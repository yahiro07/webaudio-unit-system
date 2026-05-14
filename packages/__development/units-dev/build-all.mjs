import { $ } from "zx";

const scriptName = process.argv.includes("--watch") ? "watch" : "build";

// const dirs = (await readdir(".", { withFileTypes: true }))
//   .filter((d) => d.isDirectory() && !["dist", "node_modules"].includes(d.name))
//   .map((d) => `./${d.name}`);

const dirs = [
  "./mu1-instrument",
  "./mu2-sequencer",
  "./mu3-effect",
  "./mu4-keyboard",
  "./mu5-visualizer",
];

await Promise.all(
  dirs.map(
    (dir) => $({ stdio: "inherit" })`npm run ${scriptName} --prefix ${dir}`,
  ),
);
