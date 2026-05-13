import "../styles/page.css";
import "../styles/utility-classes.css";
import "../styles/tailwind-sources.css";
import { FeKnob } from "@wus/mo-react/components/knob";
import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import { createStore } from "snap-store";
import { getHostInterface } from "@/common/unit-interfaces";

const store = createStore({ gain: 0.5 });

function setupUnitInstance() {
  const effectUnit = getHostInterface()?.createEffectUnit();
  if (effectUnit) {
    const audioContext = effectUnit.audioContext ?? new AudioContext();
    const gainNode = audioContext.createGain();
    effectUnit.sourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    store.subscribe((attrs) => {
      if (attrs.gain !== undefined) {
        gainNode.gain.value = attrs.gain;
      }
    });
    effectUnit.setup({});
  }
}
setupUnitInstance();

function App() {
  const st = store.useSnapshot();
  const mt = store.mutations;
  return (
    <div className="w-dvw h-dvh flex-vc gap-4 bg-green-200">
      <div>ku3-effect</div>
      <div className="flex-c gap-4">
        <FeKnob label="volume" value={st.gain} onChange={mt.setGain} />
      </div>
    </div>
  );
}

mountAppRoot(<App />);
