import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { mountAppRoot } from "mofus/ax-solid";
import catalog from "../unit-inventories.json";

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc">
      <UnitFrame
        destUnitId="$output"
        unitId="unit1"
        pageUrl={catalog.mu1Instrument.loaderPageUrl}
        frameSize={catalog.mu1Instrument.preferredSize}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        pageUrl={catalog.webaudioTinysynthSimple.loaderPageUrl}
        frameSize={catalog.webaudioTinysynthSimple.preferredSize}
        hostSystem={hostSystem}
      />
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(() => <App />);
