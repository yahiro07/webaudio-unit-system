import "@wus/mo/styles";
import { FeKnob } from "@wus/mo-react/components/knob";
import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import { createStore } from "snap-store";
import { getUnitInterface } from "wus-unit-types";

const store = createStore({ gain: 0.5 });

function setupUnitInstance() {
  const unitInterface = getUnitInterface();
  if (unitInterface) {
    const audioContext = unitInterface.audioContext;
    const gainNode = audioContext.createGain();
    unitInterface.primaryInputPort.audioInput.node.connect(gainNode);
    gainNode.connect(unitInterface.primaryOutputPort.audioOutput.node);

    store.subscribe((attrs) => {
      if (attrs.gain !== undefined) {
        gainNode.gain.value = attrs.gain;
      }
    });

    unitInterface.completeSetupWithAttributes({
      unitFeatures: {
        type: "effect",
        categoryHint: "effect",
        outputs: ["audio"],
        inputs: ["audio", "state"],
      },
      primaryInputPortHandlers: {
        stateInput: {
          emitStateBytes() {
            const g = (store.state.gain * 255) >>> 0;
            return new Uint8Array([g]);
          },
          applyStateBytes(state) {
            if (state.length === 1) {
              const g = state[0] / 255;
              store.setGain(g);
            }
          },
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
