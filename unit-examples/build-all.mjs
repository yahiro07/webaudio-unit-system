import { $ } from "zx";

const scriptName = process.argv.includes("--watch") ? "watch" : "build";

// const destDir = fileURLToPath(
//   new URL(`../../framework/packages/wus-units/units/dev`, import.meta.url),
// );

// const destDir = fileURLToPath(new URL(`./dist`, import.meta.url));

// const dirs = (await readdir(".", { withFileTypes: true }))
//   .filter((d) => d.isDirectory() && !["dist", "node_modules"].includes(d.name))
//   .map((d) => `./${d.name}`);

const folders = [
  "units/mu1-instrument",
  "units/mu2-sequencer",
  "units/mu3-effect",
  "units/mu4-keyboard",
  "units/mu5-visualizer",
];

await Promise.all(
  folders.map((folder) => {
    // const outDir = `${destDir}/${folder}`;
    return $({
      stdio: "inherit",
      // env: { ...process.env, WUS_OUT_DIR: outDir },
    })`npm run ${scriptName} --prefix ${folder}`;
  }),
);
