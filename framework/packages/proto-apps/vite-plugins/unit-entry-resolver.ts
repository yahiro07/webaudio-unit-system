import path from "node:path";
import {
  extractDirectTargetUrl,
  mapUnitUrlToBucketAndPieceNames,
} from "./unit-url-helpers";

export type ResolvedUnitEntry = { sourceUrlSpec: string } & (
  | { kind: "cache"; folderPath: string }
  | { kind: "file"; folderPath: string }
  | { kind: "public"; folderPath: string }
  | { kind: "direct"; targetUrl: string }
);

export type ResolvedUnitEntries = Record<string, ResolvedUnitEntry>;

function mapUrlToResolvedUnitEntry(
  url: string,
  unitsCacheFolderPath: string,
): ResolvedUnitEntry {
  if (url.startsWith("/@direct/")) {
    const targetUrl = extractDirectTargetUrl(url);
    return { kind: "direct", sourceUrlSpec: url, targetUrl };
  } else if (url.startsWith("https://") || url.startsWith("http://")) {
    const { bucketName, pieceName } = mapUnitUrlToBucketAndPieceNames(url);
    const folderPath = path.join(unitsCacheFolderPath, bucketName, pieceName);
    return { kind: "cache", folderPath, sourceUrlSpec: url };
  } else if (url.startsWith("file:///")) {
    const folderPath = url.replace("file:///", "/");
    return { kind: "file", folderPath, sourceUrlSpec: url };
  } else if (url.startsWith("/")) {
    const folderPath = `./public${url}`;
    return { kind: "public", sourceUrlSpec: url, folderPath };
  } else {
    throw new Error(`Unsupported URL format for unit source: ${url}`);
  }
}

export function createResolvedUnitEntries(
  sourceUrls: Record<string, string>,
  unitsCacheFolderPath: string,
): ResolvedUnitEntries {
  return Object.fromEntries(
    Object.entries(sourceUrls).map(([catalogKey, url]) => [
      catalogKey,
      mapUrlToResolvedUnitEntry(url, unitsCacheFolderPath),
    ]),
  );
}
