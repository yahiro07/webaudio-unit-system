/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import { seqNumbers } from "@wus/ax/array-utils";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import "@wus/mo/styles";
import { createIntervalTimer } from "@wus/ax/timer-utils";
import { Button } from "@wus/mo-solid/components/button";
import { getUnitInterface } from "wus-unit-types";

const unitInterface = getUnitInterface("wus-v02");

function createAppModel() {
  const [state, setState] = createStore({
    stepPos: 0,
    internalPlaying: false,
  });

  const notNumber = 36 + 9;

  const noteOutput = unitInterface?.primaryOutputPort.noteOutput;

  function onStep(stepPos: number) {
    if (stepPos % 4 === 2) {
      noteOutput?.noteOn(notNumber, 0.8);
    } else if (stepPos % 4 === 0) {
      noteOutput?.noteOff(notNumber);
    }
    setState({ stepPos: stepPos % 16 });
  }

  function allNotesOff() {
    noteOutput?.noteOff(notNumber);
  }
  return {
    state,
    setState,
    onStep,
    allNotesOff,
  };
}
const appModel = createAppModel();

function setupUnitInstance() {
  unitInterface?.completeSetup({
    unitAspects: {
      unitType: "sequencer",
      categoryHint: "stepSequencer",
      outputs: ["note"],
      inputs: ["clock"],
    },
    primaryInputPortHandlers: {
      clockInput: {
        start() {},
        processStep(stepIndex) {
          appModel.onStep(stepIndex);
        },
        stop() {
          appModel.allNotesOff();
        },
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
      stepPos = 0;
      appModel.onStep(0);
      intervalTimer.start(() => {
        stepPos++;
        appModel.onStep(stepPos);
      }, 200);
    } else {
      intervalTimer.stop();
      appModel.allNotesOff();
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
