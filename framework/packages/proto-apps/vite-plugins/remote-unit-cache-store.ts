import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  createRemoteUnitCacheStorageIo,
  RemoteUnitCacheStorageIo,
} from "./remote-unit-cache-storage-io";
import { generateSummariesJson } from "./unit-inventories-generator";
import { UnitInventoriesJson } from "./unit-inventory-types";
import {
  mapUnitUrlToBucketAndPieceNames,
  parseRemoteUnitUrl,
} from "./unit-url-helpers";

const execFileAsync = promisify(execFile);

export type RemoteUnitCacheStore = {
  updateCachedContents(unitSourceUrls: Record<string, string>): Promise<{
    updated: boolean;
    inventoriesJson: UnitInventoriesJson;
  }>;
  resolveCachedRemoteUnitRequest(
    bucketName: string,
    pieceName: string,
    resourcePath: string,
  ): string | undefined;
};

function checkDeepEquality(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

type UnitCacheEntry = {
  remoteUrl: string;
  bucketName: string;
  pieceName: string;
  bucketPieceComparisonKey: string; //`${bucketName}:${pieceName}`
};

async function downloadUnitsFromRemote(
  unitCacheEntries: UnitCacheEntry[],
  writeCachedPiece: (
    bucketName: string,
    pieceName: string,
    sourceUnitFolderPath: string,
  ) => Promise<void>,
  cacheFolderPath: string,
) {
  console.log(
    `adding ${unitCacheEntries.length} remote unit(s) to local cache...`,
  );

  const entriesPerBuckets = Object.groupBy(
    unitCacheEntries,
    (entry) => entry.bucketName,
  );

  for (const [_bucketName, bucketEntries] of Object.entries(
    entriesPerBuckets,
  )) {
    if (!bucketEntries || bucketEntries.length === 0) {
      continue;
    }

    const { archiveUrl } = parseRemoteUnitUrl(bucketEntries[0].remoteUrl);
    const tempDirPath = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "wus-remote-cache-"),
    );

    try {
      const archivePath = path.join(tempDirPath, "archive.zip");
      const extractDirPath = path.join(tempDirPath, "extract");
      console.log(`fetching remote units archive: ${archiveUrl}`);
      const archiveResponse = await fetch(archiveUrl);
      if (!archiveResponse.ok) {
        const fallbackArchiveUrl = archiveUrl.replace(
          "/refs/tags/",
          "/refs/heads/",
        );
        const fallbackArchiveResponse = await fetch(fallbackArchiveUrl);
        if (!fallbackArchiveResponse.ok) {
          throw new Error(
            `Failed to download remote unit archive: ${archiveUrl} (${archiveResponse.status}), ${fallbackArchiveUrl} (${fallbackArchiveResponse.status})`,
          );
        }
        await fs.promises.writeFile(
          archivePath,
          Buffer.from(await fallbackArchiveResponse.arrayBuffer()),
        );
      } else {
        await fs.promises.writeFile(
          archivePath,
          Buffer.from(await archiveResponse.arrayBuffer()),
        );
      }

      await fs.promises.mkdir(extractDirPath, { recursive: true });
      await execFileAsync("unzip", ["-q", archivePath, "-d", extractDirPath]);

      const extractedRootDirEntry = (
        await fs.promises.readdir(extractDirPath, { withFileTypes: true })
      ).find((entry) => entry.isDirectory());
      if (!extractedRootDirEntry) {
        throw new Error(`Archive extraction produced no files: ${archiveUrl}`);
      }

      const extractedRootPath = path.join(
        extractDirPath,
        extractedRootDirEntry.name,
      );
      for (const entry of bucketEntries) {
        const { pieceFolderPath } = parseRemoteUnitUrl(entry.remoteUrl);
        const sourceUnitFolderPath = path.join(
          extractedRootPath,
          pieceFolderPath,
        );
        await writeCachedPiece(
          entry.bucketName,
          entry.pieceName,
          sourceUnitFolderPath,
        );
      }
    } finally {
      await fs.promises.rm(tempDirPath, { recursive: true, force: true });
      console.log(`units cache saved in ${cacheFolderPath}`);
    }
  }
}

