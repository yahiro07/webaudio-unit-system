import { UnitMetadata } from "@wus/unit-types";

export type UnitInventorySpec = UnitMetadata & {
  catalogKey: string;
  canonicalPageId: string;
  originalPageUrl: string;
  loaderPageUrl: string;
};

export type UnitInventoriesJson = Record<string, UnitInventorySpec>;
