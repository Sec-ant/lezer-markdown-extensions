import { parser as defaultParser } from "@lezer/markdown";
import { describe, expect, it } from "vitest";
import { variableExtension } from "../src/extensions/variable";
import { serializeTreeWithText } from "./utils";

const parser = defaultParser.configure(variableExtension);

describe("variable extension", () => {
  it("simple variable", () => {
    const input = "{{planet}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,10] {{planet}}
        Paragraph[0,10] {{planet}}
          Variable[0,10] {{planet}}
            VariableMark[0,2] {{
            VariableMark[8,10] }}"
    `,
    );
  });

  it("empty variable", () => {
    const input = "{{}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,4] {{}}
        Paragraph[0,4] {{}}
          Variable[0,4] {{}}
            VariableMark[0,2] {{
            VariableMark[2,4] }}"
    `,
    );
  });

  it("nested braces (inner allowed)", () => {
    const input = "{{a{{b}}c}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,11] {{a{{b}}c}}
        Paragraph[0,11] {{a{{b}}c}}
          Variable[3,8] {{b}}
            VariableMark[3,5] {{
            VariableMark[6,8] }}"
    `,
    );
  });

  it("triple braces", () => {
    const input = "{{{hello}}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,11] {{{hello}}}
        Paragraph[0,11] {{{hello}}}
          Variable[0,10] {{{hello}}
            VariableMark[0,2] {{
            VariableMark[8,10] }}"
    `,
    );
  });

  it("quadruple braces", () => {
    const input = "{{{{hello}}}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,13] {{{{hello}}}}
        Paragraph[0,13] {{{{hello}}}}
          Variable[1,11] {{{hello}}
            VariableMark[1,3] {{
            VariableMark[9,11] }}"
    `,
    );
  });

  it("contains line ending (reject)", () => {
    const input = "{{hello\nworld}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(`
      "Document[0,15] {{hello\\nworld}}
        Paragraph[0,15] {{hello\\nworld}}"
    `);
  });

  it("escaped chars 1", () => {
    const input = "{{pla\\}net}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,12] {{pla\\}net}}
        Paragraph[0,12] {{pla\\}net}}
          Variable[0,12] {{pla\\}net}}
            VariableMark[0,2] {{
            Escape[5,7] \\}
            VariableMark[10,12] }}"
    `,
    );
  });

  it("escaped chars 2", () => {
    const input = "{{pla\\{net}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,12] {{pla\\{net}}
        Paragraph[0,12] {{pla\\{net}}
          Variable[0,12] {{pla\\{net}}
            VariableMark[0,2] {{
            Escape[5,7] \\{
            VariableMark[10,12] }}"
    `,
    );
  });

  it("escaped backslash", () => {
    const input = "{{pla\\\\net}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,12] {{pla\\\\net}}
        Paragraph[0,12] {{pla\\\\net}}
          Variable[0,12] {{pla\\\\net}}
            VariableMark[0,2] {{
            Escape[5,7] \\\\
            VariableMark[10,12] }}"
    `,
    );
  });

  it("incomplete at EOF", () => {
    const input = "{{incomplete";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(`
      "Document[0,12] {{incomplete
        Paragraph[0,12] {{incomplete"
    `);
  });

  it("adjacent variables", () => {
    const input = "{{a}}{{b}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,10] {{a}}{{b}}
        Paragraph[0,10] {{a}}{{b}}
          Variable[0,5] {{a}}
            VariableMark[0,2] {{
            VariableMark[3,5] }}
          Variable[5,10] {{b}}
            VariableMark[5,7] {{
            VariableMark[8,10] }}"
    `,
    );
  });

  it("variable inside text", () => {
    const input = "before {{var}} after";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,20] before {{var}} after
        Paragraph[0,20] before {{var}} after
          Variable[7,14] {{var}}
            VariableMark[7,9] {{
            VariableMark[12,14] }}"
    `,
    );
  });

  it("braces only triple empty", () => {
    const input = "{{{}}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,6] {{{}}}
        Paragraph[0,6] {{{}}}
          Variable[0,5] {{{}}
            VariableMark[0,2] {{
            VariableMark[3,5] }}"
    `,
    );
  });
});
