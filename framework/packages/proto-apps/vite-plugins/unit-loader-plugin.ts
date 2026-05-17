import fs from "node:fs";
import type { Plugin, ResolvedConfig } from "vite";
import {
  HostUnitMetadata,
  UnitSummariesJson,
} from "../../wus-host-system/contract";
import { UnitMetadata } from "../../wus-unit-types/unit-metadata";

function checkPageIdsUnique(metaList: HostUnitMetadata[]) {
  const pageIds = metaList.map((m) => m.unitPageId);
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i];
    if (pageIds.indexOf(id) !== i) {
      throw new Error(`Duplicate page ID detected: ${id}`);
    }
  }
}

async function fetchUnitMeta(pageFolderUrl: string): Promise<UnitMetadata> {
  if (pageFolderUrl.startsWith("file:///")) {
    const url = new URL("unit-meta.json", pageFolderUrl);
    const text = await fs.promises.readFile(url, "utf8");
    return JSON.parse(text);
  } else {
    const unitMetaUrl = `${pageFolderUrl}unit-meta.json`;
    const res = await fetch(unitMetaUrl);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch from ${unitMetaUrl}: ${res.status} ${res.statusText}`,
      );
    }
    return await res.json();
  }
}

function createHostUnitMeta(
  meta: UnitMetadata,
  pageFolderUrl: string,
): HostUnitMetadata {
  return {
    ...meta,
    unitPageId: meta.name,
    pagePath: `${pageFolderUrl}index.html`,
  };
}

async function generateSummaryFile(
  unitSourceUrls: string[],
  outputPath: string,
) {
  console.log("buildSummaryFile");
  const metaList = await Promise.all(
    unitSourceUrls.map(async (url) => {
      const meta = await fetchUnitMeta(url);
      return createHostUnitMeta(meta, url);
    }),
  );
  checkPageIdsUnique(metaList);
  const summariesJson: UnitSummariesJson = {
    generatedAt: new Date().toISOString(),
    units: metaList,
  };
  const fileContent = JSON.stringify(summariesJson, null, 2) + "\n";
  fs.writeFileSync(outputPath, fileContent);
  console.log(`generated ${outputPath}`);
}

export function unitLoaderPlugin(options: {
  unitSourceUrls: string[];
  cacheFolderPath?: string;
  summaryOutputPath?: string;
}): Plugin {
  const { unitSourceUrls } = options;
  let config: ResolvedConfig;

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const { root, publicDir } = config;
      const outputPath = options.summaryOutputPath ?? "src/units-summary.json";
      await generateSummaryFile(unitSourceUrls, outputPath);
    },
  };
}
