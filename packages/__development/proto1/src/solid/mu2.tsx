/** @jsxImportSource solid-js */
import "../styles/page.css";
import "../styles/utility-classes.css";

import { mountAppRoot } from "@wus/mo-solid/mount-app-root";

const App = () => {
  return <div class="w-dvw h-dvh bg-red-100 p-2">mu2 sub app</div>;
};

mountAppRoot(() => <App />);
