import { unitSourceUrls } from "../app2-solid/src/unit-source-urls";
import { createRemoteUnitCacheStore } from "./remote-unit-cache-store";

console.log("debug downloading");
debugger;

const remoteUnitCacheStore = createRemoteUnitCacheStore("./.wus-unit-cache");

const summariesJson =
  await remoteUnitCacheStore.updateCachedContents(unitSourceUrls);

console.log(summariesJson);
