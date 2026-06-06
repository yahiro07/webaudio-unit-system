import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { HsUnitInstance } from "../host/host-types";
import { createUnitInterface } from "../host/unit-interface-impl";
import { mergeStyleWithFrameSize } from "./frame-size-helper";
import { useHostAppContext } from "./host-app-context";
import { useUnitInputNotesAffecter } from "./unit-input-notes-affecter";

type Props = {
  unitId: string;
  pageUrl: string;
  destSpec?: string;
  loadedCallback?(unitInstance: HsUnitInstance): void;
  className?: string;
  style?: CSSProperties;
  frameSize?: { width: number; height: number };
  // onIframeMounted?(iframe: HTMLIFrameElement): (() => void) | undefined;
  inputNotes?: number[];
};

export const UnitFrame = ({
  unitId,
  pageUrl,
  destSpec,
  loadedCallback,
  className,
  style,
  frameSize,
  inputNotes,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unitInstanceRef = useRef<HsUnitInstance>(null);

  const { hostSystem, hostBpm } = useHostAppContext();

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
    const win = iframe.contentWindow;
    const unitInstantiationPromise = new Promise<HsUnitInstance>((resolve) => {
      (win as any).unitInterface = createUnitInterface(
        hostSystem.audioContext,
        unitId,
        (unitInstance) => {
          // console.log(`unit loaded for ${unitId}`);
          loadedCallback?.(unitInstance);
          unitInstanceRef.current = unitInstance;
          resolve(unitInstance);
        },
      );
    });
    return hostSystem.registerPendingUnitInstancePromise(
      unitId,
      unitInstantiationPromise,
    );
  }, [pageUrl, hostSystem]);

  useEffect(() => {
    if (hostBpm) {
      unitInstanceRef.current?.hostCallbacks?.setHostBpm?.(hostBpm);
    }
  }, [hostBpm]);

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
