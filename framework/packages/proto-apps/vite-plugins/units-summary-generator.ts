import fs from "node:fs";
import path from "node:path";
import {
  HostUnitMetadata,
  UnitSummariesJson,
} from "../../wus-host-system/contract";
import { UnitMetadata } from "../../wus-unit-types/unit-metadata";

export type UnitSourceUrls = Record<string, string>;

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

function buildUnitPageId(meta: UnitMetadata, pageFolderUrl: string): string {
  const readableName = slugifyUnitName(meta.name);
  const url = new URL(pageFolderUrl);
  if (url.protocol === "file:") {
    const sourceFolderSegments = trimTrailingSlash(pageFolderUrl)
      .split(path.sep)
      .filter(Boolean);
    return `local:${sourceFolderSegments.slice(-3).join("/")}:${readableName}`;
  } else {
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
  }
}

function checkPageIdsUnique(metaList: HostUnitMetadata[]) {
  const pageIds = metaList.map((m) => m.canonicalPageId);
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i];
    if (pageIds.indexOf(id) !== i) {
      throw new Error(`Duplicate page ID detected: ${id}`);
    }
  }
}

async function fetchUnitMeta(pageFolderUrl: string): Promise<UnitMetadata> {
  if (pageFolderUrl.startsWith("file:///")) {
    const url = new URL("unit-meta.json", pageFolderUrl);
    const text = await fs.promises.readFile(url, "utf8");
    return JSON.parse(text);
  } else {
    const unitMetaUrl = `${pageFolderUrl}unit-meta.json`;
    const res = await fetch(unitMetaUrl);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch from ${unitMetaUrl}: ${res.status} ${res.statusText}`,
      );
    }
    return await res.json();
  }
}

function createHostUnitMeta(
  catalogKey: string,
  pageFolderUrl: string,
  meta: UnitMetadata,
): HostUnitMetadata {
  return {
    catalogKey,
    canonicalPageId: buildUnitPageId(meta, pageFolderUrl),
    ...meta,
    pagePath: `${pageFolderUrl}index.html`,
  };
}

export async function generateSummaryFile(
  unitSourceUrls: UnitSourceUrls,
  outputPath: string,
) {
  console.log("buildSummaryFile");
  const metaList = await Promise.all(
    Object.entries(unitSourceUrls).map(async ([catalogKey, url]) => {
      const meta = await fetchUnitMeta(url);
      return createHostUnitMeta(catalogKey, url, meta);
    }),
  );
  checkPageIdsUnique(metaList);
  const summariesJson: UnitSummariesJson = {
    generatedAt: new Date().toISOString(),
    units: metaList,
  };
  const fileContent = JSON.stringify(summariesJson, null, 2) + "\n";
  fs.writeFileSync(outputPath, fileContent);
  console.log(`generated ${outputPath}`);
}
