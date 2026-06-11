import { render } from "preact";
import { App } from "./app";
import cssText from "./page.css?inline";

export class UnitElement extends HTMLElement {
  isMounted: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isMounted = false;
  }

  mountApp() {}

  connectedCallback() {
    if (this.isMounted || !this.shadowRoot) return;

    const style = document.createElement("style");
    style.dataset.unit1Styles = "true";
    style.textContent = cssText;
    this.shadowRoot.appendChild(style);

    render(<App />, this.shadowRoot);
    this.isMounted = true;
  }

  disconnectedCallback() {
    if (this.isMounted && this.shadowRoot) {
      setTimeout(() => {
        if (!this.shadowRoot) return;
        render(null, this.shadowRoot);
        this.isMounted = false;
      }, 0);
    }
  }
}
