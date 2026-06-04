import { ReactNode } from "react";
import { UnitInterface } from "wus-unit-types";
import { HsUnitInstance } from "../host/host-types";
import { createUnitInterface } from "../host/unit-interface-impl";

type PlainComponentFn = () => ReactNode;

export type ReactUnitTemplateFn = (unitInterface: UnitInterface) => {
  RenderUi: PlainComponentFn;
};

type ReactUnitInstance = HsUnitInstance & {
  RenderUi: PlainComponentFn;
};

export function instantiateReactUnit(
  templateFn: ReactUnitTemplateFn,
  unitId: string,
): ReactUnitInstance {
  let unitInstance: HsUnitInstance | undefined;
  const unitInterface = createUnitInterface(unitId, (instance) => {
    unitInstance = instance;
  });
  const { RenderUi } = templateFn(unitInterface);
  if (!unitInstance) {
    throw new Error("Unit instance was not created");
  }
  return {
    ...unitInstance,
    RenderUi,
  };
}
