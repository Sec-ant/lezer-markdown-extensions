import { tags } from "@lezer/highlight";
import type { Element, MarkdownExtension } from "@lezer/markdown";

export const templateVariableExtension = {
  defineNodes: [
    { name: "TemplateVariable", block: false, style: tags.variableName },
    { name: "TemplateVariableMark", style: tags.processingInstruction },
  ],
  parseInline: [
    {
      name: "TemplateVariable",
      parse(cx, _next, pos) {
        // Must start with `{{`
        if (
          cx.char(pos) !== CODES.LEFT_CURLY_BRACE ||
          cx.char(pos + 1) !== CODES.LEFT_CURLY_BRACE
        ) {
          return -1;
        }
        let i = pos + 2;
        const len = cx.end;
        // Build an array of child elements (start with opening mark)
        const elts: Element[] = [cx.elt("TemplateVariableMark", pos, pos + 2)];
        while (i < len) {
          const ch = cx.char(i);
          if (
            ch === CODES.VIRTUAL_SPACE ||
            ch === CODES.LF ||
            ch === CODES.CR
          ) {
            break; // line termination (EOF or line ending)
          }
          if (ch === CODES.LEFT_CURLY_BRACE) {
            // If we see another '{{' inside, bail out to allow inner parse
            if (cx.char(i + 1) === CODES.LEFT_CURLY_BRACE) {
              return -1;
            }
            // Otherwise advance past a single '{'
            i++;
            continue;
          }
          if (ch === CODES.RIGHT_CURLY_BRACE) {
            // closing `}}`?
            if (cx.char(i + 1) === CODES.RIGHT_CURLY_BRACE) {
              const end = i + 2;
              // push closing mark and create a TemplateVariable node with marks as children
              elts.push(cx.elt("TemplateVariableMark", i, end));
              return cx.addElement(cx.elt("TemplateVariable", pos, end, elts));
            } else {
              i++;
              continue;
            }
          }
          if (ch === CODES.BACKSLASH) {
            // Emit an Escape element covering the backslash and the next char
            // (if present). This mirrors built-in parsers that treat an escape
            // as two-character token.
            if (i + 1 < len) {
              elts.push(cx.elt("Escape", i, i + 2));
              i += 2;
              continue;
            } else {
              // backslash at EOF — treat as ordinary char (fail the parse)
              break;
            }
          }
          // Ordinary char
          i++;
        }
        return -1;
      },
    },
  ],
} satisfies MarkdownExtension;
