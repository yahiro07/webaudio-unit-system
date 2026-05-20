/** @jsxImportSource solid-js */

import { arrayExclude } from "@wus/ax/array-utils";
import {
  createEffect,
  createMemo,
  createSignal,
  JSX,
  onCleanup,
  onMount,
} from "solid-js";
import { HostInterface } from "../contract";
import {
  HostSystem,
  hostSystem_createHostInterfaceForUnit,
  hostSystem_setUnitDestination,
  hostSystem_wrapAddUnitAgent,
  UnitAgentInHostSide,
} from "../host";

const HOST_INTERFACE_REGISTRY_KEY = "__wusHostInterfaceRegistry";

type Size = { width: number; height: number };
type FrameSizeInput = Size | [number, number] | string;

function normalizeFrameSize(
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

export const UnitFrame = (props: {
  unitId: string;
  pageUrl?: string;
  destUnitId?: string;
  hostBpm?: number;
  hostPlaying?: boolean;
  inputNotes?: number[];
  hostSystem: HostSystem;
  className?: string;
  style?: JSX.CSSProperties;
  frameSize?: FrameSizeInput;
}) => {
  console.log(`loading ${props.pageUrl}`);
  const [unitAgent, setUnitAgent] = createSignal<UnitAgentInHostSide>();
  let currentNotes: number[] = [];

  const startTime = Date.now();

  const frameSize = createMemo(() => normalizeFrameSize(props.frameSize));

  const mergedStyle = createMemo<JSX.CSSProperties>(() => {
    const size = frameSize();
    return {
      ...(props.style ?? {}),
      ...(size ? { width: `${size.width}px`, height: `${size.height}px` } : {}),
    };
  });

  createEffect(() => {
    const bpm = props.hostBpm;
    const agent = unitAgent();
    if (agent && bpm !== undefined) {
      agent.setBpm?.(bpm);
    }
  });
  createEffect(() => {
    const playing = props.hostPlaying;
    const agent = unitAgent();
    if (agent && playing !== undefined) {
      agent.setPlayState?.(playing);
    }
  });
  createEffect(() => {
    const { inputNotes } = props;
    const agent = unitAgent();
    if (agent && inputNotes !== undefined) {
      const notesAdded = arrayExclude(inputNotes, currentNotes);
      const notesRemoved = arrayExclude(currentNotes, inputNotes);
      for (const note of notesAdded) {
        agent.noteInput?.noteOn?.(note, 1.0);
      }
      for (const note of notesRemoved) {
        agent.noteInput?.noteOff?.(note);
      }
      currentNotes = inputNotes;
    }
  });
  createEffect(() => {
    if (unitAgent()) {
      hostSystem_setUnitDestination(
        props.hostSystem,
        props.unitId,
        props.destUnitId,
      );
    }
  });

  const onUnitAgentLoaded = (_unitAgent: UnitAgentInHostSide) => {
    setUnitAgent(_unitAgent);
    hostSystem_wrapAddUnitAgent(props.hostSystem, _unitAgent);
    console.log(`unitAgent loaded for ${props.unitId}`);
    hostSystem_setUnitDestination(
      props.hostSystem,
      props.unitId,
      props.destUnitId,
    );
    if (props.hostBpm !== undefined) {
      _unitAgent.setBpm?.(props.hostBpm);
    }
    if (props.hostPlaying !== undefined) {
      _unitAgent.setPlayState?.(props.hostPlaying);
    }
    const completeTime = Date.now();
    console.log(`${props.unitId} loaded in ${completeTime - startTime} ms`);
  };

  const hostInterface = hostSystem_createHostInterfaceForUnit(
    props.hostSystem,
    props.unitId,
    onUnitAgentLoaded,
  );

  if (
    props.pageUrl &&
    (props.pageUrl.startsWith("http://") ||
      props.pageUrl.startsWith("https://"))
  ) {
    const pageUrl = props.pageUrl;
    let iframe: HTMLIFrameElement | undefined;
    onMount(async () => {
      if (!iframe) return;

      const parentWindow = window as Window & {
        [HOST_INTERFACE_REGISTRY_KEY]?: Record<string, HostInterface>;
      };
      const registry = (parentWindow[HOST_INTERFACE_REGISTRY_KEY] ??=
        Object.create(null));
      registry[props.unitId] = hostInterface;
      onCleanup(() => {
        delete registry[props.unitId];
      });

      const baseUrl = pageUrl.slice(0, pageUrl.lastIndexOf("/")) + "/";
      const html = await fetch(pageUrl).then((res) => res.text());
      const bootstrap = [
        `<base href="${baseUrl}">`,
        "<script>",
        `window.hostInterface = window.parent.${HOST_INTERFACE_REGISTRY_KEY}[${JSON.stringify(props.unitId)}];`,
        "</script>",
      ].join("");
      const content = html.includes("<head>")
        ? html.replace("<head>", `<head>${bootstrap}`)
        : `${bootstrap}${html}`;
      iframe.srcdoc = content;
    });
    return (
      <iframe class={props.className} style={mergedStyle()} ref={iframe} />
    );
  } else {
    let iframe: HTMLIFrameElement | undefined;
    onMount(async () => {
      if (!iframe) return;
      const win = iframe.contentWindow;
      (win as any).hostInterface = hostInterface;
    });
    return (
      <iframe
        class={props.className}
        style={mergedStyle()}
        src={props.pageUrl}
        ref={iframe}
      />
    );
  }
};
