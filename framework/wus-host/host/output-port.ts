import { PortSubtype, UnitOutputPort } from "wus-unit-types";
import {
  HsUnitInputPort,
  HsUnitOutputPort,
  HsWeakClockPort,
  HsWeakStatePort,
} from "./host-types";
import { WebAudioActionScheduler } from "./webaudio-action-scheduler";

function getConnectedSubPortTypes(
  port: HsUnitInputPort,
  hasAudioOutput: boolean,
): PortSubtype[] {
  if (port.getSubPortTypes) {
    return port.getSubPortTypes(hasAudioOutput);
  }
  return [
    hasAudioOutput && port.audioInput ? "audio" : undefined,
    port.noteInput ? "note" : undefined,
    port.cvGateInput ? "cvGate" : undefined,
    port.clockInput ? "clock" : undefined,
    port.stateInput ? "state" : undefined,
    port.automationInput ? "automation" : undefined,
    port.samplerPadInput ? "samplerPad" : undefined,
  ].filter((type): type is PortSubtype => !!type);
}

export function createHsUnitOutputPortImpl(
  audioContext: AudioContext,
  actionScheduler: WebAudioActionScheduler,
): HsUnitOutputPort {
  const connectedInputPorts = new Set<HsUnitInputPort>();
  const unsubscribeSubPortTypesByPort = new Map<HsUnitInputPort, () => void>();
  let audioRelayNode: AudioNode | null = null;
  let callbacks: Parameters<UnitOutputPort["setCallbacks"]>[0] | undefined;

  const ensureAudioRelayNode = () => {
    if (audioRelayNode) {
      return audioRelayNode;
    }
    audioRelayNode = audioContext.createGain();
    connectedInputPorts.forEach((connectedInputPort) => {
      if (connectedInputPort.audioInput) {
        audioRelayNode?.connect(connectedInputPort.audioInput.node);
      }
    });
    return audioRelayNode;
  };

  const core = {
    connectTo(port: HsUnitInputPort) {
      if (connectedInputPorts.has(port)) {
        return;
      }
      if (audioRelayNode && port.audioInput) {
        audioRelayNode.connect(port.audioInput?.node);
      }
      const subPortTypes = getConnectedSubPortTypes(port, !!audioRelayNode);
      connectedInputPorts.add(port);
      callbacks?.onConnectedTo?.(subPortTypes);
      port.callbacks?.onConnectedFrom?.(subPortTypes);
      const unsubscribeSubPortTypes = port.subscribeSubPortTypes?.(
        (nextSubPortTypes) => {
          if (connectedInputPorts.has(port)) {
            callbacks?.onConnectedTo?.(nextSubPortTypes);
          }
        },
      );
      if (unsubscribeSubPortTypes) {
        unsubscribeSubPortTypesByPort.set(port, unsubscribeSubPortTypes);
      }
    },
    disconnectFrom(port: HsUnitInputPort) {
      const wasConnected = connectedInputPorts.has(port);
      if (!wasConnected) {
        return;
      }
      if (audioRelayNode && port.audioInput) {
        audioRelayNode.disconnect(port.audioInput?.node);
      }
      unsubscribeSubPortTypesByPort.get(port)?.();
      unsubscribeSubPortTypesByPort.delete(port);
      connectedInputPorts.delete(port);
      callbacks?.onDisconnectTo?.();
      port.callbacks?.onDisconnectFrom?.();
    },
  };
  return {
    connectTo: core.connectTo,
    disconnectFrom: core.disconnectFrom,
    setCallbacks(_callbacks) {
      callbacks = _callbacks;
    },
    audioOutput: {
      get node() {
        return ensureAudioRelayNode();
      },
    },
    noteOutput: {
      noteOn(note: number, time?: number, velocity?: number) {
        actionScheduler.pushAction(() => {
          connectedInputPorts.forEach((connectedInputPort) => {
            connectedInputPort.noteInput?.noteOn(note, time, velocity);
          });
        }, time);
      },
      noteOff(note: number, time?: number) {
        actionScheduler.pushAction(() => {
          connectedInputPorts.forEach((connectedInputPort) => {
            connectedInputPort.noteInput?.noteOff(note, time);
          });
        }, time);
      },
    },
    cvGateOutput: {
      setCv(cv: number) {
        connectedInputPorts.forEach((connectedInputPort) => {
          connectedInputPort.cvGateInput?.setCv(cv);
        });
      },
      setGate(gate: boolean) {
        connectedInputPorts.forEach((connectedInputPort) => {
          connectedInputPort.cvGateInput?.setGate(gate);
        });
      },
    },
    clockOutput: {
      start() {
        connectedInputPorts.forEach((connectedInputPort) => {
          connectedInputPort.clockInput?.start?.();
        });
      },
      processStep(stepIndex: number, unitDurationSec: number) {
        connectedInputPorts.forEach((connectedInputPort) => {
          const clockInput = connectedInputPort.clockInput as HsWeakClockPort;
          clockInput?.processStep?.(stepIndex, unitDurationSec);
        });
      },
      processScheduling(startTime, ppqFrom, ppqTo, bpm) {
        connectedInputPorts.forEach((connectedInputPort) => {
          const clockInput = connectedInputPort.clockInput as HsWeakClockPort;
          clockInput?.processScheduling?.(startTime, ppqFrom, ppqTo, bpm);
        });
      },
      stop() {
        connectedInputPorts.forEach((connectedInputPort) => {
          connectedInputPort.clockInput?.stop?.();
        });
      },
    },
    stateOutput: {
      emitState() {
        const connectedInputPort = connectedInputPorts.values().next().value;
        const stateInput = connectedInputPort?.stateInput as HsWeakStatePort;
        return stateInput?.emitState?.();
      },
      applyState(state: Record<string, any>) {
        connectedInputPorts.forEach((connectedInputPort) => {
          const stateInput = connectedInputPort.stateInput as HsWeakStatePort;
          stateInput?.applyState?.(state);
        });
      },
      emitStateBytes() {
        const connectedInputPort = connectedInputPorts.values().next().value;
        const stateInput = connectedInputPort?.stateInput as HsWeakStatePort;
        return stateInput?.emitStateBytes?.();
      },
      applyStateBytes(bytes: Uint8Array) {
        connectedInputPorts.forEach((connectedInputPort) => {
          const stateInput = connectedInputPort.stateInput as HsWeakStatePort;
          stateInput?.applyStateBytes?.(bytes);
        });
      },
    },
    automationOutput: {
      getParameterSpecs() {
        const connectedInputPort = connectedInputPorts.values().next().value;
        return connectedInputPort?.automationInput?.getParameterSpecs?.() ?? [];
      },
      getParameter(id: string) {
        const connectedInputPort = connectedInputPorts.values().next().value;
        return connectedInputPort?.automationInput?.getParameter?.(id) ?? 0;
      },
      setParameter(id: string, value: number) {
        connectedInputPorts.forEach((connectedInputPort) => {
          connectedInputPort.automationInput?.setParameter?.(id, value);
        });
      },
    },
    samplerPadOutput: {
      getToneIds() {
        const connectedInputPort = connectedInputPorts.values().next().value;
        return connectedInputPort?.samplerPadInput?.getToneIds?.() ?? [];
      },
      playTone(toneId: string) {
        connectedInputPorts.forEach((connectedInputPort) => {
          connectedInputPort.samplerPadInput?.playTone?.(toneId);
        });
      },
    },
  };
}
