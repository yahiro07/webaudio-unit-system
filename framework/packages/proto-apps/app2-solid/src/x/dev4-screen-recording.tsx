import "@wus/mo/styles";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { Button } from "@wus/mo-solid/components/button";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createStore } from "solid-js/store";
import catalog from "../unit-inventories.json";

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

const ctDrumMachine = catalog["drum-machine"];

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc">
      <div>screen recording dev</div>
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        pageUrl={ctDrumMachine.loaderPageUrl}
        frameSize={ctDrumMachine.preferredSize}
        hostSystem={appModel.hostSystem}
        hostPlaying={appModel.state.playing}
        hostBpm={appModel.state.bpm}
      />
      <Button
        text="play"
        active={appModel.state.playing}
        onClick={appModel.togglePlayState}
      />
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(() => <App />);
