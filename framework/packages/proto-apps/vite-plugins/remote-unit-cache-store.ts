import { ResolvedUnitEntry, UnitCacheEntry } from "./internal-types";
import {
  createRemoteUnitCacheStorageIo,
  RemoteUnitCacheStorageIo,
} from "./remote-unit-cache-storage-io";
import { downloadUnitsFromRemote } from "./remote-units-downloader";
import { UnitInventoriesJson, UnitSourceUrls } from "./types";
import { generateSummariesJson } from "./unit-inventories-generator";

export type RemoteUnitCacheStore = {
  updateCachedContents(
    unitSourceUrls: UnitSourceUrls,
    resolvedUnitEntries: ResolvedUnitEntry[],
  ): Promise<{
    updated: boolean;
    inventoriesJson: UnitInventoriesJson;
  }>;
  getUnitsCacheFolderPath(): string;
};

function checkDeepEquality(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

async function checkUnitSourceUrlsChanged(
  cacheStorageIo: RemoteUnitCacheStorageIo,
  unitSourceUrls: UnitSourceUrls,
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

async function enumerateUnitEntriesToCache(
  resolvedUnitEntries: ResolvedUnitEntry[],
  cacheStorageIo: RemoteUnitCacheStorageIo,
): Promise<UnitCacheEntry[]> {
  const existingBucketPieceKeys =
    await cacheStorageIo.listExistingBucketPieceKeys();

  const unitCacheEntries: UnitCacheEntry[] = resolvedUnitEntries
    .filter((it) => it.kind === "cache")
    .map((resolvedUnitEntry) => {
      const { sourceUrlSpec: url, bucketName, pieceName } = resolvedUnitEntry;
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

export function createRemoteUnitCacheStore(
  cacheFolderPath: string,
): RemoteUnitCacheStore {
  const cacheStorageIo = createRemoteUnitCacheStorageIo(cacheFolderPath);
  return {
    async updateCachedContents(unitSourceUrls, resolvedUnitEntries) {
      const urlsChanged = await checkUnitSourceUrlsChanged(
        cacheStorageIo,
        unitSourceUrls,
      );
      const unitEntriesToCache = await enumerateUnitEntriesToCache(
        resolvedUnitEntries,
        cacheStorageIo,
      );
      if (!urlsChanged && unitEntriesToCache.length === 0) {
        const cachedInventoriesJson =
          await cacheStorageIo.readCachedSummariesJson();
        if (cachedInventoriesJson) {
          return { updated: false, inventoriesJson: cachedInventoriesJson };
        }
      }

      await downloadUnitsFromRemote(
        unitEntriesToCache,
        cacheStorageIo.writeCachedPiece,
        cacheFolderPath,
      );
      const inventoriesJson = await generateSummariesJson(resolvedUnitEntries);
      await cacheStorageIo.writePreviousUnitSourceUrlsInput(unitSourceUrls);
      await cacheStorageIo.writeCachedSummariesJson(inventoriesJson);

      return { updated: true, inventoriesJson };
    },
    getUnitsCacheFolderPath() {
      return cacheStorageIo.getUnitsCacheFolderPath();
    },
  };
}
