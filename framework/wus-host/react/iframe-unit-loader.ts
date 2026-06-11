import { UnitInterface, UnitInterfaceProvider } from "wus-unit-types/v02";
import { HostSystem, HsUnitInstance } from "../host";
import { createUnitInterface } from "../host/unit-interface-impl";
import { createUnitInterfaceV01 } from "../host/unit-interface-impl-v01";
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
    const unitInterfaceV01 = createUnitInterfaceV01(
      hostSystem,
      unitId,
      (unitInstance) => {
        sideEffects.unitInstanceRef.current = unitInstance;
        sideEffects.onUnitInstanceLoaded?.(unitInstance);
        resolve(unitInstance);
      },
    );
    win.unitInterface = unitInterface;
    win.queryUnitInterface = (versionCode: string) => {
      if (versionCode === "wus-v02") {
        return unitInterface;
      } else if (versionCode === "wus-v01") {
        return unitInterfaceV01 as any;
      } else {
        throw new Error(
          `incompatible unit interface version: ${versionCode} for ${unitId}`,
        );
      }
    };
    win.checkUnitInterfaceCompatibility = (versionCode: string) => {
      if (versionCode === "wus-v02") {
      } else if (versionCode === "wus-v01") {
        win.unitInterface = unitInterfaceV01 as any;
      } else {
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
