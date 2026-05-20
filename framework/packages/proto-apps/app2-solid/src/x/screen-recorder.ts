type ScreenRecorder = {
  doRecording(options: {
    recordingDurationSec: number;
    onStart?: () => void;
    onComplete?: (recordedBlob: Blob) => void;
  }): void;
};

export function createScreenRecorder(): ScreenRecorder {
  return {
    doRecording(options) {},
  };
}
