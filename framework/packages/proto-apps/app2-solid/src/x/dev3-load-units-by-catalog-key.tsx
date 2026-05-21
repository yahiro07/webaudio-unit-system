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
        pageUrl={catalog.mu1_instrument.loaderPageUrl}
        frameSize={catalog.mu1_instrument.preferredSize}
        hostSystem={hostSystem}
      />
      <UnitFrame
        destUnitId="$output"
        unitId="unit2"
        pageUrl={catalog.webaudio_tinysynth_simple.loaderPageUrl}
        frameSize={catalog.webaudio_tinysynth_simple.preferredSize}
        hostSystem={hostSystem}
      />
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(() => <App />);
