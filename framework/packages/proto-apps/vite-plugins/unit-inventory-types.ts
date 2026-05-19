import { UnitMetadata } from "@wus/unit-types";

export type UnitInventorySpec = UnitMetadata & {
  catalogKey: string;
  canonicalPageId: string;
  pageUrl: string;
  loaderUrl: string;
};

export type UnitInventoriesJson = Record<string, UnitInventorySpec>;
