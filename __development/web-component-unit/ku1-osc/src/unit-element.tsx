import { render } from "preact";
import { createUnitApp, UnitSetupArgs } from "./app";
import cssText from "./page.css?inline";

export class UnitElement extends HTMLElement {
  isMounted: boolean;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isMounted = false;
  }

  mountApp() {}

  setupUnit(args: UnitSetupArgs) {
    if (this.isMounted || !this.shadowRoot) return;

    // console.log("setupUnit", args);
    const unitApp = createUnitApp(args);

    const style = document.createElement("style");
    style.dataset.unit1Styles = "true";
    style.textContent = cssText;
    this.shadowRoot.appendChild(style);

    render(<unitApp.RenderUi />, this.shadowRoot);
    this.isMounted = true;

    // const ac = args.audioContext;
    // appDi.audioContext = ac;

    // this.mountApp();
  }

  // connectedCallback() {
  //   this.mountApp();
  // }

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