async function enumerateUnitEntriesToCache(
  unitSourceUrls: Record<string, string>,
  cacheStorageIo: RemoteUnitCacheStorageIo,
) {
  const remoteUrls = Object.values(unitSourceUrls).filter((url) =>
    url.startsWith("https://"),
  );
  const existingBucketPieceKeys =
    await cacheStorageIo.listExistingBucketPieceKeys();

  const unitCacheEntries: UnitCacheEntry[] = remoteUrls.map((url) => {
    const { bucketName, pieceName } = mapUnitUrlToBucketAndPieceNames(url);
    const bucketPieceComparisonKey = `${bucketName}:${pieceName}`;
    return {
      remoteUrl: url,
      bucketName: bucketName,
      pieceName: pieceName,
      bucketPieceComparisonKey,
    };
  });
  return unitCacheEntries.filter(
    (entry) =>
      !existingBucketPieceKeys.includes(entry.bucketPieceComparisonKey),
  );
}

async function checkUnitSourceUrlsChanged(
  cacheStorageIo: RemoteUnitCacheStorageIo,
  unitSourceUrls: Record<string, string>,
): Promise<boolean> {
  const prevUnitSourceUrls =
    await cacheStorageIo.readPreviousUnitSourceUrlsInput();
  if (prevUnitSourceUrls) {
    if (checkDeepEquality(prevUnitSourceUrls, unitSourceUrls)) {
      return false;
    }
  }
  return true;
}

async function updateCachedContentsImpl(
  cacheStorageIo: RemoteUnitCacheStorageIo,
  unitSourceUrls: Record<string, string>,
  unitEntriesToCache: UnitCacheEntry[],
  cacheFolderPath: string,
): Promise<UnitInventoriesJson> {
  await downloadUnitsFromRemote(
    unitEntriesToCache,
    cacheStorageIo.writeCachedPiece,
    cacheFolderPath,
  );

  const summariesJson = await generateSummariesJson(
    unitSourceUrls,
    (pageFolderUrl) => {
      const { bucketName, pieceName } =
        mapUnitUrlToBucketAndPieceNames(pageFolderUrl);
      return cacheStorageIo.readCachedPieceMeta(bucketName, pieceName);
    },
  );
  await cacheStorageIo.writePreviousUnitSourceUrlsInput(unitSourceUrls);
  await cacheStorageIo.writeCachedSummariesJson(summariesJson);
  return summariesJson;
}

export function createRemoteUnitCacheStore(
  cacheFolderPath: string,
): RemoteUnitCacheStore {
  const cacheStorageIo = createRemoteUnitCacheStorageIo(cacheFolderPath);
  return {
    async updateCachedContents(unitSourceUrls) {
      const urlsChanged = await checkUnitSourceUrlsChanged(
        cacheStorageIo,
        unitSourceUrls,
      );
      const unitEntriesToCache = await enumerateUnitEntriesToCache(
        unitSourceUrls,
        cacheStorageIo,
      );
      if (!urlsChanged && unitEntriesToCache.length === 0) {
        const cachedInventoriesJson =
          await cacheStorageIo.readCachedSummariesJson();
        if (cachedInventoriesJson) {
          return { updated: false, inventoriesJson: cachedInventoriesJson };
        }
      }
      const inventoriesJson = await updateCachedContentsImpl(
        cacheStorageIo,
        unitSourceUrls,
        unitEntriesToCache,
        cacheFolderPath,
      );
      return { updated: true, inventoriesJson };
    },
    resolveCachedRemoteUnitRequest(bucketName, pieceName, resourcePath) {
      return cacheStorageIo.resolveCachedRemoteUnitRequestToFilePath(
        bucketName,
        pieceName,
        resourcePath,
      );
    },
  };
}
