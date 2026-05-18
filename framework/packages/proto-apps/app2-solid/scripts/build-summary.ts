import * as fs from "node:fs";
import { HostUnitMetadata, UnitSummariesJson } from "@wus/host-system/host";
import { UnitMetadata } from "@wus/unit-types";

const unitPageFolderUrls = [
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu1-instrument/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu2-sequencer/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu3-effect/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu4-keyboard/",
  "https://cdn.jsdelivr.net/gh/yahiro07/webaudio-unit-system@load-remote-units/units/dist/dev/mu5-visualizer/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/additive/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/drum-machine/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/koodori/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/wasyn-1/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-synth-v2/",
  "https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@bundles/units/webaudio-tinysynth-simple/",
];

const getPageId = (url: string) => url.split("/").reverse()[1];

function checkPageIdsUnique() {
  const pageIds = unitPageFolderUrls.map(getPageId);
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i];
    if (pageIds.indexOf(id) !== i) {
      throw new Error(`Duplicate page ID detected: ${id}`);
    }
  }
}

async function fetchUnitMeta(pageFolderUrl: string): Promise<HostUnitMetadata> {
  const unitMetaUrl = `${pageFolderUrl}unit-meta.json`;
  const res = await fetch(unitMetaUrl);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch from ${unitMetaUrl}: ${res.status} ${res.statusText}`,
    );
  }
  const unitMeta: UnitMetadata = await res.json();
  return {
    unitPageId: getPageId(pageFolderUrl),
    pageUrl: `${pageFolderUrl}index.html`,
    ...unitMeta,
  };
}

async function buildSummary() {
  checkPageIdsUnique();
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
