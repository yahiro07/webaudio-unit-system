//note: velocity in noteOn arguments are in range between 0.0-1.0, not 0-127
export type UnitType = "instrument" | "sequencer" | "effect";

export type UnitCategoryHint =
  | "synthesizer"
  | "stepSequencer"
  | "effect"
  | "visualizer"
  | "drumMachine"
  | "keyboard"
  | "padController"
  | "switcher";

export type MetaAttributes = {
  key?: string; //C, Am, ... etc
};

export type NoteOutputPortSpec = {
  numChannels: number;
  drumChannel?: number;
};
export type NoteOutputPort = {
  noteOn(noteNumber: number, velocity: number): void;
  noteOff(noteNumber: number): void;
};

export type InstrumentMultiChannelsInterface = {
  numChannels: number;
  drumChannel?: number;
  noteOn(ch: number, noteNumber: number, velocity: number): void;
  noteOff(ch: number, noteNumber: number): void;
};

export type AssignableTonePlaybackInterface = {
  toneIds: string[];
  playTone(toneId: string): void;
};

export type DestinationRequirementFlags =
  | "hasAudioInput" //effect <-- instrument, effect <-- drumMachine
  | "hasNoteInput" //instrument <-- sequencer, instrument <-- keyboard
  | "hasPersistence" //any unit <--switcher
  | "hasMultiChannelsNoteInput" //instrument <-- sequencer
  | "hasTonePlaybackInterface"; //drumMachine <-- padController

export type NoteInputInterface = {
  noteOn(noteNumber: number, velocity: number): void;
  noteOff(noteNumber: number): void;
};

export type PersistenceInterface = {
  emitState?(): Record<string, any>;
  loadState?(state: Record<string, any>): void;
  emitStateBytes?(): Uint8Array;
  loadStateBytes?(bytes: Uint8Array): void;
};

export type TransportHandlingInterface = {
  processTickRange?(tickFrom: number, tickTo: number): void; //480PPQ based tick from song start
  processStep?(stepIndex: number): void; //16th note based step from song start
};

export type DestinationUnitAgent = {
  queryPersistenceInterface(): PersistenceInterface | undefined;
  queryNoteInputInterface(): NoteInputInterface | undefined;
  queryInstrumentMultiChannelsInterface():
    | InstrumentMultiChannelsInterface
    | undefined;
  queryAssignableTonePlaybackInterface():
    | AssignableTonePlaybackInterface
    | undefined;
};

export type UnitAgent = {
  type: UnitType;
  categoryHint?: UnitCategoryHint;
  destinationRequirementFlags?: DestinationRequirementFlags[];
  setBpm?(bpm: number): void;
  setPlayState?(playing: boolean): void;
  setMetaAttrs?(metaAttrs: MetaAttributes): void;
  persistence?: PersistenceInterface;
  noteInput?: NoteInputInterface;
  transportHandling?: TransportHandlingInterface;
  extraCapabilities?: {
    instrumentMultiChannelsInterface?: InstrumentMultiChannelsInterface;
    assignableTonePlaybackInterface?: AssignableTonePlaybackInterface;
  };
  onConnectedTo?(destUnitAgent: DestinationUnitAgent): void;
  onDisconnected?(): void;
};

export type HostInterface = {
  audioContext: AudioContext;
  audioDestinationNode: AudioNode;
  audioSourceNode: AudioNode;
  noteOutputPort: NoteOutputPort;
  setupUnitAgent(unitAgent: UnitAgent): void;
};
