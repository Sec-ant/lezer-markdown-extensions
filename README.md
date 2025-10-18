# lezer-markdown-extensions

A set of small extensions and helper packages for working with `@lezer/markdown` and related tooling.

This repository contains reusable Lezer/Markdown parser extensions (for example: a template-variable inline parser), packaging helpers and conventions for publishing the extensions as consumable subpaths.

## Why this package

`@lezer/markdown` provides a flexible CommonMark-compatible Markdown parser framework. Projects often need small, isolated extensions to add custom inline or block constructs (for example, templating markers, custom fenced blocks, or inline math). This package collects such reusable extensions and publishes them in a way that is easy to consume from Node and bundlers.

Key goals:

- Provide small, focused `MarkdownExtension` implementations you can drop into `@lezer/markdown`.
- Export each extension as a subpath (for example `lezer-markdown-extensions/template-variable`) so you can import only what you need.
- Keep compatibility with both ESM and CJS consumers.

## Install

Install with your package manager of choice (example with pnpm):

```bash
pnpm add lezer-markdown-extensions
```

Peer dependencies to be aware of (install them in your project):

```bash
pnpm add @lezer/markdown @lezer/highlight
```

## Quick usage

Below are examples showing how to integrate an extension from this package into `@lezer/markdown` and into CodeMirror via `@codemirror/lang-markdown`.

### Using with @lezer/markdown

This package exports `MarkdownExtension` objects. The `@lezer/markdown` parser can be reconfigured by calling `MarkdownParser.configure` with one or more extensions.

Minimal example — create a configured parser that adds the `templateVariableExtension`:

```ts
import { parser as defaultParser, MarkdownParser } from "@lezer/markdown";
import { templateVariableExtension } from "lezer-markdown-extensions/template-variable";

// The parser exported by `@lezer/markdown` is a `MarkdownParser` instance.
// Use `configure` to get a new parser that includes your extension.
const configuredParser: MarkdownParser = defaultParser.configure([
  templateVariableExtension,
]);

// You can now use `configuredParser.parseInline(text, 0)` or pass it to
// other helpers that expect a Markdown parser configuration.
const inlineElements = configuredParser.parseInline("Hello {{name}} world", 0);
console.log(inlineElements);
```

Notes:

- `templateVariableExtension` is a `MarkdownExtension` (it defines new nodes and an inline parser).
- `configure` accepts a single `MarkdownExtension` or an array; nested arrays are supported.
- See `src/extensions/*` for the extension's node names and behavior.

### Using with @codemirror/lang-markdown

`@codemirror/lang-markdown` accepts a `config` object with an `extensions` option that is forwarded to the underlying `MarkdownParser`. The typical pattern is to pass your `MarkdownExtension` directly to `markdown({ extensions })`.

Minimal CodeMirror example — enable the extension in the language support:

```ts
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { templateVariableExtension } from "lezer-markdown-extensions/template-variable";

const view = new EditorView({
  parent: document.body,
  doc: "Hello {{user}}",
  extensions: [
    basicSetup,
    // Pass the extension into the markdown() config. It will be applied to
    // the MarkdownParser used by the language support.
    markdown({ extensions: templateVariableExtension }),
  ],
});
```

Notes:

- `markdown({ extensions })` accepts the same `MarkdownExtension` type used by `@lezer/markdown`.
- Under the hood the package calls `parser.configure(extensions)`; you can pass a single extension, an array of extensions, or nested arrays.
- If you need to ship a custom parser binary (for older bundling setups), you may instead build a parser that already includes the extension and pass that parser as `base` in the `markdown()` config. For most setups, passing `extensions` is sufficient and simplest.

## API & package exports

This package exposes a main entrypoint and per-extension subpaths. Example exports:

- `lezer-markdown-extensions` — main package export (index)
- `lezer-markdown-extensions/template-variable` — template variable extension

Each extension exports a `MarkdownExtension` object (type from `@lezer/markdown`). Import it and pass it into your parser configuration.

## Development

Development scripts are defined in `package.json`. Common commands:

- `pnpm install` — install dependencies
- `pnpm build` — build both ESM and CJS bundles
- `pnpm test` — run tests (vitest)
- `pnpm type-check` — run TypeScript type check

The repo uses a small script to generate `entry` and `exports` metadata (see `meta.ts`). If you add new extensions under `src/extensions/*`, the packaging script will include them as subpath exports automatically.

## Publishing

The package is configured to publish ESM and CJS bundles and to expose subpath exports for each extension. The `prepublishOnly` hook runs the full build.

If you publish, make sure to bump the package version and run `pnpm publish --access public` (or follow your CI workflow).

## Contributing

Contributions are welcome. Good first issues include small extension ideas or improvements to existing extensions' parsing behavior. When opening a PR, please:

1. Add tests (vitest) for the new behavior.
2. Run `pnpm -s format` and `pnpm -s type-check`.
3. Keep extensions small and focused.

## License

MIT
