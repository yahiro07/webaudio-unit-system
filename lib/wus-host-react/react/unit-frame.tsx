import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { HostSystem } from "../host";
import { HsUnitInstance } from "../host/host-types";
import { createUnitInterface } from "../host/unit-interface-impl";
import { mergeStyleWithFrameSize } from "./frame-size-helper";

export const UnitFrame = ({
  unitId,
  pageUrl,
  destSpec,
  loadedCallback,
  hostSystem,
  className,
  style,
  frameSize,
}: {
  unitId: string;
  pageUrl: string;
  destSpec?: string;
  loadedCallback?(unitInstance: HsUnitInstance): void;
  hostSystem: HostSystem;
  // inputNotes?: number[];
  className?: string;
  style?: CSSProperties;
  frameSize?: { width: number; height: number };
  // onIframeMounted?(iframe: HTMLIFrameElement): (() => void) | undefined;
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

  const mergedStyle = useMemo(
    () => mergeStyleWithFrameSize(style, frameSize),
    [style, frameSize],
  );

  return (
    <iframe
      className={className}
      style={mergedStyle}
      ref={iframeRef}
      src={pageUrl}
      title={unitId}
    />
  );
};
