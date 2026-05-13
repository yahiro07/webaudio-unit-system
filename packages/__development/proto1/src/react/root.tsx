import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";

import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import "@/core/unit-frame-element";
import { setupMidiKeyboardInput } from "@wus/mo/midi-keyboard-input";
import { Button } from "@wus/mo-react/components/button";
import { FeNumberSliderBox } from "@wus/mo-react/components/number-slider-box";
import { useCallback, useEffect } from "react";
import { createStore } from "snap-store";
import { createHostSystem } from "@/core/host-system";

type StoreState = {
  bpm: number;
  playing: boolean;
  notes: number[];
};

function createAppModel() {
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
  return { hostSystem, store, ...actions };
}
const appModel = createAppModel();

function App() {
  const state = appModel.store.useSnapshot();

  useEffect(
    () =>
      setupMidiKeyboardInput({
        noteCallback(noteNumber, velocity) {
          if (velocity > 0) {
            appModel.noteOn(noteNumber);
          } else {
            appModel.noteOff(noteNumber);
          }
        },
      }),
    [],
  );
  const refSupplyHostSystem = useCallback((el: UnitFrameElement) => {
    el.hostSystem = appModel.hostSystem;
  }, []);
  return (
    <div className="w-dvw h-dvh flex-vc">
      <unit-frame
        unit-id="mu3"
        src="/units/mu3-effect.html"
        ref={refSupplyHostSystem}
        dest-unit-id="$output"
      />
      <unit-frame
        unit-id="mu1"
        src="/units/mu1-instrument.html"
        // input-notes={appModel.state.notes}
        ref={refSupplyHostSystem}
        dest-unit-id="mu3"
      />
      <unit-frame
        unit-id="mu2"
        src="units/mu2-sequencer.html"
        host-bpm={state.bpm}
        host-playing={state.playing}
        // input-notes={appModel.state.notes}
        ref={refSupplyHostSystem}
        dest-unit-id="mu1"
      />
      <div>{JSON.stringify(state.notes)}</div>
      <div className="flex-ha gap-4">
        <Button
          text="play"
          active={state.playing}
          onClick={appModel.togglePlayState}
        />
        <FeNumberSliderBox
          label="bpm"
          value={state.bpm}
          min={60}
          max={180}
          step={1}
          onChange={appModel.setBpm}
          fracDigits={0}
        />
      </div>
    </div>
  );
}

mountAppRoot(<App />);
