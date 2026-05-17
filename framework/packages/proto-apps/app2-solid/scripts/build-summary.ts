import * as fs from "node:fs";
import path from "node:path";
import { HostUnitMetadata, UnitSummariesJson } from "@wus/host-system/host";
import { UnitMetadata } from "@wus/unit-types";

const unitPageFolderUrls = [
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu2-sequencer",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu3-effect",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu4-keyboard",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu5-visualizer",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/additive",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/drum-machine",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/koodori",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/wasyn-1",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaduio-synth-v2",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaduio-tinysynth-simple",
];

async function fetchUnitMeta(url: string): Promise<HostUnitMetadata> {
  const res = await fetch(`${url}/unit-meta.json`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch unit-meta.json from ${url}: ${res.status} ${res.statusText}`,
    );
  }
  const unitMeta: UnitMetadata = await res.json();
  return {
    unitPageId: path.basename(path.dirname(url)),
    pagePath: url + "/index.html",
    ...unitMeta,
  };
}

async function buildSummary() {
  const metaList = await Promise.all(
    unitPageFolderUrls.map((url) => fetchUnitMeta(url)),
  );
  const summariesJson: UnitSummariesJson = {
    generatedAt: new Date().toISOString(),
    units: metaList,
  };
  const outputFilePath = "./src/units-summary.json";
  const fileContent = JSON.stringify(summariesJson, null, 2) + "\n";
  fs.writeFileSync(outputFilePath, fileContent);
  console.log(`generated ${outputFilePath}`);
}

buildSummary();
