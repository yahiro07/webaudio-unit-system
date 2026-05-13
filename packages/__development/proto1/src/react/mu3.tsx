import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";

import { mountAppRoot } from "@wus/mo-react/mount-app-root";
// import { FeKnob } from "@my/lib/mo-solid/synth-components";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { getHostInterface } from "../common/unit-interfaces";

function createAppModel() {
  const [state, setState] = createStore({
    gain: 0.5,
  });
  return {
    state,
    setState,
  };
}
const appModel = createAppModel();

function setupUnitInstance() {
  const effectUnit = getHostInterface()?.createEffectUnit();
  if (effectUnit) {
    const audioContext = effectUnit.audioContext ?? new AudioContext();
    const gainNode = audioContext.createGain();
    effectUnit.sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    createEffect(() => {
      gainNode.gain.value = appModel.state.gain;
    });
    effectUnit.setup({});
  }
}
setupUnitInstance();

function App() {
  const vm = {
    gain() {
      return appModel.state.gain;
    },
    setGain(v: number) {
      appModel.setState({ gain: v });
    },
  };
  return (
    <div className="w-dvw h-dvh flex-vc gap-4 bg-green-300">
      <div>ku3-effect</div>
      <div className="flex-c gap-4">
        {/* <FeKnob label="volume" value={vm.gain()} onChange={vm.setGain} /> */}
      </div>
    </div>
  );
}

mountAppRoot(<App />);
