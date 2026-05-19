import "@wus/mo/styles";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import {
  HostUnitMetadata,
  UnitSummariesJson,
} from "../../../vite-plugins/unit-inventory-types";
import unitsSummaryJson from "../units-summary.json";

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

function findCatalogItem(catalogKey: string): HostUnitMetadata {
  const item = (unitsSummaryJson as UnitSummariesJson).units.find(
    (unit) => unit.catalogKey === catalogKey,
  );
  if (!item) throw new Error(`catalog item with key "${catalogKey}" not found`);
  return item;
}
const c_mu1 = findCatalogItem("mu1Instrument");
const c_tinySynth = findCatalogItem("webaudioTinysynthSimple");

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc">
      <UnitFrame
        destUnitId="$output"
        unitId="unit1"
        pageUrl={c_mu1.loaderUrl}
        frameSize={c_mu1.preferredSize}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        pageUrl={c_tinySynth.loaderUrl}
        frameSize={c_tinySynth.preferredSize}
        hostSystem={hostSystem}
        style={{ width: "500px", height: "300px" }}
      />
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(() => <App />);
