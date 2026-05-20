import { iife } from "@wus/ax/general-utils";
import type { Plugin, ResolvedConfig } from "vite";
import { unitSourceUrls } from "../app2-solid/src/unit-source-urls";
import { ResolvedUnitEntry } from "./common/internal-types";
import { UnitSourceUrls } from "./common/types";
import {
  checkFileExists,
  checkUnitSourceUrlFormat,
} from "./common/unit-url-helpers";
import { createResolvedUnitEntries } from "./stage1-input/unit-entry-resolver";
import { formatUnitSourceUrlsToDictionary } from "./stage1-input/unit-source-urls-array-converter";
import {
  createRemoteUnitCacheStorageIo,
  RemoteUnitCacheStorageIo,
} from "./stage2-caching/remote-unit-cache-storage-io";
import { checkNeedRemoteUnitsCaching } from "./stage2-caching/remote-unit-cache-store";
import { downloadUnitsFromRemote } from "./stage2-caching/remote-units-downloader";
import {
  generateSummariesJson,
  writeSummariesJsonToFile,
} from "./stage3-generate-info/unit-inventories-generator";
import { createDevServerMiddleware } from "./stage4-dev-serving/dev-server-middleware";
import { writeBundleImpl } from "./stage5-build/write-bundle-impl";

const startingFlow = {
  processStage1(
    cacheStorageIo: RemoteUnitCacheStorageIo,
    unistSourceUrlsInput: UnitSourceUrls | string[],
  ) {
    const unitSourceUrls =
      formatUnitSourceUrlsToDictionary(unistSourceUrlsInput);
    Object.values(unitSourceUrls).forEach(checkUnitSourceUrlFormat);
    const unitsCacheFolderPath = cacheStorageIo.getUnitsCacheFolderPath();
    const resolvedUnitEntries = createResolvedUnitEntries(
      unitSourceUrls,
      unitsCacheFolderPath,
    );
    return [unitSourceUrls, resolvedUnitEntries] as const;
  },
  async processStage2(
    cacheStorageIo: RemoteUnitCacheStorageIo,
    unitSourceUrls: UnitSourceUrls,
    resolvedUnitEntries: ResolvedUnitEntry[],
    cacheFolderPath: string,
  ): Promise<boolean> {
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
  async processStage3(
    cacheStorageIo: RemoteUnitCacheStorageIo,
    resolvedUnitEntries: ResolvedUnitEntry[],
    summaryOutputPath: string,
    hasUpdated: boolean,
  ) {
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
      writeSummariesJsonToFile(inventoriesJson, summaryOutputPath);
    }
  },
};

export function unitLoaderPlugin(options: {
  unitSourceUrls: UnitSourceUrls | string[];
  cacheFolderPath?: string;
  summaryOutputPath?: string;
}): Plugin {
  const cacheFolderPath = options.cacheFolderPath ?? "~/.wus/cache";
  const summaryOutputPath =
    options.summaryOutputPath ?? "src/unit-inventories.json";
  const unistSourceUrlsInput = options.unitSourceUrls;
  let config: ResolvedConfig;
  let resolvedUnitEntries: ResolvedUnitEntry[];
  const cacheStorageIo = createRemoteUnitCacheStorageIo(cacheFolderPath);

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      //stage1 - resolve unit entires
      let unitSourceUrls: UnitSourceUrls;
      [unitSourceUrls, resolvedUnitEntries] = startingFlow.processStage1(
        cacheStorageIo,
        unistSourceUrlsInput,
      );
      console.log(resolvedUnitEntries);

      //stage2 - check and download remote units if needed
      const hasUpdated = await startingFlow.processStage2(
        cacheStorageIo,
        unitSourceUrls,
        resolvedUnitEntries,
        cacheFolderPath,
      );

      //stage3 - generate summaries json and write to file if needed
      await startingFlow.processStage3(
        cacheStorageIo,
        resolvedUnitEntries,
        summaryOutputPath,
        hasUpdated,
      );
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
