async function loadUnitElementClass(tagName: string, moduleUrl: string) {
  const unitModuleText = await fetch(moduleUrl).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${moduleUrl}: ${response.status}`);
    }
    return response.text();
  });

  const unitModuleBlobUrl = URL.createObjectURL(
    new Blob([unitModuleText], { type: "text/javascript" }),
  );

  const unitElement = (await import(/* @vite-ignore */ unitModuleBlobUrl).then(
    (module) => module.default,
  )) as any;

  URL.revokeObjectURL(unitModuleBlobUrl);

  customElements.define(tagName, unitElement);
}

const cachedPromises = new Map<string, Promise<void>>();

export async function loadUnitElementClassCached(
  tagName: string,
  moduleUrl: string,
) {
  let promise = cachedPromises.get(tagName);
  if (!promise) {
    promise = loadUnitElementClass(tagName, moduleUrl);
    cachedPromises.set(tagName, promise);
  }
  await promise;
}
