import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { setupMidiKeyboardInput } from "beams/mx-audio/midi-keyboard-input";
import { useEffect } from "react";
import { createStore } from "snap-store";
import { createHostSystem } from "wus-host/host";
import { UnitFrame } from "wus-host/react";
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

const UnitsSolid = () => {
  const state = store.useSnapshot();
  return (
    <>
      <UnitFrame
        unitId="uf_effect"
        pageUrl={catalog.mu5_visualizer.loaderPageUrl}
        destUnitId="$output"
        hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="uf_instrument"
        pageUrl={catalog.mini_synth_ge.loaderPageUrl}
        // pageUrl={catalog.mini_synth_ge.loaderPageUrl}
        // className="w-[640px] h-[320px]"
        frameSize={catalog.mini_synth_ge.preferredSize}
        destUnitId="uf_effect"
        hostSystem={hostSystem}
        hostBpm={state.bpm}
        hostPlaying={state.playing}
      />
      <UnitFrame
        unitId="uf_keyboard"
        pageUrl={catalog.mu4_keyboard.loaderPageUrl}
        destUnitId="uf_instrument"
        hostSystem={hostSystem}
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
        <UnitsSolid />
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
