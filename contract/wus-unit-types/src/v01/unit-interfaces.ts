//note: velocity in noteOn arguments are in range between 0.0-1.0, not 0-127
export type UnitType = "instrument" | "sequencer" | "effect";

export type UnitCategoryHint =
  | "synthesizer"
  | "stepSequencer"
  | "effect"
  | "visualizer"
  | "drumMachine"
  | "keyboard";

export type PortSubtype = "audio" | "note";

export type NotePort = {
  noteOn(noteNumber: number, time?: number, velocity?: number): void;
  noteOff(noteNumber: number, time?: number): void;
};

export type PersistencePort = {
  emitState?(): Record<string, any>;
  applyState?(state: Record<string, any>): void;
  emitStateBytes?(): Uint8Array;
  applyStateBytes?(bytes: Uint8Array): void;
};

export type ClockInputPort = {
  start?(): void;
  processTickRange?(startTime: number, ppqFrom: number, ppqTo: number): void; //480PPQ based tick from song start
  processStep?(stepIndex: number): void; //16th note based step from song start
  stop?(): void;
};

export type UnitAspects = {
  unitType: UnitType;
  categoryHint?: UnitCategoryHint;
  outputs?: PortSubtype[];
  inputs?: PortSubtype[];
};

export type HostCallbacks = {
  setBpm?(bpm: number): void;
  setPlayState?(playing: boolean): void;
  setMetaAttributes?(metaAttrs: Record<string, any>): void;
};

export type UnitInterface = {
  audioContext: AudioContext;
  audioOutputNode: AudioNode;
  audioInputNode: AudioNode;
  noteOutputPort: NotePort;
  completeSetup(attrs: {
    unitAspects: UnitAspects;
    hostCallbacks?: HostCallbacks;
    persistence?: PersistencePort;
    noteInput?: NotePort;
    clockInput?: ClockInputPort;
  }): void;
};
