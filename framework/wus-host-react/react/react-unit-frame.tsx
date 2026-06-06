import { useEffect, useMemo } from "react";
import { HostSystem } from "../host";
import { HsUnitInstance } from "../host/host-types";
import {
  instantiateReactUnit,
  ReactUnitTemplateFn,
} from "./react-unit-interface";

type Props = {
  unitId: string;
  unitTemplateFn: ReactUnitTemplateFn;
  destSpec?: string;
  loadedCallback?(unitInstance: HsUnitInstance): void;
  hostSystem: HostSystem;
};

export const ReactUnitFrame = ({
  unitId,
  unitTemplateFn,
  destSpec,
  loadedCallback,
  hostSystem,
}: Props) => {
  const unit = useMemo(
    () => instantiateReactUnit(hostSystem.audioContext, unitTemplateFn, unitId),
    [unitTemplateFn, unitId, hostSystem],
  );
  useEffect(() => {
    loadedCallback?.(unit);
    return hostSystem.registerUnitInstance(unit);
  }, [unit, loadedCallback, hostSystem]);

  useEffect(() => {
    hostSystem.reserveConnectionChange(unitId, destSpec);
  }, [unitId, destSpec, hostSystem]);

  return <unit.RenderUi />;
};
