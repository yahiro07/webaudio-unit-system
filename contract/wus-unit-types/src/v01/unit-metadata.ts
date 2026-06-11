import { UnitCategoryHint, UnitType } from "./unit-interfaces";

export type UnitMetadata = {
  targetProtocol: "wus-v01";
  name: string;
  unitType: UnitType;
  categoryHint?: UnitCategoryHint;
  preferredSize: string; //w,h
  outputSignalTypes: string; //audio,note,state,params,pad
  inputSignalTypes: string; //audio,note,state,params,pad
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
