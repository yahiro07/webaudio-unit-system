import { removeArrayItem } from "beams/ax/array-utils";
import {
  HostInterface,
  NoteOutputPort,
  UnitAgent,
  UnitType,
} from "wus-unit-types";

export type UnitAgentInHostSide = UnitAgent & {
  unitId: string;
  unitDestinationNode: AudioNode;
  noteOutputPortImpl: NoteOutputPortImpl;
  effectSourceNode: AudioNode;
};

type HostSystemBus = {
  audioContext: AudioContext;
  pendingConnectionRules: {
    sourceUnitId: string;
    destUnitId: string;
  }[];
  currentConnections: Map<string, string>;
  getUnitAgent(unitId: string): UnitAgentInHostSide | undefined;
  addUnitAgent(unitAgent: UnitAgentInHostSide): void;
  getUnits: () => UnitAgentInHostSide[];
};

export type HostSystem = {
  audioContext: AudioContext;
  getUnits: () => UnitAgentInHostSide[];
  createHostInterfaceForUnit(
    unitId: string,
    registeredCallback: (unitAgent: UnitAgentInHostSide) => void,
  ): HostInterface;
  setUnitDestination(unitId: string, destUnitId?: string): void;
  wrapAddUnitAgent(unitAgent: UnitAgentInHostSide): void;
  wrapConnectUnits(unitId: string, destUnitId: string): void;
  wrapDisconnectUnits(unitId: string, destUnitId: string): void;
};

type NoteOutputPortImpl = NoteOutputPort & {
  setDestinationAgent(noteDestinationAgent?: UnitAgentInHostSide): void;
};

function createNoteOutputPortImpl(): NoteOutputPortImpl {
  let destinationAgent: UnitAgentInHostSide | undefined;
  return {
    noteOn(noteNumber, velocity) {
      destinationAgent?.noteInput?.noteOn?.(noteNumber, velocity);
    },
    noteOff(noteNumber) {
      destinationAgent?.noteInput?.noteOff?.(noteNumber);
    },
    setDestinationAgent(agent) {
      destinationAgent = agent;
    },
  };
}

function createHostSystemBus(audioContext: AudioContext): HostSystemBus {
  const units: Map<string, UnitAgentInHostSide> = new Map();
  const pendingConnectionRules: {
    sourceUnitId: string;
    destUnitId: string;
  }[] = [];
  const currentConnections: Map<string, string> = new Map();
  return {
    audioContext,
    pendingConnectionRules,
    currentConnections,
    getUnitAgent(unitId: string): UnitAgentInHostSide | undefined {
      return units.get(unitId);
    },
    addUnitAgent(unitAgent: UnitAgentInHostSide) {
      units.set(unitAgent.unitId, unitAgent);
    },
    getUnits() {
      return Array.from(units.values());
    },
  };
}

function hostSystemBus_createHostInterfaceForUnit(
  bus: HostSystemBus,
  unitId: string,
  registeredCallback: (unitAgent: UnitAgentInHostSide) => void,
) {
  const unitDestinationNode = bus.audioContext.createGain();
  const effectSourceNode = bus.audioContext.createGain();
  const noteOutputPortImpl = createNoteOutputPortImpl();
  const hostInterface: HostInterface = {
    audioContext: bus.audioContext,
    audioDestinationNode: unitDestinationNode,
    audioSourceNode: effectSourceNode,
    noteOutputPort: noteOutputPortImpl,
    setupUnitAgent(_unitAgent) {
      if (_unitAgent.type === "sequencer" && !_unitAgent.noteInput) {
        //route note outside if the unit doesn't handle input notes
        _unitAgent.noteInput = noteOutputPortImpl;
      }
      const unitAgent: UnitAgentInHostSide = {
        unitId,
        ..._unitAgent,
        unitDestinationNode,
        noteOutputPortImpl,
        effectSourceNode,
      };
      registeredCallback(unitAgent);
    },
  };
  return hostInterface;
}

function hostSystemBus_connectUnits(
  bus: HostSystemBus,
  unitId: string,
  destUnitId: string,
) {
  const sourceUnit = bus.getUnitAgent(unitId);

  if (sourceUnit && destUnitId === "$output") {
    if ((["instrument", "effect"] as UnitType[]).includes(sourceUnit.type)) {
      sourceUnit.unitDestinationNode.connect(bus.audioContext.destination);
      bus.currentConnections.set(unitId, destUnitId);
      console.log(`connected audio: ${unitId} --> output`);
    }
    return;
  }

  const destUnit = bus.getUnitAgent(destUnitId);

  if (sourceUnit && destUnit) {
    const destType = destUnit.type;
    if (destType === "effect") {
      sourceUnit.unitDestinationNode.connect(destUnit.effectSourceNode);
      bus.currentConnections.set(unitId, destUnitId);
      console.log(`connected audio: ${unitId} --> ${destUnitId}`);
    } else if (destType === "instrument" || destType === "sequencer") {
      sourceUnit.noteOutputPortImpl.setDestinationAgent(destUnit);
      bus.currentConnections.set(unitId, destUnitId);
      console.log(`connected note: ${unitId} --> ${destUnitId}`);
    }
  }
}

