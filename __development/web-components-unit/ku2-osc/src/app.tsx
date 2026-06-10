import { createStore } from "snap-store";
import { UnitInterface } from "wus-unit-types";

console.log("ku2-osc import meta url", import.meta.url);

const unitInterface = (window as any).queryUnitInterfaceForModule(
  "wus-v02",
  import.meta.url,
) as UnitInterface;

const audioContext = unitInterface?.audioContext ?? new AudioContext();
const destinationNode =
  unitInterface?.primaryOutputPort.audioOutput.node ?? audioContext.destination;

const sore = createStore({
  count: 0,
});

const actions = {
  playTestTone(noteNumber: number) {
    const osc = audioContext.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 440 * 2 ** ((noteNumber - 69) / 12);
    osc.connect(destinationNode);
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

export const App = () => {
  const { count } = sore.useSnapshot();
  return (
    <div class="primary">
      ku2-osc
      <div class="border border-cyan-500 bg-gray-200 p-4">{count}</div>
      <button type="button" onClick={() => sore.setCount((prev) => prev + 1)}>
        +
      </button>
      <button type="button" onClick={() => actions.playTestTone(69)}>
        Play Test Tone
      </button>
    </div>
  );
};
