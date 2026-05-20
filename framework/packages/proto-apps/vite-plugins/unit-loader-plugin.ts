import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { createRemoteUnitCacheStore } from "./remote-unit-cache-store";
import {
  createResolvedUnitEntries,
  ResolvedUnitEntries,
} from "./unit-entry-resolver";
import {
  UnitSourceUrls,
  writeSummariesJsonToFile,
} from "./unit-inventories-generator";
import { UnitInventoriesJson } from "./unit-inventory-types";
import { formatUnitSourceUrlsToDictionary } from "./unit-source-urls-array-converter";
import { checkUnitSourceUrlFormat } from "./unit-url-helpers";

function getContentType(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".wasm":
      return "application/wasm";
    case ".map":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

async function checkFileExists(filePath: string): Promise<boolean> {
  return fs.promises
    .stat(filePath)
    .then(() => true)
    .catch(() => false);
}

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
  let resolvedUnitEntries: ResolvedUnitEntries;

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

      resolvedUnitEntries = createResolvedUnitEntries(
        unitSourceUrls,
        remoteUnitCacheStore,
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

          const resolvedUnitEntry = resolvedUnitEntries[catalogKey];
          if (resolvedUnitEntry && pathInUnit) {
            if (resolvedUnitEntry.kind === "direct") {
              const targetUrl = new URL(
                pathInUnit,
                resolvedUnitEntry.targetUrl,
              ).toString();
              console.log(
                "--> redirected by unit loader:",
                req.url,
                "-->",
                targetUrl,
              );
              res.statusCode = 307;
              res.setHeader("Location", targetUrl);
              res.end();
              return;
            }
            if (resolvedUnitEntry.kind === "public") {
              req.url = path.posix.join(
                resolvedUnitEntry.sourceUrlSpec,
                pathInUnit,
              );
              console.log(
                "--> rewritten by unit loader:",
                requestPath,
                "-->",
                req.url,
              );
              next();
              return;
            }
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
        resolvedUnitEntries,
      )) {
        if (
          resolvedUnitEntry.kind === "direct" ||
          resolvedUnitEntry.kind === "public"
        ) {
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
