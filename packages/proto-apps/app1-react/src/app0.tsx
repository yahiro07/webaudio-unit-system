import { mountAppRoot } from "@wus/mo-react/mount-app-root";

const App = () => {
  return (
    <div>
      <iframe src="/units-dev/mu1-instrument/index.html" title="unit" />
      <iframe src="/units-dev/mu2-sequencer/index.html" title="unit" />
      <iframe src="/units-dev/mu3-effect/index.html" title="unit" />
      <iframe src="/units-dev/mu4-keyboard/index.html" title="unit" />
      <iframe src="/units-dev/mu5-visualizer/index.html" title="unit" />
    </div>
  );
};

mountAppRoot(<App />);
