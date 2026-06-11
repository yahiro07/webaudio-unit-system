import { UnitCategoryHint, UnitType } from "./common-types";

export type PortSubtype =
  | "audio"
  | "note"
  | "cvGate"
  | "clock"
  | "state"
  | "automation"
  | "samplerPad";

export type NotePort = {
  noteOn(note: number, time?: number, velocity?: number): void; //midi note number, velocity 0~1
  noteOff(note: number, time?: number): void;
};

export type CvGatePort = {
  setCv(cv: number, time?: number): void; //0~1, 0.1cv/octave
  setGate(gate: boolean, time?: number): void;
};

export type ClockPort = {
  start?(): void;
  stop?(): void;
  processScheduling?(
    startTime: number, //absolute time based on AudioContext.currentTime
    ppqFrom: number, //480ppq based tick from song start
    ppqTo: number, //480ppq based tick from song start
    //bpm for this clock, this could vary from host's global bpm if there is a clock divider/multiplier unit in between
    bpm: number,
  ): void;
  //16th note based (4ppq) integer step from song start
  processStep?(stepIndex: number, unitDurationSec: number): void;
};

type ClockInputPort = {
  start?(): void;
  stop?(): void;
} & (
  | {
      processScheduling(
        startTime: number,
        ppqFrom: number,
        ppqTo: number,
        bpm: number,
      ): void;
    }
  | {
      processStep(stepIndex: number, unitDurationSec: number): void;
    }
);

export type StatePort = {
  subscribeChange?(fn: () => void): () => void;
  emitState?(): Record<string, any> | undefined;
  applyState?(state: Record<string, any>): void;
  emitStateBytes?(): Uint8Array | undefined;
  applyStateBytes?(bytes: Uint8Array): void;
};

type StateInputPort = {
  subscribeChange?(fn: () => void): () => void;
} & (
  | {
      emitState(): Record<string, any> | undefined;
      applyState(state: Record<string, any>): void;
    }
  | {
      emitStateBytes(): Uint8Array | undefined;
      applyStateBytes(bytes: Uint8Array): void;
    }
);

export type ParameterSpec = {
  id: string;
  steps?: number; //2 for on/off, 3 for low/medium/high, etc
  //all parameters are ranged in 0~1
};

export type AutomationPort = {
  getParameterSpecs(): ParameterSpec[];
  getParameter(id: string): number;
  setParameter(id: string, value: number, time?: number): void;
};

export type SamplerPadPort = {
  getToneIds(): string[];
  playTone(toneId: string, time?: number): void;
};

export type AudioPort = {
  node: AudioNode;
};

export type UnitOutputPortCallbacks = {
  onConnectedTo?(subPortTypes: PortSubtype[]): void;
  onDisconnectTo?(): void;
};

export type UnitOutputPort = {
  setCallbacks(callbacks: UnitOutputPortCallbacks): void;
  audioOutput: AudioPort;
  noteOutput: NotePort;
  cvGateOutput: CvGatePort;
  clockOutput: ClockPort;
  stateOutput: StatePort;
  automationOutput: AutomationPort;
  samplerPadOutput: SamplerPadPort;
};

export type UnitInputPortCallbacks = {
  onConnectedFrom?(subPortTypes: PortSubtype[]): void;
  onDisconnectFrom?(): void;
};

export type UnitInputPortHandlers = {
  callbacks?: UnitInputPortCallbacks;
  noteInput?: NotePort;
  cvGateInput?: CvGatePort;
  clockInput?: ClockInputPort; //host feed clocks only for primaryInputPort, not for multi-channel ports
  stateInput?: StateInputPort; //host handles states only for primaryInputPort, not for multi-channel ports
  automationInput?: AutomationPort;
  samplerPadInput?: SamplerPadPort;
};

export type UnitInputPort = {
  audioInput: AudioPort;
  setHandlers(handlers: UnitInputPortHandlers): void;
};

//arbitrary data could be passed from host to unit.
export type MetaAttributes = Record<string, any>;

export type HostCallbacks = {
  //setBpm and setPlayState are used for naive synchronization
  //to host transport without step position
  setBpm?(bpm: number): void;
  setPlayState?(playing: boolean): void;
  setMetaAttributes?(metaAttrs: MetaAttributes): void;
};

export type UnitAspects = {
  unitType: UnitType;
  categoryHint?: UnitCategoryHint;
  outputs?: PortSubtype[];
  inputs?: PortSubtype[];
};

export type UnitInterface = {
  audioContext: AudioContext;
  primaryOutputPort: UnitOutputPort;
  primaryInputPort: UnitInputPort;
  createMultiChannelOutputPorts(numPorts: number): UnitOutputPort[];
  createMultiChannelInputPorts(numPorts: number): UnitInputPort[];
  emitMetaAttributes(metaAttrs: MetaAttributes): void;
  completeSetup(attrs: {
    unitAspects: UnitAspects;
    hostCallbacks?: HostCallbacks;
    primaryInputPortHandlers?: UnitInputPortHandlers;
    multiChannelOutputPorts?: UnitOutputPort[];
    multiChannelInputPorts?: UnitInputPort[];
  }): void;
};

export type UnitInterfaceProvider = {
  //for iframe based units, legacy js
  checkUnitInterfaceCompatibility?(versionCode: string): void;
  unitInterface?: UnitInterface;
  //for iframe based units, typescript
  queryUnitInterface?(versionCode: string): UnitInterface | undefined;
  //for web component units
  queryUnitInterfaceForModule?(
    versionCode: string,
    importMetaUrl: string,
  ): UnitInterface | undefined;
};
