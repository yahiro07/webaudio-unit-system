import { UnitSourceUrls } from "./unit-inventories-generator";

function createUnitSourceUrlsDictionaryFromArray(
  unitSourceUrlsArray: string[],
): UnitSourceUrls {
  const items = unitSourceUrlsArray
    .map((url) => {
      const segments = url.replace(/\/$/, "").split("/");
      const catalogKey = segments.at(-1);
      if (catalogKey) {
        return { catalogKey, url } as const;
      }
      return undefined;
    })
    .filter((it) => !!it) as { catalogKey: string; url: string }[];
  const nameCounters: Record<string, number> = {};
  for (const item of items) {
    const key = item.catalogKey;
    nameCounters[key] ??= 0;
    nameCounters[key]++;
    if (nameCounters[key] > 1) {
      item.catalogKey = `${key}-${nameCounters[key]}`;
    }
  }
  return Object.fromEntries(
    items.map(({ catalogKey, url }) => [catalogKey, url]),
  );
}

export function formatUnitSourceUrlsToDictionary(
  unitSourceUrls: UnitSourceUrls | string[],
): UnitSourceUrls {
  if (Array.isArray(unitSourceUrls)) {
    return createUnitSourceUrlsDictionaryFromArray(unitSourceUrls);
  } else {
    return unitSourceUrls;
  }
}
