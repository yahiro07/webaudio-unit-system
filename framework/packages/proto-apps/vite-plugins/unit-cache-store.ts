import { UnitSummariesJson } from "../../wus-host-system/contract";

type UnitCacheStore = {
  fetchRemoteUnits(
    unitSummariesJson: UnitSummariesJson,
    cacheFolderPath: string,
  ): Promise<void>;
  resolveCachedRemoteUnitRequest(requestPath: string): string | undefined;
};
