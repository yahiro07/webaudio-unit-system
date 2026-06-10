import { createStore } from "snap-store";

export const appDi = {
  audioContext: null! as AudioContext,
};

const sore = createStore({
  count: 0,
});

const actions = {
  playTestTone() {
    const ac = appDi.audioContext;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 440;
    osc.connect(ac.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
    }, 1000);
  },
};

export const App = () => {
  const { count } = sore.useSnapshot();
  return (
    <div class="primary">
      hello preact 1951
      <div class="border border-teal-500 bg-gray-200 p-4">{count}</div>
      <button type="button" onClick={() => sore.setCount((prev) => prev + 1)}>
        +
      </button>
      <button type="button" onClick={() => actions.playTestTone()}>
        Play Test Tone
      </button>
    </div>
  );
};
