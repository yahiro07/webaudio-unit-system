import { createEventPort, EventPort } from "../utils/event-port";
import { DestinationCode, HsUnitInputPort, HsUnitInstance } from "./host-types";
import { getUnitSourcePort } from "./unit-connecter";

type HostSystemEvent = { type: "loadStarted" } | { type: "loadCompleted" };
// | { type: "unitsAdded"; units: HsUnitInstance[] }
// | { type: "unitsRemoved"; unitIds: string[] };

export type HostSystem = {
  audioContext: AudioContext;
  eventPort: EventPort<HostSystemEvent>;
  registerUnitInstance(unit: HsUnitInstance): () => void;
  registerPendingUnitInstancePromise(
    unitId: string,
    unitInstancePromise: Promise<HsUnitInstance>,
  ): () => void;
  reserveConnectionChange(
    srcUnitId: string,
    destSpec: DestinationCode | undefined,
  ): void;
};

type HostStateBus = {
  audioContext: AudioContext;
  eventPort: EventPort<HostSystemEvent>;
  audioDestinationUnitInputPort: HsUnitInputPort;
  units: Map<string, HsUnitInstance>;
  addUnits(units: HsUnitInstance[]): void;
  getAllUnits(): HsUnitInstance[];
  removeUnit(unitId: string): void;
};

function createHostStateBus(audioContext: AudioContext): HostStateBus {
  const eventPort = createEventPort<HostSystemEvent>();
  const audioDestinationUnitInputPort: HsUnitInputPort = {
    audioInput: { node: audioContext.destination },
  };
  const units: Map<string, HsUnitInstance> = new Map();

  return {
    audioContext,
    eventPort,
    audioDestinationUnitInputPort,
    units,
    addUnits(newUnits: HsUnitInstance[]) {
      for (const unit of newUnits) {
        units.set(unit.unitId, unit);
      }
    },
    getAllUnits() {
      return Array.from(units.values());
    },
    removeUnit(unitId: string) {
      units.delete(unitId);
    },
  };
}

function getConnectionTargetPort(
  bus: HostStateBus,
  destSpec: string,
): HsUnitInputPort | undefined {
  if (destSpec === "$output") {
    return bus.audioDestinationUnitInputPort;
  }
  if (destSpec.includes(".")) {
    const [unitId, portName] = destSpec.split(".");
    const portIndex = parseInt(portName.replace("port", ""), 10);
    if (unitId && Number.isFinite(portIndex)) {
      const unit = bus.units.get(unitId);
      return unit?.inputPorts?.[portIndex];
    }
  } else {
    const unit = bus.units.get(destSpec);
    return unit?.inputPort;
  }
}

type ConnectingOperation = "connect" | "disconnect";

function updateUnitConnectionToPort(
  bus: HostStateBus,
  unit: HsUnitInstance,
  destSpec: string,
  operation: ConnectingOperation,
  outputPortIndex?: number,
) {
  const [srcPort, srcSpec] = getUnitSourcePort(unit, outputPortIndex);
  const destPort = getConnectionTargetPort(bus, destSpec);
  if (srcPort && destPort) {
    if (operation === "connect") {
      console.log(`connecting ${srcSpec} --> ${destSpec}`);
      srcPort.connectTo(destPort);
    } else if (operation === "disconnect") {
      console.log(`disconnecting ${srcSpec} --> ${destSpec}`);
      srcPort.disconnectFrom(destPort);
    }
  }
}

function updateUnitConnectionForSingleOutputPortWithFanOut(
  bus: HostStateBus,
  unit: HsUnitInstance,
  curr: DestinationCode,
  next: DestinationCode,
  outputPortIndex?: number,
) {
  const currs = curr?.split("&").filter(Boolean) ?? [];
  const nexts = next?.split("&").filter(Boolean) ?? [];
  const toConnect = nexts.filter((dest) => !currs.includes(dest));
  const toDisconnect = currs.filter((dest) => !nexts.includes(dest));
  for (const destSpec of toDisconnect) {
    updateUnitConnectionToPort(
      bus,
      unit,
      destSpec,
      "disconnect",
      outputPortIndex,
    );
  }
  for (const destSpec of toConnect) {
    updateUnitConnectionToPort(bus, unit, destSpec, "connect", outputPortIndex);
  }
}

function updateUnitConnectionForMultiOutputPorts(
  bus: HostStateBus,
  unit: HsUnitInstance,
  curr: DestinationCode,
  next: DestinationCode,
) {
  const currChannelPorts = curr?.split("|");
  const nextChannelPorts = next?.split("|");
  if (currChannelPorts.length >= 2 || nextChannelPorts.length >= 2) {
    const maxLength = Math.max(
      currChannelPorts.length,
      nextChannelPorts.length,
    );
    for (let i = 0; i < maxLength; i++) {
      const currDestSpec = currChannelPorts[i] ?? "";
      const nextDestSpec = nextChannelPorts[i] ?? "";
      updateUnitConnectionForSingleOutputPortWithFanOut(
        bus,
        unit,
        currDestSpec,
        nextDestSpec,
        i,
      );
    }
  } else {
    updateUnitConnectionForSingleOutputPortWithFanOut(bus, unit, curr, next);
  }
}

