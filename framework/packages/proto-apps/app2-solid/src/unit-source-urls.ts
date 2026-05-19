const repositoryRoot = new URL("../../../../..", import.meta.url).href;

const wusCustomUnitsLocalRoot = new URL(
  "../../../../../../wus-custom-units/",
  import.meta.url,
).href;

// console.log({ repositoryRoot, wusCustomUnitsLocalRoot });

export const unitSourceUrls_array = [
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r4/units/additive/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r4/units/drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r4/units/wasyn-1/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r4/units/webaudio-tinysynth-simple/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/koodori/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-synth-v2/",
  `${wusCustomUnitsLocalRoot}koodori/dist/`,
  `${wusCustomUnitsLocalRoot}webaudio-synth-v2/web/`,
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu2-sequencer/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu3-effect/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu4-keyboard/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu5-visualizer/",
  `${repositoryRoot}framework/packages/units-dev/dist/mu1-instrument/`,
  `${repositoryRoot}framework/packages/units-dev/dist/mu2-sequencer/`,
  `${repositoryRoot}framework/packages/units-dev/dist/mu3-effect/`,
  `${repositoryRoot}framework/packages/units-dev/dist/mu4-keyboard/`,
  `${repositoryRoot}framework/packages/units-dev/dist/mu5-visualizer/`,
];

export const unitSourceUrls = {
  additive:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/additive/",
  drumMachine:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/drum-machine/",
  wasyn1:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/wasyn-1/",
  webaudioTinysynthSimple:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/webaudio-tinysynth-simple/",
  bc010:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/bc-010/",
  koodori:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/koodori/",
  webaudioSynthV2:
    "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r5/units/webaudio-synth-v2/",
  // additive: `${wusCustomUnitsLocalRoot}/dist/additive/`,
  // drumMachine: `${wusCustomUnitsLocalRoot}/dist/drum-machine/`,
  // wasyn1: `${wusCustomUnitsLocalRoot}/dist/wasyn-1/`,
  // webaudioTinysynthSimple: `${wusCustomUnitsLocalRoot}/dist/webaudio-tinysynth-simple/`,
  // bc010: `${wusCustomUnitsLocalRoot}/dist/bc-010/`,
  // koodori: `${wusCustomUnitsLocalRoot}/dist/koodori/`,
  // webaudioSynthV2: `${wusCustomUnitsLocalRoot}/dist/webaudio-synth-v2/`,

  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu2-sequencer/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu3-effect/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu4-keyboard/",
  // "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu5-visualizer/",
  mu1Instrument: `${repositoryRoot}framework/packages/units-dev/dist/mu1-instrument/`,
  mu2Sequencer: `${repositoryRoot}framework/packages/units-dev/dist/mu2-sequencer/`,
  mu3Effect: `${repositoryRoot}framework/packages/units-dev/dist/mu3-effect/`,
  mu4Keyboard: `${repositoryRoot}framework/packages/units-dev/dist/mu4-keyboard/`,
  mu5Visualizer: `${repositoryRoot}framework/packages/units-dev/dist/mu5-visualizer/`,
};

console.log("unit sources:", unitSourceUrls);
