const homeDir = process.env.HOME;

function toAbsolutePath(path: string): string {
  return new URL(path, import.meta.url).pathname;
}

function getUnitSourceUrls() {
  if (1) {
    const unitsDevDistDir = toAbsolutePath(
      "../../../../webaudio-unit-system/unit-examples/dist",
    );
    const wusUnitsLocalDistDir = toAbsolutePath("../../../../wus-units/dist");
    const wusCustomUnitsLocalDir = toAbsolutePath(
      "../../../../wus-custom-units",
    );
    return [
      `file://${wusUnitsLocalDistDir}/graphite-drum-machine/`,
      `file://${wusCustomUnitsLocalDir}/js/shiny-drum-machine/`,
      `file://${wusCustomUnitsLocalDir}/js/web-audio-mixer/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/vue-audio-mixer/`,

      `file://${wusCustomUnitsLocalDir}/js/midi-synth/`,
      `file://${wusCustomUnitsLocalDir}/js/webaudio-tinysynth-mini/`,
      `file://${wusCustomUnitsLocalDir}/js/webaudio-synth-v2/`,
      `file://${wusCustomUnitsLocalDir}/js/wasyn-1/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/syntho/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/super-oscillator/`,
      `file://${wusCustomUnitsLocalDir}/js/simple-synth/`,

      `file://${wusUnitsLocalDistDir}/wavicle/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/model-1/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/react-synth/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/poly-synth/`,

      `file://${wusCustomUnitsLocalDir}/ts/dist/sk-synth/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/cadence/`,
      `file://${wusCustomUnitsLocalDir}/js/additive/`,
      // `file://${wusCustomUnitsLocalDir}/ts/dist/aura/`,
      `file://${wusCustomUnitsLocalDir}/js/bl-synth-modular/`,

      `file://${wusCustomUnitsLocalDir}/ts/dist/hm-step-sequencer/`,
      `file://${wusCustomUnitsLocalDir}/js/d3-synth-scale/`,

      `file://${wusCustomUnitsLocalDir}/js/webaudio-spectrum/`,
      `file://${wusCustomUnitsLocalDir}/js/audio-input-effects/`,
      `file://${wusCustomUnitsLocalDir}/js/darkwave/`,

      `file://${wusCustomUnitsLocalDir}/js/circular-audio-wave/`,
      `file://${wusCustomUnitsLocalDir}/js/vissonance/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/threejs-audio-reactive-visual/`,

      `file://${wusCustomUnitsLocalDir}/ts/dist/beatmaker/`,

      `file://${wusUnitsLocalDistDir}/rtfr/`,
      `file://${wusUnitsLocalDistDir}/rtfs1/`,
      `file://${wusUnitsLocalDistDir}/rtfs2/`,
      `file://${wusUnitsLocalDistDir}/rtfs-p/`,
      // `file://${wusUnitsLocalDistDir}/piano-roll/`,
      `file://${wusUnitsLocalDistDir}/fluorite-piano-roll/`,
      `file://${wusUnitsLocalDistDir}/recoru/`,
      `file://${wusUnitsLocalDistDir}/loop-player/`,
      `file://${wusUnitsLocalDistDir}/timing-checker/`,

      // `file:///Users/ore/Documents/projects/oss/web_synth/_work/shiny-drum-machine/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/darkwave/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/fh-step-sequencer/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/d3-synth-scale/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/syntho/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/cadance/`,
      // {
      //   url: `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/bpm-tracker/dist/`,
      //   name: "BT",
      // },
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/visual-flux/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/aura/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/synth-modular/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/simple-synth/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/e2work/web-audio-loop-mixer/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/e2work/dist/vue-audio-mixer/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/e2work/web-audio-mixer/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/0700_work/wip/mc-webaudio-spectrum/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/e2work/tuner/`,

      // `file:///Users/ore/Documents/projects/oss/web_synth/_work/audio-input-effects/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/sk-synth/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/dist/jw-guitar-amp/`,
      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/dwork/circular-audio-wave/`,
      // `file://${homeDir}/wus-units/my-drum-machine/`,

      // `file:///Users/ore/Documents/projects/oss/web_synth/_pre/fwork/dist/beatmaker/`,
      `file:///Users/ore/Documents/projects/yahiro/synth-internal-2604/si2607/dist/audio-playback-dev/`,
      // `file:///Users/ore/Documents/projects/yahiro/synth-internal-2604/si2607/dist/beatmaker/`,

      `file://${wusUnitsLocalDistDir}/bseq2/`,
      `file://${wusUnitsLocalDistDir}/tonerio-sequencer/`,
      `file://${wusUnitsLocalDistDir}/bseq1/`,
      `file://${wusUnitsLocalDistDir}/lseq1/`,
      `file://${wusUnitsLocalDistDir}/partex/`,
      `file://${wusUnitsLocalDistDir}/root-prog/`,

      `file://${wusUnitsLocalDistDir}/multi-lfo/`,
      `file://${wusUnitsLocalDistDir}/step-automator/`,

      `file://${wusUnitsLocalDistDir}/sunset-delay/`,
      `file://${wusUnitsLocalDistDir}/sunset-chorus-mini/`,
      `file://${wusUnitsLocalDistDir}/crusher/`,
      `file://${wusUnitsLocalDistDir}/channel-strip/`,
      `file://${wusUnitsLocalDistDir}/noise-mix/`,
      `file://${wusUnitsLocalDistDir}/lofi2/`,

      // `file://${wusUnitsLocalDistDir}/sepa-mixer/`,
      `file://${wusUnitsLocalDistDir}/bs03/`,
      `file://${wusUnitsLocalDistDir}/s7/`,
      `file://${wusUnitsLocalDistDir}/mop2/`,
      `file://${wusUnitsLocalDistDir}/mpd1/`,
      // `file://${wusUnitsLocalDistDir}/s2/`,

      `file://${unitsDevDistDir}/mu4-keyboard/`,
      `file://${homeDir}/wus-units/twsq1/`,
      // `file://${homeDir}/wus-units/loop-mapper/`,
      //
      // `file://${unitsDevDistDir}/mu1-instrument/`,
      // `file://${unitsDevDistDir}/mu2-sequencer/`,
      // `file://${unitsDevDistDir}/mu3-effect/`,

      // `file://${unitsDevDistDir}/mu5-visualizer/`,

      // `file://${wusUnitsLocalDistDir}/chord-caster/`,
      // `file://${wusUnitsLocalDistDir}/rtfr/`,
      // `file://${wusUnitsLocalDistDir}/rtfs1/`,
      // `file://${wusUnitsLocalDistDir}/rtfs2/`,
      // `file://${wusUnitsLocalDistDir}/perseq/`,
      `file://${wusUnitsLocalDistDir}/piano-roll/`,

      // `file://${wusUnitsLocalDistDir}/specbar/`,
      `file://${wusUnitsLocalDistDir}/proto-engine-ptm-osc/`,
      `file://${wusUnitsLocalDistDir}/proto-engine-pd-fm/`,
      `file://${wusUnitsLocalDistDir}/mini-synth/`,
      `file://${wusUnitsLocalDistDir}/mini-synth-ge/`,
      `file://${wusUnitsLocalDistDir}/mini-synth-gp/`,

      //
    ];
  } else {
    return [
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/wavicle/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/mini-synth/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/bseq1/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/lseq1/",
      //
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/specbar/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/proto-engine-ptm-osc/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/proto-engine-pd-fm/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/mini-synth-ge/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-units@r14/mini-synth-gp/",

      //
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r14/additive/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r14/wasyn-1/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r14/webaudio-tinysynth-simple/",
      "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r14/webaudio-synth-v2/",
    ];
  }
}

export const unitSourceUrls = getUnitSourceUrls();
