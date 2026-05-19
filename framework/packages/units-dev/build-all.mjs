import { fileURLToPath } from "node:url";
import { $ } from "zx";

const scriptName = process.argv.includes("--watch") ? "watch" : "build";

// const destDir = fileURLToPath(
//   new URL(`../../framework/packages/wus-units/units/dev`, import.meta.url),
// );

const destDir = fileURLToPath(new URL(`./dist`, import.meta.url));

// const dirs = (await readdir(".", { withFileTypes: true }))
//   .filter((d) => d.isDirectory() && !["dist", "node_modules"].includes(d.name))
//   .map((d) => `./${d.name}`);

const folders = [
  "mu1-instrument",
  "mu2-sequencer",
  "mu3-effect",
  "mu4-keyboard",
  "mu5-visualizer",
];

await Promise.all(
  folders.map((folder) => {
    const outDir = `${destDir}/${folder}`;
    return $({
      stdio: "inherit",
      env: { ...process.env, WUS_OUT_DIR: outDir },
    })`npm run ${scriptName} --prefix ${folder}`;
  }),
);
