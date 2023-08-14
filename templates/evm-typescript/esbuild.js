#!/usr/bin/env node
/* eslint node/no-unpublished-require: 0 */
/* eslint no-unused-vars: 0 */
const { build } = require("esbuild");
const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");

const entrypoint = path.join(__dirname, "src", "index.ts");
const outputDirectory = path.join(__dirname, "dist");
const outputFile = path.join(outputDirectory, "index.js");

const commonOptions = {
  bundle: true,
  minify: true,
  platform: "node",
  sourcemap: "inline",
  treeShaking: true,
  sourcesContent: true,
  target: "node18",
  plugins: [],
  legalComments: "none",
};

fs.rmSync(outputDirectory, {
  force: true,
  recursive: true,
});

build({
  ...commonOptions,
  format: "cjs",
  entryPoints: [entrypoint],
  outfile: outputFile,
})
  .then(() => {
    execSync(`npx tsc -d`, { encoding: "utf-8" });
  });
