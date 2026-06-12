export function createCustomElementClass(
  fn: (shadowRoot: ShadowRoot) => () => void,
  cssTexts: string[],
): CustomElementConstructor {
  return class extends HTMLElement {
    isMounted: boolean;
    disposeRender: (() => void) | null = null;

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.isMounted = false;
    }
    connectedCallback() {
      if (this.isMounted || !this.shadowRoot) return;

      const style = document.createElement("style");
      style.dataset.unit1Styles = "true";
      style.textContent = cssTexts.join("\n");
      this.shadowRoot.appendChild(style);

      this.disposeRender = fn(this.shadowRoot);
      this.isMounted = true;
    }

    disconnectedCallback() {
      if (this.isMounted && this.shadowRoot) {
        setTimeout(() => {
          if (!this.shadowRoot) return;
          this.disposeRender?.();
          this.disposeRender = null;
          this.isMounted = false;
        }, 0);
      }
    }
  };
}
