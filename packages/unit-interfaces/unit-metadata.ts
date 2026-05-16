import { UnitCategoryHint, UnitType } from "./unit-interfaces-2";

export type UnitMetadata = {
  unitType: UnitType;
  name: string;
  repositoryUrl: string;
  category?: UnitCategoryHint;
};
