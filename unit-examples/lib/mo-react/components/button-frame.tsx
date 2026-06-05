import { ReactNode } from "react";

export function ButtonFrame(props: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <div onClick={props.onClick} className="cursor-pointer">
      {props.children}
    </div>
  );
}
