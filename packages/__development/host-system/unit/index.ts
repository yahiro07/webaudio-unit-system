import { HostInterface } from "../contract";

export * from "../contract";
export function getHostInterface(): HostInterface | undefined {
  type WindowWithHostInterface = {
    hostInterface?: HostInterface;
  };
  return (window as WindowWithHostInterface)?.hostInterface;
}