type ConnectionManager = {
  updateConnections(newConnectionCodeMap: Map<string, DestinationCode>): void;
  removeConnectionsForUnit(unitId: string): void;
};

function createUnitConnectionsManager(bus: HostStateBus) {
  const connectionCodeMap: Map<string, DestinationCode> = new Map();
  return {
    updateConnections(newConnectionCodeMap: Map<string, DestinationCode>) {
      for (const [unitId, code] of newConnectionCodeMap.entries()) {
        const unit = bus.units.get(unitId);
        if (unit) {
          const curr = connectionCodeMap.get(unit.unitId);
          const next = code;
          if (next !== undefined && next !== curr) {
            updateUnitConnectionForMultiOutputPorts(
              bus,
              unit,
              curr ?? "",
              next,
            );
            connectionCodeMap.set(unit.unitId, next);
          }
        }
      }
    },
    removeConnectionsForUnit(unitId: string) {
      const unit = bus.units.get(unitId);
      const curr = connectionCodeMap.get(unitId);
      if (unit && curr) {
        updateUnitConnectionForMultiOutputPorts(bus, unit, curr, "");
        connectionCodeMap.delete(unitId);
      }
    },
  };
}

type UnitLoadingJob = {
  promise: Promise<HsUnitInstance>;
  cancelled?: boolean;
  resolvedUnitInstance?: HsUnitInstance;
};

function createUnitsLoadingManager(
  bus: HostStateBus,
  connectionManager: ConnectionManager,
) {
  const unitLoadingJobs: UnitLoadingJob[] = [];
  const pendingConnectionCodeMap: Map<string, DestinationCode> = new Map();

  let isProcessing = false;

  const internal = {
    async waitPendingUnits() {
      let i = 0;
      while (i < unitLoadingJobs.length) {
        const job = unitLoadingJobs[i];
        try {
          job.resolvedUnitInstance = await job.promise;
        } catch (e) {
          console.error("Failed to load unit instance", e);
        }
        i++;
      }
      const newUnits = unitLoadingJobs
        .filter((job) => !job.cancelled && job.resolvedUnitInstance)
        .map((job) => job.resolvedUnitInstance!);

      unitLoadingJobs.length = 0;

      return newUnits;
    },
    async reserveLoading() {
      if (!isProcessing) {
        isProcessing = true;
        bus.eventPort.emit({ type: "loadStarted" });
        const newUnits = await internal.waitPendingUnits();

        if (newUnits.length > 0) {
          bus.addUnits(newUnits);
        }
        if (pendingConnectionCodeMap.size > 0) {
          connectionManager.updateConnections(pendingConnectionCodeMap);
          pendingConnectionCodeMap.clear();
        }
        if (newUnits.length > 0) {
          // bus.eventPort.emit({ type: "unitsAdded", units: newUnits });
        }
        bus.eventPort.emit({ type: "loadCompleted" });
        isProcessing = false;
        if (unitLoadingJobs.length > 0 || pendingConnectionCodeMap.size > 0) {
          internal.reserveLoading();
        }
      }
    },
  };

  return {
    reserveLoadUnit(promise: Promise<HsUnitInstance>) {
      unitLoadingJobs.push({ promise });
      internal.reserveLoading();
    },
    cancelLoadUnit(promise: Promise<HsUnitInstance>) {
      const job = unitLoadingJobs.find((job) => job.promise === promise);
      if (job) {
        job.cancelled = true;
      }
    },
    reserveConnectUnit(srcUnitId: string, destSpec: DestinationCode) {
      pendingConnectionCodeMap.set(srcUnitId, destSpec);
      internal.reserveLoading();
    },
  };
}

export function createHostSystem(audioContext: AudioContext): HostSystem {
  const bus = createHostStateBus(audioContext);
  const connectionManager = createUnitConnectionsManager(bus);
  const loadingManager = createUnitsLoadingManager(bus, connectionManager);

  const internal = {
    addUnitInstancePromise(unitId: string, promise: Promise<HsUnitInstance>) {
      loadingManager.reserveLoadUnit(promise);
      return () => {
        loadingManager.cancelLoadUnit(promise);
        connectionManager.removeConnectionsForUnit(unitId);
        bus.removeUnit(unitId);
      };
    },
  };

  return {
    audioContext,
    eventPort: bus.eventPort,
    registerUnitInstance(unit: HsUnitInstance) {
      const promise = Promise.resolve(unit);
      return internal.addUnitInstancePromise(unit.unitId, promise);
    },
    registerPendingUnitInstancePromise(unitId, unitInstancePromise) {
      return internal.addUnitInstancePromise(unitId, unitInstancePromise);
    },
    reserveConnectionChange(srcUnitId, destSpec) {
      loadingManager.reserveConnectUnit(srcUnitId, destSpec ?? "");
    },
  };
}
