import { useEffect, useRef } from "react";
import { HostSystem } from "../host";
import { HsUnitInstance } from "../host/host-types";
import { createUnitInterface } from "../host/unit-interface-impl";

export const UnitFrame = ({
  unitId,
  pageUrl,
  destSpec,
  loadedCallback,
  hostSystem,
}: {
  unitId: string;
  pageUrl: string;
  destSpec?: string;
  loadedCallback?(unitInstance: HsUnitInstance): void;
  hostSystem: HostSystem;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    hostSystem.reserveConnectionChange(unitId, destSpec);
  }, [unitId, destSpec, hostSystem]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: add pageUrl to deps
  useEffect(() => {
    const iframe = iframeRef.current!;
    const win = iframe.contentWindow;
    const unitInstantiationPromise = new Promise<HsUnitInstance>((resolve) => {
      (win as any).unitInterface = createUnitInterface(
        hostSystem.audioContext,
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
  }, [pageUrl, hostSystem]);
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
