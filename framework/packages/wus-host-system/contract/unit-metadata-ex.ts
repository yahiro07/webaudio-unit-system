import { UnitMetadata } from "@wus/unit-types";

export type HostUnitMetadata = {
  catalogKey: string;
  canonicalPageId: string;
  // unitPageId: string;
  pageUrl: string;
} & UnitMetadata;

export type UnitSummariesJson = {
  generatedAt: string;
  units: HostUnitMetadata[];
};
