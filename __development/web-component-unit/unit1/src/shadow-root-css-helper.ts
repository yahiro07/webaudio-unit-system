const withTrailingSlash = (value: string) =>
  value.endsWith("/") ? value : `${value}/`;

export function applyShadowRootAppStyleCss(
  el: HTMLElement,
  assetBaseUrlInput: string,
  cssFilePath: string,
) {
  const assetBaseUrl = withTrailingSlash(assetBaseUrlInput);
  const stylesheetUrl = `${assetBaseUrl}${cssFilePath}`;

  if (!el.shadowRoot!.querySelector("link[data-shadow-root-app-styles]")) {
    const styleLink = document.createElement("link");
    styleLink.dataset.shadowRootAppStyles = "true";
    styleLink.rel = "stylesheet";
    styleLink.href = stylesheetUrl;
    el.shadowRoot!.appendChild(styleLink);
  }
}
