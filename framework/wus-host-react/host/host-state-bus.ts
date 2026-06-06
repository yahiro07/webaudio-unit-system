import { createEventPort, EventPort } from "../utils/event-port";
import { HostSystemEvent, HsUnitInputPort, HsUnitInstance } from "./host-types";

export type HostStateBus = {
  audioContext: AudioContext;
  eventPort: EventPort<HostSystemEvent>;
  audioDestinationUnitInputPort: HsUnitInputPort;
  units: Map<string, HsUnitInstance>;
  addUnits(units: HsUnitInstance[]): void;
  getAllUnits(): HsUnitInstance[];
  removeUnit(unitId: string): void;
};

export function createHostStateBus(audioContext: AudioContext): HostStateBus {
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
