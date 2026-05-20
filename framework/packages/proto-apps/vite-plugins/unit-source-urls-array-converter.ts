import { UnitSourceUrls } from "./types";
import { createSegmentsDecoder } from "./unit-url-helpers";

function createUnitSourceUrlsDictionaryFromArray(
  unitSourceUrlsArray: string[],
): UnitSourceUrls {
  const items = unitSourceUrlsArray
    .map((url) => {
      if (url.startsWith("/@direct/")) {
        const segDecoder = createSegmentsDecoder(url, {
          removeHeadSlash: true,
        });
        const catalogKey = segDecoder.getSegmentAt(1);
        return { catalogKey, url };
      }
      const segDecoder = createSegmentsDecoder(url, { removeTailSlash: true });
      const catalogKey = segDecoder.getSegmentAt(-1);
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
