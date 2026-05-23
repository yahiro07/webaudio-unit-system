import { unitSourceUrls } from "../app2-solid/src/unit-source-urls";
import { createRemoteUnitCacheStore } from "./stage2-caching/remote-unit-cache-store";

console.log("debug downloading");
// biome-ignore lint/suspicious/noDebugger: debug
debugger;

const remoteUnitCacheStore = createRemoteUnitCacheStore("./.wus-unit-cache");

const summariesJson =
  await remoteUnitCacheStore.updateCachedContents(unitSourceUrls);

console.log(summariesJson);
