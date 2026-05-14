import { promises as fs } from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

type UnitMeta = Record<string, unknown>;

type UnitsSummary = {
  generatedAt: string;
  units: Array<
    {
      pagePath: string;
    } & UnitMeta
  >;
};

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectUnitMetaFiles(unitsRootDir: string) {
  const entries = await fs.readdir(unitsRootDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      unitId: entry.name,
      metaFilePath: path.join(unitsRootDir, entry.name, "unit-meta.json"),
    }));
}

async function buildUnitsSummary(
  unitsRootDir: string,
): Promise<UnitsSummary | null> {
  if (!(await pathExists(unitsRootDir))) {
    return null;
  }

  const unitEntries = await collectUnitMetaFiles(unitsRootDir);
  const units = await Promise.all(
    unitEntries.map(async ({ unitId, metaFilePath }) => {
      const raw = await fs.readFile(metaFilePath, "utf8");
      const meta = JSON.parse(raw) as UnitMeta;

      return {
        pagePath: `/units-dev/${unitId}/index.html`,
        ...meta,
      };
    }),
  );

  units.sort((a, b) => a.pagePath.localeCompare(b.pagePath));

  return {
    generatedAt: new Date().toISOString(),
    units,
  };
}

async function writeUnitsSummaryFile(
  publicDir: string,
  unitsSummary: UnitsSummary | null,
) {
  const outputFilePath = path.join(publicDir, "units-summary.json");

  if (unitsSummary === null) {
    if (await pathExists(outputFilePath)) {
      await fs.unlink(outputFilePath);
      return true;
    }
    return false;
  }

  const nextContent = `${JSON.stringify(unitsSummary, null, 2)}\n`;
  const prevContent = (await pathExists(outputFilePath))
    ? await fs.readFile(outputFilePath, "utf8")
    : null;

  if (prevContent === nextContent) {
    return false;
  }

  await fs.writeFile(outputFilePath, nextContent, "utf8");
  console.log(`generated public/units-summary.json`);
  return true;
}

async function resolveUnitsRootDir(publicDir: string) {
  const unitsDir = path.join(publicDir, "units-dev");

  if (!(await pathExists(unitsDir))) {
    return null;
  }

  return fs.realpath(unitsDir);
}

export function unitsSummaryPlugin(): Plugin {
  let configPublicDir = "";
  let server: ViteDevServer | undefined;
  let lastUnitsRootDir: string | null = null;
  let generationTask: Promise<boolean> | null = null;

  const generate = async () => {
    if (generationTask) {
      return generationTask;
    }

    generationTask = (async () => {
      const unitsRootDir = await resolveUnitsRootDir(configPublicDir);
      const summary = unitsRootDir
        ? await buildUnitsSummary(unitsRootDir)
        : null;
      const didWrite = await writeUnitsSummaryFile(configPublicDir, summary);

      if (lastUnitsRootDir !== unitsRootDir && unitsRootDir && server) {
        server.watcher.add(path.join(unitsRootDir, "**/unit-meta.json"));
      }

      lastUnitsRootDir = unitsRootDir;
      return didWrite;
    })();

    try {
      return await generationTask;
    } finally {
      generationTask = null;
    }
  };

  const reloadIfUpdated = async () => {
    const didWrite = await generate();
    if (didWrite) {
      server?.ws.send({ type: "full-reload" });
    }
  };

  return {
    name: "units-summary",
    configResolved(config) {
      configPublicDir = config.publicDir;
    },
    async buildStart() {
      await generate();
    },
    async configureServer(devServer) {
      server = devServer;
      await generate();

      const isMetaFile = (filePath: string) =>
        filePath.endsWith(`${path.sep}unit-meta.json`) ||
        filePath.endsWith("/unit-meta.json");

      const onMetaFileEvent = (filePath: string) => {
        if (!isMetaFile(filePath)) {
          return;
        }

        void reloadIfUpdated();
      };

      devServer.watcher.on("add", onMetaFileEvent);
      devServer.watcher.on("change", onMetaFileEvent);
      devServer.watcher.on("unlink", onMetaFileEvent);
    },
  };
}
