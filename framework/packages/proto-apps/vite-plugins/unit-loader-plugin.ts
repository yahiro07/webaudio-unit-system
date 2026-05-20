import type { Plugin, ResolvedConfig } from "vite";
import { ResolvedUnitEntry } from "./common/internal-types";
import { UnitInventoriesJson, UnitSourceUrls } from "./common/types";
import {
  checkFileExists,
  checkUnitSourceUrlFormat,
} from "./common/unit-url-helpers";
import { createResolvedUnitEntries } from "./stage1-input/unit-entry-resolver";
import { formatUnitSourceUrlsToDictionary } from "./stage1-input/unit-source-urls-array-converter";
import { createRemoteUnitCacheStore } from "./stage2-caching/remote-unit-cache-store";
import { writeSummariesJsonToFile } from "./stage3-generate-info/unit-inventories-generator";
import { createDevServerMiddleware } from "./stage4-dev-serving/dev-server-middleware";
import { writeBundleImpl } from "./stage5-build/write-bundle-impl";

export function unitLoaderPlugin(options: {
  unitSourceUrls: UnitSourceUrls | string[];
  cacheFolderPath?: string;
  summaryOutputPath?: string;
}): Plugin {
  const cacheFolderPath = options.cacheFolderPath ?? "~/.wus/cache";
  const summaryOutputPath =
    options.summaryOutputPath ?? "src/unit-inventories.json";
  let config: ResolvedConfig;
  const remoteUnitCacheStore = createRemoteUnitCacheStore(cacheFolderPath);
  let inventoriesJson: UnitInventoriesJson;
  let resolvedUnitEntries: ResolvedUnitEntry[];

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const unitSourceUrls = formatUnitSourceUrlsToDictionary(
        options.unitSourceUrls,
      );
      Object.values(unitSourceUrls).forEach(checkUnitSourceUrlFormat);

      const unitsCacheFolderPath =
        remoteUnitCacheStore.getUnitsCacheFolderPath();
      resolvedUnitEntries = createResolvedUnitEntries(
        unitSourceUrls,
        unitsCacheFolderPath,
      );

      console.log(resolvedUnitEntries);

      const res = await remoteUnitCacheStore.updateCachedContents(
        unitSourceUrls,
        resolvedUnitEntries,
      );
      inventoriesJson = res.inventoriesJson;
      const summaryFileExists = await checkFileExists(summaryOutputPath);

      if (res.updated || !summaryFileExists) {
        writeSummariesJsonToFile(inventoriesJson, summaryOutputPath);
      }
    },
    configureServer(server) {
      const middleware = createDevServerMiddleware(resolvedUnitEntries);
      server.middlewares.use(middleware);
    },
    async writeBundle(outputOptions) {
      writeBundleImpl(
        resolvedUnitEntries,
        config.root,
        outputOptions.dir ?? "dist",
      );
    },
  };
}
