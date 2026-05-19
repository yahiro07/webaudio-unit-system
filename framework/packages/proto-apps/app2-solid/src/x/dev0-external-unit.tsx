import {
  createAudioContextDestinationProxied,
  UnitAgent,
} from "@wus/host-system/host";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { onMount } from "solid-js";

const _IFrameExp0 = () => {
  const pageUri = "/dist/units/oss-js/du10-drum-machine/index.html";
  let iframe: HTMLIFrameElement | undefined;
  onMount(() => {
    if (!iframe) return;
    const win = iframe.contentWindow;
    if (!win) return;
    (win as any).hostInterface = {
      setupUnitAgent(unitAgent: UnitAgent) {
        console.log("setup", unitAgent);
      },
    };
  });
  return <iframe ref={iframe} src={pageUri} width={800} height={600} />;
};

const IFrameExp1 = () => {
  // const baseUrl =
  //   "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@main/packages/__development/units-oss-js/drum-machine/du10-drum-machine/web/";

  const baseUrl =
    "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument/";
  let iframe: HTMLIFrameElement | undefined;
  onMount(async () => {
    if (!iframe) return;
    const content = await fetch(`${baseUrl}index.html`).then((res) =>
      res.text(),
    );
    iframe.srcdoc = `<base href="${baseUrl}">${content}`;

    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1;
    gainNode.connect(audioContext.destination);
    const innerAudioContext = createAudioContextDestinationProxied(
      audioContext,
      gainNode,
    );

    setTimeout(() => {
      const win = iframe.contentWindow;
      if (!win) return;
      (win as any).hostInterface = {
        audioContext: innerAudioContext,
        setupUnitAgent(unitAgent: UnitAgent) {
          console.log("setup", unitAgent);
        },
      };
    }, 1);
  });

  return <iframe ref={iframe} width={800} height={600} />;
};

const App = () => {
  return (
    <div class="w-dvw h-dvh flex-c gap-4">
      {/* <IFrameExp0 /> */}
      <IFrameExp1 />
    </div>
  );
};

mountAppRoot(() => <App />);
