
export function parseRemoteUnitUrl(url: string): {
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

export function mapUnitUrlToBucketAndPieceNames(url: string): {
  bucketName: string;
  pieceName: string;
} {
  const { bucketName, pieceName } = parseRemoteUnitUrl(url);
  return { bucketName, pieceName };
}