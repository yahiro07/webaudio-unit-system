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
  resolveCachedRemoteUnitRequest(
    unitPageUrl: string,
    requestPath: string,
  ): string | undefined;
};

export function createRemoteUnitCacheStorageIo(
  cacheFolderPath: string,
): RemoteUnitCacheStorageIo {
  return {
    readPreviousUnitSourceUrlsInput() {},
    writePreviousUnitSourceUrlsInput(unitSourceUrls) {},
    readCachedSummariesJson() {},
    writeCachedSummariesJson(summariesJson) {},
    listExistingBucketPieceKeys() {},
    writeCachedPiece(bucketName, pieceName, sourceUnitFolderPath) {},
    readCachedPieceMeta(bucketName, pieceName) {},
  };
}
