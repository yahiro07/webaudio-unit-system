import "@wus/mo/styles";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";
import catalog from "../unit-inventories.json";

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc">
      <UnitFrame
        destUnitId="$output"
        unitId="unit1"
        pageUrl={catalog.mu1Instrument.loaderUrl}
        frameSize={catalog.mu1Instrument.preferredSize}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        pageUrl={catalog.webaudioTinysynthSimple.loaderUrl}
        frameSize={catalog.webaudioTinysynthSimple.preferredSize}
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
