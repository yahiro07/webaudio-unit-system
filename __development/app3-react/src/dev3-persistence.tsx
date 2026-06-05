import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { useEffect } from "react";
import { createStore } from "snap-store";
import { createHostSystem, UnitStateData } from "wus-host/host";
import { HostAppProvider, UnitFrame } from "wus-host/react";
import { Button } from "@/components/button";
import catalog from "./unit-inventories.json";

function loadDataFromUrl(): ProjectData | undefined {
  const params = new URLSearchParams(location.search);
  const dataParam = params.get("data");
  if (dataParam) {
    try {
      const json = atob(dataParam);
      const data = JSON.parse(json) as ProjectData;
      return data;
    } catch (e) {
      console.warn(`Failed to load data from URL:`, e);
      return undefined;
    }
  }
}

function loadSavedData(): ProjectData | undefined {
  const text = localStorage.getItem(`dev3-persistence-saved-data`);
  if (text) {
    try {
      const data = JSON.parse(text) as ProjectData;
      return data;
    } catch (e) {
      console.warn(`Failed to parse saved data:`, e);
      return undefined;
    }
  }
}
const initialData = loadDataFromUrl() ?? loadSavedData();

type CatalogKey = keyof typeof catalog;

type StoreState = {
  catalogKey: CatalogKey;
};

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);
const store = createStore<StoreState>({
  catalogKey: initialData?.catalogKey ?? "miniSynth",
});
if (initialData) {
  hostSystem.importUnitStates(initialData.unitStates);
}

type ProjectData = {
  catalogKey: CatalogKey;
  unitStates: UnitStateData[];
};

function mapSongDataEmbeddedUrl(projectData: ProjectData): string {
  const json = JSON.stringify(projectData);
  const base64 = btoa(json);
  const base = location.origin + location.pathname;
  return `${base}?data=${base64}`;
}

const actionsInternal = {
  makeProjectData() {
    const { catalogKey } = store.state;
    const unitStates = hostSystem.exportUnitStates();
    const projectData: ProjectData = { catalogKey, unitStates };
    return projectData;
  },
};
const actions = {
  saveSceneStates() {
    const projectData = actionsInternal.makeProjectData();
    localStorage.setItem(
      `dev3-persistence-saved-data`,
      JSON.stringify(projectData),
    );
    alert("state saved");
  },
  reloadPage() {
    location.reload();
  },
  generateShareUrl() {
    const projectData = actionsInternal.makeProjectData();
    const url = mapSongDataEmbeddedUrl(projectData);
    navigator.clipboard.writeText(url);
    alert("share url copied to clipboard");
  },
};

const PageRoot = () => {
  const { catalogKey } = store.useSnapshot();

  const visualizerUnitId = `uf_visualizer`;
  const instrumentUnitId = `uf_instrument:${catalogKey}`;
  const keyboardUnitId = `uf_keyboard:${catalogKey}`;
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
            <Button text="reload page" onClick={actions.reloadPage} />
            <Button text="share url" onClick={actions.generateShareUrl} />
            <Button text="save states" onClick={actions.saveSceneStates} />
          </div>
        </div>
        <div className="border border-gray-400 flex-vc h-[700px]">
          <HostAppProvider hostSystem={hostSystem}>
            <UnitFrame
              unitId={visualizerUnitId}
              destUnitId="$output"
              pageUrl={catalog.specbar.loaderPageUrl}
              frameSize={catalog.specbar.preferredSize}
            />
            <UnitFrame
              key={instrumentUnitId}
              unitId={instrumentUnitId}
              destUnitId={visualizerUnitId}
              pageUrl={catalog[catalogKey].loaderPageUrl}
              frameSize={catalog[catalogKey].preferredSize}
            />
            <UnitFrame
              key={keyboardUnitId}
              unitId={keyboardUnitId}
              destUnitId={instrumentUnitId}
              pageUrl={catalog.mu4Keyboard.loaderPageUrl}
              frameSize={catalog.mu4Keyboard.preferredSize}
            />
          </HostAppProvider>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(hostSystem.setupLifecycle, []);
  return <PageRoot />;
};

mountAppRoot(<App />);
