import {
  parser as defaultParser,
  Subscript,
  Superscript,
} from "@lezer/markdown";
import { describe, expect, it } from "vitest";
import { templateVariableExtension } from "../src/extensions/template-variable";
import { serializeTreeWithText } from "./utils";

const parser = defaultParser.configure(templateVariableExtension);

describe("template variable extension", () => {
  it("simple variable", () => {
    const input = "{{planet}}";
    const tree = parser.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    expect(serialized).toMatchInlineSnapshot(
      `
      "Document[0,10] {{planet}}
        Paragraph[0,10] {{planet}}
          TemplateVariable[0,10] {{planet}}
            TemplateVariableMark[0,2] {{
            TemplateVariableMark[8,10] }}"
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
          TemplateVariable[0,4] {{}}
            TemplateVariableMark[0,2] {{
            TemplateVariableMark[2,4] }}"
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
          TemplateVariable[3,8] {{b}}
            TemplateVariableMark[3,5] {{
            TemplateVariableMark[6,8] }}"
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
          TemplateVariable[0,10] {{{hello}}
            TemplateVariableMark[0,2] {{
            TemplateVariableMark[8,10] }}"
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
          TemplateVariable[1,11] {{{hello}}
            TemplateVariableMark[1,3] {{
            TemplateVariableMark[9,11] }}"
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
          TemplateVariable[0,12] {{pla\\}net}}
            TemplateVariableMark[0,2] {{
            Escape[5,7] \\}
            TemplateVariableMark[10,12] }}"
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
          TemplateVariable[0,12] {{pla\\{net}}
            TemplateVariableMark[0,2] {{
            Escape[5,7] \\{
            TemplateVariableMark[10,12] }}"
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
          TemplateVariable[0,12] {{pla\\\\net}}
            TemplateVariableMark[0,2] {{
            Escape[5,7] \\\\
            TemplateVariableMark[10,12] }}"
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
          TemplateVariable[0,5] {{a}}
            TemplateVariableMark[0,2] {{
            TemplateVariableMark[3,5] }}
          TemplateVariable[5,10] {{b}}
            TemplateVariableMark[5,7] {{
            TemplateVariableMark[8,10] }}"
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
          TemplateVariable[7,14] {{var}}
            TemplateVariableMark[7,9] {{
            TemplateVariableMark[12,14] }}"
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
          TemplateVariable[0,5] {{{}}
            TemplateVariableMark[0,2] {{
            TemplateVariableMark[3,5] }}"
    `,
    );
  });
});

describe("builtin inline examples", () => {
  it("superscript and subscript examples", () => {
    const parser2 = defaultParser.configure([
      Superscript,
      Subscript,
      templateVariableExtension,
    ]);
    const input = "a^b^ c~d~";
    const tree = parser2.parse(input);
    const serialized = serializeTreeWithText(tree, input);
    // Inline snapshot will show how Superscript/Subscript are represented
    expect(serialized).toMatchInlineSnapshot(`
      "Document[0,9] a^b^ c~d~
        Paragraph[0,9] a^b^ c~d~
          Superscript[1,4] ^b^
            SuperscriptMark[1,2] ^
            SuperscriptMark[3,4] ^
          Subscript[6,9] ~d~
            SubscriptMark[6,7] ~
            SubscriptMark[8,9] ~"
    `);
  });
});
