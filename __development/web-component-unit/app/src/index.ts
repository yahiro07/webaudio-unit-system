// import Unit1Element from "unit1";

const unit1ModuleUrl = "/unit1/index.js";
const unit1StylesheetUrl = "/unit1/style.css";

const unit1ModuleText = await fetch(unit1ModuleUrl).then((response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${unit1ModuleUrl}: ${response.status}`);
  }
  return response.text();
});

const unit1ModuleBlobUrl = URL.createObjectURL(
  new Blob([unit1ModuleText], { type: "text/javascript" }),
);

const Unit1Element = (await import(/* @vite-ignore */ unit1ModuleBlobUrl).then(
  (module) => module.default,
)) as any;

Unit1Element.stylesheetUrl = unit1StylesheetUrl;

URL.revokeObjectURL(unit1ModuleBlobUrl);

console.log({ Unit1Element });

customElements.define("my-unit1", Unit1Element);

console.log("hello");

const element = document.createElement("my-unit1");

(element as any).setupUnit({ hello: "world" });

document.body.appendChild(element);

export {};
