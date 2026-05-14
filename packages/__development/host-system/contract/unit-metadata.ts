import { UnitCategoryHint, UnitType } from "./unit-interfaces-2";

export type UnitMetadata = {
  unitType: UnitType;
  name: string;
  repositoryUrl: string;
  category?: UnitCategoryHint;
};

export type HostUnitMetadata = {
  pagePath: string;
} & UnitMetadata;

export type UnitSummariesJson = {
  generatedAt: string;
  units: HostUnitMetadata[];
};
