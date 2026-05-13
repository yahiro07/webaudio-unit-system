import "../styles/page.css";
import "../styles/utility-classes.css";

import { mountAppRoot } from "@wus/mo-react/mount-app-root";

const App = () => {
  return (
    <div className="w-dvw h-dvh flex-vc gap-4">
      <div>root app</div>
      <div className="flex-c gap-4">
        <iframe
          src="/units/mu1.html"
          title="unit"
          className="border border-[#888]"
        />
        <iframe
          src="/units/mu2.html"
          title="unit"
          className="border border-[#888]"
        />
      </div>
    </div>
  );
};

mountAppRoot(<App />);
