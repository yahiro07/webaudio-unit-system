import { UnitMetadata } from "wus-unit-types";

export type UnitSourceUrls = Record<string, string>;

export type UnitInventorySpec = Omit<UnitMetadata, "preferredSize"> & {
  catalogKey: string;
  // canonicalPageId: string;
  originalPageUrl: string;
  loaderPageUrl: string;
  preferredSize: { width: number; height: number };
};

export type UnitInventoriesJson = Record<string, UnitInventorySpec>;
