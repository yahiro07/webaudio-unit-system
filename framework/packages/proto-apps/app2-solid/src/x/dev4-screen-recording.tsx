import "@wus/mo/styles";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { Button } from "@wus/mo-solid/components/button";
import { FeNumberSliderBox } from "@wus/mo-solid/components/number-slider-box";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createStore } from "solid-js/store";
import catalog from "../unit-inventories.json";
import { createScreenRecorder, openVideoInNewTab } from "./screen-recorder";

const screenRecorder = createScreenRecorder();

type StoreState = {
  bpm: number;
  playing: boolean;
  notes: number[];
};

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

function createAppStore() {
  const [state, setState] = createStore<StoreState>({
    bpm: 120,
    playing: false,
    notes: [],
  });
  return { state, setState };
}
const store = createAppStore();

const uiActions = {
  noteOn(noteNumber: number) {
    store.setState("notes", (prev) => [...prev, noteNumber]);
  },
  noteOff(noteNumber: number) {
    store.setState("notes", (prev) => prev.filter((p) => p !== noteNumber));
  },
  togglePlayState() {
    store.setState("playing", (prev) => !prev);
  },
  setPlayState(playing: boolean) {
    store.setState("playing", playing);
  },
  setBpm(bpm: number) {
    store.setState("bpm", bpm);
  },
  startRecording() {
    //1 bar
    const recordingDurationSec = (60 / store.state.bpm) * 4;
    screenRecorder.doRecording({
      recordingDurationSec,
      onStart() {
        console.log("Recording started");
        uiActions.setPlayState(true);
      },
      onEnd() {
        uiActions.setPlayState(false);
      },
      onComplete(recordedBlob) {
        console.log("Recording completed", recordedBlob);
        openVideoInNewTab(recordedBlob);
      },
    });
  },
};

// const ctDrumMachine = catalog["drum-machine"];
// const ctDrumMachine = catalog["koodori"];
const ctDrumMachine = catalog["my-drum-machine"];

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc gap-4">
      <div>screen recording dev</div>
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        pageUrl={ctDrumMachine.loaderPageUrl}
        frameSize={ctDrumMachine.preferredSize}
        hostSystem={hostSystem}
        hostPlaying={store.state.playing}
        hostBpm={store.state.bpm}
      />
      <div class="flex-h gap-2">
        <Button
          text="play"
          active={store.state.playing}
          onClick={uiActions.togglePlayState}
        />
        <FeNumberSliderBox
          label="bpm"
          value={store.state.bpm}
          min={60}
          max={180}
          step={1}
          onChange={uiActions.setBpm}
          fracDigits={0}
        />
        <Button text="record" onClick={uiActions.startRecording} />
      </div>
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(() => <App />);
