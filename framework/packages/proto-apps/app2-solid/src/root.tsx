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

// const baseUrl =
//   "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev";
const baseUrl = "/local-units";

const UnitsSolid = () => {
  const { hostSystem } = appModel;
  const vm = {
    state: () => appModel.state,
  };
  return (
    <>
      <UnitFrame
        destUnitId="$output"
        unitId="mu5"
        pageUrl={`${baseUrl}/mu5-visualizer/index.html`}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="mu5"
        unitId="mu3"
        pageUrl={`${baseUrl}/mu3-effect/index.html`}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="mu3"
        unitId="mu1"
        pageUrl={`${baseUrl}/mu1-instrument/index.html`}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="mu1"
        unitId="mu2"
        pageUrl={`${baseUrl}/mu2-sequencer/index.html`}
        hostBpm={vm.state().bpm}
        hostPlaying={vm.state().playing}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="mu2"
        unitId="mu4"
        pageUrl={`${baseUrl}/mu4-keyboard/index.html`}
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
