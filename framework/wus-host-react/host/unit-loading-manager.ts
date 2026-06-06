import { ConnectionManager } from "./connection-manager";
import { HostStateBus } from "./host-state-bus";
import { DestinationCode, HsUnitInstance } from "./host-types";

type UnitLoadingJob = {
  promise: Promise<HsUnitInstance>;
  cancelled?: boolean;
  resolvedUnitInstance?: HsUnitInstance;
};

export function createUnitsLoadingManager(
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
    async executeLoadingJobs() {
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
    reserveLoading() {
      if (!isProcessing) {
        setTimeout(internal.executeLoadingJobs, 0);
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
