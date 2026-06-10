import { createStore } from "snap-store";

const sore = createStore({
  count: 0,
});

export const App = () => {
  const { count } = sore.useSnapshot();
  return (
    <div class="primary">
      hello preact 1951
      <div class="border border-teal-500 bg-gray-200 p-4">{count}</div>
      <button type="button" onClick={() => sore.setCount((prev) => prev + 1)}>
        +
      </button>
    </div>
  );
};
