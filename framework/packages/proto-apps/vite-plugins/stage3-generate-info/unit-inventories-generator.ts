import fs from "node:fs";
import path from "node:path";
import { UnitMetadata } from "../../../wus-unit-types/unit-metadata";
import { ResolvedUnitEntry } from "../common/internal-types";
import { UnitInventoriesJson, UnitInventorySpec } from "../common/types";

function slugifyUnitName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function buildUnitPageId(
  meta: UnitMetadata,
  resolvedUnitEntry: ResolvedUnitEntry,
): string {
  const pageFolderUrl = resolvedUnitEntry.sourceUrlSpec;
  const readableName = slugifyUnitName(meta.name);
  const url = new URL(pageFolderUrl);

  if (resolvedUnitEntry.kind === "file") {
    const sourceFolderSegments = trimTrailingSlash(pageFolderUrl)
      .split(path.sep)
      .filter(Boolean);
    return `file:${sourceFolderSegments.slice(-3).join("/")}:${readableName}`;
  } else if (resolvedUnitEntry.kind === "cache") {
    const normalizedPathname = trimTrailingSlash(url.pathname);
    const ghMatch = normalizedPathname.match(
      /^\/gh\/([^/]+)\/([^/@]+)(?:@[^/]+)?(?:\/.*)?$/,
    );
    if (url.hostname === "cdn.jsdelivr.net" && ghMatch) {
      return `gh:${ghMatch[1]}/${ghMatch[2]}:${readableName}`;
    } else {
      const sourcePath = path.posix.dirname(normalizedPathname);
      return `url:${url.host}${sourcePath}:${readableName}`;
    }
  } else if (resolvedUnitEntry.kind === "public") {
    return `public:${resolvedUnitEntry.folderPath}`;
  } else if (resolvedUnitEntry.kind === "direct") {
    return `direct:${resolvedUnitEntry.targetUrl}`;
  } else {
    throw new Error(
      `Unsupported resolved unit entry kind for building page ID: ${(resolvedUnitEntry as any).kind}`,
    );
  }
}

function checkPageIdsUnique(metaList: UnitInventorySpec[]) {
  const pageIds = metaList.map((m) => m.canonicalPageId);
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i];
    if (pageIds.indexOf(id) !== i) {
      throw new Error(`Duplicate page ID detected: ${id}`);
    }
  }
}

async function readUnitMetaFromFolder(
  folderPath: string,
): Promise<UnitMetadata> {
  try {
    const metaFilePath = path.join(folderPath, "unit-meta.json");
    console.log(`Reading unit meta from ${metaFilePath}`);
    const res = await fs.promises.readFile(metaFilePath, "utf8");
    const json = JSON.parse(res) as UnitMetadata;
    return json;
  } catch (error) {
    throw new Error(
      `Failed to read unit meta from folder ${folderPath}: ${error}`,
    );
  }
}

async function readUnitMetaFromUrl(url: string): Promise<UnitMetadata> {
  try {
    const metaUrl = new URL("unit-meta.json", url);
    const res = await fetch(metaUrl);
    if (!res.ok) {
      // return undefined;
      throw new Error(`Failed to fetch unit meta from ${metaUrl}`);
    }
    const json = (await res.json()) as UnitMetadata;
    return json;
  } catch (error) {
    throw new Error(`Failed to fetch unit meta from ${url}: ${error}`);
  }
}

async function fetchUnitMeta(
  resolvedUnitEntry: ResolvedUnitEntry,
): Promise<UnitMetadata> {
  if (
    resolvedUnitEntry.kind === "file" ||
    resolvedUnitEntry.kind === "cache" ||
    resolvedUnitEntry.kind === "public"
  ) {
    const folderPath = resolvedUnitEntry.folderPath;
    return readUnitMetaFromFolder(folderPath);
  } else if (resolvedUnitEntry.kind === "direct") {
    const url = resolvedUnitEntry.targetUrl;
    return readUnitMetaFromUrl(url);
  }
  throw new Error(
    `Unsupported resolved unit entry kind for ${resolvedUnitEntry.catalogKey}: ${(resolvedUnitEntry as any).kind}`,
  );
}

function getLoaderPageUrl(resolvedUnitEntry: ResolvedUnitEntry): string {
  if (resolvedUnitEntry.kind === "public") {
    return `${resolvedUnitEntry.sourceUrlSpec}index.html`;
  } else if (resolvedUnitEntry.kind === "direct") {
    return `${resolvedUnitEntry.targetUrl}index.html`;
  } else {
    return `/inventory-units/${resolvedUnitEntry.catalogKey}/index.html`;
  }
}

let counter = 1;

function createUnitInventorySpec(
  resolvedUnitEntry: ResolvedUnitEntry,
  meta: UnitMetadata,
): UnitInventorySpec {
  const catalogKey = resolvedUnitEntry.catalogKey;
  const pageFolderUrl = resolvedUnitEntry.sourceUrlSpec;
  return {
    catalogKey,
    // canonicalPageId: buildUnitPageId(meta, resolvedUnitEntry),
    canonicalPageId: "OMIT_AT_THIS_POINT_" + (counter++).toString(),
    ...meta,
    originalPageUrl: `${pageFolderUrl}index.html`,
    loaderPageUrl: getLoaderPageUrl(resolvedUnitEntry),
  };
}

export async function generateSummariesJson(
  resolvedUnitEntries: ResolvedUnitEntry[],
): Promise<UnitInventoriesJson> {
  const inventorySpecs = await Promise.all(
    resolvedUnitEntries.map(async (resolvedUnitEntry) => {
      const meta = await fetchUnitMeta(resolvedUnitEntry);
      return createUnitInventorySpec(resolvedUnitEntry, meta);
    }),
  );
  checkPageIdsUnique(inventorySpecs);
  const summariesJson: UnitInventoriesJson = Object.fromEntries(
    inventorySpecs.map((spec) => [spec.catalogKey, spec]),
  );
  return summariesJson;
}

export function writeSummariesJsonToFile(
  summariesJson: UnitInventoriesJson,
  outputPath: string,
) {
  const outputContent = `${JSON.stringify(summariesJson, null, 2)}\n`;
  fs.writeFileSync(outputPath, outputContent);
  console.log(`generated ${outputPath}`);
}
