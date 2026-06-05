import { ReactNode } from "react";

export function CellFrame(props: { children: ReactNode; label: string }) {
  return (
    <div className="flex-vc">
      <div className="text-[16px]">{props.label}</div>
      <div className="flex-vl gap-2 h-[40px] flex-c">{props.children}</div>
    </div>
  );
}
