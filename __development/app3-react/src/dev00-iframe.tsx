import { mountAppRoot } from "mofur/ax-react";
import { createHostSystem } from "wafer-host/core";
import { HostAppProvider, UnitFrame } from "wafer-host/react";
import catalog from "./unit-inventories.json";

const audioContext = new AudioContext();
const hostSystem = createHostSystem(audioContext);

const UnitRows = () => {
  return (
    <UnitFrame
      unitId="uf_instrument"
      unitUrl={catalog.mu1Instrument.loaderPageUrl}
      destSpec="uf_effect"
    />
  );
};

const App = () => {
  return (
    <HostAppProvider hostSystem={hostSystem}>
      <UnitRows />
    </HostAppProvider>
  );
};

mountAppRoot(<App />);
