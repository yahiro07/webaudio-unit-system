import { render } from "preact";
import { App } from "./app";
import { applyShadowRootAppStyleCss } from "./shadow-root-css-helper";

const defaultAssetBaseUrl = import.meta.url.replace(/\/[^/]*$/, "/");

export class UnitElement extends HTMLElement {
  static assetBaseUrl = defaultAssetBaseUrl;

  reactRoot: any | null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.reactRoot = null;
  }
  setupUnit(args: any) {
    console.log("setupUnit", args);
    applyShadowRootAppStyleCss(
      this,
      (this.constructor as typeof UnitElement).assetBaseUrl,
      "style.css",
    );
    this.reactRoot = render(<App />, this.shadowRoot!);
  }

  // connectedCallback() {
  //   const div = document.createElement("div");
  //   div.textContent = "unit1";
  //   this.shadowRoot?.appendChild(div);
  // }

  disconnectedCallback() {
    if (this.reactRoot) {
      setTimeout(() => {
        this.reactRoot.unmount();
        this.reactRoot = null;
      }, 0);
    }
  }
}
