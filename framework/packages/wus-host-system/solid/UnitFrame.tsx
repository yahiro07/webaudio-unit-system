/** @jsxImportSource solid-js */

import { arrayExclude } from "@wus/ax/array-utils";
import { createEffect, createSignal, JSX, onMount } from "solid-js";
import { HostInterface } from "../contract";
import {
  HostSystem,
  hostSystem_createHostInterfaceForUnit,
  hostSystem_setUnitDestination,
  hostSystem_wrapAddUnitAgent,
  UnitAgentInHostSide,
} from "../host";

export const UnitFrame = (props: {
  unitId: string;
  pageUri: string;
  destUnitId?: string;
  hostBpm?: number;
  hostPlaying?: boolean;
  inputNotes?: number[];
  hostSystem: HostSystem;
  className?: string;
  style?: JSX.DOMAttributes<HTMLIFrameElement>["style"];
}) => {
  let iframe: HTMLIFrameElement | undefined;
  const [unitAgent, setUnitAgent] = createSignal<UnitAgentInHostSide>();
  let currentNotes: number[] = [];

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

  onMount(() => {
    const win = iframe?.contentWindow as {
      hostInterface?: HostInterface;
    };
    if (win) {
      win.hostInterface = hostSystem_createHostInterfaceForUnit(
        props.hostSystem,
        props.unitId,
        (_unitAgent) => {
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
        },
      );
    }
  });
  return (
    <iframe
      class={props.className}
      style={props.style}
      ref={iframe}
      src={props.pageUri}
      title="unit"
    />
  );
};
