import { HsUnitOutputPort } from "./host-types";
import { createHsUnitOutputPortImpl } from "./output-port";

const audioContext = new AudioContext();
export const gAudioContext = audioContext;

export function createHsUnitOutputPort(): HsUnitOutputPort {
  return createHsUnitOutputPortImpl(() => audioContext.createGain());
}
