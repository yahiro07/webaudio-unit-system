export type ResolvedUnitEntry = {
  catalogKey: string;
  sourceUrlSpec: string;
} & (
  | { kind: "cache"; folderPath: string; bucketName: string; pieceName: string }
  | { kind: "file" | "public"; folderPath: string }
  | { kind: "direct"; targetUrl: string }
);

export type ResolvedUnitEntriesMap = Record<string, ResolvedUnitEntry>;

export type UnitCacheEntry = {
  remoteUrl: string;
  bucketName: string;
  pieceName: string;
  bucketPieceComparisonKey: string; //`${bucketName}:${pieceName}`
};
