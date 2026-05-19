import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ResolvedConfig } from "vite";
import { UnitSummariesJson } from "./catalogue-types";
import { createRemoteUnitCacheStore } from "./remote-unit-cache-store";
import {
  UnitSourceUrls,
  writeSummariesJsonToFile,
} from "./units-summary-generator";

// const LOCAL_UNIT_ROUTE_PREFIX = "/@unit-file";
const CATALOG_UNIT_ROUTE_PREFIX = "/@unit-loader";

// function isLocalPageUrl(pageUrl: string): boolean {
//   return pageUrl.startsWith("file:///");
// }

// function fileUrlToRoutePath(pageUrl: string): string {
//   const filePath = fileURLToPath(new URL(pageUrl));
//   const posixPath = filePath.split(path.sep).join("/");
//   return `${LOCAL_UNIT_ROUTE_PREFIX}${posixPath}`;
// }

// function createServeSummariesJson(
//   summariesJson: UnitSummariesJson,
// ): UnitSummariesJson {
//   return {
//     ...summariesJson,
//     units: summariesJson.units.map((unit) => {
//       if (!isLocalPageUrl(unit.pageUrl)) {
//         return unit;
//       }
//       return {
//         ...unit,
//         pageUrl: fileUrlToRoutePath(unit.pageUrl),
//       };
//     }),
//   };
// }

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

// function resolveLocalUnitRequest(
//   requestPath: string,
//   summariesJson: UnitSummariesJson,
// ): string | undefined {
//   if (!requestPath.startsWith(`${LOCAL_UNIT_ROUTE_PREFIX}/`)) {
//     return undefined;
//   }

//   const requestedFilePath = path.normalize(
//     decodeURIComponent(requestPath.slice(LOCAL_UNIT_ROUTE_PREFIX.length)),
//   );
//   const localUnits = summariesJson.units.filter((unit) =>
//     isLocalPageUrl(unit.pageUrl),
//   );
//   const matchedUnit = localUnits
//     .map((unit) => {
//       const entryFilePath = path.normalize(
//         fileURLToPath(new URL(unit.pageUrl)),
//       );
//       const entryFolderPath = path.dirname(entryFilePath);
//       return {
//         entryFilePath,
//         entryFolderPath,
//       };
//     })
//     .filter(({ entryFilePath, entryFolderPath }) => {
//       return (
//         requestedFilePath === entryFilePath ||
//         requestedFilePath.startsWith(`${entryFolderPath}${path.sep}`)
//       );
//     })
//     .sort((a, b) => b.entryFolderPath.length - a.entryFolderPath.length)[0];

//   if (!matchedUnit) {
//     return undefined;
//   }

//   return requestedFilePath;
// }

function resolveCatalogUnitRequest(
  requestPath: string,
  summariesJson: UnitSummariesJson,
  resolveCachedRemoteUnitRequestFn: (
    unitPageUrl: string,
    relativePathInUnit: string,
  ) => string | undefined,
): string | undefined {
  if (!requestPath.startsWith(`${CATALOG_UNIT_ROUTE_PREFIX}/`)) {
    return undefined;
  }
  const relativePath = decodeURIComponent(
    requestPath.slice(CATALOG_UNIT_ROUTE_PREFIX.length + 1),
  );
  const [catalogKey, ...resourceSegments] = relativePath.split("/");
  if (!catalogKey) {
    return undefined;
  }

  const unit = summariesJson.units.find(
    (entry) => entry.catalogKey === catalogKey,
  );
  if (!unit) {
    return undefined;
  }

  if (
    unit.pageUrl.startsWith("http://") ||
    unit.pageUrl.startsWith("https://")
  ) {
    const requestedResourcePath = resourceSegments.join("/");
    return resolveCachedRemoteUnitRequestFn(
      unit.pageUrl,
      requestedResourcePath,
    );
  }

  const entryFilePath = path.normalize(fileURLToPath(new URL(unit.pageUrl)));
  const entryFolderPath = path.dirname(entryFilePath);
  const requestedResourcePath = resourceSegments.join("/") || "index.html";
  const targetFilePath = path.normalize(
    path.join(entryFolderPath, requestedResourcePath),
  );

  if (
    targetFilePath !== entryFolderPath &&
    !targetFilePath.startsWith(`${entryFolderPath}${path.sep}`)
  ) {
    return undefined;
  }

  return targetFilePath;
}

function checkFileExists(filePath: string): Promise<boolean> {
  return fs.promises
    .stat(filePath)
    .then(() => true)
    .catch(() => false);
}

export function unitLoaderPlugin(options: {
  unitSourceUrls: UnitSourceUrls;
  cacheFolderPath?: string;
  summaryOutputPath?: string;
}): Plugin {
  const cacheFolderPath = options.cacheFolderPath ?? "~/.wus/cache";
  const summaryOutputPath =
    options.summaryOutputPath ?? "src/units-summary.json";

  const { unitSourceUrls } = options;
  let config: ResolvedConfig;
  let summariesJson: UnitSummariesJson;
  // let sourceSummariesJson: UnitSummariesJson;
  const remoteUnitCacheStore = createRemoteUnitCacheStore(cacheFolderPath);

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const res =
        await remoteUnitCacheStore.updateCachedContents(unitSourceUrls);
      summariesJson = res.summariesJson;
      const summaryFileExists = await checkFileExists(summaryOutputPath);
      if (res.updated || !summaryFileExists) {
        writeSummariesJsonToFile(summariesJson, summaryOutputPath);
      }
      // summariesJson =
      //   config.command === "serve"
      //     ? createServeSummariesJson(sourceSummariesJson)
      //     : sourceSummariesJson;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        console.log("requested", req.url);
        if (!req.url || !summariesJson) {
          next();
          return;
        }

        const requestUrl = new URL(req.url, "http://localhost");
        const targetFilePath = resolveCatalogUnitRequest(
          requestUrl.pathname,
          summariesJson,
          remoteUnitCacheStore.resolveCachedRemoteUnitRequest,
        );
        if (!targetFilePath) {
          next();
          return;
        }

        try {
          const stat = await fs.promises.stat(targetFilePath);
          const filePath = stat.isDirectory()
            ? path.join(targetFilePath, "index.html")
            : targetFilePath;

          console.log("--> resolved by unit loader:", req.url, "-->", filePath);

          res.statusCode = 200;
          res.setHeader("Content-Type", getContentType(filePath));
          fs.createReadStream(filePath).pipe(res);
        } catch {
          next();
        }
      });
    },
  };
}
