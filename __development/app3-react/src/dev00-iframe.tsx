import { mountAppRoot } from "mofur/ax-react";
import { createHostSystem } from "wafer-host/core";
import { HostAppProvider, UnitFrame } from "wafer-host/react";
import catalog from "./unit-inventories.json";

catalog;

const hostSystem = createHostSystem(new AudioContext());

const UnitRows = () => {
  return (
    <UnitFrame
      unitId="uf_instrument"
      pageUrl={catalog.mu1Instrument.loaderPageUrl}
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
