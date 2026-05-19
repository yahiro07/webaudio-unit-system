import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { createRemoteUnitCacheStore } from "./remote-unit-cache-store";
import {
  UnitSourceUrls,
  writeSummariesJsonToFile,
} from "./unit-inventories-generator";

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

function resolveCatalogUnitRequest(
  requestPath: string,
  resolveCachedRemoteUnitRequestFn: (
    bucketName: string,
    pieceName: string,
    resourcePath: string,
  ) => string | undefined,
): string | undefined {
  if (!requestPath.startsWith("/@unit-loader/")) {
    return undefined;
  }
  // debugger;

  const segments = requestPath.replace("/@unit-loader/", "").split("/");

  if (segments[0] === "cached") {
    const bucketName = segments[1];
    const pieceName = segments[2];
    const resourcePath = segments.slice(3).join("/");
    if (!bucketName || !pieceName) {
      return undefined;
    }
    return resolveCachedRemoteUnitRequestFn(
      bucketName,
      pieceName,
      resourcePath,
    );
  } else if (segments[0] === "local") {
    return "/" + segments.slice(1).join("/");
  }
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
    options.summaryOutputPath ?? "src/unit-inventories.json";

  const { unitSourceUrls } = options;
  let config: ResolvedConfig;
  const remoteUnitCacheStore = createRemoteUnitCacheStore(cacheFolderPath);

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const res =
        await remoteUnitCacheStore.updateCachedContents(unitSourceUrls);
      const summariesJson = res.inventoriesJson;
      const summaryFileExists = await checkFileExists(summaryOutputPath);
      if (res.updated || !summaryFileExists) {
        writeSummariesJsonToFile(summariesJson, summaryOutputPath);
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
        const targetFilePath = resolveCatalogUnitRequest(
          requestUrl.pathname,
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
