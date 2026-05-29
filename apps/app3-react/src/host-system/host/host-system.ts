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

export type HostSystem = {
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

export type NoteOutputPortImpl = NoteOutputPort & {
  setDestinationAgent(noteDestinationAgent?: UnitAgentInHostSide): void;
};

export function createNoteOutputPortImpl(): NoteOutputPortImpl {
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

export function createHostSystem(audioContext: AudioContext): HostSystem {
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

export function hostSystem_createHostInterfaceForUnit(
  hostSystem: HostSystem,
  unitId: string,
  registeredCallback: (unitAgent: UnitAgentInHostSide) => void,
) {
  const unitDestinationNode = hostSystem.audioContext.createGain();
  const effectSourceNode = hostSystem.audioContext.createGain();
  const noteOutputPortImpl = createNoteOutputPortImpl();
  const hostInterface: HostInterface = {
    audioContext: hostSystem.audioContext,
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

export function hostSystem_connectUnits(
  hostSystem: HostSystem,
  unitId: string,
  destUnitId: string,
) {
  const sourceUnit = hostSystem.getUnitAgent(unitId);

  if (sourceUnit && destUnitId === "$output") {
    if ((["instrument", "effect"] as UnitType[]).includes(sourceUnit.type)) {
      sourceUnit.unitDestinationNode.connect(
        hostSystem.audioContext.destination,
      );
      hostSystem.currentConnections.set(unitId, destUnitId);
      console.log(`connected audio: ${unitId} --> output`);
    }
    return;
  }

  const destUnit = hostSystem.getUnitAgent(destUnitId);

  if (sourceUnit && destUnit) {
    const destType = destUnit.type;
    if (destType === "effect") {
      sourceUnit.unitDestinationNode.connect(destUnit.effectSourceNode);
      hostSystem.currentConnections.set(unitId, destUnitId);
      console.log(`connected audio: ${unitId} --> ${destUnitId}`);
    } else if (destType === "instrument" || destType === "sequencer") {
      sourceUnit.noteOutputPortImpl.setDestinationAgent(destUnit);
      hostSystem.currentConnections.set(unitId, destUnitId);
      console.log(`connected note: ${unitId} --> ${destUnitId}`);
    }
  }
}

export function hostSystem_disconnectUnits(
  hostSystem: HostSystem,
  unitId: string,
  destUnitId: string,
) {
  const sourceUnit = hostSystem.getUnitAgent(unitId);
  if (!sourceUnit) return;

  if (destUnitId === "$output") {
    if ((["instrument", "effect"] as UnitType[]).includes(sourceUnit.type)) {
      sourceUnit.unitDestinationNode.disconnect(
        hostSystem.audioContext.destination,
      );
      console.log(`disconnected audio: ${unitId} --> output`);
    }
    hostSystem.currentConnections.delete(unitId);
    return;
  }

  const destUnit = hostSystem.getUnitAgent(destUnitId);
  if (!destUnit) {
    hostSystem.currentConnections.delete(unitId);
    return;
  }

  if (destUnit.type === "effect") {
    sourceUnit.unitDestinationNode.disconnect(destUnit.effectSourceNode);
    console.log(`disconnected audio: ${unitId} --> ${destUnitId}`);
  } else if (destUnit.type === "instrument" || destUnit.type === "sequencer") {
    sourceUnit.noteOutputPortImpl.setDestinationAgent(undefined);
    console.log(`disconnected note: ${unitId} --> ${destUnitId}`);
  }
  hostSystem.currentConnections.delete(unitId);
}

export function hostSystem_wrapAddUnitAgent(
  hostSystem: HostSystem,
  unitAgent: UnitAgentInHostSide,
) {
  hostSystem.addUnitAgent(unitAgent);
  for (const rule of hostSystem.pendingConnectionRules) {
    if (rule.destUnitId === unitAgent.unitId) {
      hostSystem_setUnitDestination(
        hostSystem,
        rule.sourceUnitId,
        unitAgent.unitId,
      );
      removeArrayItem(hostSystem.pendingConnectionRules, rule);
    }
  }
}

export function hostSystem_wrapConnectUnits(
  hostSystem: HostSystem,
  unitId: string,
  destUnitId: string,
) {
  const sourceUnit = hostSystem.getUnitAgent(unitId);
  const destUnit = hostSystem.getUnitAgent(destUnitId);
  if (sourceUnit && (destUnit || destUnitId === "$output")) {
    hostSystem_connectUnits(hostSystem, unitId, destUnitId);
    return;
  }
  hostSystem.pendingConnectionRules.push({
    sourceUnitId: unitId,
    destUnitId: destUnitId,
  });
}

export function hostSystem_setUnitDestination(
  hostSystem: HostSystem,
  unitId: string,
  destUnitId?: string,
) {
  const previousDestUnitId = hostSystem.currentConnections.get(unitId);
  if (previousDestUnitId && previousDestUnitId !== destUnitId) {
    hostSystem_disconnectUnits(hostSystem, unitId, previousDestUnitId);
  }

  for (const rule of [...hostSystem.pendingConnectionRules]) {
    if (rule.sourceUnitId === unitId) {
      removeArrayItem(hostSystem.pendingConnectionRules, rule);
    }
  }

  if (!destUnitId) {
    return;
  }

  hostSystem_wrapConnectUnits(hostSystem, unitId, destUnitId);
}
