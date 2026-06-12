import { UnitInterface } from "wus-unit-types";
import { seqNumbers } from "../utils/array-utils";
import { HostSystem } from "./host-system";
import {
  HsUnitInputPort,
  HsUnitInputPortPre,
  HsUnitInputPortPreHandlers,
  HsUnitInstance,
  HsUnitOutputPort,
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

export function createUnitInterface(
  hostSystem: HostSystem,
  unitId: string,
  createdCallback: (unitInstance: HsUnitInstance) => void,
): UnitInterface {
  const { audioContext } = hostSystem;
  const primaryOutputPort = createHsUnitOutputPortImpl(
    audioContext,
    hostSystem.actionScheduler,
  );
  const primaryInputPort = createHsUnitInputPortPre(audioContext);
  return {
    audioContext,
    primaryOutputPort,
    primaryInputPort,
    createMultiChannelOutputPorts(numPorts: number) {
      return seqNumbers(numPorts).map(() =>
        createHsUnitOutputPortImpl(audioContext, hostSystem.actionScheduler),
      );
    },
    createMultiChannelInputPorts(numPorts: number) {
      return seqNumbers(numPorts).map(() =>
        createHsUnitInputPortPre(audioContext),
      );
    },
    emitMetaAttributes(metaAttrs) {
      hostSystem.emitMetaAttributes(metaAttrs);
    },
    completeSetup(attrs) {
      if (attrs.primaryInputPortHandlers) {
        primaryInputPort.setHandlers(attrs.primaryInputPortHandlers);
      }
      if ("primaryInputPortCallbacks" in attrs) {
        throw new Error(
          "primaryInputPortCallbacks field is deprecated. Please set callbacks to primaryInputPortHandlers.callbacks instead.",
        );
      }
      const outputPorts = attrs.multiChannelOutputPorts as HsUnitOutputPort[];
      const inputPorts = attrs.multiChannelInputPorts?.map((it) =>
        (it as HsUnitInputPortPre).emit(),
      );
      createdCallback({
        unitId,
        portsSpec: {
          outputPortSubtypes: attrs.unitAspects.outputs,
          inputPortSubtypes: attrs.unitAspects.inputs,
          numMultiOutputs: outputPorts?.length,
          numMultiInputs: inputPorts?.length,
        },
        outputPort: primaryOutputPort,
        inputPort: primaryInputPort.emit(),
        outputPorts,
        inputPorts,
        hostCallbacks: attrs.hostCallbacks,
      });
    },
  };
}
