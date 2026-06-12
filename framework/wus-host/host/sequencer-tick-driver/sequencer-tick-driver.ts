import { HostSystem } from "../host-system";
import { createSequencerTickDriverCore } from "./sequencer-tick-driver-core";

type SequencerTickDriver = {
  setBpm(bpm: number): void;
  start(): void;
  stop(): void;
};

type CrossingStepInfo = {
  stepIndex: number;
  time: number;
};

function getCrossingStepIndices(
  startTime: number,
  ppqFrom: number,
  ppqTo: number,
  bpm: number,
): CrossingStepInfo[] {
  const ppqPerStep = 120;
  const stepFrom = Math.floor(ppqFrom / ppqPerStep);
  const stepTo = Math.floor(ppqTo / ppqPerStep);
  const crossingStepInfos: CrossingStepInfo[] = [];
  const stepDurationSec = ppqPerStep / ((480 * bpm) / 60);
  for (let stepIndex = stepFrom + 1; stepIndex <= stepTo; stepIndex++) {
    crossingStepInfos.push({
      stepIndex,
      time: startTime + stepIndex * stepDurationSec,
    });
  }
  return crossingStepInfos;
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
) {
  const crossingStepInfos = getCrossingStepIndices(
    startTime,
    ppqFrom,
    ppqTo,
    bpm,
  );
  const units = hostSystem.getAllUnits();
  const unitStepDurationSec = 60 / bpm / 4;
  for (const crossingStepIndex of crossingStepInfos) {
    for (const unit of units) {
      unit.inputPort?.clockInput?.processStep?.(
        crossingStepIndex.stepIndex,
        crossingStepIndex.time,
        unitStepDurationSec,
      );
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
          processAllUnitsScheduling(hostSystem, startTime, ppqFrom, ppqTo, bpm);
        },
      });
    },
    stop() {
      core.stop();
      processAllUnitsStartStop(hostSystem, "stop");
    },
  };
}
