import { UnitInterface } from "wus-unit-types";
import { seqNumbers } from "../utils/array-utils";
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
  audioContext: AudioContext,
  unitId: string,
  createdCallback: (unitInstance: HsUnitInstance) => void,
): UnitInterface {
  const primaryOutputPort = createHsUnitOutputPortImpl(audioContext);
  const primaryInputPort = createHsUnitInputPortPre(audioContext);
  return {
    audioContext,
    primaryOutputPort,
    primaryInputPort,
    createMultiChannelOutputPorts(numPorts: number) {
      return seqNumbers(numPorts).map(() =>
        createHsUnitOutputPortImpl(audioContext),
      );
    },
    createMultiChannelInputPorts(numPorts: number) {
      return seqNumbers(numPorts).map(() =>
        createHsUnitInputPortPre(audioContext),
      );
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
          outputPortSubtypes: attrs.unitFeatures.outputs,
          inputPortSubtypes: attrs.unitFeatures.inputs,
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
