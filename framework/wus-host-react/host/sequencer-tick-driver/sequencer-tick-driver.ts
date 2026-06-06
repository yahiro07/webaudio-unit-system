import { HostSystem } from "../host-system";
import { createSequencerTickDriverCore } from "./sequencer-tick-driver-core";

type SequencerTickDriver = {
  setBpm(bpm: number): void;
  start(): void;
  stop(): void;
};

function getCrossingStepIndices(ppqFrom: number, ppqTo: number): number[] {
  const ppqPerStep = 120;
  const stepFrom = Math.floor(ppqFrom / ppqPerStep);
  const stepTo = Math.floor(ppqTo / ppqPerStep);
  const stepIndices: number[] = [];
  for (let stepIndex = stepFrom + 1; stepIndex <= stepTo; stepIndex++) {
    stepIndices.push(stepIndex);
  }
  return stepIndices;
}

function processAllUnitsStartStop(
  hostSystem: HostSystem,
  method: "start" | "stop",
) {
  const units = hostSystem.getAllUnits();
  for (const unit of units) {
    unit.inputPort?.clockInput?.[method]?.();
  }
}

function processAllUnitsScheduling(
  hostSystem: HostSystem,
  startTime: number,
  ppqFrom: number,
  ppqTo: number,
  bpm: number,
  crossingStepIndices: number[],
) {
  const units = hostSystem.getAllUnits();
  for (const crossingStepIndex of crossingStepIndices) {
    for (const unit of units) {
      unit.inputPort?.clockInput?.processStep?.(crossingStepIndex);
    }
  }
  for (const unit of units) {
    unit.inputPort?.clockInput?.processScheduling?.(
      startTime,
      ppqFrom,
      ppqTo,
      bpm,
    );
  }
}

export function createSequencerTickDriver(
  hostSystem: HostSystem,
): SequencerTickDriver {
  const core = createSequencerTickDriverCore(hostSystem.audioContext, 25, 100);
  return {
    setBpm: core.setBpm,
    start() {
      processAllUnitsStartStop(hostSystem, "start");
      core.start({
        processScheduling(startTime, ppqFrom, ppqTo, bpm) {
          const crossingStepIndices = getCrossingStepIndices(ppqFrom, ppqTo);
          processAllUnitsScheduling(
            hostSystem,
            startTime,
            ppqFrom,
            ppqTo,
            bpm,
            crossingStepIndices,
          );
        },
      });
    },
    stop() {
      core.stop();
      processAllUnitsStartStop(hostSystem, "stop");
    },
  };
}
