'use strict';

const BaseFormatter = require('./base');
const { getBaseIndent, padRight, parseEnumLine } = require('./general');

class EnumFormatter extends BaseFormatter {
  detectBoundaries(lines, cursorLineIndex) {
    // Walk UP to find the start of the typedef enum
    let start = cursorLineIndex;
    while (start > 0) {
      const prev = lines[start - 1].trim();
      if (prev === '') break;

      if (prev.match(/typedef\s+enum\b/) || prev.match(/\benum\b/) ) {
        // If the enum header is on the previous line, include it
        start = start - 1;
        break;
      }

      // If we hit a closing brace for a previous block, stop
      if (prev.match(/\}\s*(?:[A-Za-z_][A-Za-z0-9_]*)?\s*;$/)) break;

      start--;
    }

    // Walk DOWN to find the end of the enum block (the line with closing '}' and the typedef name)
    let end = cursorLineIndex;
    while (end < lines.length - 1) {
      const next = lines[end + 1].trim();
      if (next === '') break;
      if (next.startsWith('};') || next.match(/^\}\s*[A-Za-z_][A-Za-z0-9_]*\s*;$/) || next === '}') {
        end = end + 1;
        break;
      }
      end++;
    }

    return { start, end };
  }

  formatBlock(blockLines, options) {
    const baseIndent = getBaseIndent(options);

    // Find open brace and close brace indices
    let openIdx = -1, closeIdx = -1;
    for (let i = 0; i < blockLines.length; i++) {
      if (blockLines[i].includes('{')) { openIdx = i; break; }
    }
    for (let i = blockLines.length - 1; i >= 0; i--) {
      if (blockLines[i].includes('}')) { closeIdx = i; break; }
    }

    if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) {
      // Not a normal enum block, return trimmed copy
      return blockLines.map(l => l.trim());
    }

    // Header (everything up to and including the open brace)
    const headerLines = blockLines.slice(0, openIdx + 1).map(l => l.trim());

    // Items between braces
    const rawItems = blockLines.slice(openIdx + 1, closeIdx);
    const parsed = [];
    for (let ln of rawItems) {
      const t = ln.trim();
      if (!t) continue;
      // skip block comments or standalone comments
      if (t.startsWith('/*') && t.endsWith('*/')) {
        parsed.push({ type: 'comment', raw: t });
        continue;
      }
      parsed.push({ type: 'item', parsed: parseEnumLine(t) });
    }

    // Compute maximum length of the left side (name + optional ` = value` + comma)
    let maxLeft = 0;
    parsed.forEach(p => {
      if (p.type === 'item' && p.parsed) {
        let left = p.parsed.namePart;
        if (p.parsed.valuePart) left += ' = ' + p.parsed.valuePart;
        // account for trailing comma
        left += ',';
        if (left.length > maxLeft) maxLeft = left.length;
      }
    });

    // Choose a comment column offset (two spaces after the longest left entry)
    const commentCol = maxLeft + 2;

    // Build formatted output
    const out = [];

    // Header: try to keep header on single line if it already was; otherwise join neatly
    if (headerLines.length === 1) {
      out.push(headerLines[0]);
    } else {
      // join header tokens but keep '{' on the same line if present
      let joined = headerLines.join(' ');
      out.push(joined);
    }

    // Items with alignment
    parsed.forEach(p => {
      if (p.type === 'comment') {
        out.push(baseIndent + p.raw);
        return;
      }
      const info = p.parsed;
      if (!info) return;
      let left = info.namePart;
      if (info.valuePart) left += ' = ' + info.valuePart;
      left += ',';

      const leftPadded = padRight(left, commentCol - 1);
      if (info.comment) {
        out.push(baseIndent + leftPadded + ' ' + info.comment);
      } else {
        out.push(baseIndent + left);
      }
    });

    // Closing line(s): preserve the original close line trimmed and indent
    const closeLine = blockLines[closeIdx].trim();
    out.push(closeLine);

    // Any trailing lines after closeIdx (e.g., typedef name on same line or following) - include them
    if (closeIdx < blockLines.length - 1) {
      for (let i = closeIdx + 1; i < blockLines.length; i++) {
        const t = blockLines[i].trim();
        if (t) out.push(t);
      }
    }

    return out;
  }
}

module.exports = EnumFormatter;
