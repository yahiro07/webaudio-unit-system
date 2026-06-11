import { UnitInterface, UnitInterfaceProvider } from "wus-unit-types/v02";
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
  const win = iframe.contentWindow as unknown as UnitInterfaceProvider & {
    checkUnitInterfaceCompatibility: (versionCode: string) => void;
    unitInterface?: UnitInterface;
  };

  const unitInstantiationPromise = new Promise<HsUnitInstance>((resolve) => {
    const unitInterface = createUnitInterface(
      hostSystem,
      unitId,
      (unitInstance) => {
        sideEffects.unitInstanceRef.current = unitInstance;
        sideEffects.onUnitInstanceLoaded?.(unitInstance);
        resolve(unitInstance);
      },
    );
    win.unitInterface = unitInterface;
    win.queryUnitInterface = () => unitInterface;
    win.checkUnitInterfaceCompatibility = (versionCode: string) => {
      if (versionCode !== "wus-v02") {
        console.warn(
          `incompatible unit interface version: ${versionCode} for ${unitId}`,
        );
        win.unitInterface = undefined;
      }
    };
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
