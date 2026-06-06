import { createEventPort, EventPort } from "../utils/event-port";
import { HostSystemEvent, HsUnitInputPort, HsUnitInstance } from "./host-types";

export type HostStateBus = {
  eventPort: EventPort<HostSystemEvent>;
  audioContext: AudioContext;
  masterGainNode: GainNode;
  audioDestinationVirtualUnitInputPort: HsUnitInputPort;
  units: Map<string, HsUnitInstance>;
  addUnit(unit: HsUnitInstance): void;
  getAllUnits(): HsUnitInstance[];
  removeUnit(unitId: string): void;
};

export function createHostStateBus(audioContext: AudioContext): HostStateBus {
  const eventPort = createEventPort<HostSystemEvent>();
  const masterGainNode = audioContext.createGain();
  masterGainNode.connect(audioContext.destination);
  const audioDestinationVirtualUnitInputPort: HsUnitInputPort = {
    audioInput: { node: masterGainNode },
  };
  const units: Map<string, HsUnitInstance> = new Map();

  return {
    eventPort,
    audioContext,
    masterGainNode,
    audioDestinationVirtualUnitInputPort,
    units,
    addUnit(unit: HsUnitInstance) {
      units.set(unit.unitId, unit);
      // eventPort.emit({ type: "unitAdded", unitInstance: unit });
    },
    getAllUnits() {
      return Array.from(units.values());
    },
    removeUnit(unitId: string) {
      units.delete(unitId);
      // eventPort.emit({ type: "unitRemoved", unitId });
    },
  };
}
