import { UnitInterface, UnitInterfaceProvider } from "./unit-interfaces";

export function getUnitInterface(
  versionCode: string,
): UnitInterface | undefined {
  const win = window as UnitInterfaceProvider;
  return win.queryUnitInterface?.(versionCode);
}

export function queryUnitInterfaceForModule(
  versionCode: string,
  importMetaUrl: string,
): UnitInterface | undefined {
  const win = window as UnitInterfaceProvider;
  return win?.queryUnitInterfaceForModule?.(versionCode, importMetaUrl);
}
