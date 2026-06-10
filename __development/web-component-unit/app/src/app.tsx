import { mountAppRoot } from "mofur/ax-react";
import { loadUnitElement } from "./unit-element-loader";
import { WebComponentUnitBox } from "./web-component-unit-box";

await loadUnitElement("my-unit1", "/unit1/index.js");

const App = () => {
  return (
    <div>
      aaa
      <WebComponentUnitBox tagName="my-unit1" />
    </div>
  );
};

mountAppRoot(<App />);
