import * as fs from "node:fs";
import { globSync } from "node:fs";
import path from "node:path";
import {
  HostUnitMetadata,
  UnitMetadata,
  UnitSummariesJson,
} from "@wus/host-system/host";
import type { Plugin, ResolvedConfig } from "vite";

function buildSummaryJson(
  entries: {
    pagePath: string;
    metadata: UnitMetadata;
  }[],
): UnitSummariesJson {
  const metadataObjects: HostUnitMetadata[] = entries.map(
    ({ pagePath, metadata }) => {
      return {
        unitPageId: path.basename(path.dirname(pagePath)),
        pagePath,
        ...metadata,
      };
    },
  );
  return {
    generatedAt: new Date().toISOString(),
    units: metadataObjects,
  };
}

function generateSummaryFile(
  root: string,
  publicDir: string,
  outputFileRelPath: string,
) {
  const outputFilePath = path.resolve(root, outputFileRelPath);
  const unitMetaFilePaths = globSync(`units/**/unit-meta.json`, {
    cwd: publicDir,
  });
  const entries = unitMetaFilePaths.map((metaFilePath) => {
    const folderPath = path.dirname(metaFilePath);
    const fullPath = path.join(publicDir, metaFilePath);
    const contentText = fs.readFileSync(fullPath).toString();
    const metadata = JSON.parse(contentText) as UnitMetadata;
    const pagePath = path.join(folderPath, "index.html");
    return { pagePath, metadata };
  });
  entries.sort((a, b) => a.pagePath.localeCompare(b.pagePath));
  const summariesJson = buildSummaryJson(entries);
  const outputContent = `${JSON.stringify(summariesJson, null, 2)}\n`;
  fs.writeFileSync(outputFilePath, outputContent);
  console.log(
    `${entries.length} units detected, generated ${outputFileRelPath}`,
  );
}

export function unitsSummaryPlugin(options: { output?: string } = {}): Plugin {
  const outputFileRelPath = options.output ?? "public/units-summary.json";
  let config: ResolvedConfig;
  return {
    name: "units-summary",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const { root, publicDir } = config;
      generateSummaryFile(root, publicDir, outputFileRelPath);
    },
  };
}
