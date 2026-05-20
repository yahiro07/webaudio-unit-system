import { delayMs } from "@wus/ax/timer-utils";

type ScreenRecorder = {
  doRecording(options: {
    recordingDurationSec: number;
    onStart?: () => void;
    onComplete?: (recordedBlob: Blob) => void;
  }): void;
};

export function createScreenRecorder(): ScreenRecorder {
  return {
    async doRecording(options) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          preferCurrentTab: true,
          audio: true,
        } as DisplayMediaStreamOptions);

        const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
          ? "video/webm; codecs=vp9"
          : "video/webm";

        const recorder = new MediaRecorder(stream, {
          mimeType,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        let timerId: ReturnType<typeof setTimeout> | null = null;

        recorder.onstop = () => {
          if (timerId) {
            clearTimeout(timerId);
          }
          const blob = new Blob(chunks, { type: mimeType });
          options.onComplete?.(blob);

          for (const track of stream.getTracks()) {
            track.stop();
          }
        };

        // Handle case where user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        };
        await delayMs(100);

        recorder.start();
        options.onStart?.();

        timerId = setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }, options.recordingDurationSec * 1000);
      } catch (e) {
        console.error("Failed to start recording:", e);
      }
    },
  };
}
