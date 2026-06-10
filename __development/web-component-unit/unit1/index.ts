export class Unit1Element extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setupUnit(args: any) {
    console.log("setupUnit", args);
  }

  connectedCallback() {
    const div = document.createElement("div");
    div.textContent = "unit1";
    this.shadowRoot?.appendChild(div);
  }
  disconnectedCallback() {}
}
