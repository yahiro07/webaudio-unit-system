import type { Plugin, ResolvedConfig } from "vite";
import { UnitSummariesJson } from "../../wus-host-system/contract";
import {
  generateSummariesJson,
  UnitSourceUrls,
  writeSummariesJsonToFile,
} from "./units-summary-generator";

export function unitLoaderPlugin(options: {
  unitSourceUrls: UnitSourceUrls;
  cacheFolderPath?: string;
  summaryOutputPath?: string;
}): Plugin {
  const { unitSourceUrls } = options;
  let config: ResolvedConfig;
  let summariesJson: UnitSummariesJson;

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const { root, publicDir } = config;
      const outputPath = options.summaryOutputPath ?? "src/units-summary.json";
      summariesJson = await generateSummariesJson(unitSourceUrls);
      writeSummariesJsonToFile(summariesJson, outputPath);
    },
  };
}
