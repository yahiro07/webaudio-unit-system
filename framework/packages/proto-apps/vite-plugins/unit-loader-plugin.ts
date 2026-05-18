import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ResolvedConfig } from "vite";
import { UnitSummariesJson } from "../../wus-host-system/contract";
import {
  generateSummariesJson,
  UnitSourceUrls,
  writeSummariesJsonToFile,
} from "./units-summary-generator";

const LOCAL_UNIT_ROUTE_PREFIX = "/@unit-file";

function isLocalPagePath(pagePath: string): boolean {
  return pagePath.startsWith("file:///");
}

function fileUrlToRoutePath(pagePath: string): string {
  const filePath = fileURLToPath(new URL(pagePath));
  const posixPath = filePath.split(path.sep).join("/");
  return `${LOCAL_UNIT_ROUTE_PREFIX}${posixPath}`;
}

function createServeSummariesJson(
  summariesJson: UnitSummariesJson,
): UnitSummariesJson {
  return {
    ...summariesJson,
    units: summariesJson.units.map((unit) => {
      if (!isLocalPagePath(unit.pagePath)) {
        return unit;
      }
      return {
        ...unit,
        pagePath: fileUrlToRoutePath(unit.pagePath),
      };
    }),
  };
}

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

function resolveLocalUnitRequest(
  requestPath: string,
  summariesJson: UnitSummariesJson,
): string | undefined {
  if (!requestPath.startsWith(`${LOCAL_UNIT_ROUTE_PREFIX}/`)) {
    return undefined;
  }

  const requestedFilePath = path.normalize(
    decodeURIComponent(requestPath.slice(LOCAL_UNIT_ROUTE_PREFIX.length)),
  );
  const localUnits = summariesJson.units.filter((unit) =>
    isLocalPagePath(unit.pagePath),
  );
  const matchedUnit = localUnits
    .map((unit) => {
      const entryFilePath = path.normalize(
        fileURLToPath(new URL(unit.pagePath)),
      );
      const entryFolderPath = path.dirname(entryFilePath);
      return {
        entryFilePath,
        entryFolderPath,
      };
    })
    .filter(({ entryFilePath, entryFolderPath }) => {
      return (
        requestedFilePath === entryFilePath ||
        requestedFilePath.startsWith(`${entryFolderPath}${path.sep}`)
      );
    })
    .sort((a, b) => b.entryFolderPath.length - a.entryFolderPath.length)[0];

  if (!matchedUnit) {
    return undefined;
  }

  return requestedFilePath;
}

export function unitLoaderPlugin(options: {
  unitSourceUrls: UnitSourceUrls;
  cacheFolderPath?: string;
  summaryOutputPath?: string;
}): Plugin {
  const { unitSourceUrls } = options;
  let config: ResolvedConfig;
  let summariesJson: UnitSummariesJson;
  let sourceSummariesJson: UnitSummariesJson;

  return {
    name: "unit-loader",
    configResolved(_config) {
      config = _config;
    },
    async buildStart() {
      const outputPath = options.summaryOutputPath ?? "src/units-summary.json";
      sourceSummariesJson = await generateSummariesJson(unitSourceUrls);
      summariesJson =
        config.command === "serve"
          ? createServeSummariesJson(sourceSummariesJson)
          : sourceSummariesJson;
      writeSummariesJsonToFile(summariesJson, outputPath);
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // console.log("requested", req.url);
        if (!req.url || !summariesJson || !sourceSummariesJson) {
          next();
          return;
        }

        const requestUrl = new URL(req.url, "http://localhost");
        const targetFilePath = resolveLocalUnitRequest(
          requestUrl.pathname,
          sourceSummariesJson,
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
