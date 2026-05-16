/** @jsxImportSource solid-js */

import { arrayExclude } from "@wus/ax/array-utils";
import { createEffect, JSX, onMount } from "solid-js";
import { HostInterface } from "../contract";
import {
  HostSystem,
  hostSystem_createHostInterfaceForUnit,
  hostSystem_wrapAddUnitAgent,
  hostSystem_wrapConnectUnits,
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
  let unitAgent: UnitAgentInHostSide | undefined;
  let currentNotes: number[] = [];

  createEffect(() => {
    const bpm = props.hostBpm;
    if (unitAgent && bpm !== undefined) {
      unitAgent.setBpm?.(bpm);
    }
  });
  createEffect(() => {
    const playing = props.hostPlaying;
    if (unitAgent && playing !== undefined) {
      unitAgent.setPlayState?.(playing);
    }
  });
  createEffect(() => {
    const { inputNotes } = props;
    if (unitAgent && inputNotes !== undefined) {
      const notesAdded = arrayExclude(inputNotes, currentNotes);
      const notesRemoved = arrayExclude(currentNotes, inputNotes);
      for (const note of notesAdded) {
        unitAgent.noteInput?.noteOn?.(note, 1.0);
      }
      for (const note of notesRemoved) {
        unitAgent.noteInput?.noteOff?.(note);
      }
      currentNotes = inputNotes;
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
          unitAgent = _unitAgent;
          hostSystem_wrapAddUnitAgent(props.hostSystem, unitAgent);
          console.log(`unitAgent loaded for ${props.unitId}`);
          if (props.destUnitId) {
            hostSystem_wrapConnectUnits(
              props.hostSystem,
              props.unitId,
              props.destUnitId,
            );
          }
          if (props.hostBpm !== undefined) {
            unitAgent.setBpm?.(props.hostBpm);
          }
          if (props.hostPlaying !== undefined) {
            unitAgent.setPlayState?.(props.hostPlaying);
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
