/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import "@wus/mo/styles";
import { seqNumbers } from "@wus/ax/array-utils";
import {
  createHostSystem,
  UnitCategoryHint,
  UnitType,
} from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { generateRandomId } from "@wus/mo/random-id-generator";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createSignal, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { UnitInventorySpec } from "wus-vite-unit-loader-plugin";
import unitInventories from "./unit-inventories.json";

type CatalogKey = keyof typeof unitInventories;

type UnitTemplate = {
  catalogKey: CatalogKey;
  pageUrl: string;
  unitType: UnitType;
  name: string;
  repositoryUrl: string;
  category?: UnitCategoryHint;
  size: string;
  scaling?: number;
};

function createUnitTemplateEntry(
  catalogKey: CatalogKey,
  attrs?: { scaling?: number },
): UnitTemplate {
  const unit = unitInventories[catalogKey] as UnitInventorySpec | undefined;
  if (!unit) {
    throw new Error(`Unit not found: ${catalogKey}`);
  }
  return {
    catalogKey: unit.catalogKey as CatalogKey,
    pageUrl: unit.loaderPageUrl,
    unitType: unit.unitType,
    name: unit.name,
    repositoryUrl: unit.repositoryUrl,
    category: unit.category,
    size: unit.preferredSize,
    ...attrs,
  };
}

const unitTemplates: UnitTemplate[] = [
  createUnitTemplateEntry("mu1_instrument", { scaling: 0.6 }),
  createUnitTemplateEntry("mu2_sequencer", { scaling: 0.6 }),
  createUnitTemplateEntry("mu3_effect", { scaling: 0.6 }),
  createUnitTemplateEntry("mu4_keyboard", { scaling: 0.6 }),
  createUnitTemplateEntry("mu5_visualizer", { scaling: 0.6 }),
  createUnitTemplateEntry("my_drum_machine", { scaling: 0.3 }),
  // createUnitTemplateEntry("debugLH3000", {scaling: 0.2}),
  createUnitTemplateEntry("additive", { scaling: 0.2 }),
  createUnitTemplateEntry("wavicle", { scaling: 0.25 }),
  createUnitTemplateEntry("proto_engine", { scaling: 0.17 }),
  createUnitTemplateEntry("mini_synth", { scaling: 0.3 }),
  createUnitTemplateEntry("mini_synth_ge", { scaling: 0.3 }),
  createUnitTemplateEntry("mini_synth_gp", { scaling: 0.25 }),
  createUnitTemplateEntry("bc_010", { scaling: 0.25 }),
  createUnitTemplateEntry("webaudio_tinysynth_simple", { scaling: 0.35 }),
  createUnitTemplateEntry("wasyn_1", { scaling: 0.25 }),
  createUnitTemplateEntry("webaudio_synth_v2", { scaling: 0.25 }),
  createUnitTemplateEntry("koodori", { scaling: 0.2 }),
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
  const _navigator = navigator as { audioSession?: { type: string } };
  if (_navigator.audioSession) {
    _navigator.audioSession.type = "playback";
  }
  const audioContext = new AudioContext();
  const hostSystem = createHostSystem(audioContext);

  const [state, setState] = createStore<{ scene: Scene }>({
    scene: createScene(),
  });

  const actions = {
    assignUnit(slotId: string, catalogKey: CatalogKey) {
      const template = unitTemplates.find(
        (template) => template.catalogKey === catalogKey,
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
    async resumeAudioContext() {
      await audioContext.resume();
      const osc = audioContext.createOscillator();
      osc.frequency.value = 440;
      osc.type = "triangle";
      osc.connect(audioContext.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
      }, 500);
    },
  };
  return { hostSystem, state, actions };
}
const appModel = createAppModel();

const presetScenes = {
  setupScenePreset1() {
    appModel.actions.assignUnit("lane0-instrument", "mu1_instrument");
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
          pageUrl={props.unitAssignment.template.pageUrl}
          destUnitId={props.destUnitId}
          hostSystem={appModel.hostSystem}
          frameSize={props.unitAssignment.template.size}
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
      appModel.actions.assignUnit(props.slot.slotId, template.catalogKey);
    },
  };
  return (
    <div class="flex-vl  h-full text-xs" onClick={() => props.closeListing()}>
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
    <div class="w-[200px] h-[120px] bg-gray-100 overflow-y-auto">
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
    <div class="flex-v gap-1">
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
  // presetScenes.setupScenePreset1();
  return (
    <div class="w-dvw h-dvh flex-vc gap-4 text-[#888]">
      {/* <div>app2-solid 2136</div> */}
      <div class="flex-h gap-4">
        {appModel.state.scene.lanes.map((lane) => (
          <LaneView lane={lane} />
        ))}
      </div>
      {/* <div>
        <Button
          text="resume"
          onClick={() => appModel.actions.resumeAudioContext()}
        />
      </div> */}
    </div>
  );
};

mountAppRoot(() => <App />);
