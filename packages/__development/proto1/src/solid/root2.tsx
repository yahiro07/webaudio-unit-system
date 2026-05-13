/** @jsxImportSource solid-js */
/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";
import { seqNumbers } from "@wus/ax/array-utils";
import { createHostSystem, UnitType } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { generateRandomId } from "@wus/mo/random-id-generator";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createStore, produce } from "solid-js/store";

type UnitTemplate = {
  pageUri: string;
  scaling?: number;
};

const unitTemplates: Record<string, UnitTemplate> = {
  mu1: { pageUri: "/units/mu1-instrument.html", scaling: 0.6 },
  mu2: { pageUri: "/units/mu2-sequencer.html" },
  mu3: { pageUri: "/units/mu3-effect.html" },
  mu4: { pageUri: "/units/mu4-keyboard.html" },
  mu5: { pageUri: "/units/mu5-visualizer.html" },
};

type UnitAssignment = {
  unitId: string;
  // pageUri: string;
  template: UnitTemplate;
};

type UnitSlot = {
  slotId: string;
  targetUnitType: UnitType;
  unitAssignment: UnitAssignment | undefined;
};

type Lane = {
  id: string;
  effectSlot: UnitSlot;
  instrumentSlot: UnitSlot;
  sequencerSlot: UnitSlot;
};

type Scene = {
  lanes: Lane[];
};

function createLane(id: string): Lane {
  return {
    id,
    effectSlot: {
      slotId: `${id}-effect`,
      targetUnitType: "effect",
      unitAssignment: undefined,
    },
    instrumentSlot: {
      slotId: `${id}-instrument`,
      targetUnitType: "instrument",
      unitAssignment: undefined,
    },
    sequencerSlot: {
      slotId: `${id}-sequencer`,
      targetUnitType: "sequencer",
      unitAssignment: undefined,
    },
  };
}

function createScene(): Scene {
  return {
    lanes: seqNumbers(4).map((i) => createLane(`lane${i}`)),
  };
}

function createAppModel() {
  const audioContext = new AudioContext();
  const hostSystem = createHostSystem(audioContext);

  const [state, setState] = createStore<{ scene: Scene }>({
    scene: createScene(),
  });

  const actions = {
    assignUnit(slotId: string, unitTemplateId: string) {
      const unitId = generateRandomId(6);
      const template = unitTemplates[unitTemplateId];
      if (!template) return;
      const laneId = slotId.split("-")[0];
      setState(
        produce((draft) => {
          const lane = draft.scene.lanes.find((lane) => lane.id === laneId);
          if (!lane) return;
          const slot = [
            lane.effectSlot,
            lane.instrumentSlot,
            lane.sequencerSlot,
          ].find((slot) => slot.slotId === slotId);
          if (!slot) return;
          slot.unitAssignment = {
            unitId,
            template,
          };
        }),
      );
    },
  };
  return { hostSystem, state, actions };
}
const appModel = createAppModel();

const presetScenes = {
  setupScenePreset1() {
    appModel.actions.assignUnit("lane0-instrument", "mu1");
  },
};

const UnitView = (props: { unitAssignment: UnitAssignment }) => {
  return (
    <div class="w-full h-full flex-c">
      <div
        style={{
          transform: `scale(${props.unitAssignment.template.scaling ?? 1})`,
          "transform-origin": "center",
        }}
      >
        <UnitFrame
          unitId={props.unitAssignment.unitId}
          pageUri={props.unitAssignment.template.pageUri}
          destUnitId="$output"
          hostSystem={appModel.hostSystem}
        />
      </div>
    </div>
  );
};

const BlankSlotView = (props: { slot: UnitSlot }) => {
  return <div></div>;
};

const SlotView = (props: { slot: UnitSlot }) => {
  return (
    <div class="w-[200px] h-[120px] border border-[#888]">
      {props.slot.unitAssignment ? (
        <UnitView unitAssignment={props.slot.unitAssignment} />
      ) : (
        <BlankSlotView slot={props.slot} />
      )}
    </div>
  );
};

const LaneView = (props: { lane: Lane }) => {
  return (
    <div>
      <SlotView slot={props.lane.effectSlot} />
      <SlotView slot={props.lane.instrumentSlot} />
      <SlotView slot={props.lane.sequencerSlot} />
    </div>
  );
};

const App = () => {
  presetScenes.setupScenePreset1();
  return (
    <div class="w-dvw h-dvh flex-c gap-4">
      {appModel.state.scene.lanes.map((lane) => (
        <LaneView lane={lane} />
      ))}
    </div>
  );
};

mountAppRoot(() => <App />);
