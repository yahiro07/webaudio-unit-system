import { UnitInterface } from "wus-unit-types";
import { seqNumbers } from "../utils/array-utils";
import { createHsUnitOutputPort, gAudioContext } from "./host-core";
import {
  HsUnitInputPort,
  HsUnitInputPortCallbacks,
  HsUnitInputPortPre,
  HsUnitInputPortPreHandlers,
  HsUnitInstance,
  HsUnitOutputPort,
} from "./host-types";

export function createHsUnitInputPortPre(): HsUnitInputPortPre {
  const audioNode = gAudioContext.createGain();
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
  unitId: string,
  createdCallback: (unitInstance: HsUnitInstance) => void,
): UnitInterface {
  const audioContext = gAudioContext;
  const primaryOutputPort = createHsUnitOutputPort();
  const primaryInputPort = createHsUnitInputPortPre();
  let outputPorts: HsUnitOutputPort[] | undefined;
  let inputPorts: HsUnitInputPortPre[] | undefined;
  return {
    audioContext,
    primaryOutputPort,
    primaryInputPort,
    createMultiChannelOutputPorts(numPorts: number) {
      outputPorts = seqNumbers(numPorts).map(() => createHsUnitOutputPort());
      return outputPorts;
    },
    createMultiChannelInputPorts(numPorts: number) {
      inputPorts = seqNumbers(numPorts).map(() => createHsUnitInputPortPre());
      return inputPorts;
    },
    completeSetupWithAttributes(attrs) {
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
