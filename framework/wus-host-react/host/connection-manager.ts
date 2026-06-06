import { HostStateBus } from "./host-state-bus";
import { DestinationCode, HsUnitInputPort, HsUnitInstance } from "./host-types";
import { getUnitSourcePort } from "./unit-connecter";

export type ConnectionManager = {
  updateConnections(newConnectionCodeMap: Map<string, DestinationCode>): void;
  removeConnectionsForUnit(unitId: string): void;
};

function getConnectionTargetPort(
  bus: HostStateBus,
  destSpec: string,
): HsUnitInputPort | undefined {
  if (destSpec === "$output") {
    return bus.audioDestinationVirtualUnitInputPort;
  }
  if (destSpec.includes(".")) {
    const [unitId, portName] = destSpec.split(".");
    const portIndex = parseInt(portName.replace("port", ""), 10);
    if (unitId && Number.isFinite(portIndex)) {
      const unit = bus.getUnit(unitId);
      return unit?.inputPorts?.[portIndex];
    }
  } else {
    const unit = bus.getUnit(destSpec);
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

export function createUnitConnectionsManager(bus: HostStateBus) {
  const connectionCodeMap: Map<string, DestinationCode> = new Map();
  return {
    updateConnection(unitId: string, newConnectionCode: DestinationCode) {
      const unit = bus.getUnit(unitId);
      if (unit) {
        const curr = connectionCodeMap.get(unit.unitId);
        const next = newConnectionCode;
        if (next !== undefined && next !== curr) {
          updateUnitConnectionForMultiOutputPorts(bus, unit, curr ?? "", next);
          connectionCodeMap.set(unit.unitId, next);
        }
      }
    },
    removeConnectionsForUnit(unitId: string) {
      const unit = bus.getUnit(unitId);
      const curr = connectionCodeMap.get(unitId);
      if (unit && curr) {
        updateUnitConnectionForMultiOutputPorts(bus, unit, curr, "");
        connectionCodeMap.delete(unitId);
      }
    },
  };
}
