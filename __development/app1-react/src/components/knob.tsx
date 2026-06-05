import { mapUnaryTo } from "../../../mylib/ax/number-utils";
import { mergeReactProps } from "../utils/merge-react-props";
import { CellFrame } from "./cell-frame";
import { KnobFrame } from "./knob-frame";

export function KnobView(props: { value: number; min: number; max: number }) {
  const vm = {
    tickAngel() {
      const { value, min, max } = props;
      const normValue = (value - min) / (max - min);
      const halfRange = 135;
      const angle = mapUnaryTo(normValue, -halfRange, halfRange);
      return angle;
    },
  };
  return (
    <div className="border border-[#444] w-[36px] h-[36px] rounded-full">
      <div
        className="w-full h-full flex justify-center"
        style={{
          transform: `rotate(${vm.tickAngel()}deg)`,
        }}
      >
        <div className="w-[1px] h-[10px] bg-[#444]" />
      </div>
    </div>
  );
}

export function Knob(inputProps: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const props = mergeReactProps({ min: 0, max: 1, step: 0.01 }, inputProps);
  console.log(inputProps, props);
  return (
    <KnobFrame
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      onChange={props.onChange}
    >
      <KnobView value={props.value} min={props.min} max={props.max} />
    </KnobFrame>
  );
}

export function FeKnob(props: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <CellFrame label={props.label}>
      <Knob
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={props.onChange}
      />
    </CellFrame>
  );
}
