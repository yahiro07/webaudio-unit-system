import { ReactNode } from "react";
import {
  AudioPort,
  AutomationPort,
  ClockPort,
  CvGatePort,
  HostCallbacks,
  NotePort,
  PortSubtype,
  SamplerPadPort,
  StatePort,
  UnitInputPort,
  UnitInputPortCallbacks,
  UnitOutputPort,
} from "wus-unit-types";

export type HostSystemEvent =
  | { type: "loadStarted" }
  | { type: "loadCompleted" };
// | { type: "unitsAdded"; units: HsUnitInstance[] }
// | { type: "unitsRemoved"; unitIds: string[] };

export type HsUnitInputPortPreHandlers = {
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockPort;
  stateInput?: StatePort;
  automationInput?: AutomationPort;
  samplerPadInput?: SamplerPadPort;
};

export type HsUnitInputPortPre = UnitInputPort & {
  emit(): HsUnitInputPort;
};

export type HsUnitInputPort = {
  callbacks?: UnitInputPortCallbacks;
  audioInput?: AudioPort;
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockPort;
  stateInput?: StatePort;
  automationInput?: AutomationPort;
  samplerPadInput?: SamplerPadPort;
  getSubPortTypes?: (hasAudioOutput: boolean) => PortSubtype[];
  subscribeSubPortTypes?: (
    listener: (subPortTypes: PortSubtype[]) => void,
  ) => () => void;
};

export type HsUnitOutputPort = UnitOutputPort & {
  connectTo(port: HsUnitInputPort): void;
  disconnectFrom(port: HsUnitInputPort): void;
};

export type HsUnitPortsSpec = {
  outputPortSubtypes?: PortSubtype[];
  inputPortSubtypes?: PortSubtype[];
  numMultiInputs?: number;
  numMultiOutputs?: number;
};

export type HsUnitInstance = {
  portsSpec: HsUnitPortsSpec;
  unitId: string;
  outputPort: HsUnitOutputPort;
  inputPort: HsUnitInputPort;
  outputPorts?: HsUnitOutputPort[];
  inputPorts?: HsUnitInputPort[];
  hostCallbacks?: HostCallbacks;
  RenderUi?: () => ReactNode;
};

export type DestinationCode = string;
