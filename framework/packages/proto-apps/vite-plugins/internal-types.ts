export type ResolvedUnitEntry = {
  catalogKey: string;
  sourceUrlSpec: string;
} & (
  | { kind: "cache" | "file" | "public"; folderPath: string }
  | { kind: "direct"; targetUrl: string }
);

export type ResolvedUnitEntriesMap = Record<string, ResolvedUnitEntry>;
