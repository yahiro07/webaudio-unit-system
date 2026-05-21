import { createIntervalTimer } from "@wus/ax/timer-utils";
import { HostSystem } from "./host-system";

type SequenceTickDriver = {
  setBpm(bpm: number): void;
  start(): void;
  stop(): void;
};

function mapTimeMsToPpq(timeMs: number, bpm: number): number {
  const minutes = timeMs / 60000;
  const beats = minutes * bpm;
  const ppq = beats * 480;
  return ppq;
}

function getCrossedStepIndices(ppqFrom: number, ppqTo: number): number[] {
  const ppqPerStep = 120;
  const stepFrom = Math.floor(ppqFrom / ppqPerStep);
  const stepTo = Math.floor(ppqTo / ppqPerStep);
  const stepIndices: number[] = [];
  for (let stepIndex = stepFrom + 1; stepIndex <= stepTo; stepIndex++) {
    stepIndices.push(stepIndex);
  }
  return stepIndices;
}

export function createSequenceTickDriver(
  hostSystem: HostSystem,
): SequenceTickDriver {
  const state = { bpm: 120, previousTime: 0, ppqTick: 0 };
  const intervalTimer = createIntervalTimer();
  return {
    setBpm(bpm: number) {
      state.bpm = bpm;
    },
    start() {
      state.previousTime = hostSystem.audioContext.currentTime;
      state.ppqTick = 0;

      intervalTimer.start(() => {
        const currentTime = hostSystem.audioContext.currentTime;
        const timeElapsed = currentTime - state.previousTime;
        const ppqElapsed = mapTimeMsToPpq(timeElapsed * 1000, state.bpm);

        const ppqFrom = state.ppqTick;
        const ppqTo = ppqFrom + ppqElapsed;

        const units = hostSystem.getUnits().values();
        const crossedStepIndices = getCrossedStepIndices(ppqFrom, ppqTo);

        for (const crossedStepIndex of crossedStepIndices) {
          for (const unit of units) {
            unit.transportHandling?.processStep?.(crossedStepIndex);
          }
        }
        for (const unit of units) {
          unit.transportHandling?.processTickRange?.(ppqFrom, ppqTo);
        }

        state.ppqTick = ppqTo;
        state.previousTime = currentTime;
      }, 5);
    },
    stop() {
      intervalTimer.stop();
    },
  };
}
