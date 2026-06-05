export function iife<T>(fn: () => T) {
  return fn();
}

export function assignTyped<T extends object>(obj: T, attrs: Partial<T>) {
  Object.assign(obj, attrs);
}

export function getObjectKeys<T extends Record<string, unknown>>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}
