import { mountAppRoot } from "@wus/mo-react/mount-app-root";

const App = () => {
  return (
    <div>
      root app
      <iframe src="/units/mu1.html" title="unit" />
      <iframe src="/units/mu2.html" title="unit" />
    </div>
  );
};

mountAppRoot(<App />);
