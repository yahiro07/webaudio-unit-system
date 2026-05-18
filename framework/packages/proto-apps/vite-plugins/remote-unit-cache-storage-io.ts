import { UnitSummariesJson } from "../../wus-host-system/contract";
import { UnitMetadata } from "../../wus-unit-types/unit-metadata";

export type RemoteUnitCacheStorageIo = {
  readPreviousUnitSourceUrlsInput(): Promise<
    Record<string, string> | undefined
  >;
  writePreviousUnitSourceUrlsInput(
    unitSourceUrls: Record<string, string>,
  ): Promise<void>;
  readCachedSummariesJson(): Promise<UnitSummariesJson | undefined>;
  writeCachedSummariesJson(summariesJson: UnitSummariesJson): Promise<void>;
  listExistingBucketPieceKeys(): Promise<string[]>;
  writeCachedPiece(
    bucketName: string,
    pieceName: string,
    sourceUnitFolderPath: string,
  ): Promise<void>;
  readCachedPieceMeta(
    bucketName: string,
    pieceName: string,
  ): Promise<UnitMetadata | undefined>;
  resolveCachedRemoteUnitRequestToFilePath(
    bucketName: string,
    pieceName: string,
    pathInPiece: string,
  ): string | undefined;
};

export function createRemoteUnitCacheStorageIo(
  cacheFolderPath: string,
): RemoteUnitCacheStorageIo {
  const internal = {
    readJsonFile<T>(path: string): Promise<T | undefined> {},
    writeJsonFile<T>(path: string, content: T): Promise<void> {},
    writeFolder(path: string, srcPath: string): Promise<void> {},
    globFoldersTwoLevels(basePath: string): Promise<string[]> {},
  };
  return {
    readPreviousUnitSourceUrlsInput() {
      return internal.readJsonFile("previous-unit-source-urls.json");
    },
    writePreviousUnitSourceUrlsInput(unitSourceUrls) {
      return internal.writeJsonFile(
        "previous-unit-source-urls.json",
        unitSourceUrls,
      );
    },
    readCachedSummariesJson() {
      return internal.readJsonFile("cached-summaries.json");
    },
    writeCachedSummariesJson(summariesJson) {
      return internal.writeJsonFile("cached-summaries.json", summariesJson);
    },
    async listExistingBucketPieceKeys() {
      const paths = await internal.globFoldersTwoLevels("units");
      return paths.map((p) => p.replace("/", ":"));
    },
    writeCachedPiece(bucketName, pieceName, sourceUnitFolderPath) {
      const destFolder = `units/${bucketName}/${pieceName}`;
      return internal.writeFolder(destFolder, sourceUnitFolderPath);
    },
    readCachedPieceMeta(bucketName, pieceName) {
      return internal.readJsonFile(
        `units/${bucketName}/${pieceName}/unit-meta.json`,
      );
    },
    resolveCachedRemoteUnitRequestToFilePath(
      bucketName,
      pieceName,
      pathInPiece,
    ) {
      return `units/${bucketName}/${pieceName}/${pathInPiece}`;
    },
  };
}
