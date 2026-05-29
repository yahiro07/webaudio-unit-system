import { UnitCategoryHint, UnitType } from "./unit-interfaces";

export type UnitMetadata = {
  name: string;
  unitType: UnitType;
  category?: UnitCategoryHint;
  repositoryUrl: string;
  preferredSize: string;
  unitTypesVersion?: string;
  inputSignalTypes?: string; //audio,note,cvgate,state,params,pad
  outputSignalTypes?: string; //audio,note,cvgate,state,params,pad
};
