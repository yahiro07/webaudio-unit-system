import "@wus/mo/styles";
import { getHostInterface } from "@wus/host-system/unit";
import { FeKnob } from "@wus/mo-react/components/knob";
import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import { createStore } from "snap-store";

const store = createStore({ gain: 0.5 });

function setupUnitInstance() {
  const hostInterface = getHostInterface();
  if (hostInterface) {
    const audioContext = hostInterface.audioContext ?? new AudioContext();
    const gainNode = audioContext.createGain();
    hostInterface.audioSourceNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    store.subscribe((attrs) => {
      if (attrs.gain !== undefined) {
        gainNode.gain.value = attrs.gain;
      }
    });
    hostInterface.setupUnitAgent({
      type: "effect",
    });
  }
}
setupUnitInstance();

function App() {
  const st = store.useSnapshot();
  const mt = store.mutations;
  return (
    <div className="w-dvw h-dvh flex-vc gap-4 bg-green-200">
      <div>mu3-effect</div>
      <div className="flex-c gap-4">
        <FeKnob label="volume" value={st.gain} onChange={mt.setGain} />
      </div>
    </div>
  );
}

mountAppRoot(<App />);
