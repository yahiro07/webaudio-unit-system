//note: velocity in noteOn arguments are in range between 0.0-1.0, not 0-127
export type UnitType =
  | "instrument"
  | "drumMachine"
  | "sequencer"
  | "effect"
  | "switcher"
  | "tonePlayer";

export type MetaAttributes = {
  key?: string; //C, Am, ... etc
};

export type UnitAgent = {
  setBpm?(bpm: number): void;
  setPlayState?(playing: boolean): void;
  setMetaAttrs?(metaAttrs: MetaAttributes): void;
  emitState?(): object;
  loadState?(state: object): void;
  noteOn?(noteNumber: number, velocity: number): void;
  noteOff?(noteNumber: number): void;
};

export type InstrumentMultiChannelsInterface = {
  numChannels: number;
  drumChannel?: number;
  noteOn(ch: number, noteNumber: number, velocity: number): void;
  noteOff(ch: number, noteNumber: number): void;
};

export type InstrumentUnit = {
  audioContext: AudioContext;
  setup(
    unitAgent: UnitAgent,
    additionalCapabilities?: {
      multiChannelsInterface: InstrumentMultiChannelsInterface;
    },
  ): void;
};

export type TonePlaybackInterface = {
  toneIds: string[];
  playTone(toneId: string): void;
};
export type TonePlaybackPortSpec = {
  toneIds: string[];
};
export type ToneOutputPort = {
  playTone(toneId: string): void;
  onConnected(callback: (portSpec: TonePlaybackPortSpec) => void): void;
};
export type TonePlayerUnit = {
  toneOutputPort: ToneOutputPort;
  setup(unitAgent: UnitAgent): void;
};

export type NoteOutputPortSpec = {
  numChannels: number;
  drumChannel?: number;
};
export type NoteOutputPort = {
  noteOn(noteNumber: number, velocity: number): void;
  noteOff(noteNumber: number): void;
  // channels(ch: number): {
  //   noteOn(noteNumber: number, velocity: number): void;
  //   noteOff(noteNumber: number): void;
  // };
  // onConnected(callback: (portSpec: NoteOutputPortSpec) => void): void;
};

export type SequencerUnit = {
  outputPort: NoteOutputPort;
  setup(unitAgent: UnitAgent): void;
};

export type EffectUnit = {
  audioContext: AudioContext;
  sourceNode: AudioNode;
  setup(unitAgent: UnitAgent): void;
};

export type DrumMachineUnit = {
  audioContext: AudioContext;
  setup(
    unitAgent: UnitAgent,
    additionalCapabilities?: {
      tonePlaybackInterface: TonePlaybackInterface;
    },
  ): void;
};

export type SwitcherTargetUnitPort = {
  emitState(): object;
  loadState(state: object): void;
};
export type SwitcherUnit = {
  onConnected(target: SwitcherTargetUnitPort): void;
  setup(unitAgent: UnitAgent): void;
};

export type HostInterface = {
  createInstrumentUnit(): InstrumentUnit;
  createSequencerUnit(): SequencerUnit;
  createEffectUnit(): EffectUnit;
  // createDrumMachineUnit(): DrumMachineUnit;
  // createTonePlayerUnit(): TonePlayerUnit;
  // createSwitcherUnit(): SwitcherUnit;
};

export function getHostInterface(): HostInterface | undefined {
  type WindowWithHostInterface = {
    hostInterface?: HostInterface;
  };
  return (window as WindowWithHostInterface)?.hostInterface;
}
