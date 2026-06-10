import { createRoot } from "react-dom/client";
import { App } from "./app";

export class Unit1Element extends HTMLElement {
  reactRoot: any | null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.reactRoot = null;
  }
  setupUnit(args: any) {
    console.log("setupUnit", args);
    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.shadowRoot!);
    }
    this.reactRoot.render(<App />);
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
