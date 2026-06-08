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
  noteOn(note: number, timeAt?: number, velocity?: number): void; //midi note number, velocity 0~1
  noteOff(note: number, timeAt?: number): void;
};

export type CvGatePort = {
  setCv(cv: number, timeAt?: number): void; //0~1, 0.1cv/octave
  setGate(gate: boolean, timeAt?: number): void;
};

export type ClockPort = {
  start?(): void;
  processScheduling?(
    startTime: number, //absolute time based on AudioContext.currentTime
    ppqFrom: number, //480ppq based tick from song start
    ppqTo: number, //480ppq based tick from song start
    //bpm for this clock, this could vary from host's global bpm if there is a clock divider/multiplier unit in between
    bpm: number,
  ): void;
  //16th note based (4ppq) integer step from song start
  processStep?(stepIndex: number, unitDurationSec: number): void;
  stop?(): void;
};

export type StatePort = {
  subscribeChange?(fn: () => void): () => void;
  emitState?(): Record<string, any> | undefined;
  applyState?(state: Record<string, any>): void;
  emitStateBytes?(): Uint8Array | undefined;
  applyStateBytes?(bytes: Uint8Array): void;
};

export type ParameterSpec = {
  id: string;
  steps?: number; //2 for on/off, 3 for low/medium/high, etc
  //all parameters are ranged in 0~1
};

export type AutomationPort = {
  getParameterSpecs(): ParameterSpec[];
  getParameter(id: string): number;
  setParameter(id: string, value: number, timeAt?: number): void;
};

export type SamplerPadPort = {
  getToneIds(): string[];
  playTone(toneId: string, timeAt?: number): void;
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
  clockInput?: ClockPort; //host feed clocks only for primaryInputPort, not for multi-channel ports
  stateInput?: StatePort; //host handles states only for primaryInputPort, not for multi-channel ports
  automationInput?: AutomationPort;
  samplerPadInput?: SamplerPadPort;
};

export type UnitInputPort = {
  audioInput: AudioPort;
  setHandlers(handlers: UnitInputPortHandlers): void;
};

export type MetaAttributes = {
  [key: string]: any;
  //arbitrary data could be passed from host to unit.
  //key?: string; //C, Am, ... etc
  //dynamicPatternRootNote?: number;  //used to shift notes according to key and root note.
};

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
  completeSetup(attrs: {
    unitAspects: UnitAspects;
    hostCallbacks?: HostCallbacks;
    primaryInputPortHandlers?: UnitInputPortHandlers;
    multiChannelOutputPorts?: UnitOutputPort[];
    multiChannelInputPorts?: UnitInputPort[];
  }): void;
};

export type WindowWithUnitInterface = {
  checkUnitInterfaceCompatibility?(versionCode: string): void;
  unitInterface?: UnitInterface;
};
