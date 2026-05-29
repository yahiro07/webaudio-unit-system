import {
  HostSystem,
  hostSystem_createHostInterfaceForUnit,
  hostSystem_setUnitDestination,
  hostSystem_wrapAddUnitAgent,
  UnitAgentInHostSide,
} from "@/host-system/host";

type UnitAttributes = {
  destUnitId?: string;
  hostBpm?: number;
  hostPlaying?: boolean;
  inputNotes?: number[];
};

export function createUnitFrameModel(hostSystem: HostSystem, unitId: string) {
  let unitAgent: UnitAgentInHostSide | undefined;
  const activeNotes: Set<number> = new Set();
  const currentAttributes: UnitAttributes = {};
  let agentLoaded = false;
  let terminated = false;
  let pendingAttributes: UnitAttributes | undefined;

  const core = {
    setDestUnitId(destUnitId?: string) {
      // console.log(`setting destUnitId for ${unitId}: ${destUnitId}`);
      hostSystem_setUnitDestination(hostSystem, unitId, destUnitId);
    },
    setBpm(bpm?: number) {
      if (bpm) {
        unitAgent?.setBpm?.(bpm);
      }
    },
    setPlayState(playing?: boolean) {
      unitAgent?.setPlayState?.(playing ?? false);
    },
    setInputNotes(inputNotes: number[] | undefined) {
      if (!unitAgent) return;
      if (inputNotes) {
        for (const note of inputNotes) {
          if (!activeNotes.has(note)) {
            unitAgent.noteInput?.noteOn?.(note, 1.0);
            activeNotes.add(note);
          }
        }
      }
      for (const note of activeNotes) {
        if (!inputNotes?.includes(note)) {
          unitAgent.noteInput?.noteOff?.(note);
          activeNotes.delete(note);
        }
      }
    },
    feedAttributes(next: {
      destUnitId?: string;
      hostBpm?: number;
      hostPlaying?: boolean;
      inputNotes?: number[];
    }) {
      // console.log(`feedAttributes`, { unitId, agentLoaded, terminated, next });
      if (!agentLoaded) {
        pendingAttributes = next;
        return;
      }
      if (terminated) return;
      const curr = currentAttributes;
      if (next.destUnitId !== curr.destUnitId) {
        core.setDestUnitId(next.destUnitId);
        curr.destUnitId = next.destUnitId;
      }
      if (next.hostBpm !== curr.hostBpm) {
        core.setBpm(next.hostBpm!);
        curr.hostBpm = next.hostBpm;
      }
      if (next.hostPlaying !== curr.hostPlaying) {
        core.setPlayState(next.hostPlaying!);
        curr.hostPlaying = next.hostPlaying;
      }
      if (next.inputNotes !== curr.inputNotes) {
        core.setInputNotes(next.inputNotes);
        curr.inputNotes = next.inputNotes;
      }
    },
    handleUnitAgentLoaded(_unitAgent: UnitAgentInHostSide) {
      unitAgent = _unitAgent;
      hostSystem_wrapAddUnitAgent(hostSystem, unitAgent);
      console.log(`unitAgent loaded for ${unitId}`);
      agentLoaded = true;
      if (pendingAttributes) {
        core.feedAttributes(pendingAttributes);
        pendingAttributes = undefined;
      }
    },
    handleIframeMounted(iframe: HTMLIFrameElement) {
      const hostInterface = hostSystem_createHostInterfaceForUnit(
        hostSystem,
        unitId,
        core.handleUnitAgentLoaded,
      );
      (iframe.contentWindow as any).hostInterface = hostInterface;

      return () => {
        terminated = true;
        // cleanup here
        // core.setDestUnitId(undefined); //breaks hmr, so skip this for now
        core.setDestUnitId(undefined);
      };
    },
  };
  return {
    handleIframeMounted: core.handleIframeMounted,
    feedAttributes: core.feedAttributes,
  };
}
