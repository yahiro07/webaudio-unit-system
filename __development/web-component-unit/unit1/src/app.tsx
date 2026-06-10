import { createStore } from "snap-store";

const sore = createStore({
  count: 0,
});

export const App = () => {
  const { count } = sore.useSnapshot();
  return (
    <div class="primary">
      hello preact 1631
      <div>{count}</div>
      <button type="button" onClick={() => sore.setCount((prev) => prev + 1)}>
        +
      </button>
    </div>
  );
};
