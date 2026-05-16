import { HostInterface } from "./unit-interfaces-2";

export function getHostInterface(): HostInterface | undefined {
  type WindowWithHostInterface = {
    hostInterface?: HostInterface;
  };
  return (window as WindowWithHostInterface)?.hostInterface;
}
