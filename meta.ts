import { globSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "src");

export const entry: Record<string, string> = {
  index: resolve(root, "index.ts"),
};

export const exports: Record<string, Record<string, string>> = {
  ".": {
    import: "./dist/es/index.js",
    require: "./dist/cjs/index.js",
    default: "./dist/es/index.js",
  },
};

const extensionFiles = globSync("src/extensions/*/index.ts", {
  cwd: import.meta.dirname,
});

for (const file of extensionFiles) {
  const entryName = file.replace(/^src\//, "").replace(/\.ts$/, "");
  // For exports subpath we want only the extension folder name, e.g.
  // "src/extensions/variable/index.ts" -> "./variable"
  const match = entryName.match(/^extensions\/([^/]+)\/index$/);
  const subpath = match ? `./${match[1]}` : `./${entryName}`;

  entry[entryName] = resolve(import.meta.dirname, file);

  exports[subpath] = {
    import: `./dist/es/${entryName}.js`,
    require: `./dist/cjs/${entryName}.js`,
    default: `./dist/es/${entryName}.js`,
  };
}
