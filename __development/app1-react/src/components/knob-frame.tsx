import { ReactNode } from "react";
import { clampValue } from "../../../mylib/ax/number-utils";
import { startDragSession } from "../../../mylib/mo/drag-session";

export function KnobFrame(props: {
  value: number;
  min: number;
  max: number;
  step: number;
  children: ReactNode;
  onChange: (value: number) => void;
  dragRange?: number;
}) {
  const handlePointerDown = (e0: React.PointerEvent) => {
    const min = props.min;
    const max = props.max;
    const step = props.step;
    const dragRange = props.dragRange ?? 100;

    const originalValue = props.value;
    startDragSession(e0.nativeEvent, {
      onMove(e) {
        const delta =
          -(e.position.y - e.originalPosition.y) / (dragRange / (max - min));
        let newValue = originalValue + delta;
        if (step > 0) {
          newValue = Math.round(newValue / step) * step;
        }
        newValue = clampValue(newValue, min, max);
        props.onChange(newValue);
      },
    });
  };
  return (
    <div onPointerDown={handlePointerDown} className="cursor-pointer">
      {props.children}
    </div>
  );
}
