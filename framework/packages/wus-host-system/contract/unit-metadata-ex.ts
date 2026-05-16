import { UnitMetadata } from "@wus/unit-types";

export type HostUnitMetadata = {
  unitPageId: string;
  pagePath: string;
} & UnitMetadata;

export type UnitSummariesJson = {
  generatedAt: string;
  units: HostUnitMetadata[];
};
