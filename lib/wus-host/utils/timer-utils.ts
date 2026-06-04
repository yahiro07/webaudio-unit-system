export function createIntervalTimer() {
  let timerId: ReturnType<typeof setInterval> | undefined;

  return {
    start(fn: () => void, ms: number) {
      timerId = setInterval(fn, ms);
    },
    stop() {
      if (timerId !== undefined) {
        clearInterval(timerId);
        timerId = undefined;
      }
    },
  };
}
