import { UnitCategoryHint, UnitType } from "./unit-interfaces";

export type UnitMetadata = {
  name: string;
  unitType: UnitType;
  category?: UnitCategoryHint;
  preferredSize: string;
  unitTypesVersion?: string;
  inputSignalTypes?: string; //audio,note,cvgate,state,params,pad
  outputSignalTypes?: string; //audio,note,cvgate,state,params,pad
  repositoryUrl: string;
  author: string;
  forkedRepositoryUrl?: string;
  forkedAuthor?: string;
  license: string;
};
