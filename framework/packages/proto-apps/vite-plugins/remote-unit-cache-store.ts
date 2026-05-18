import {
  UnitMetadata,
  UnitSummariesJson,
} from "../../wus-host-system/contract";

export type RemoteUnitCacheStore = {
  updateCachedContents(
    unitSourceUrls: Record<string, string>,
  ): Promise<UnitSummariesJson>;
  resolveCachedRemoteUnitRequest(requestPath: string): string | undefined;
};

function mapUnitUrlToBucketName(url: string): string {}

function mapUnitUrlToPieceName(url: string): string {}

function checkDeepEquality(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function createCacheStorageIo(cacheFolderPath: string) {
  return {
    readPreviousUnitSourceUrlsInput(): Record<string, string> | undefined {},
    writePreviousUnitSourceUrlsInput(
      unitSourceUrls: Record<string, string>,
    ): Promise<void> {},
    readCachedSummariesJson(): Promise<UnitSummariesJson | undefined> {},
    writeCachedSummariesJson(
      summariesJson: UnitSummariesJson,
    ): Promise<void> {},
    listExistingBucketPieceKeys(): Promise<string[]> {},
    writeCachedPiece(
      bucketName: string,
      pieceName: string,
      sourceUnitFolderPath: string,
    ): Promise<void> {},
    readCachedPieceMeta(
      bucketName: string,
      pieceName: string,
    ): Promise<UnitMetadata | undefined> {},
  };
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

async function generateSummaries(
  unitSourceUrls: Record<string, string>,
  readCachedPieceMeta: (
    bucketName: string,
    pieceName: string,
  ) => Promise<UnitMetadata | undefined>,
): Promise<UnitSummariesJson> {}

export function createRemoteUnitCacheStore(
  cacheFolderPath: string,
): RemoteUnitCacheStore {
  const cacheStorageIo = createCacheStorageIo(cacheFolderPath);
  return {
    async updateCachedContents(unitSourceUrls) {
      const prevUnitSourceUrls =
        cacheStorageIo.readPreviousUnitSourceUrlsInput();
      if (prevUnitSourceUrls) {
        if (checkDeepEquality(prevUnitSourceUrls, unitSourceUrls)) {
          const cachedSummariesJson =
            await cacheStorageIo.readCachedSummariesJson();
          if (cachedSummariesJson) {
            return cachedSummariesJson;
          }
        }
      }

      const remoteUrls = Object.values(unitSourceUrls).filter((url) =>
        url.startsWith("https://"),
      );
      const existingBucketPieceKeys =
        await cacheStorageIo.listExistingBucketPieceKeys();

      const unitCacheEntries: UnitCacheEntry[] = remoteUrls.map((url) => {
        const bucketName = mapUnitUrlToBucketName(url);
        const pieceName = mapUnitUrlToPieceName(url);
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

      const summariesJson = await generateSummaries(
        unitSourceUrls,
        cacheStorageIo.readCachedPieceMeta,
      );
      await cacheStorageIo.writePreviousUnitSourceUrlsInput(unitSourceUrls);
      await cacheStorageIo.writeCachedSummariesJson(summariesJson);
      return summariesJson;
    },
    resolveCachedRemoteUnitRequest(requestPath) {
      return undefined;
    },
  };
}
