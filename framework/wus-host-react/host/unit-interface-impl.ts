import { UnitInterface } from "wus-unit-types";
import { seqNumbers } from "../utils/array-utils";
import {
  HsUnitInputPort,
  HsUnitInputPortCallbacks,
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
  let callbacks: HsUnitInputPortCallbacks | undefined;
  return {
    audioInput: { node: audioNode },
    setCallbacks(_callbacks: HsUnitInputPortCallbacks) {
      callbacks = _callbacks;
    },
    setHandlers(_handlers: HsUnitInputPortPreHandlers) {
      handlers = _handlers;
    },
    emit(): HsUnitInputPort {
      return {
        audioInput: { node: audioNode },
        ...handlers,
        callbacks: {
          onConnectedFrom(subPortTypes) {
            callbacks?.onConnectedFrom?.(subPortTypes);
          },
          onDisconnectFrom() {
            callbacks?.onDisconnectFrom?.();
          },
        },
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
  let outputPorts: HsUnitOutputPort[] | undefined;
  let inputPorts: HsUnitInputPortPre[] | undefined;
  return {
    audioContext,
    primaryOutputPort,
    primaryInputPort,
    createMultiChannelOutputPorts(numPorts: number) {
      outputPorts = seqNumbers(numPorts).map(() =>
        createHsUnitOutputPortImpl(audioContext),
      );
      return outputPorts;
    },
    createMultiChannelInputPorts(numPorts: number) {
      inputPorts = seqNumbers(numPorts).map(() =>
        createHsUnitInputPortPre(audioContext),
      );
      return inputPorts;
    },
    completeSetupWithAttributes(attrs) {
      if (attrs.primaryInputPortHandlers) {
        primaryInputPort.setHandlers(attrs.primaryInputPortHandlers);
      }
      if (attrs.primaryInputPortCallbacks) {
        primaryInputPort.setCallbacks(attrs.primaryInputPortCallbacks);
      }
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
        inputPorts: inputPorts?.map((port) => port.emit()),
        hostCallbacks: attrs.hostCallbacks,
      });
    },
  };
}
