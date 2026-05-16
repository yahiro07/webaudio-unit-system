/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import "@wus/mo/styles";
import { seqNumbers } from "@wus/ax/array-utils";
import {
  createHostSystem,
  UnitCategoryHint,
  UnitSummariesJson,
  UnitType,
} from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { generateRandomId } from "@wus/mo/random-id-generator";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createSignal, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import _unitsSummary from "./units-summary.json";

type UnitTemplate = {
  templateId: string;
  pagePath: string;
  unitType: UnitType;
  name: string;
  repositoryUrl: string;
  category?: UnitCategoryHint;
  size?: [number, number];
  scaling?: number;
};

function createUnitTemplateEntry(
  unitPageId: string,
  attrs?: { scaling?: number; size?: [number, number] },
): UnitTemplate {
  const unitsSummary = _unitsSummary as UnitSummariesJson;
  const unit = unitsSummary.units.find(
    (unit) => unit.unitPageId === unitPageId,
  );
  if (!unit) {
    throw new Error(`Unit not found: ${unitPageId}`);
  }
  return {
    templateId: unit.unitPageId,
    pagePath: unit.pagePath,
    unitType: unit.unitType,
    name: unit.name,
    repositoryUrl: unit.repositoryUrl,
    category: unit.category,
    ...attrs,
  };
}

const unitTemplates: UnitTemplate[] = [
  createUnitTemplateEntry("mu1-instrument", { scaling: 0.6 }),
  createUnitTemplateEntry("mu2-sequencer", { scaling: 0.6 }),
  createUnitTemplateEntry("mu3-effect", { scaling: 0.6 }),
  createUnitTemplateEntry("mu4-keyboard", { scaling: 0.6 }),
  createUnitTemplateEntry("mu5-visualizer", { scaling: 0.6 }),
  createUnitTemplateEntry("du10-drum-machine", {
    size: [800, 500],
    scaling: 0.2,
  }),
  createUnitTemplateEntry("su11-webaudio-tinysynth", {
    size: [520, 280],
    scaling: 0.4,
  }),
  createUnitTemplateEntry("su12-wasyn-1", { size: [720, 360], scaling: 0.25 }),
  createUnitTemplateEntry("su20-webaudio-synth-v2", {
    size: [700, 400],
    scaling: 0.25,
  }),
];

type UnitAssignment = {
  unitId: string;
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
    assignUnit(slotId: string, templateId: string) {
      const template = unitTemplates.find(
        (template) => template.templateId === templateId,
      );
      if (!template) return;
      const unitId = template.name + "-" + generateRandomId(6);
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
    appModel.actions.assignUnit("lane0-instrument", "mu1-instrument");
  },
};

const UnitView = (props: {
  unitAssignment: UnitAssignment;
  destUnitId?: string;
}) => {
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
          pageUri={props.unitAssignment.template.pagePath}
          destUnitId={props.destUnitId}
          hostSystem={appModel.hostSystem}
          style={
            props.unitAssignment.template.size
              ? {
                  width: `${props.unitAssignment.template.size[0]}px`,
                  height: `${props.unitAssignment.template.size[1]}px`,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
};

const UnitListingView = (props: {
  slot: UnitSlot;
  closeListing: () => void;
}) => {
  const vm = {
    unitTemplatesForThisSlot: unitTemplates.filter(
      (template) => template.unitType === props.slot.targetUnitType,
    ),
    addUnit(template: UnitTemplate) {
      appModel.actions.assignUnit(props.slot.slotId, template.templateId);
    },
  };
  return (
    <div class="flex-vl  h-full" onClick={() => props.closeListing()}>
      {vm.unitTemplatesForThisSlot.map((template) => (
        <div class="cursor-pointer" onClick={() => vm.addUnit(template)}>
          {template.name}
        </div>
      ))}
    </div>
  );
};

const AddableSlotView = (props: { slot: UnitSlot }) => {
  const [isListing, setIsListing] = createSignal(false);
  const vm = {
    toggleListing: () => setIsListing(!isListing()),
    closeListing: () => setIsListing(false),
    openListing: () => setIsListing(true),
  };
  return (
    <div class="h-full">
      <Show when={!isListing()}>
        <div
          class="w-full h-full flex-c cursor-pointer"
          onClick={vm.openListing}
        >
          +
        </div>
      </Show>
      <Show when={isListing()}>
        <UnitListingView slot={props.slot} closeListing={vm.closeListing} />
      </Show>
    </div>
  );
};

const SlotView = (props: {
  slot: UnitSlot;
  canAdd: boolean;
  destUnitId?: string;
}) => {
  return (
    <div class="w-[200px] h-[120px] border border-[#888]">
      {props.slot.unitAssignment ? (
        <UnitView
          unitAssignment={props.slot.unitAssignment}
          destUnitId={props.destUnitId}
        />
      ) : (
        props.canAdd && <AddableSlotView slot={props.slot} />
      )}
    </div>
  );
};

const LaneView = (props: { lane: Lane }) => {
  const vm = {
    get effect() {
      return props.lane.effectSlot.unitAssignment;
    },
    get instrument() {
      return props.lane.instrumentSlot.unitAssignment;
    },
    get sequencer() {
      return props.lane.sequencerSlot.unitAssignment;
    },
    canAddEffect: () => !!vm.instrument && !vm.effect,
    canAddInstrument: () => !vm.instrument,
    canAddSequencer: () => !!vm.instrument && !vm.sequencer,
    effectDestId() {
      if (vm.effect) {
        return "$output";
      }
      return undefined;
    },
    instrumentDestId() {
      if (vm.instrument && vm.effect) {
        return vm.effect.unitId;
      } else if (vm.instrument) {
        return "$output";
      }
      return undefined;
    },
    sequencerDestId() {
      if (vm.sequencer && vm.instrument) {
        return vm.instrument.unitId;
      }
      return undefined;
    },
  };
  return (
    <div class="flex-v">
      <SlotView
        slot={props.lane.effectSlot}
        canAdd={vm.canAddEffect()}
        destUnitId={vm.effectDestId()}
      />
      <SlotView
        slot={props.lane.instrumentSlot}
        canAdd={vm.canAddInstrument()}
        destUnitId={vm.instrumentDestId()}
      />
      <SlotView
        slot={props.lane.sequencerSlot}
        canAdd={vm.canAddSequencer()}
        destUnitId={vm.sequencerDestId()}
      />
    </div>
  );
};

const App = () => {
  presetScenes.setupScenePreset1();
  return (
    <div class="w-dvw h-dvh flex-vc gap-4">
      <div>app2-solid 2010</div>
      <div class="flex-h gap-4">
        {appModel.state.scene.lanes.map((lane) => (
          <LaneView lane={lane} />
        ))}
      </div>
    </div>
  );
};

mountAppRoot(() => <App />);
