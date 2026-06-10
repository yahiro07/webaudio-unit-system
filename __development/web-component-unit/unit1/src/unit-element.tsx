import { render } from "preact";
import { App } from "./app";

const defaultStylesheetUrl = import.meta.url.replace(/\/[^/]*$/, "/style.css");

export class UnitElement extends HTMLElement {
  static stylesheetUrl = defaultStylesheetUrl;

  reactRoot: any | null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.reactRoot = null;
  }
  setupUnit(args: any) {
    console.log("setupUnit", args);

    const stylesheetUrl = (this.constructor as typeof UnitElement).stylesheetUrl;

    if (!this.shadowRoot!.querySelector("link[data-unit1-styles]")) {
      const styleLink = document.createElement("link");
      styleLink.dataset.unit1Styles = "true";
      styleLink.rel = "stylesheet";
      styleLink.href = stylesheetUrl;
      this.shadowRoot!.appendChild(styleLink);
    }

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
