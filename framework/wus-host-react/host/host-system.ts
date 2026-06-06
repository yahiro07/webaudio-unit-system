import { EventPort } from "../utils/event-port";
import { createUnitConnectionsManager } from "./connection-manager";
import { createHostStateBus } from "./host-state-bus";
import { DestinationCode, HostSystemEvent, HsUnitInstance } from "./host-types";
import { createUnitsLoadingManager } from "./unit-loading-manager";

export type HostSystem = {
  audioContext: AudioContext;
  getAllUnits(): HsUnitInstance[];
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
  setMasterGain(gain: number): void;
};

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
    getAllUnits: bus.getAllUnits,
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
    setMasterGain(gain) {
      bus.masterGainNode.gain.linearRampToValueAtTime(
        gain,
        audioContext.currentTime + 0.01,
      );
    },
  };
}
