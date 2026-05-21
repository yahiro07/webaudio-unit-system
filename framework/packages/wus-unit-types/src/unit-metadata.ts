import { UnitCategoryHint, UnitType } from "./unit-interfaces";

export type UnitMetadata = {
  name: string;
  unitType: UnitType;
  category?: UnitCategoryHint;
  repositoryUrl: string;
  preferredSize: string;
};
