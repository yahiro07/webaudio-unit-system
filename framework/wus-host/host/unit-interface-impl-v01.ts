import { UnitInterface } from "wus-unit-types";
import { HostSystem } from "./host-system";
import {
  HsUnitInputPort,
  HsUnitInputPortPre,
  HsUnitInputPortPreHandlers,
  HsUnitInstance,
} from "./host-types";
import { createHsUnitOutputPortImpl } from "./output-port";

export function createHsUnitInputPortPre(
  audioContext: AudioContext,
): HsUnitInputPortPre {
  const audioNode = audioContext.createGain();
  let handlers: HsUnitInputPortPreHandlers | undefined;
  return {
    audioInput: { node: audioNode },
    setHandlers(_handlers: HsUnitInputPortPreHandlers) {
      handlers = _handlers;
    },
    emit(): HsUnitInputPort {
      return {
        audioInput: { node: audioNode },
        ...handlers,
      };
    },
  };
}

export function createUnitInterfaceV01(
  hostSystem: HostSystem,
  unitId: string,
  createdCallback: (unitInstance: HsUnitInstance) => void,
): UnitInterface {
  const { audioContext } = hostSystem;
  const primaryOutputPort = createHsUnitOutputPortImpl(audioContext);
  const primaryInputPort = createHsUnitInputPortPre(audioContext);
  return {
    audioContext,
    audioOutputNode: primaryOutputPort.audioOutput.node,
    audioInputNode: primaryInputPort.audioInput.node,
    noteOutputPort: primaryOutputPort.noteOutput,
    emitMetaAttributes(metaAttrs) {
      hostSystem.emitMetaAttributes(metaAttrs);
    },
    completeSetup(attrs) {
      primaryInputPort.setHandlers({
        noteInput: attrs.noteInput,
        clockInput: attrs.clockInput,
        stateInput: attrs.persistence,
      });
      createdCallback({
        unitId,
        portsSpec: {
          outputPortSubtypes: attrs.unitAspects.outputs,
          inputPortSubtypes: attrs.unitAspects.inputs,
        },
        outputPort: primaryOutputPort,
        inputPort: primaryInputPort.emit(),
        hostCallbacks: attrs.hostCallbacks,
      });
    },
  };
}
