const homeDir = process.env.HOME;

function toAbsolutePath(path: string): string {
  return new URL(path, import.meta.url).pathname;
}

const unitsDevDistDir = toAbsolutePath("../../../unit-examples/dist");
// const wusUnitsLocalDistDir = toAbsolutePath("../../../../wus-units/dist");

export const unitSourceUrls = [
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/wavicle/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/specbar/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/proto-engine-ptm-osc/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/proto-engine-pd-fm/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/mini-synth/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/mini-synth-ge/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/mini-synth-gp/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/useq/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r12/lseq1/",
  // `file://${wusUnitsLocalDistDir}/specbar/`,

  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/additive/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/wasyn-1/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/webaudio-tinysynth-simple/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/bc-010/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/koodori/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r12/webaudio-synth-v2/",
  `file://${homeDir}/wus-units/my-drum-machine/`,
  `file://${homeDir}/wus-units/twsq1/`,
  // `file://${unitsDevDistDir}/mu1-instrument/`,
  // `file://${unitsDevDistDir}/mu2-sequencer/`,
  // `file://${unitsDevDistDir}/mu3-effect/`,
  // `file://${unitsDevDistDir}/mu4-keyboard/`,
  // `file://${unitsDevDistDir}/mu5-visualizer/`,
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu1-instrument/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu2-sequencer/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu3-effect/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu4-keyboard/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@r0/unit-examples/dist/mu5-visualizer/",
];
