import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { createSequenceTickDriver, HostSystem } from "../host";

type HostAppContextValue = {
  hostSystem: HostSystem;
  playing?: boolean;
  bpm?: number;
  masterGain?: number;
};

const hostAppContext = createContext<HostAppContextValue>(undefined!);

export function useHostAppContext() {
  return useContext(hostAppContext);
}

function useHostAppDrivers({
  hostSystem,
  playing = false,
  bpm,
  masterGain,
}: {
  hostSystem: HostSystem;
  playing?: boolean;
  bpm?: number;
  masterGain?: number;
}) {
  const sequenceTickDriver = useMemo(
    () => createSequenceTickDriver(hostSystem),
    [hostSystem],
  );
  useEffect(hostSystem.setupLifecycle, []);
  useEffect(() => {
    if (masterGain !== undefined) {
      hostSystem.setMasterGain(masterGain);
    }
  }, [hostSystem, masterGain]);
  useEffect(() => {
    if (bpm) {
      sequenceTickDriver.setBpm(bpm);
    }
  }, [sequenceTickDriver, bpm]);
  useEffect(() => {
    if (playing) {
      sequenceTickDriver.start();
      return () => sequenceTickDriver.stop();
    } else {
      sequenceTickDriver.stop();
    }
  }, [sequenceTickDriver, playing]);
}

export const HostAppProvider = ({
  hostSystem,
  playing = false,
  bpm,
  masterGain,
  children,
}: {
  hostSystem: HostSystem;
  playing?: boolean;
  bpm?: number;
  masterGain?: number;
  children: ReactNode;
}) => {
  useHostAppDrivers({ hostSystem, playing, bpm, masterGain });
  return (
    <hostAppContext.Provider value={{ hostSystem, playing, bpm, masterGain }}>
      {children}
    </hostAppContext.Provider>
  );
};
