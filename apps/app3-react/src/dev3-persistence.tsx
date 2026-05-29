import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { createStore } from "snap-store";
import { Button } from "@/components/button";
import { createHostSystem } from "@/host-system/host";
import { UnitFrame } from "@/host-system/react";
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

  const instrumentUnitId = `uf_instrument_${catalogKey}`;
  const keyboardUnitId = `uf_keyboard_${catalogKey}`;
  return (
    <div className="w-dvw h-dvh flex-c">
      <div className="flex-v gap-6 w-[1000px]">
        <div className="flex-ha justify-between">
          <select
            value={catalogKey}
            onChange={(e) => store.setCatalogKey(e.target.value as CatalogKey)}
            className="border border-gray-400 px-1 py-2 w-[400px]"
          >
            {Object.entries(catalog).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name}
              </option>
            ))}
          </select>
          <div className="flex-ha gap-4">
            <Button text="reload page" />
            <Button text="save states" />
          </div>
        </div>
        <div className="border border-gray-400 flex-vc h-[700px]">
          <UnitFrame
            unitId="uf_visualizer"
            destUnitId="$output"
            pageUrl={catalog.specbar.loaderPageUrl}
            frameSize={catalog.specbar.preferredSize}
            hostSystem={hostSystem}
          />
          <UnitFrame
            key={instrumentUnitId}
            unitId={instrumentUnitId}
            destUnitId="uf_visualizer"
            pageUrl={catalog[catalogKey].loaderPageUrl}
            frameSize={catalog[catalogKey].preferredSize}
            hostSystem={hostSystem}
          />
          <UnitFrame
            key={keyboardUnitId}
            unitId={keyboardUnitId}
            destUnitId={instrumentUnitId}
            pageUrl={catalog.mu4_keyboard.loaderPageUrl}
            frameSize={catalog.mu4_keyboard.preferredSize}
            hostSystem={hostSystem}
          />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return <PageRoot />;
};

mountAppRoot(<App />);
