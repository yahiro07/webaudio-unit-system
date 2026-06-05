import { HsUnitInstance } from "./host-types";

export function getUnitSourcePort(
  unit: HsUnitInstance,
  outputPortIndex?: number,
) {
  if (outputPortIndex !== undefined) {
    if (unit.outputPorts?.[outputPortIndex]) {
      return [
        unit.outputPorts[outputPortIndex],
        `${unit.unitId}.port${outputPortIndex}`,
      ] as const;
    } else {
      //fallback to primary output port if specified index port does not exist
    }
  }
  return [unit.outputPort, `${unit.unitId}`] as const;
}
