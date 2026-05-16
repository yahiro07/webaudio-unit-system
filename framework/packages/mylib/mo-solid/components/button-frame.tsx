import { JSXElement } from "solid-js";

export function ButtonFrame(props: {
  children: JSXElement;
  onClick: () => void;
}) {
  return (
    <div onClick={props.onClick} class="cursor-pointer">
      {props.children}
    </div>
  );
}
