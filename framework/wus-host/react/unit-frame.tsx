import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { HsUnitInstance } from "../host/host-types";
import { createUnitInterface } from "../host/unit-interface-impl";
import { mergeStyleWithFrameSize } from "../utils/frame-size-helper";
import { useHostAppContext } from "./host-app-context";
import { useUnitInputNotesAffecter } from "./unit-input-notes-affecter";

type Props = {
  unitId: string;
  pageUrl: string;
  destSpec?: string;
  className?: string;
  style?: CSSProperties;
  frameSize?: { width: number; height: number };
  inputNotes?: number[];
  onIframeMounted?(iframe: HTMLIFrameElement): (() => void) | undefined;
  onUnitInstanceLoaded?(unitInstance: HsUnitInstance): void;
};

export const UnitFrame = ({
  unitId,
  pageUrl,
  destSpec,
  className,
  style,
  frameSize,
  inputNotes,
  onIframeMounted,
  onUnitInstanceLoaded,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unitInstanceRef = useRef<HsUnitInstance>(null);

  const { hostSystem, hostBpm, hostPlaying } = useHostAppContext();

  const mergedStyle = useMemo(
    () => mergeStyleWithFrameSize(style, frameSize),
    [style, frameSize],
  );

  useEffect(() => {
    hostSystem.reserveConnectionChange(unitId, destSpec);
  }, [unitId, destSpec, hostSystem]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: add pageUrl to deps
  useEffect(() => {
    const iframe = iframeRef.current!;
    const cleanupIFrameCallback = onIframeMounted?.(iframe);

    const win = iframe.contentWindow;
    const unitInstantiationPromise = new Promise<HsUnitInstance>((resolve) => {
      (win as any).unitInterface = createUnitInterface(
        hostSystem.audioContext,
        unitId,
        (unitInstance) => {
          // console.log(`unit loaded for ${unitId}`);
          onUnitInstanceLoaded?.(unitInstance);
          unitInstanceRef.current = unitInstance;
          resolve(unitInstance);
        },
      );
    });
    const unregisterUnit = hostSystem.registerPendingUnitInstancePromise(
      unitId,
      unitInstantiationPromise,
    );
    return () => {
      unregisterUnit();
      cleanupIFrameCallback?.();
    };
  }, [pageUrl, hostSystem]);

  useEffect(() => {
    if (hostBpm) {
      unitInstanceRef.current?.hostCallbacks?.setBpm?.(hostBpm);
    }
  }, [hostBpm]);

  useEffect(() => {
    const unit = unitInstanceRef.current;
    if (hostPlaying && unit) {
      unit.hostCallbacks?.setPlayState?.(true);
      return () => unit.hostCallbacks?.setPlayState?.(false);
    }
  }, [hostPlaying]);

  useUnitInputNotesAffecter(unitInstanceRef, inputNotes);

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
