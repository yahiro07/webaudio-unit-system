import { UnitCategoryHint, UnitType } from "./unit-interfaces-2";

export type UnitMetadata = {
  name: string;
  unitType: UnitType;
  category?: UnitCategoryHint;
  repositoryUrl: string;
  preferredSize: string;
};
