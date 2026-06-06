import { delayMs } from "mofus/ax";

type ScreenRecorder = {
  doRecording(options: {
    recordingDurationSec: number;
    onStart?: () => void;
    onEnd?: () => void;
    onComplete?: (recordedBlob: Blob) => void;
  }): void;
};

function _checkMimeTypeSupport() {
  const types = [
    "video/webm; codecs=av1, opus",
    "video/webm; codecs=vp9, opus",
    "video/webm; codecs=vp8, opus",
    "video/mp4; codecs=avc1",
  ];
  types.forEach((type) => {
    console.log(`${type}: ${MediaRecorder.isTypeSupported(type)}`);
  });
}
// checkMimeTypeSupport();

export function createScreenRecorder(): ScreenRecorder {
  return {
    async doRecording(options) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          preferCurrentTab: true,
          video: { frameRate: { ideal: 60 } },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 2,
            sampleRate: 48000,
          },
          systemAudio: "exclude",
        } as DisplayMediaStreamOptions);

        const mimeTypePreferred = "video/webm; codecs=av1, opus";
        // const mimeTypePreferred = "video/mp4; codecs=avc3";
        const mimeType = MediaRecorder.isTypeSupported(mimeTypePreferred)
          ? mimeTypePreferred
          : "video/webm";
        console.log({ mimeType });

        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 256000,
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
          options?.onEnd?.();
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
        await delayMs(1000);

        options.onStart?.();
        recorder.start();

        timerId = setTimeout(
          () => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          },
          options.recordingDurationSec * 1000 - 50,
        );
      } catch (e) {
        console.error("Failed to start recording:", e);
      }
    },
  };
}

export function openVideoInNewTab(blob: Blob) {
  const videoUrl = URL.createObjectURL(blob);
  const newTab = window.open("", "_blank");
  if (newTab) {
    newTab.document.write(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <title>video playback</title>
        <style>
          body { background: #121212; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          video { max-width: 80%; max-height: 70vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
          h2 { margin-bottom: 10px; font-size: 20px; color: #aaa; }
        </style>
      </head>
      <body>
        <video src="${videoUrl}" controls autoplay loop></video>
      </body>
      </html>
    `);
    newTab.document.close();
  }
}
