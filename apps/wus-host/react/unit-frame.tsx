import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { FrameSizeInput, mergeStyleWithFrameSize } from "./frame-size";
import { useHostAppContext } from "./host-app-context";
import { createUnitFrameModel } from "./unit-frame-model";

type Props = {
  unitId: string;
  pageUrl?: string;
  destUnitId?: string;
  inputNotes?: number[];
  className?: string;
  style?: CSSProperties;
  frameSize?: FrameSizeInput;
  // iframeAttrs?: Omit<JSX.IntrinsicElements["iframe"], "src" | "title" | "ref">;
  onIframeMounted?(iframe: HTMLIFrameElement): (() => void) | undefined;
};
export const UnitFrame = ({
  unitId,
  pageUrl,
  destUnitId,
  inputNotes,
  className,
  style,
  frameSize,
  onIframeMounted,
}: Props) => {
  if (destUnitId && destUnitId === unitId) {
    throw new Error(
      `UnitFrame ${unitId}: destUnitId cannot be the same as unitId.`,
    );
  }
  const {
    hostSystem,
    bpm: hostBpm,
    playing: hostPlaying,
  } = useHostAppContext();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const model = useMemo(
    () => createUnitFrameModel(hostSystem, unitId),
    [hostSystem, unitId],
  );
  useEffect(() => {
    const iframe = iframeRef.current!;
    const cleanup1 = onIframeMounted?.(iframe);
    const cleanup2 = model.handleIframeMounted(iframe);
    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, [model, onIframeMounted]);
  model.feedAttributes({ destUnitId, hostBpm, hostPlaying, inputNotes });

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
      title="unit"
    />
  );
};
