import { mountAppRoot } from "mofur/ax-react";
import { setupMidiKeyboardInput } from "mofur/mx-audio";
import { useEffect } from "react";
import { createStore } from "snap-store";
import { createHostSystem } from "wafer-host/core";
import { HostAppProvider, UnitFrame } from "wafer-host/react";
import { Button } from "@/components/button";
import { NumberSliderBox } from "@/components/number-slider-box";
import catalog from "./unit-inventories.json";

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
    <>
      <UnitFrame
        destSpec="$output"
        unitId="uf_effect"
        unitUrl={catalog.mu5Visualizer.loaderPageUrl}
      />
      <UnitFrame
        unitId="uf_instrument"
        unitUrl={catalog.miniSynthGe.loaderPageUrl}
        destSpec="uf_effect"
      />
      <UnitFrame
        destSpec="uf_instrument"
        unitId="uf_keyboard"
        unitUrl={catalog.mu4Keyboard.loaderPageUrl}
        inputNotes={state.notes}
      />
    </>
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
  const state = store.useSnapshot();
  useEffect(() =>
    setupMidiKeyboardInput({
      noteOn: actions.noteOn,
      noteOff: actions.noteOff,
    }),
  );
  return (
    <HostAppProvider
      hostSystem={hostSystem}
      bpm={state.bpm}
      playing={state.playing}
    >
      <PageRoot />
    </HostAppProvider>
  );
};

mountAppRoot(<App />);
