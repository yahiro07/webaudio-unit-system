import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import { onMount } from "solid-js";

const baseUrl =
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@main/packages/__development/units-oss-js/drum-machine/du10-drum-machine/web/";

const App = () => {
  let iframe: HTMLIFrameElement | undefined;
  onMount(async () => {
    if (!iframe) return;
    const content = await fetch(`${baseUrl}index.html`).then((res) =>
      res.text(),
    );
    console.log(content);
    iframe.srcdoc = `<base href={$baseUrl}">${content}`;
  });
  return (
    <div class="w-dvw h-dvh flex-c gap-4">
      <base href={baseUrl} />
      <iframe ref={iframe} width={800} height={600} />
    </div>
  );
};

mountAppRoot(() => <App />);
