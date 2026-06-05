import { mountAppRoot } from "mofur/ax-react";
import { setupMidiKeyboardInput } from "mofur/mx-audio";
import { useEffect } from "react";
import { createStore } from "snap-store";
import { createHostSystem } from "wus-host/host";
import { HostAppProvider, UnitFrame } from "wus-host/react";
import { Button } from "@/components/button";
import { NumberSliderBox } from "@/components/number-slider-box";
import catalog from "./unit-inventories.json";

catalog;

type StoreState = {
  bpm: number;
  playing: boolean;
  notes: number[];
};

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);
const store = createStore<StoreState>({
  bpm: 120,
  playing: false,
  notes: [],
});

const actions = {
  noteOn(noteNumber: number) {
    store.setNotes((prev) => [...prev, noteNumber]);
  },
  noteOff(noteNumber: number) {
    store.setNotes((prev) => prev.filter((p) => p !== noteNumber));
  },
  togglePlayState() {
    store.setPlaying((prev) => !prev);
  },
  setBpm(bpm: number) {
    store.setBpm(bpm);
  },
};

const UnitRows = () => {
  const state = store.useSnapshot();
  return (
    <HostAppProvider
      hostSystem={hostSystem}
      bpm={state.bpm}
      playing={state.playing}
    >
      <UnitFrame
        unitId="uf_effect"
        pageUrl={catalog.mu5Visualizer.loaderPageUrl}
        destUnitId="$output"
        // hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="uf_instrument"
        pageUrl={catalog.miniSynthGe.loaderPageUrl}
        // pageUrl={catalog.mini_synth_ge.loaderPageUrl}
        // className="w-[640px] h-[320px]"
        frameSize={catalog.miniSynthGe.preferredSize}
        destUnitId="uf_effect"
        // hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="uf_keyboard"
        pageUrl={catalog.mu4Keyboard.loaderPageUrl}
        destUnitId="uf_instrument"
        // hostSystem={hostSystem}
        inputNotes={state.notes}
      />
    </HostAppProvider>
  );
};

const PageRoot = () => {
  const state = store.useSnapshot();
  return (
    <div className="w-dvw h-dvh flex-vc">
      <div className="flex-v gap-2">
        <UnitRows />
      </div>
      <div className="flex-ha gap-4">
        <Button
          text="play"
          active={state.playing}
          onClick={actions.togglePlayState}
        />
        <NumberSliderBox
          label="bpm"
          value={state.bpm}
          min={60}
          max={180}
          step={1}
          onChange={actions.setBpm}
          fracDigits={0}
        />
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() =>
    setupMidiKeyboardInput({
      noteOn: actions.noteOn,
      noteOff: actions.noteOff,
    }),
  );
  return <PageRoot />;
};

mountAppRoot(<App />);
