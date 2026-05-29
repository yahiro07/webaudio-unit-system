import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { ScalerBox } from "beams/mo-react/components/scaler-box";
import { createStore } from "snap-store";
import { createHostSystem } from "@/host-system/host";
import { UnitFrame } from "@/host-system/react";
import { normalizeFrameSize } from "@/host-system/react/frame-size";
import catalog from "./unit-inventories.json";

type CatalogKey = keyof typeof catalog;

type StoreState = {
  catalogKey: CatalogKey;
};

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);
const store = createStore<StoreState>({
  catalogKey: Object.keys(catalog)[0] as CatalogKey,
});

const PageRoot = () => {
  const { catalogKey } = store.useSnapshot();
  const frameSize = normalizeFrameSize(catalog[catalogKey].preferredSize)!;
  const dpr = window.devicePixelRatio;
  const captureSizeWidth = 400 / dpr;
  const captureSizeHeight = 270 / dpr;
  const scaling = Math.min(
    captureSizeWidth / frameSize.width,
    captureSizeHeight / frameSize.height,
  );

  return (
    <div className="w-dvw h-dvh flex-c">
      <div className="flex-v gap-6 w-[600px]">
        <select
          value={catalogKey}
          onChange={(e) => store.setCatalogKey(e.target.value as CatalogKey)}
          className="border border-gray-400 px-1 py-2"
        >
          {Object.entries(catalog).map(([key, info]) => (
            <option key={key} value={key}>
              {info.name}
            </option>
          ))}
        </select>
        <div className="border border-gray-400 flex-c h-[400px]">
          <div id="screenshot-target-container">
            <ScalerBox
              contentWidth={frameSize.width}
              contentHeight={frameSize.height}
              scale={scaling}
            >
              <UnitFrame
                unitId="uf_instrument"
                pageUrl={catalog[catalogKey].loaderPageUrl}
                frameSize={frameSize}
                hostSystem={hostSystem}
              />
            </ScalerBox>
          </div>
        </div>
        <div className="text-gray-500">
          To capture thumbnail screenshot of the unit, open devtool and select
          div with id "screenshot-target-container" element (not the inner
          iframe itself), then right click and choose "Capture node screenshot".
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(<App />);
