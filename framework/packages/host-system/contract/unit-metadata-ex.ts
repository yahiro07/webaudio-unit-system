import { UnitMetadata } from "../../unit-interfaces";

export type HostUnitMetadata = {
  unitPageId: string;
  pagePath: string;
} & UnitMetadata;

export type UnitSummariesJson = {
  generatedAt: string;
  units: HostUnitMetadata[];
};
