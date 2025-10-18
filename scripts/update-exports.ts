import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { lowerCase } from "es-toolkit";
import { exports } from "../meta";

const PACKAGE_JSON_PATH = resolve(import.meta.dirname, "../package.json");
const README_PATH = resolve(import.meta.dirname, "../README.md");

const updatePackageExports = () => {
  try {
    const packageJsonContent = readFileSync(PACKAGE_JSON_PATH, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    packageJson.exports = exports;

    writeFileSync(
      PACKAGE_JSON_PATH,
      `${JSON.stringify(packageJson, null, 2)}\n`,
      "utf-8",
    );

    console.log("package.json exports updated successfully.");
  } catch (error) {
    console.error("Error updating package.json exports:", error);
    process.exit(1);
  }
};

const updateReadmeExports = () => {
  try {
    // Read package.json again to get the package name
    const packageJsonContent = readFileSync(PACKAGE_JSON_PATH, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    const pkgName = packageJson.name || "<package>";

    const readme = readFileSync(README_PATH, "utf-8");

    // Build concise generated markdown for the exports section
    const lines: string[] = [];
    lines.push("## API & package exports\n");
    lines.push(
      "This package exposes a main entrypoint and per-extension subpaths. Example exports:\n",
    );

    // main entry
    lines.push(`- \`${pkgName}\` — main package export (index)`);

    // per-extension entries: humanize the last path segment
    for (const rawSubpath of Object.keys(exports)) {
      if (rawSubpath === ".") continue;
      const normalized = String(rawSubpath).replace(/^\.\//, "");
      const parts = normalized.split("/");
      let last = parts[parts.length - 1];
      if (last === "index" && parts.length > 1) last = parts[parts.length - 2];
      // Use es-toolkit's lowerCase for humanization
      const human = lowerCase(last);
      const display = `${pkgName}/${normalized}`;
      lines.push(`- \`${display}\` — ${human} extension`);
    }

    lines.push("");
    lines.push(
      "Each extension exports a `MarkdownExtension` object (type from `@lezer/markdown`). Import it and pass it into your parser configuration.\n",
    );

    const generated = lines.join("\n");

    // Replace the existing section from the heading to the next '## ' heading.
    const sectionStartRegex = /^## API & package exports\s*$/m;
    const match = readme.match(sectionStartRegex);
    if (match && match.index !== undefined) {
      const startIndex = match.index;
      // Find next top-level '## ' heading after the start
      const rest = readme.slice(startIndex + match[0].length);
      const nextHeadingMatch = rest.match(/\n##\s+/);
      let endIndex: number;
      if (nextHeadingMatch && nextHeadingMatch.index !== undefined) {
        endIndex = startIndex + match[0].length + nextHeadingMatch.index + 1; // include newline
      } else {
        endIndex = readme.length;
      }

      const before = readme.slice(0, startIndex);
      const after = readme.slice(endIndex);

      const newReadme = `${before + generated}\n${after}`;
      writeFileSync(README_PATH, newReadme, "utf-8");
      console.log("README.md exports section updated successfully.");
    } else {
      // If the section is not found, append it at the end
      const newReadme = `${readme}\n${generated}\n`;
      writeFileSync(README_PATH, newReadme, "utf-8");
      console.log("README.md exports section appended successfully.");
    }
  } catch (error) {
    console.error("Error updating README.md exports section:", error);
    process.exit(1);
  }
};

updatePackageExports();
updateReadmeExports();
