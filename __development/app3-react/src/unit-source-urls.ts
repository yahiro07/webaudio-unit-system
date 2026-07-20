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
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/shiny-drum-machine/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/web-audio-mixer/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/vue-audio-mixer/`,

      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/midi-synth/`,
      `file://${wusCustomUnitsLocalDir}/vanilla/webaudio-tinysynth-simple/`,
      `file://${wusCustomUnitsLocalDir}/vanilla/webaudio-synth-v2/`,
      `file://${wusCustomUnitsLocalDir}/vanilla/wasyn-1/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/syntho/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/super-oscillator/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/simple-synth/`,

      `file://${wusUnitsLocalDistDir}/wavicle/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/model-1/`,
      // `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/vue-synth/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/react-synth/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/poly-synth/`,

      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/sk-synth/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/marlotron-duo/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/cadence/`,
      `file://${wusCustomUnitsLocalDir}/vanilla/additive/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/aura/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/bl-synth-modular/`,

      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/hm-step-sequencer/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/d3-synth-scale/`,

      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/webaudio-spectrum/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/audio-input-effects/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/darkwave/`,
      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/ts-beta/dist/jw-guitar-amp/`,

      `file:///Users/ore/Documents/projects/yahiro/wus-custom-units/vanilla-beta/circular-audio-wave/`,
      `file://${wusCustomUnitsLocalDir}/vanilla/vissonance/`,
      `file://${wusCustomUnitsLocalDir}/ts/dist/threejs-audio-reactive-visual/`,

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
