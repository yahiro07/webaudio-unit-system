import { removeArrayItem } from "@wus/ax/array-utils";
import {
  HostInterface,
  NoteOutputPort,
  UnitAgent,
  UnitType,
} from "../contract";

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
  getUnitAgent(unitId: string): UnitAgentInHostSide | undefined;
  addUnitAgent(unitAgent: UnitAgentInHostSide): void;
};

export type NoteOutputPortImpl = NoteOutputPort & {
  setDestinationAgent(noteDestinationAgent: UnitAgentInHostSide): void;
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
  return {
    audioContext,
    pendingConnectionRules,
    getUnitAgent(unitId: string): UnitAgentInHostSide | undefined {
      return units.get(unitId);
    },
    addUnitAgent(unitAgent: UnitAgentInHostSide) {
      units.set(unitAgent.unitId, unitAgent);
    },
  };
}

function createAudioContextDestinationProxied(
  audioContext: AudioContext,
  unitDestinationNode: AudioNode,
): AudioContext {
  return new Proxy(audioContext, {
    get: (target, prop) => {
      if (prop === "destination") {
        return unitDestinationNode;
      }
      const value = Reflect.get(target, prop, target);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });
}

export function hostSystem_createHostInterfaceForUnit(
  hostSystem: HostSystem,
  unitId: string,
  registeredCallback: (unitAgent: UnitAgentInHostSide) => void,
) {
  const unitDestinationNode = hostSystem.audioContext.createGain();
  const unitAudioContext = createAudioContextDestinationProxied(
    hostSystem.audioContext,
    unitDestinationNode,
  );
  const effectSourceNode = hostSystem.audioContext.createGain();
  const noteOutputPortImpl = createNoteOutputPortImpl();
  const hostInterface: HostInterface = {
    audioContext: unitAudioContext,
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
      console.log(`connected: ${unitId} --> output`);
    }
    return;
  }

  const destUnit = hostSystem.getUnitAgent(destUnitId);

  if (sourceUnit && destUnit) {
    const destType = destUnit.type;
    if (destType === "effect") {
      sourceUnit.unitDestinationNode.connect(destUnit.effectSourceNode);
      console.log(`connected: ${unitId} --> ${destUnitId}`);
    } else if (destType === "instrument" || destType === "sequencer") {
      sourceUnit.noteOutputPortImpl.setDestinationAgent(destUnit);
      console.log(`connected: ${unitId} --> ${destUnitId}`);
    }
  }
}

export function hostSystem_wrapAddUnitAgent(
  hostSystem: HostSystem,
  unitAgent: UnitAgentInHostSide,
) {
  hostSystem.addUnitAgent(unitAgent);
  for (const rule of hostSystem.pendingConnectionRules) {
    if (rule.destUnitId === unitAgent.unitId) {
      hostSystem_connectUnits(hostSystem, rule.sourceUnitId, unitAgent.unitId);
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
