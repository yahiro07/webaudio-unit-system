import { UnitInterface, WindowWithUnitInterface } from "./unit-interfaces";

export function getUnitInterface(
  versionCode: string,
): UnitInterface | undefined {
  const win = window as WindowWithUnitInterface;
  win.checkUnitInterfaceCompatibility?.(versionCode);
  return win?.unitInterface;
}
