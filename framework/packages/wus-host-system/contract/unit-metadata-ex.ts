import { UnitMetadata } from "@wus/unit-types";

export type HostUnitMetadata = {
  catalogKey: string;
  canonicalPageId: string;
  // unitPageId: string;
  pagePath: string;
} & UnitMetadata;

export type UnitSummariesJson = {
  generatedAt: string;
  units: HostUnitMetadata[];
};
