import { HostStateBus } from "./host-state-bus";
import { HsUnitInstance } from "./host-types";

type UnitLoadingJob = {
  promise: Promise<HsUnitInstance>;
  cancelled?: boolean;
  resolvedUnitInstance?: HsUnitInstance;
};

type PendingUnitOperation = () => void;

export function createUnitsLoadingManager(bus: HostStateBus) {
  const unitLoadingJobs: UnitLoadingJob[] = [];
  const pendingUnitOperations: PendingUnitOperation[] = [];

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

        //wait all unitInstances loaded in iframe
        const newUnits = await internal.waitPendingUnits();

        if (newUnits.length > 0) {
          for (const unit of newUnits) {
            bus.addUnit(unit);
          }
        }

        //connect units, apply persist states
        for (const op of pendingUnitOperations) {
          op();
        }
        pendingUnitOperations.length = 0;

        bus.eventPort.emit({ type: "loadCompleted" });
        isProcessing = false;
        if (unitLoadingJobs.length > 0 || pendingUnitOperations.length > 0) {
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
    reserveUnitOperation(operation: () => void) {
      pendingUnitOperations.push(operation);
      internal.reserveLoading();
    },
  };
}
