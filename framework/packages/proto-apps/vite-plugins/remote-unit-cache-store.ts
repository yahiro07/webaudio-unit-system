import { UnitSummariesJson } from "../../wus-host-system/contract";
import {
  createRemoteUnitCacheStorageIo,
  RemoteUnitCacheStorageIo,
} from "./remote-unit-cache-storage-io";
import { generateSummariesJson } from "./units-summary-generator";

export type RemoteUnitCacheStore = {
  updateCachedContents(
    unitSourceUrls: Record<string, string>,
  ): Promise<UnitSummariesJson>;
  resolveCachedRemoteUnitRequest(
    unitPageUrl: string,
    requestPath: string,
  ): string | undefined;
};

function mapUnitUrlToBucketAndPieceNames(url: string): {
  bucketName: string;
  pieceName: string;
} {}

// function mapUnitUrlToPieceName(url: string): string {}

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
) {
  const entriesPerBuckets: Record<string, UnitCacheEntry[]> = {};

  //todo: group units by repository

  for (const bucketName in entriesPerBuckets) {
    //fetch the zip file
    //extract
    //write to cache for each required unit
  }
}

async function checkCache(
  cacheStorageIo: RemoteUnitCacheStorageIo,
  unitSourceUrls: Record<string, string>,
): Promise<UnitSummariesJson | undefined> {
  const prevUnitSourceUrls =
    await cacheStorageIo.readPreviousUnitSourceUrlsInput();
  if (prevUnitSourceUrls) {
    if (checkDeepEquality(prevUnitSourceUrls, unitSourceUrls)) {
      const cachedSummariesJson =
        await cacheStorageIo.readCachedSummariesJson();
      if (cachedSummariesJson) {
        return cachedSummariesJson;
      }
    }
  }
}

async function updateCachedContentsImpl(
  cacheStorageIo: RemoteUnitCacheStorageIo,
  unitSourceUrls: Record<string, string>,
): Promise<UnitSummariesJson> {
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
  const unitEntriesToCache = unitCacheEntries.filter(
    (entry) =>
      !existingBucketPieceKeys.includes(entry.bucketPieceComparisonKey),
  );
  await downloadUnitsFromRemote(
    unitEntriesToCache,
    cacheStorageIo.writeCachedPiece,
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
      return (
        (await checkCache(cacheStorageIo, unitSourceUrls)) ??
        (await updateCachedContentsImpl(cacheStorageIo, unitSourceUrls))
      );
    },
    resolveCachedRemoteUnitRequest(unitPageUrl, requestPath) {
      const { bucketName, pieceName } =
        mapUnitUrlToBucketAndPieceNames(unitPageUrl);
      return cacheStorageIo.resolveCachedRemoteUnitRequestToFilePath(
        bucketName,
        pieceName,
        requestPath,
      );
    },
  };
}
