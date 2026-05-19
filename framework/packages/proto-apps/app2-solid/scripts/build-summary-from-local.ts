import * as fs from "node:fs";
import { HostUnitMetadata, UnitSummariesJson } from "@wus/host-system/host";
import { UnitMetadata } from "@wus/unit-types";

const getPageId = (url: string) => url.split("/").reverse()[0];

function loadUnitMeta(
  rootPath: string,
  relativeUnitFolderPath: string,
): HostUnitMetadata {
  const unitMetaUrl = `${rootPath}${relativeUnitFolderPath}/unit-meta.json`;
  const unitMeta = JSON.parse(
    fs.readFileSync(unitMetaUrl, "utf-8"),
  ) as UnitMetadata;
  return {
    unitPageId: getPageId(relativeUnitFolderPath),
    pagePath: `${relativeUnitFolderPath}/index.html`,
    ...unitMeta,
  };
}

function buildSummary() {
  const unitFolderNames = fs.readdirSync("./public/units", {
    withFileTypes: true,
  });
  const metaList = unitFolderNames
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => loadUnitMeta("public", `/units/${dirent.name}`));
  const summariesJson: UnitSummariesJson = {
    generatedAt: new Date().toISOString(),
    units: metaList,
  };
  const outputFilePath = "./src/units-summary.json";
  const fileContent = JSON.stringify(summariesJson, null, 2) + "\n";
  fs.writeFileSync(outputFilePath, fileContent);
  console.log(`generated ${outputFilePath}`);
}

buildSummary();
