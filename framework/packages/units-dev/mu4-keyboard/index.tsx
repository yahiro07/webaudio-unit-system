import { mountAppRoot } from "@wus/mo-react/mount-app-root";
import { getHostInterface } from "@wus/unit-types";
import "@wus/mo/styles";
import { seqNumbers } from "@wus/ax/array-utils";
import { createStore } from "snap-store";

const hostInterface = getHostInterface();

const store = createStore<{ notes: number[] }>({ notes: [] });

const actions = {
  noteOn(noteNumber: number, velocity: number) {
    store.mutations.setNotes((prev) => [...prev, noteNumber]);
    hostInterface?.noteOutputPort.noteOn(noteNumber, velocity);
  },
  noteOff(noteNumber: number) {
    store.mutations.setNotes((prev) => prev.filter((n) => n !== noteNumber));
    hostInterface?.noteOutputPort.noteOff(noteNumber);
  },
};

function setupUnitInstance() {
  hostInterface?.setupUnitAgent({
    type: "sequencer",
    noteInput: {
      noteOn: actions.noteOn,
      noteOff: actions.noteOff,
    },
  });
}
setupUnitInstance();

const OctaveBlock = ({
  baseNoteNumber,
  activeNotes,
  noteOn,
  noteOff,
}: {
  baseNoteNumber: number;
  activeNotes: number[];
  noteOn(noteNumber: number, velocity: number): void;
  noteOff(noteNumber: number): void;
}) => {
  const velocity = 0.8;
  return (
    <div className="relative">
      <div className="flex-h">
        {seqNumbers(7).map((k) => {
          const relatives = [0, 2, 4, 5, 7, 9, 11];
          const noteNumber = baseNoteNumber + relatives[k];
          const active = activeNotes.includes(noteNumber);
          return (
            <div
              key={k}
              className="w-[20px] h-[80px] border border-[#666] cursor-pointer"
              style={{ background: active ? "#8f8" : "#fff" }}
              onPointerDown={() => noteOn(noteNumber, velocity)}
              onPointerUp={() => noteOff(noteNumber)}
            />
          );
        })}
      </div>
      <div className="absolute top-0 left-0 flex-h pl-[12px] gap-[4px]">
        {seqNumbers(6).map((k) => {
          const relatives = [1, 3, -1, 6, 8, 10];
          const noteNumber = baseNoteNumber + relatives[k];
          const active = activeNotes.includes(noteNumber);
          return (
            <div
              key={k}
              className="w-[16px] h-[50px] border border-[#666] cursor-pointer"
              style={{
                visibility: k === 2 ? "hidden" : "visible",
                background: active ? "#8f8" : "#888",
              }}
              onPointerDown={() => noteOn(noteNumber, velocity)}
              onPointerUp={() => noteOff(noteNumber)}
            />
          );
        })}
      </div>
    </div>
  );
};

function App() {
  const { notes } = store.useSnapshot();
  return (
    <div className="w-dvw h-dvh flex-vc gap-1 bg-purple-200">
      <div>mu4-keyboard</div>
      <div>{notes.length > 0 ? notes : "--"}</div>
      <div className="flex-h">
        <OctaveBlock
          baseNoteNumber={48}
          activeNotes={notes}
          noteOn={actions.noteOn}
          noteOff={actions.noteOff}
        />
        <OctaveBlock
          baseNoteNumber={60}
          activeNotes={notes}
          noteOn={actions.noteOn}
          noteOff={actions.noteOff}
        />
      </div>
    </div>
  );
}

mountAppRoot(<App />);
