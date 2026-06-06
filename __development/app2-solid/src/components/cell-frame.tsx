import { JSXElement } from "solid-js";

export function CellFrame(props: { children: JSXElement; label: string }) {
  return (
    <div class="flex-vc">
      <div class="text-[16px]">{props.label}</div>
      <div class="flex-vl gap-2 h-[40px] flex-c">{props.children}</div>
    </div>
  );
}
