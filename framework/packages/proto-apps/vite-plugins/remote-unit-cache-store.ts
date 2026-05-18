import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { UnitSummariesJson } from "../../wus-host-system/contract";
import {
  createRemoteUnitCacheStorageIo,
  RemoteUnitCacheStorageIo,
} from "./remote-unit-cache-storage-io";
import { generateSummariesJson } from "./units-summary-generator";

const execFileAsync = promisify(execFile);

export type RemoteUnitCacheStore = {
  updateCachedContents(
    unitSourceUrls: Record<string, string>,
  ): Promise<UnitSummariesJson>;
  resolveCachedRemoteUnitRequest(
    unitPageUrl: string,
    relativePathInUnit: string,
  ): string | undefined;
};

function parseRemoteUnitUrl(url: string): {
  bucketName: string;
  pieceName: string;
  pieceFolderPath: string;
  archiveUrl: string;
} {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname !== "cdn.jsdelivr.net") {
    throw new Error(`Unsupported remote unit host: ${url}`);
  }

  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  if (pathSegments[0] !== "gh") {
    throw new Error(`Unsupported remote unit path format: ${url}`);
  }

  const bucketLastSegmentIndex = pathSegments.findIndex((segment) =>
    segment.includes("@"),
  );
  if (bucketLastSegmentIndex < 0) {
    throw new Error(`Remote unit URL must contain a tag segment: ${url}`);
  }

  const bucketSegments = pathSegments
    .slice(0, bucketLastSegmentIndex + 1)
    .flatMap((segment) => segment.split("@"));
  const [_, owner, repoWithTag] = pathSegments;
  const [repo, ref] = repoWithTag.split("@");
  if (!owner || !repo || !ref) {
    throw new Error(
      `Remote unit URL must contain owner, repo, and ref: ${url}`,
    );
  }

  const piecePathSegments = pathSegments.slice(bucketLastSegmentIndex + 1);
  const isLastSegmentFile = piecePathSegments.at(-1)?.includes(".") ?? false;
  const pieceFolderSegments = isLastSegmentFile
    ? piecePathSegments.slice(0, -1)
    : piecePathSegments;
  const pieceName = pieceFolderSegments.at(-1);

  if (!pieceName) {
    throw new Error(`Remote unit URL must contain a piece name: ${url}`);
  }

  const pieceFolderPath = pieceFolderSegments.join("/");
  if (!pieceFolderPath) {
    throw new Error(`Remote unit URL must contain a piece folder path: ${url}`);
  }

  return {
    bucketName: bucketSegments.join("_"),
    pieceName,
    pieceFolderPath,
    archiveUrl: `https://github.com/${owner}/${repo}/archive/refs/tags/${ref}.zip`,
  };
}

function mapUnitUrlToBucketAndPieceNames(url: string): {
  bucketName: string;
  pieceName: string;
} {
  const { bucketName, pieceName } = parseRemoteUnitUrl(url);
  return { bucketName, pieceName };
}

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
  cacheFolderPath: string,
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
      return (
        (await checkCache(cacheStorageIo, unitSourceUrls)) ??
        (await updateCachedContentsImpl(
          cacheStorageIo,
          unitSourceUrls,
          cacheFolderPath,
        ))
      );
    },
    resolveCachedRemoteUnitRequest(unitPageUrl, relativePathInUnit) {
      const { bucketName, pieceName } =
        mapUnitUrlToBucketAndPieceNames(unitPageUrl);
      return cacheStorageIo.resolveCachedRemoteUnitRequestToFilePath(
        bucketName,
        pieceName,
        relativePathInUnit,
      );
    },
  };
}
