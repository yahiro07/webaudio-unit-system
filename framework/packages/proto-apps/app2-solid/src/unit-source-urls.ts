const repositoryRoot = new URL("../../../../..", import.meta.url).href;

const wusCustomUnitsLocalRoot = new URL(
  "../../../../../../wus-custom-units/",
  import.meta.url,
).href;

// console.log({ repositoryRoot, wusCustomUnitsLocalRoot });

export const unitSourceUrls_array = [
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/additive/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/wasyn-1/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/webaudio-tinysynth-simple/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/koodori/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-synth-v2/",
  `${wusCustomUnitsLocalRoot}koodori/dist/`,
  `${wusCustomUnitsLocalRoot}webaudio-synth-v2/web/`,
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu2-sequencer/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu3-effect/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu4-keyboard/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu5-visualizer/",
  `${repositoryRoot}units/units-dev/dist/mu1-instrument/`,
  `${repositoryRoot}units/units-dev/dist/mu2-sequencer/`,
  `${repositoryRoot}units/units-dev/dist/mu3-effect/`,
  `${repositoryRoot}units/units-dev/dist/mu4-keyboard/`,
  `${repositoryRoot}units/units-dev/dist/mu5-visualizer/`,
];

export const unitSourceUrls = {
  additive:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/additive/",
  drumMachine:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/drum-machine/",
  wasyn1:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/wasyn-1/",
  webaudioTinysynthSimple:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/webaudio-tinysynth-simple/",
  // koodori:
  // "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/koodori/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-synth-v2/",
  koodori: `${wusCustomUnitsLocalRoot}koodori/dist/`,
  webaudioSynthV2: `${wusCustomUnitsLocalRoot}webaudio-synth-v2/web/`,
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu2-sequencer/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu3-effect/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu4-keyboard/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu5-visualizer/",
  mu1Instrument: `${repositoryRoot}units/units-dev/dist/mu1-instrument/`,
  mu2Sequencer: `${repositoryRoot}units/units-dev/dist/mu2-sequencer/`,
  mu3Effect: `${repositoryRoot}units/units-dev/dist/mu3-effect/`,
  mu4Keyboard: `${repositoryRoot}units/units-dev/dist/mu4-keyboard/`,
  mu5Visualizer: `${repositoryRoot}units/units-dev/dist/mu5-visualizer/`,
};

console.log("unit sources:", unitSourceUrls);
