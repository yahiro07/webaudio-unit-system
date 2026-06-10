import { loadUnitElement } from "./unit-element-loader";

await loadUnitElement("my-unit1", "/unit1/index.js");
console.log("hello");

const element = document.createElement("my-unit1");

(element as any).setupUnit({ hello: "world" });

document.body.appendChild(element);
