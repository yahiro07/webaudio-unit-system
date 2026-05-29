import { mountAppRoot } from "beams/ax-react/mount-app-root";
import { createStore } from "snap-store";
import { Button } from "@/components/button";
import { createHostSystem } from "@/host-system/host";
import { UnitFrame } from "@/host-system/react";
import catalog from "./unit-inventories.json";

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
const savedData = loadSavedData();

type CatalogKey = keyof typeof catalog;

type StoreState = {
  catalogKey: CatalogKey;
};

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);
const store = createStore<StoreState>({
  catalogKey: savedData?.catalogKey ?? "mini_synth",
});

type UnitStateData =
  | { type: "bytes"; base64: string }
  | { type: "json"; json: any };

function isUint8ArrayLike(value: unknown): value is Uint8Array {
  return (
    value instanceof Uint8Array ||
    (ArrayBuffer.isView(value) &&
      Object.prototype.toString.call(value) === "[object Uint8Array]")
  );
}

function mapUnitStateToData(
  state: Uint8Array | Record<string, any>,
): UnitStateData | undefined {
  if (isUint8ArrayLike(state)) {
    const base64 = btoa(String.fromCharCode(...state));
    return { type: "bytes", base64 };
  } else if (state && typeof state === "object") {
    return { type: "json", json: state };
  }
}

type ProjectData = {
  catalogKey: CatalogKey;
  unitStates: {
    id: string;
    data?: UnitStateData;
  }[];
};

const actions = {
  saveSceneStates() {
    const { catalogKey } = store.state;
    const units = hostSystem.getUnits();
    const states = units.map((unit) => {
      const state =
        unit.persistence?.emitStateBytes?.() ?? unit.persistence?.emitState?.();
      console.log({ state });
      return {
        id: unit.unitId,
        data: state ? mapUnitStateToData(state) : undefined,
      };
    });
    const projectData: ProjectData = {
      catalogKey,
      unitStates: states,
    };
    localStorage.setItem(
      `dev3-persistence-saved-data`,
      JSON.stringify(projectData),
    );
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
            <Button text="reload page" />
            <Button text="save states" onClick={actions.saveSceneStates} />
          </div>
        </div>
        <div className="border border-gray-400 flex-vc h-[700px]">
          <UnitFrame
            unitId={visualizerUnitId}
            destUnitId="$output"
            pageUrl={catalog.specbar.loaderPageUrl}
            frameSize={catalog.specbar.preferredSize}
            hostSystem={hostSystem}
          />
          <UnitFrame
            key={instrumentUnitId}
            unitId={instrumentUnitId}
            destUnitId={visualizerUnitId}
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
