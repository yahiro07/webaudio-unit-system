import { CSSProperties } from "react";

export type Size = { width: number; height: number };
export type FrameSizeInput = Size | [number, number] | string;

export function normalizeFrameSize(
  size: FrameSizeInput | undefined,
): Size | undefined {
  if (Array.isArray(size)) {
    return { width: size[0], height: size[1] };
  } else if (typeof size === "string") {
    if (size.includes(",")) {
      const [width, height] = size.split(",").map((s) => Number(s.trim()));
      return { width, height };
    } else if (size.includes("x")) {
      const [width, height] = size.split("x").map((s) => Number(s.trim()));
      return { width, height };
    }
  } else if (typeof size === "object") {
    return size;
  }
  return undefined;
}

export function mergeStyleWithFrameSize(
  style?: CSSProperties,
  size?: FrameSizeInput,
): CSSProperties | undefined {
  if (!style && !size) return undefined;
  const normalizedSize = normalizeFrameSize(size);
  if (!normalizedSize) return style;
  return {
    ...style,
    width: `${normalizedSize.width}px`,
    height: `${normalizedSize.height}px`,
  };
}
