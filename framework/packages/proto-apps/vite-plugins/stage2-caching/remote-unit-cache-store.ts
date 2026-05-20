import { ResolvedUnitEntry, UnitCacheEntry } from "../common/internal-types";
import { UnitSourceUrls } from "../common/types";
import { RemoteUnitCacheStorageIo } from "./remote-unit-cache-storage-io";

function checkDeepEquality(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export async function checkUnitSourceUrlsChanged(
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

export async function enumerateUnitEntriesToCache(
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

type checkNeedRemoteUnitsCachingResult =
  | { needUpdate: false }
  | { needUpdate: true; unitEntriesToCache: UnitCacheEntry[] };

export async function checkNeedRemoteUnitsCaching(
  cacheStorageIo: RemoteUnitCacheStorageIo,
  unitSourceUrls: UnitSourceUrls,
  resolvedUnitEntries: ResolvedUnitEntry[],
): Promise<checkNeedRemoteUnitsCachingResult> {
  const urlsChanged = await checkUnitSourceUrlsChanged(
    cacheStorageIo,
    unitSourceUrls,
  );
  const unitEntriesToCache = await enumerateUnitEntriesToCache(
    resolvedUnitEntries,
    cacheStorageIo,
  );
  if (!urlsChanged && unitEntriesToCache.length === 0) {
    return { needUpdate: false };
  }
  return { needUpdate: true, unitEntriesToCache };
}
