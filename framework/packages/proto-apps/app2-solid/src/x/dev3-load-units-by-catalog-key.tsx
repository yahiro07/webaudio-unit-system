import "@wus/mo/styles";
import { createHostSystem, UnitSummariesJson } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import unitsSummaryJson from "../units-summary.json";

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

const catalogKeysAvailable = (unitsSummaryJson as UnitSummariesJson).units.map(
  (unit) => unit.catalogKey,
);
console.log("catalog keys available:", catalogKeysAvailable);

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc">
      <UnitFrame
        destUnitId="$output"
        unitId="unit1"
        catalogKey="mu1Instrument"
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        catalogKey="webaudioTinysynthSimple"
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
