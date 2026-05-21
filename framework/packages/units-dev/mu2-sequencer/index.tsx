/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import { seqNumbers } from "@wus/ax/array-utils";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { getHostInterface } from "@wus/unit-types";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import "@wus/mo/styles";
import { createIntervalTimer } from "@wus/ax/timer-utils";
import { Button } from "@wus/mo-solid/components/button";

const hostInterface = getHostInterface();

function createAppModel() {
  const [state, setState] = createStore({
    stepPos: 0,
    internalPlaying: false,
  });

  function onStep(stepPos: number) {
    if (stepPos % 4 === 0) {
      console.log("note on");
      hostInterface?.noteOutputPort.noteOn(48, 0.8);
    } else if (stepPos % 4 === 2) {
      console.log("note off");
      hostInterface?.noteOutputPort.noteOff(48);
    }
    setState({ stepPos });
  }
  return {
    state,
    onStep,
    setState,
  };
}
const appModel = createAppModel();

function setupUnitInstance() {
  hostInterface?.setupUnitAgent({
    type: "sequencer",
    transportHandling: {
      processStep(stepIndex) {
        appModel.onStep(stepIndex);
      },
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

function setupInternalDriver() {
  let stepPos = 0;
  const intervalTimer = createIntervalTimer();
  createEffect(() => {
    if (appModel.state.internalPlaying) {
      intervalTimer.start(() => {
        stepPos = (stepPos + 1) % 16;
        appModel.onStep(stepPos);
      }, 200);
    } else {
      intervalTimer.stop();
    }
  });
}

function MainView() {
  const vm = {
    internalPlaying() {
      return appModel.state.internalPlaying;
    },
    toggleInternalPlayState() {
      appModel.setState({ internalPlaying: !appModel.state.internalPlaying });
    },
  };
  return (
    <div class="w-dvw h-dvh flex-vc gap-4 bg-blue-200">
      <div>mu2-sequencer</div>
      <StepIndicator />
      <Button
        text="play"
        active={vm.internalPlaying()}
        onClick={vm.toggleInternalPlayState}
      />
    </div>
  );
}

function App() {
  setupInternalDriver();
  return <MainView />;
}

mountAppRoot(() => <App />);
