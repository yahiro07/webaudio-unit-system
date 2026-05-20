import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { ResolvedUnitEntriesMap } from "./internal-types";
import { createRemoteUnitCacheStore } from "./remote-unit-cache-store";
import { UnitInventoriesJson, UnitSourceUrls } from "./types";
import { createResolvedUnitEntries } from "./unit-entry-resolver";
import { writeSummariesJsonToFile } from "./unit-inventories-generator";
import { formatUnitSourceUrlsToDictionary } from "./unit-source-urls-array-converter";
import {
  checkFileExists,
  checkUnitSourceUrlFormat,
  getContentType,
} from "./unit-url-helpers";

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
  let resolvedUnitEntriesMap: ResolvedUnitEntriesMap;

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
      const resolvedUnitEntries = createResolvedUnitEntries(
        unitSourceUrls,
        unitsCacheFolderPath,
      );
      resolvedUnitEntriesMap = Object.fromEntries(
        Object.entries(resolvedUnitEntries).map(([catalogKey, entry]) => [
          catalogKey,
          entry,
        ]),
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
      server.middlewares.use(async (req, res, next) => {
        console.log("requested", req.url);
        if (!req.url) {
          next();
          return;
        }

        const requestUrl = new URL(req.url, "http://localhost");
        const requestPath = requestUrl.pathname;

        if (requestPath.startsWith("/inventory-units/")) {
          const segments = requestPath
            .replace("/inventory-units/", "")
            .split("/");
          const catalogKey = segments[0];
          const pathInUnit = segments.slice(1).join("/");

          const resolvedUnitEntry = resolvedUnitEntriesMap[catalogKey];
          if (resolvedUnitEntry && pathInUnit) {
            if (
              resolvedUnitEntry.kind === "cache" ||
              resolvedUnitEntry.kind === "file"
            ) {
              const targetFilePath = path.join(
                resolvedUnitEntry.folderPath,
                pathInUnit,
              );
              console.log(
                "--> resolved by unit loader:",
                req.url,
                "-->",
                targetFilePath,
              );
              res.statusCode = 200;
              res.setHeader("Content-Type", getContentType(targetFilePath));
              fs.createReadStream(targetFilePath).pipe(res);
              return;
            }
          }
        }
        next();
      });
    },
    async writeBundle(outputOptions) {
      for (const [catalogKey, resolvedUnitEntry] of Object.entries(
        resolvedUnitEntriesMap,
      )) {
        if (resolvedUnitEntry.kind === "public") {
          continue;
        }
        if (resolvedUnitEntry.kind === "direct") {
          continue;
        }
        const outputFolderPath = path.resolve(
          config.root,
          outputOptions.dir ?? "dist",
          "inventory-units",
          catalogKey,
        );
        await fs.promises.mkdir(outputFolderPath, { recursive: true });
        await fs.promises.cp(resolvedUnitEntry.folderPath, outputFolderPath, {
          recursive: true,
        });
      }
    },
  };
}
