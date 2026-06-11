/** biome-ignore-all lint/correctness/useJsxKeyInIterable: solid */

import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { createStore } from "solid-js/store";
import { queryUnitInterface } from "wus-unit-types";
import "@wus/mo/styles";
import { mapUnaryFrom, mapUnaryTo } from "@wus/ax/number-utils";
import { createEffect } from "solid-js";

const [state, setState] = createStore<{
  fftData: Float32Array | undefined;
  sampleRate: number;
}>({
  fftData: undefined,
  sampleRate: 0,
});

function setupUnitInstance() {
  const unitInterface = queryUnitInterface("wus-v01");
  if (unitInterface) {
    const audioContext = unitInterface.audioContext;
    setState({ sampleRate: audioContext.sampleRate });
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 1024;
    const getLevels = () => {
      const levels = new Float32Array(analyzer.frequencyBinCount);
      analyzer.getFloatFrequencyData(levels);
      return levels;
    };
    setInterval(() => {
      const fftData = getLevels();
      setState({ fftData });
    }, 16);

    unitInterface.audioInputNode.connect(analyzer);
    analyzer.connect(unitInterface.audioOutputNode);

    unitInterface.completeSetup({
      unitAspects: {
        unitType: "effect",
        categoryHint: "visualizer",
        outputs: ["audio"],
        inputs: ["audio"],
      },
    });
  }
}
setupUnitInstance();

function frequencyToMidiNoteNumber(freq: number) {
  return 69 + 12 * Math.log2(freq / 440);
}

function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

const CanvasArea = () => {
  let canvas: HTMLCanvasElement | undefined;

  const vm = {
    sampleRate: () => state.sampleRate,
    fftData: () => state.fftData,
  };

  createEffect(() => {
    const sampleRate = vm.sampleRate();
    const fftData = vm.fftData();
    if (!(fftData && canvas && sampleRate)) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.lineWidth = 4;
    // ctx.strokeStyle = "#0f03";
    // ctx.moveTo(0, canvas.height / 2);

    const topFreq = sampleRate / 2;
    for (let i = 0; i < fftData.length; i++) {
      const pp = i / (fftData.length - 1);

      let value = mapUnaryFrom(fftData[i], -120, 0, true);
      if (0) {
        value *= (1 - pp) * (1 - pp);
        const frequency = pp * topFreq;
        const noteNumber = frequencyToMidiNoteNumber(frequency);
        const angle = degToRad(noteNumber * 30);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const baseRadius = cy;

        // const octave = (noteNumber / 12) >>> 0;
        // const ra = linearInterpolate(octave, 0, 10, 0.2, 0.8, true);
        const ra = 0.5 - value * 0.5;
        const rb = 0.5 + value * 0.5;

        const pax = cx + Math.cos(angle) * ra * baseRadius;
        const pay = cy + Math.sin(angle) * ra * baseRadius;
        const pbx = cx + Math.cos(angle) * rb * baseRadius;
        const pby = cy + Math.sin(angle) * rb * baseRadius;

        // const hue = pp * 360;
        // const color = `hsla(${hue}, ${100}%, ${value * 100}%, .3)`;
        const color = "#08f4";

        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(pax, pay);
        ctx.lineTo(pbx, pby);
        ctx.stroke();
      } else {
        const px = pp * canvas.width;
        const py = mapUnaryTo(value, canvas.height, 0);
        ctx.strokeStyle = "#0f0";
        ctx.beginPath();
        ctx.moveTo(px, canvas.height);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
    }
  });

  return (
    <div class="w-[240px] h-[120px] bg-white">
      <canvas ref={canvas} width="200" height="100" class="w-full h-full" />
    </div>
  );
};

function App() {
  return (
    <div class="w-dvw h-dvh bg-green-200 flex-c">
      <CanvasArea />
    </div>
  );
}

mountAppRoot(() => <App />);
