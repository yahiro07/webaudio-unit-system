import { Unit1Element } from "../../unit1/index";

customElements.define("my-unit1", Unit1Element);

console.log("hello");

const element = document.createElement("my-unit1");

(element as any).setupUnit({ hello: "world" });

document.body.appendChild(element);
