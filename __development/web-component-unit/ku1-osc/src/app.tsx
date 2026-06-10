import { createStore } from "snap-store";
import { UnitInterface } from "wus-unit-types";

export type UnitSetupArgs = {
  unitInterface: UnitInterface;
};

export function createUnitApp(setupArgs: UnitSetupArgs) {
  const { unitInterface } = setupArgs;

  const sore = createStore({
    count: 0,
  });

  const actions = {
    playTestTone(noteNumber: number) {
      const ac = unitInterface.audioContext;
      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 440 * 2 ** ((noteNumber - 69) / 12);
      osc.connect(unitInterface.primaryOutputPort.audioOutput.node);
      osc.start();
      setTimeout(() => {
        osc.stop();
      }, 1000);
    },
  };
  unitInterface.completeSetup({
    unitAspects: {
      unitType: "instrument",
      outputs: ["audio"],
      inputs: ["note"],
    },
    primaryInputPortHandlers: {
      noteInput: {
        noteOn(note) {
          actions.playTestTone(note);
        },
        noteOff() {},
      },
    },
  });

  return {
    RenderUi() {
      const { count } = sore.useSnapshot();
      return (
        <div class="primary">
          hello preact 1951
          <div class="border border-teal-500 bg-gray-200 p-4">{count}</div>
          <button
            type="button"
            onClick={() => sore.setCount((prev) => prev + 1)}
          >
            +
          </button>
          <button type="button" onClick={() => actions.playTestTone(69)}>
            Play Test Tone
          </button>
        </div>
      );
    },
  };
}
