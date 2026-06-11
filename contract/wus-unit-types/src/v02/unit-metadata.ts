import { UnitCategoryHint, UnitType } from "./common-types";

export type UnitMetadata = {
  targetProtocol: "wus-v02";
  name: string;
  unitType: UnitType;
  categoryHint?: UnitCategoryHint;
  preferredSize: string; //w,h
  outputSignalTypes: string; //audio,note,cvGate,clock,state,automation,samplerPad
  inputSignalTypes: string; //audio,note,cvGate,clock,state,automation,samplerPad
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
