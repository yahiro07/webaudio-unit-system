const repositoryRoot = new URL("../../../../..", import.meta.url).href;

const wusCustomUnitsLocalRoot = new URL(
  "../../../../../../wus-custom-units/",
  import.meta.url,
).href;

console.log({ repositoryRoot, wusCustomUnitsLocalRoot });


export const unitSourceUrls = [
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/additive/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/wasyn-1/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-tinysynth-simple/",
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
