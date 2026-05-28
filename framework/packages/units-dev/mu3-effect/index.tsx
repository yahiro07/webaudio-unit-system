import "@wus/mo/styles";
import { FeKnob } from "@wus/mo-react/components/knob";
import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import { createStore } from "snap-store";
import { getHostInterface } from "wus-unit-types";

const store = createStore({ gain: 0.5 });

function setupUnitInstance() {
  const hostInterface = getHostInterface();
  if (hostInterface) {
    const audioContext = hostInterface.audioContext;
    const gainNode = audioContext.createGain();
    hostInterface.audioSourceNode.connect(gainNode);
    gainNode.connect(hostInterface.audioDestinationNode);

    store.subscribe((attrs) => {
      if (attrs.gain !== undefined) {
        gainNode.gain.value = attrs.gain;
      }
    });
    hostInterface.setupUnitAgent({
      type: "effect",
      persistence: {
        emitStateB() {
          const g = (store.state.gain * 255) >>> 0;
          return new Uint8Array([g]);
        },
        loadStateB(state) {
          if (state.length === 1) {
            const g = state[0] / 255;
            store.setGain(g);
          }
        },
      },
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
