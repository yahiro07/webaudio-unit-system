export function mergeReactProps<P, Q>(mergedProps: Q, inputProps: P): P & Q {
  const props: any = { ...mergedProps };
  for (const key in inputProps) {
    if (inputProps[key] !== undefined) {
      props[key] = inputProps[key];
    }
  }
  return props;
}
