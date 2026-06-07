const homeDir = process.env.HOME;

function toAbsolutePath(path: string): string {
  return new URL(path, import.meta.url).pathname;
}

const unitsDevDistDir = toAbsolutePath("../../../unit-examples/dist");
// const wusUnitsLocalDistDir = toAbsolutePath("../../../../wus-units/dist");

export const unitSourceUrls = [
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/wavicle/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/specbar/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/proto-engine-ptm-osc/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/proto-engine-pd-fm/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/mini-synth/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/mini-synth-ge/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/mini-synth-gp/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/useq/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r13/lseq1/",
  // `file://${wusUnitsLocalDistDir}/specbar/`,

  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/additive/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/wasyn-1/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/webaudio-tinysynth-simple/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/bc-010/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/koodori/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r13/webaudio-synth-v2/",
  `file://${homeDir}/wus-units/my-drum-machine/`,
  `file://${homeDir}/wus-units/twsq1/`,

  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu1-instrument/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu2-sequencer/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu3-effect/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu4-keyboard/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu5-visualizer/",

  `file://${unitsDevDistDir}/mu1-instrument/`,
  `file://${unitsDevDistDir}/mu2-sequencer/`,
  `file://${unitsDevDistDir}/mu3-effect/`,
  `file://${unitsDevDistDir}/mu4-keyboard/`,
  `file://${unitsDevDistDir}/mu5-visualizer/`,
];
