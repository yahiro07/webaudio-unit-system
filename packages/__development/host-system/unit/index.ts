import { HostInterface } from "../contract/unit-interfaces";

export * from "../contract/unit-interfaces";
export function getHostInterface(): HostInterface | undefined {
  type WindowWithHostInterface = {
    hostInterface?: HostInterface;
  };
  return (window as WindowWithHostInterface)?.hostInterface;
}
