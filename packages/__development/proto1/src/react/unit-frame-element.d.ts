import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { HostSystem } from "@/core/host-system";

type UnitFrameElementProps = DetailedHTMLProps<
  HTMLAttributes<UnitFrameElement>,
  UnitFrameElement
> & {
  src?: string;
  "unit-id"?: string;
  "host-bpm"?: number;
  "host-playing"?: boolean;
  "input-notes"?: number[];
  "dest-unit-id"?: string;
};

declare global {
  interface UnitFrameElement extends HTMLElement {
    src: string;
    unitId: string;
    hostBpm: number;
    hostPlaying: boolean;
    inputNotes: number[];
    destUnitId: string;
    hostSystem?: HostSystem;
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "unit-frame": UnitFrameElementProps;
    }
  }
}
