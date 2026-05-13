/** @jsxImportSource solid-js */
/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import { seqNumbers } from "@wus/ax/array-utils";
import { getHostInterface } from "@wus/host-system/unit";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";
import { Button } from "@wus/mo-solid/components/button";

const sequencerUnit = getHostInterface()?.createSequencerUnit();

function createAppModel() {
  const [state, setState] = createStore({
    stepPos: 0,
    playing: false,
  });

  const onStep = () => {
    const stepPos = (state.stepPos + 1) % 16;
    if (stepPos % 4 === 0) {
      console.log("note on");
      sequencerUnit?.outputPort.noteOn(48, 0.8);
    } else if (stepPos % 4 === 2) {
      console.log("note off");
      sequencerUnit?.outputPort.noteOff(48);
    }
    setState({ stepPos });
  };

  let intervalId = null as number | null;
  createEffect(() => {
    if (state.playing) {
      intervalId = setInterval(onStep, 200);
    } else {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });

  return {
    state,
    onStep,
    setState,
  };
}
const appModel = createAppModel();

function setupUnitInstance() {
  sequencerUnit?.setup({
    setPlayState(playing) {
      appModel.setState({ playing });
    },
  });
}
setupUnitInstance();

function StepIndicator() {
  const vm = {
    pos() {
      return appModel.state.stepPos;
    },
  };
  return (
    <div class="flex-h gap-1">
      {seqNumbers(16).map((i) => {
        return (
          <div
            class="w-2 h-2 bg-gray-300"
            style={{ background: i === vm.pos() ? "#0f0" : "#888" }}
          />
        );
      })}
    </div>
  );
}

function App() {
  const vm = {
    playing() {
      return appModel.state.playing;
    },
    togglePlayState() {
      const playing = appModel.state.playing;
      appModel.setState({ playing: !playing });
    },
  };
  return (
    <div class="w-dvw h-dvh flex-vc gap-4 bg-blue-200">
      <div>mu2-sequencer</div>
      <StepIndicator />
      <Button text="play" active={vm.playing()} onClick={vm.togglePlayState} />
    </div>
  );
}

mountAppRoot(() => <App />);
