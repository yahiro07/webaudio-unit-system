import { UnitInterface } from "./unit-interfaces";

export function getUnitInterface(): UnitInterface | undefined {
  type WindowWithUnitInterface = {
    unitInterface?: UnitInterface;
  };
  return (window as WindowWithUnitInterface)?.unitInterface;
}