function hostSystemBus_disconnectUnits(
  bus: HostSystemBus,
  unitId: string,
  destUnitId: string,
) {
  const sourceUnit = bus.getUnitAgent(unitId);
  if (!sourceUnit) return;

  if (destUnitId === "$output") {
    if ((["instrument", "effect"] as UnitType[]).includes(sourceUnit.type)) {
      sourceUnit.unitDestinationNode.disconnect(bus.audioContext.destination);
      console.log(`disconnected audio: ${unitId} --> output`);
    }
    bus.currentConnections.delete(unitId);
    return;
  }

  const destUnit = bus.getUnitAgent(destUnitId);
  if (!destUnit) {
    bus.currentConnections.delete(unitId);
    return;
  }

  if (destUnit.type === "effect") {
    sourceUnit.unitDestinationNode.disconnect(destUnit.effectSourceNode);
    console.log(`disconnected audio: ${unitId} --> ${destUnitId}`);
  } else if (destUnit.type === "instrument" || destUnit.type === "sequencer") {
    sourceUnit.noteOutputPortImpl.setDestinationAgent(undefined);
    console.log(`disconnected note: ${unitId} --> ${destUnitId}`);
  }
  bus.currentConnections.delete(unitId);
}

function hostSystemBus_wrapAddUnitAgent(
  bus: HostSystemBus,
  unitAgent: UnitAgentInHostSide,
) {
  bus.addUnitAgent(unitAgent);
  for (const rule of bus.pendingConnectionRules) {
    if (rule.destUnitId === unitAgent.unitId) {
      hostSystemBus_setUnitDestination(
        bus,
        rule.sourceUnitId,
        unitAgent.unitId,
      );
      removeArrayItem(bus.pendingConnectionRules, rule);
    }
  }
}

function hostSystemBus_wrapConnectUnits(
  bus: HostSystemBus,
  unitId: string,
  destUnitId: string,
) {
  const sourceUnit = bus.getUnitAgent(unitId);
  const destUnit = bus.getUnitAgent(destUnitId);
  if (sourceUnit && (destUnit || destUnitId === "$output")) {
    hostSystemBus_connectUnits(bus, unitId, destUnitId);
    return;
  }
  bus.pendingConnectionRules.push({
    sourceUnitId: unitId,
    destUnitId: destUnitId,
  });
}

export function hostSystemBus_setUnitDestination(
  bus: HostSystemBus,
  unitId: string,
  destUnitId?: string,
) {
  const previousDestUnitId = bus.currentConnections.get(unitId);
  if (previousDestUnitId && previousDestUnitId !== destUnitId) {
    hostSystemBus_disconnectUnits(bus, unitId, previousDestUnitId);
  }

  for (const rule of [...bus.pendingConnectionRules]) {
    if (rule.sourceUnitId === unitId) {
      removeArrayItem(bus.pendingConnectionRules, rule);
    }
  }

  if (!destUnitId) {
    return;
  }

  hostSystemBus_wrapConnectUnits(bus, unitId, destUnitId);
}

export function createHostSystem(audioContext: AudioContext): HostSystem {
  const bus = createHostSystemBus(audioContext);
  return {
    audioContext,
    getUnits() {
      return bus.getUnits();
    },
    createHostInterfaceForUnit(unitId, registeredCallback) {
      return hostSystemBus_createHostInterfaceForUnit(
        bus,
        unitId,
        registeredCallback,
      );
    },
    setUnitDestination(unitId, destUnitId) {
      hostSystemBus_setUnitDestination(bus, unitId, destUnitId);
    },
    wrapAddUnitAgent(unitAgent) {
      hostSystemBus_wrapAddUnitAgent(bus, unitAgent);
    },
    wrapConnectUnits(unitId, destUnitId) {
      hostSystemBus_wrapConnectUnits(bus, unitId, destUnitId);
    },
    wrapDisconnectUnits(unitId, destUnitId) {
      hostSystemBus_disconnectUnits(bus, unitId, destUnitId);
    },
  };
}
