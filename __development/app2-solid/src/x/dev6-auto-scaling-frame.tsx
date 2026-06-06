import {
  createHostSystem,
  createSequenceTickDriver,
} from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { mountAppRoot } from "mofus/ax-solid";
import { createStore } from "solid-js/store";
import { Button } from "../components/button";
import { FeNumberSliderBox } from "../components/number-slider-box";
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
const sequenceTickDriver = createSequenceTickDriver(hostSystem);

function createAppStore() {
  const [state, setState] = createStore<StoreState>({
    bpm: 130,
    playing: false,
    notes: [],
  });
  return { state, setState };
}
const store = createAppStore();
sequenceTickDriver.setBpm(store.state.bpm);

const uiActions = {
  noteOn(noteNumber: number) {
    store.setState("notes", (prev) => [...prev, noteNumber]);
  },
  noteOff(noteNumber: number) {
    store.setState("notes", (prev) => prev.filter((p) => p !== noteNumber));
  },
  setPlayState(playing: boolean) {
    store.setState("playing", playing);
    if (playing) {
      sequenceTickDriver.start();
    } else {
      sequenceTickDriver.stop();
    }
  },
  togglePlayState() {
    uiActions.setPlayState(!store.state.playing);
  },
  setBpm(bpm: number) {
    store.setState("bpm", bpm);
    sequenceTickDriver.setBpm(bpm);
  },
  startRecording() {
    const bars = 2;
    const recordingDurationSec = (60 / store.state.bpm) * 4 * bars;
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

const commonSize = [240, 150] as [number, number];

function UnitFrameEx(props: {
  catalogKey: keyof typeof catalog;
  unitId: string;
  destUnitId?: string;
}) {
  const pageUrl = catalog[props.catalogKey].loaderPageUrl;
  const { width: frameW, height: frameH } =
    catalog[props.catalogKey].preferredSize;
  // const [frameW, frameH] = frameSize.split(",").map(Number);
  const [outerW, outerH] = commonSize;
  const scaling = Math.min(outerW / frameW, outerH / frameH);
  const planeW = frameW * scaling;
  const planeH = frameH * scaling;
  return (
    <div
      class="bg-gray-300 flex-c"
      style={{ width: `${outerW}px`, height: `${outerH}px` }}
    >
      <div style={{ width: `${planeW}px`, height: `${planeH}px` }}>
        <UnitFrame
          {...props}
          pageUrl={pageUrl}
          hostSystem={hostSystem}
          hostBpm={store.state.bpm}
          hostPlaying={store.state.playing}
          style={{
            width: `${frameW}px`,
            height: `${frameH}px`,
            transform: `scale(${scaling})`,
            "transform-origin": "top left",
          }}
        />
      </div>
    </div>
  );
}
const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc gap-4">
      <div class="flex-ha gap-6">
        <div class="flex-vc gap-2">
          <UnitFrameEx
            destUnitId="$output"
            unitId="mu5"
            catalogKey="mu5Visualizer"
          />
          <UnitFrameEx
            destUnitId="mu5"
            unitId="unit2"
            catalogKey="myDrumMachine"
          />
          <UnitFrameEx unitId="ua1" catalogKey="bc010" />
        </div>
        <div class="flex-vc gap-2">
          <UnitFrameEx
            destUnitId="$output"
            unitId="mu1"
            catalogKey="additive"
          />
          <UnitFrameEx
            destUnitId="mu1"
            unitId="mu2"
            catalogKey="mu2Sequencer"
          />
          <UnitFrameEx unitId="ua1" catalogKey="wasyn1" />
        </div>
        <div class="flex-vc gap-2">
          <UnitFrameEx unitId="ua1" catalogKey="koodori" />
          <UnitFrameEx unitId="ua2" catalogKey="webaudioSynthV2" />
          <UnitFrameEx unitId="ua1" catalogKey="drumMachine" />
        </div>
      </div>

      <div class="flex-ha gap-4">
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
