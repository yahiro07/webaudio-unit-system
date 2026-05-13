import "../styles/page.css";
import "../styles/utility-classes.css";

import { mountAppRoot } from "@wus/mo-react/mount-app-root";

const App = () => {
  return <div className="w-dvw h-dvh bg-blue-100">mu1 sub app</div>;
};

mountAppRoot(<App />);
