/** @jsxImportSource solid-js */
import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";
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

const UnitsSolid = () => {
  const { hostSystem } = appModel;
  const vm = {
    state: () => appModel.state,
  };
  return (
    <>
      {/* <UnitFrame
        unitId="mu3"
        pageUri="/units/mu3-effect.html"
        destUnitId="$output"
        hostSystem={hostSystem}
      /> */}
      <UnitFrame
        unitId="mu3"
        pageUri="/units/mu5-visualizer.html"
        destUnitId="$output"
        hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="mu1"
        pageUri="/units/mu1-instrument.html"
        destUnitId="mu3"
        hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="mu2"
        pageUri="units/mu2-sequencer.html"
        hostBpm={vm.state().bpm}
        hostPlaying={vm.state().playing}
        destUnitId="mu1"
        hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="mu4"
        pageUri="units/mu4-keyboard.html"
        destUnitId="mu2"
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
    noteCallback(noteNumber, velocity) {
      if (velocity > 0) {
        appModel.noteOn(noteNumber);
      } else {
        appModel.noteOff(noteNumber);
      }
    },
  });
  onCleanup(closeMidiIn);
  return <PageRoot />;
};

mountAppRoot(() => <App />);
