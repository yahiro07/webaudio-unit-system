import type { Plugin, ResolvedConfig } from "vite";
import { generateSummaryFile, UnitSourceUrls } from "./units-summary-generator";

export function unitLoaderPlugin(options: {
  unitSourceUrls: UnitSourceUrls;
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
