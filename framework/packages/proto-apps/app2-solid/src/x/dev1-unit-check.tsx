import "@wus/mo/styles";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { setupMidiKeyboardInput } from "@wus/mo/midi-keyboard-input";
import { Button } from "@wus/mo-solid/components/button";
import { FeNumberSliderBox } from "@wus/mo-solid/components/number-slider-box";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

type StoreState = {
  bpm: number;
  playing: boolean;
  notes: number[];
};

function createAppModel() {
  const audioContext = new AudioContext();
  const hostSystem = createHostSystem(audioContext);
  const [state, setState] = createStore<StoreState>({
    bpm: 120,
    playing: false,
    notes: [],
  });
  const actions = {
    noteOn(noteNumber: number) {
      setState("notes", (prev) => [...prev, noteNumber]);
    },
    noteOff(noteNumber: number) {
      setState("notes", (prev) => prev.filter((p) => p !== noteNumber));
    },
    togglePlayState() {
      setState("playing", (prev) => !prev);
    },
    setBpm(bpm: number) {
      setState("bpm", bpm);
    },
  };
  return { hostSystem, state, setState, ...actions };
}
const appModel = createAppModel();

const devUnitsBase =
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev";

const UnitsSolid = () => {
  const { hostSystem } = appModel;
  const vm = {
    state: () => appModel.state,
  };
  return (
    <>
      <UnitFrame
        unitId="uf_effect"
        pageUrl={`${devUnitsBase}/mu5-visualizer/index.html`}
        // pageUrl="/local-units/mu3-effect/index.html"
        destUnitId="$output"
        hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="uf_instrument"
        // pageUrl="http://localhost:3000/index.html"
        pageUrl="/local-units/mu1-instrument/index.html"
        // pageUrl="https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/koodori/index.html"
        // pageUrl="https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-synth-v2/index.html"
        // pageUrl="https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r4/units/bc-010/index.html"
        destUnitId="uf_effect"
        hostSystem={hostSystem}
        className="w-[800px] h-[600px]"
      />
      <UnitFrame
        unitId="uf_keyboard"
        pageUrl={`${devUnitsBase}/mu4-keyboard/index.html`}
        // pageUrl="/local-units/mu4-keyboard/index.html"
        destUnitId="uf_instrument"
        hostSystem={hostSystem}
        inputNotes={vm.state().notes}
      />
    </>
  );
};

const PageRoot = () => {
  const vm = {
    state: () => appModel.state,
  };
  return (
    <div class="w-dvw h-dvh flex-vc">
      <div>{JSON.stringify(vm.state().notes)}</div>
      <div class="flex-v gap-2">
        <UnitsSolid />
      </div>
      <div class="flex-ha gap-4">
        <Button
          text="play"
          active={vm.state().playing}
          onClick={appModel.togglePlayState}
        />
        <FeNumberSliderBox
          label="bpm"
          value={vm.state().bpm}
          min={60}
          max={180}
          step={1}
          onChange={appModel.setBpm}
          fracDigits={0}
        />
      </div>
    </div>
  );
};

const App = () => {
  const closeMidiIn = setupMidiKeyboardInput({
    noteOn: appModel.noteOn,
    noteOff: appModel.noteOff,
  });
  onCleanup(closeMidiIn);
  return <PageRoot />;
};

mountAppRoot(() => <App />);
