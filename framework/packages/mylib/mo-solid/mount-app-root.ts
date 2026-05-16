import { JSX } from "solid-js/jsx-runtime";
import { render } from "solid-js/web";

type RootElement = HTMLElement & { __disposeRender?: () => void };

export function mountAppRoot(fn: () => JSX.Element, rootElementId = "app") {
  const root = document.getElementById(rootElementId)! as RootElement;
  root.__disposeRender?.(); //cleanup previous dom
  root.__disposeRender = render(fn, root);
}
