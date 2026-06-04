import { UnitCategoryHint, UnitType } from "./unit-interfaces";

export type UnitMetadata = {
  name: string;
  unitType: UnitType;
  category?: UnitCategoryHint;
  preferredSize: string;
  outputSignalTypes: string; //audio,note,cvgate,state,params,pad
  inputSignalTypes: string; //audio,note,cvgate,state,params,pad
  unitTypesVersion: string;
} & (
  | { repositoryUrl: string; author: string }
  | {
      originalRepositoryUrl: string;
      originalAuthor: string;
      forkedRepositoryUrl: string;
      forkedAuthor: string;
    }
) & {
    license: string;
  };
