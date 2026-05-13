import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";

import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import "@wus/host-system/web-components";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/react";
import { setupMidiKeyboardInput } from "@wus/mo/midi-keyboard-input";
import { Button } from "@wus/mo-react/components/button";
import { FeNumberSliderBox } from "@wus/mo-react/components/number-slider-box";
import { useCallback, useEffect } from "react";
import { createStore } from "snap-store";

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

const UnitsWebComponents = () => {
  const state = appModel.store.useSnapshot();
  const refSupplyHostSystem = useCallback((el: UnitFrameElement) => {
    el.hostSystem = appModel.hostSystem;
  }, []);
  return (
    <>
      <unit-frame
        unit-id="mu3"
        src="/units/mu3-effect.html"
        ref={refSupplyHostSystem}
        dest-unit-id="$output"
      />
      <unit-frame
        unit-id="mu1"
        src="/units/mu1-instrument.html"
        ref={refSupplyHostSystem}
        dest-unit-id="mu3"
      />
      <unit-frame
        unit-id="mu2"
        src="units/mu2-sequencer.html"
        host-bpm={state.bpm}
        host-playing={state.playing}
        ref={refSupplyHostSystem}
        dest-unit-id="mu1"
      />
      <unit-frame
        unit-id="mu4"
        src="units/mu4-keyboard.html"
        ref={refSupplyHostSystem}
        dest-unit-id="mu2"
      />
    </>
  );
};

const UnitsReact = () => {
  const { hostSystem } = appModel;
  const state = appModel.store.useSnapshot();
  return (
    <>
      <UnitFrame
        unitId="mu3"
        pageUri="/units/mu3-effect.html"
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
        hostBpm={state.bpm}
        hostPlaying={state.playing}
        destUnitId="mu1"
        hostSystem={hostSystem}
      />
      <UnitFrame
        unitId="mu4"
        pageUri="units/mu4-keyboard.html"
        destUnitId="mu2"
        hostSystem={hostSystem}
        inputNotes={state.notes}
      />
    </>
  );
};

const PageRoot = () => {
  const state = appModel.store.useSnapshot();
  return (
    <div className="w-dvw h-dvh flex-vc">
      <div>{JSON.stringify(state.notes)}</div>
      {0 && <UnitsWebComponents />}
      {1 && (
        <div className="flex-v gap-2">
          <UnitsReact />
        </div>
      )}
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
};

const App = () => {
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
  return <PageRoot />;
};

mountAppRoot(<App />);
