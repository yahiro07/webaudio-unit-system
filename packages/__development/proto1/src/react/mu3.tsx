import "../styles/page.css";
import "../styles/utility-classes.css";

import { mountAppRoot } from "@wus/mo-react/mount-app-root";

const App = () => {
  return <div className="w-dvw h-dvh bg-green-100 p-2">mu3 sub app</div>;
};

mountAppRoot(<App />);
