import "@wus/mo/styles";
import { createHostSystem } from "@wus/host-system/host";
import { UnitFrame } from "@wus/host-system/solid";
import { mountAppRoot } from "@wus/mo-solid/mount-app-root";

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

const PageRoot = () => {
  return (
    <div class="w-dvw h-dvh flex-vc">
      {/* load unit from public folder */}
      <UnitFrame
        destUnitId="$output"
        unitId="mu1a"
        pageUrl="/local-units/mu1-instrument/index.html"
        hostSystem={hostSystem}
      />
      {/* load unit from remote url */}
      <UnitFrame
        destUnitId="$output"
        unitId="mu1b"
        pageUrl="https://cdn.jsdelivr.net/gh/yahiro07/wus-custom-units@r2/units/webaudio-tinysynth-simple/index.html"
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
