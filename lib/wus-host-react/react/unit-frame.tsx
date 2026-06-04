import { useEffect, useRef } from "react";
import { hostSystem } from "../host";
import { HsUnitInstance } from "../host/host-types";
import { createUnitInterface } from "../host/unit-interface-impl";

export const UnitFrame = ({
  unitId,
  pageUrl,
  destSpec,
  loadedCallback,
}: {
  unitId: string;
  pageUrl: string;
  destSpec?: string;
  loadedCallback?(unitInstance: HsUnitInstance): void;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    hostSystem.reserveConnectionChange(unitId, destSpec);
  }, [unitId, destSpec]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: add pageUrl to deps
  useEffect(() => {
    const iframe = iframeRef.current!;
    const win = iframe.contentWindow;
    const unitInstantiationPromise = new Promise<HsUnitInstance>((resolve) => {
      (win as any).unitInterface = createUnitInterface(
        unitId,
        (unitInstance) => {
          loadedCallback?.(unitInstance);
          resolve(unitInstance);
        },
      );
    });
    return hostSystem.registerPendingUnitInstancePromise(
      unitId,
      unitInstantiationPromise,
    );
  }, [pageUrl]);
  return (
    <iframe
      ref={iframeRef}
      src={pageUrl}
      width="200"
      height="100"
      title={unitId}
    />
  );
};
