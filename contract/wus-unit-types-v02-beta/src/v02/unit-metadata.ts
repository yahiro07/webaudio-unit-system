import { UnitCategoryHint, UnitType } from "./common-types";

export type UnitMetadata = {
  name: string;
  unitType: UnitType;
  categoryHint?: UnitCategoryHint;
  preferredSize: string; //w,h
  outputSignalTypes: string; //audio,note,cvGate,clock,state,automation,samplerPad
  inputSignalTypes: string; //audio,note,cvGate,clock,state,automation,samplerPad
  protocol: "wus-v02";
  unitTypesVersion: string;
  integrationFormat: "iframe" | "webComponents";
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
