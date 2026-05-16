import { arrayExclude } from "@wus/ax/array-utils";
import { useEffect, useRef } from "react";
import { HostInterface } from "../contract";
import {
  HostSystem,
  hostSystem_createHostInterfaceForUnit,
  hostSystem_wrapAddUnitAgent,
  hostSystem_wrapConnectUnits,
  UnitAgentInHostSide,
} from "../host";

type Props = {
  unitId: string;
  pageUri: string;
  destUnitId?: string;
  hostBpm?: number;
  hostPlaying?: boolean;
  inputNotes?: number[];
  hostSystem: HostSystem;
};
export const UnitFrame = ({
  unitId,
  pageUri,
  destUnitId,
  hostBpm,
  hostPlaying,
  inputNotes,
  hostSystem,
}: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unitAgentRef = useRef<UnitAgentInHostSide | undefined>(undefined);

  useEffect(() => {
    const win = iframeRef.current?.contentWindow as {
      hostInterface?: HostInterface;
    };
    if (win) {
      win.hostInterface = hostSystem_createHostInterfaceForUnit(
        hostSystem,
        unitId,
        (unitAgent) => {
          unitAgentRef.current = unitAgent;
          hostSystem_wrapAddUnitAgent(hostSystem, unitAgent);
          console.log(`unitAgent loaded for ${unitId}`);
          if (destUnitId) {
            hostSystem_wrapConnectUnits(hostSystem, unitId, destUnitId);
          }
          if (hostBpm !== undefined) {
            unitAgent.setBpm?.(hostBpm);
          }
          if (hostPlaying !== undefined) {
            unitAgent.setPlayState?.(hostPlaying);
          }
        },
      );
    }
  }, []);
  useEffect(() => {
    if (hostBpm !== undefined) {
      unitAgentRef.current?.setBpm?.(hostBpm);
    }
  }, [hostBpm]);
  useEffect(() => {
    if (hostPlaying !== undefined) {
      unitAgentRef.current?.setPlayState?.(hostPlaying);
    }
  }, [hostPlaying]);

  const currentNotes = usePrevious(inputNotes);
  useEffect(() => {
    const agent = unitAgentRef.current;
    if (!(agent && inputNotes && currentNotes)) return;
    const notesAdded = arrayExclude(inputNotes, currentNotes);
    const notesRemoved = arrayExclude(currentNotes, inputNotes);
    for (const note of notesAdded) {
      agent.noteInput?.noteOn?.(note, 1.0);
    }
    for (const note of notesRemoved) {
      agent.noteInput?.noteOff?.(note);
    }
  }, [inputNotes]);

  return <iframe ref={iframeRef} src={pageUri} title="unit" />;
};

function usePrevious<T>(val: T) {
  const ref = useRef<T>(val);
  useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref.current;
}
