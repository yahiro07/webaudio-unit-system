import { HostSystem, HsUnitInstance } from "../host";
import { createUnitInterface } from "../host/unit-interface-impl";

export function loadIframeUnitInstance(
  hostSystem: HostSystem,
  unitId: string,
  iframe: HTMLIFrameElement,
  sideEffects: {
    onIframeMounted?: (iframe: HTMLIFrameElement) => (() => void) | undefined;
    onUnitInstanceLoaded?: (unitInstance: HsUnitInstance) => void;
    unitInstanceRef: React.RefObject<HsUnitInstance | null>;
  },
) {
  const cleanupIFrameCallback = sideEffects.onIframeMounted?.(iframe);
  const win = iframe.contentWindow;
  const unitInstantiationPromise = new Promise<HsUnitInstance>((resolve) => {
    (win as any).unitInterface = createUnitInterface(
      hostSystem.audioContext,
      unitId,
      (unitInstance) => {
        sideEffects.unitInstanceRef.current = unitInstance;
        sideEffects.onUnitInstanceLoaded?.(unitInstance);
        resolve(unitInstance);
      },
    );
  });
  const unregisterUnit = hostSystem.registerPendingUnitInstancePromise(
    unitId,
    unitInstantiationPromise,
  );
  return () => {
    unregisterUnit();
    cleanupIFrameCallback?.();
  };
}
