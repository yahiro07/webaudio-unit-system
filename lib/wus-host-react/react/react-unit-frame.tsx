import { useEffect, useMemo } from "react";
import { hostSystem } from "../host/host-system";
import { HsUnitInstance } from "../host/host-types";
import {
  instantiateReactUnit,
  ReactUnitTemplateFn,
} from "./react-unit-interface";

export const ReactUnitFrame = ({
  unitId,
  unitTemplateFn,
  destSpec,
  loadedCallback,
}: {
  unitId: string;
  unitTemplateFn: ReactUnitTemplateFn;
  destSpec?: string;
  loadedCallback?(unitInstance: HsUnitInstance): void;
}) => {
  const unit = useMemo(
    () => instantiateReactUnit(unitTemplateFn, unitId),
    [unitTemplateFn, unitId],
  );
  useEffect(() => {
    loadedCallback?.(unit);
    return hostSystem.registerUnitInstance(unit);
  }, [unit, loadedCallback]);

  useEffect(() => {
    hostSystem.reserveConnectionChange(unitId, destSpec);
  }, [unitId, destSpec]);

  return <unit.RenderUi />;
};
