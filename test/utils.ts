import type { Tree } from "@lezer/common";

function escapeForTemplateLiteral(s: string) {
  // Escape sequences for safe inclusion inside a template literal
  // (the snapshots are stored inside backtick template literals).
  // We intentionally avoid escaping backslashes to keep existing
  // backslash sequences readable (so we don't turn '\\}' into '\\\\}').
  // We do escape newlines/carriage returns to visible \n / \r,
  // escape backticks and '${' to avoid template interpolation,
  // and escape Unicode line/paragraph separators.
  return s
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function serializeTreeWithText(tree: Tree, text: string) {
  const c = tree.cursor();
  const lines: string[] = [];
  function walk(depth = 0) {
    const indent = "  ".repeat(depth);
    const slice = text.slice(c.from, c.to);
    const shown = escapeForTemplateLiteral(slice);
    // No outer quotes around the slice: keep it unquoted but escaped
    // for template-literal safety (\n, \r, escaped backticks, etc.).
    lines.push(`${indent}${c.type.name}[${c.from},${c.to}] ${shown}`);
    if (c.firstChild()) {
      do {
        walk(depth + 1);
      } while (c.nextSibling());
      c.parent();
    }
  }
  walk(0);
  return lines.join("\n");
}
