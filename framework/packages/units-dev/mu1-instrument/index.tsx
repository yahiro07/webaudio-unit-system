import "@wus/mo/styles";
import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import { getUnitInterface } from "wus-unit-types";

const unitInterface = getUnitInterface();

unitInterface?.declareUnitFeatures({
  type: "instrument",
  categoryHint: "synthesizer",
  outputs: ["audio"],
  inputs: ["note"],
});

const audioContext = unitInterface?.audioContext ?? new AudioContext();
const destinationNode =
  unitInterface?.primaryOutputPort.audioOutput.node ?? audioContext.destination;

function midiToFrequency(midiNote: number): number {
  return 440 * 2 ** ((midiNote - 69) / 12);
}

function createAppModel() {
  const noteNodes: Record<number, OscillatorNode> = {};

  return {
    async noteOn(noteNumber: number) {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      const freq = midiToFrequency(noteNumber);
      const oscillatorNode = audioContext.createOscillator();
      oscillatorNode.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillatorNode.type = "sawtooth";
      oscillatorNode.connect(destinationNode);
      oscillatorNode.start();
      noteNodes[noteNumber] = oscillatorNode;
    },
    noteOff(noteNumber: number) {
      const oscillatorNode = noteNodes[noteNumber];
      if (oscillatorNode) {
        oscillatorNode.stop();
        if (noteNodes[noteNumber]) {
          delete noteNodes[noteNumber];
        }
      }
    },
  };
}
const appModel = createAppModel();

function ToneButton(props: { label: string; noteNumber: number }) {
  return (
    <div
      className="w-[60px] border border-gray-600 bg-gray-200 flex-c text-[40px] cursor-pointer"
      onPointerDown={() => appModel.noteOn(props.noteNumber)}
      onPointerUp={() => appModel.noteOff(props.noteNumber)}
    >
      {props.label}
    </div>
  );
}

function setupUnitInstance() {
  unitInterface?.primaryInputPort.setHandlers({
    noteInput: {
      noteOn(noteNumber) {
        appModel.noteOn(noteNumber);
      },
      noteOff(noteNumber) {
        appModel.noteOff(noteNumber);
      },
    },
  });
  unitInterface?.completeSetup();
}
setupUnitInstance();

function App() {
  return (
    <div className="w-dvw h-dvh flex-vc gap-4 bg-orange-200">
      <div>mu1-instrument</div>
      <div className="flex-c gap-4">
        <ToneButton label="C" noteNumber={60} />
        <ToneButton label="D" noteNumber={62} />
        <ToneButton label="E" noteNumber={64} />
      </div>
    </div>
  );
}

mountAppRoot(<App />);
