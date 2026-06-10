import { render } from "preact";
import { App } from "./app";
import cssText from "./page.css?inline";

export class UnitElement extends HTMLElement {
  reactRoot: any | null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.reactRoot = null;
  }
  setupUnit(args: any) {
    console.log("setupUnit", args);

    const style = document.createElement("style");
    style.dataset.unit1Styles = "true";
    style.textContent = cssText;
    this.shadowRoot!.appendChild(style);

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
