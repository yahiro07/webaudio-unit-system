import { iife } from "@wus/ax/general-utils";
import type { Plugin, ResolvedConfig } from "vite";
import { ResolvedUnitEntry } from "./common/internal-types";
import { UnitSourceUrls } from "./common/types";
import {
  checkFileExists,
  checkUnitSourceUrlFormat,
} from "./common/unit-url-helpers";
import { createResolvedUnitEntries } from "./stage1-input/unit-entry-resolver";
import { formatUnitSourceUrlsToDictionary } from "./stage1-input/unit-source-urls-array-converter";
import { createRemoteUnitCacheStorageIo } from "./stage2-caching/remote-unit-cache-storage-io";
import { checkNeedRemoteUnitsCaching } from "./stage2-caching/remote-unit-cache-store";
import { downloadUnitsFromRemote } from "./stage2-caching/remote-units-downloader";
import {
  generateSummariesJson,
  writeSummariesJsonToFile,
} from "./stage3-generate-info/unit-inventories-generator";
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
  let unitSourceUrls: UnitSourceUrls;
  let resolvedUnitEntries: ResolvedUnitEntry[];
  const cacheStorageIo = createRemoteUnitCacheStorageIo(cacheFolderPath);

  const startingFlow = {
    processStage1() {
      //stage1 - resolve unit entires
      unitSourceUrls = formatUnitSourceUrlsToDictionary(options.unitSourceUrls);
      Object.values(unitSourceUrls).forEach(checkUnitSourceUrlFormat);
      const unitsCacheFolderPath = cacheStorageIo.getUnitsCacheFolderPath();
      resolvedUnitEntries = createResolvedUnitEntries(
        unitSourceUrls,
        unitsCacheFolderPath,
      );
      console.log(resolvedUnitEntries);
    },
    async processStage2() {
      //stage2 - check and download remote units if needed
      const res = await checkNeedRemoteUnitsCaching(
        cacheStorageIo,
        unitSourceUrls,
        resolvedUnitEntries,
      );
      if (res.needUpdate) {
        await downloadUnitsFromRemote(
          res.unitEntriesToCache,
          cacheStorageIo.writeCachedPiece,
          cacheFolderPath,
        );
        return true;
      }
      return false;
    },
    async processStage3(hasUpdated: boolean) {
      //stage3 - generate summaries json and write to file if needed
      const inventoriesJson = await iife(async () => {
        const cachedInventoriesJson =
          await cacheStorageIo.readCachedSummariesJson();

        if (!hasUpdated && cachedInventoriesJson) {
          return cachedInventoriesJson;
        } else {
          const inventoriesJson =
            await generateSummariesJson(resolvedUnitEntries);
          await cacheStorageIo.writePreviousUnitSourceUrlsInput(unitSourceUrls);
          await cacheStorageIo.writeCachedSummariesJson(inventoriesJson);
          return inventoriesJson;
        }
      });
      const summaryFileExists = await checkFileExists(summaryOutputPath);
      if (hasUpdated || !summaryFileExists) {
        await writeSummariesJsonToFile(inventoriesJson, summaryOutputPath);
      }
    },
  };

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      startingFlow.processStage1();
      const hasUpdated = await startingFlow.processStage2();
      await startingFlow.processStage3(hasUpdated);
    },
    configureServer(server) {
      const middleware = createDevServerMiddleware(resolvedUnitEntries);
      server.middlewares.use(middleware);
    },
    async writeBundle(outputOptions) {
      await writeBundleImpl(
        resolvedUnitEntries,
        config.root,
        outputOptions.dir ?? "dist",
      );
    },
  };
}
