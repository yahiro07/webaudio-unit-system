export async function loadUnitElement(tagName: string, moduleUrl: string) {
  const unit1ModuleText = await fetch(moduleUrl).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${moduleUrl}: ${response.status}`);
    }
    return response.text();
  });

  const unit1ModuleBlobUrl = URL.createObjectURL(
    new Blob([unit1ModuleText], { type: "text/javascript" }),
  );

  const unitElement = (await import(/* @vite-ignore */ unit1ModuleBlobUrl).then(
    (module) => module.default,
  )) as any;

  URL.revokeObjectURL(unit1ModuleBlobUrl);

  customElements.define(tagName, unitElement);
}
