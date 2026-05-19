'use strict';

const BaseFormatter = require('./base');

function getBaseIndent(options) {
  const insertSpaces = options && typeof options.insertSpaces !== 'undefined' ? options.insertSpaces : true;
  const tabSize = options && options.tabSize ? Number(options.tabSize) : 4;
  return insertSpaces ? ' '.repeat(Math.max(1, tabSize)) : '\t';
}

/**
 * ORIGINAL HELPER: Helper to pull a full `{ ... }` struct out of a string.
 */
function extractRow(str) {
  let depth = 0;
  let inStr = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\\') { i++; continue; }
    if (str[i] === '"') inStr = !inStr;
    if (!inStr) {
      if (str[i] === '{\'') depth++;
      if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          let end = i + 1;
          if (end < str.length && str[end] === ',') end++;
          return {
            row: str.substring(0, end),
            rest: str.substring(end).trim()
          };
        }
      }
    }
  }
  return null;
}


class TableFormatter extends BaseFormatter {

  /**
   * Identifies the start and end lines of the table.
   */
  detectBoundaries(lines, cursorLineIndex) {
    // --- Helper: check if a trimmed line contains '};' (table terminator) ---
    function hasTableClose(str) {
      return /}\s*;/.test(str);
    }

    // --- Helper: check if a trimmed line is a declaration header ---
    function isDeclaration(str) {
      return /=\s*\{?$/.test(str) || str.includes('={') || str.includes('= {');
    }

    // --- Helper: check if a trimmed line is a lone opening brace ---
    function isLoneOpenBrace(str) {
      return str === '{';
    }

    // --- Helper: check if a trimmed line ends a struct/enum/typedef block ---
    function isBlockClose(str) {
      return /\}\s*(?:[A-Za-z_][A-Za-z0-9_]*)?\s*;$/.test(str);
    }

    // --- Helper: compute brace depth at each line from the top ---
    // Returns an array where depth[i] = brace depth just BEFORE line i
    // (i.e., the nesting level entering line i).
    function computeDepths() {
      const depths = [0];
      let depth = 0;
      for (let i = 0; i < lines.length; i++) {
        depths.push(depth);
        const trimmed = lines[i].trim();
        let inStr = false;
        for (let j = 0; j < trimmed.length; j++) {
          const ch = trimmed[j];
          if (ch === '\\') { j++; continue; }
          if (ch === '"') { inStr = !inStr; continue; }
          if (!inStr) {
            if (ch === '{') depth++;
            if (ch === '}') depth--;
          }
        }
      }
      return depths;
    }

    const depths = computeDepths();

    // ================================================================
    // Walk UP: find the first line of the table block
    // ================================================================
    let start = cursorLineIndex;

    while (start > 0) {
      const prev = lines[start - 1].trim();
      const depthAtPrev = depths[start - 1]; // depth entering the previous line

      // Stop at empty lines only when not inside any braces
      if (prev === '' && depthAtPrev === 0) break;

      // Stop if we hit the previous block's closing brace (at depth 0)
      if (isBlockClose(prev) && depthAtPrev === 0) break;

      // Found a declaration — this is the table start
      if (isDeclaration(prev)) { start--; break; }

      // Found a lone '{' — the table opener. Check if the declaration
      // is the line above it (staircase pattern).
      if (isLoneOpenBrace(prev)) {
        if (start > 1 && isDeclaration(lines[start - 2].trim())) {
          start -= 2;
        } else {
          start--;
        }
        break;
      }

      // A line with both '{' and '=' is a declaration with inline brace
      if (prev.includes('{') && prev.includes('=')) { start--; break; }

      // Everything else (data rows, continuation lines, etc.) — keep walking
      start--;
    }

    // ================================================================
    // Walk DOWN: find the last line of the table block
    // ================================================================
    let end = cursorLineIndex;

    while (end < lines.length - 1) {
      const next = lines[end + 1].trim();
      const depthAtNext = depths[end + 1]; // depth entering the next line

      // Stop at empty lines only when not inside any braces
      if (next === '' && depthAtNext === 0) break;

      // Found the table's closing '};' — include this line
      if (hasTableClose(next)) { end++; break; }

      // Stop if we hit the next table's declaration (at depth 0)
      if (isDeclaration(next) && depthAtNext === 0) break;

      // Stop if we hit a block close (at depth 0)
      if (isBlockClose(next) && depthAtNext === 0) break;

      end++;
    }

    return { start, end };
  }

  /**
   * Format the isolated chunk of lines independently.
   */
  formatBlock(blockLines, options) {
    console.log("blockLines");
    console.log(blockLines);
    const rowtypes = this.parseRowTypes(blockLines);
    console.log("rowtypes");
    console.log("header:");
    console.log(rowtypes.header);
    console.log("table:");
    console.log(rowtypes.table);
    console.log("footer:");
    console.log(rowtypes.footer);
    // console.log(rowtypes);
    
    // 4. Construct the formatted output (use editor options for indentation)
    const result = null;
    console.log('result');
    console.log(result);
    return result;
  }

  parseRowTypes(blockLines) {
    const header = [];
    const table = [];
    const footer = [];

    let inHeader = true;
    let inFooter = false;
    // Tracks brace depth inside the table body (row-level braces).
    // This does NOT count the table-level opening brace (handled
    // by the header detection).
    let rowDepth = 0;

    // Helper: count braces in a string, ignoring those inside string literals
    function countBraces(str) {
      let opens = 0;
      let closes = 0;
      let inStr = false;
      for (let j = 0; j < str.length; j++) {
        const ch = str[j];
        if (ch === '\\') { j++; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (!inStr) {
          if (ch === '{') opens++;
          if (ch === '}') closes++;
        }
      }
      return { opens, closes };
    }

    // Helper: find the position of the first '}' that is followed by
    // optional whitespace and ';' — i.e. the table terminator '};'.
    // Returns the index of '}' or -1 if not found.
    function findTableCloseBrace(str) {
      let inStr = false;
      for (let j = 0; j < str.length; j++) {
        const ch = str[j];
        if (ch === '\\') { j++; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (!inStr && ch === '}') {
          // Check if followed by optional whitespace and ';'
          let k = j + 1;
          while (k < str.length && (str[k] === ' ' || str[k] === '\t')) k++;
          if (k < str.length && str[k] === ';') return j;
        }
      }
      return -1;
    }

    for (let i = 0; i < blockLines.length; i++) {
      const line = blockLines[i];
      const trimmed = line.trim();
      const lineEntry = { line, index: i };

      if (inFooter) {
        footer.push(lineEntry);
        continue;
      }

      if (inHeader) {
        const { opens } = countBraces(trimmed);
        header.push(lineEntry);
        if (opens > 0) {
          // This line contains the table's opening brace '{'.
          // Transition to table body. The opening brace itself is
          // part of the header; data after it on this same line
          // needs to be captured as table content.
          inHeader = false;
          // Find where the table-opening brace is to extract any
          // data that follows it on the same line.
          const closePos = findTableCloseBrace(trimmed);
          if (closePos !== -1) {
            // The line has '};' — the table opens and closes on the
            // same line. Extract data between '{' and '}'.
            const afterOpen = trimmed.indexOf('{');
            if (afterOpen !== -1 && afterOpen + 1 < closePos) {
              const data = trimmed.substring(afterOpen + 1, closePos).trim();
              if (data.length > 0) {
                table.push({ line: data, index: i, synthetic: true });
              }
            }
            inFooter = true;
            footer.push(lineEntry);
          }
          // Otherwise the table body continues on subsequent lines;
          // data after '{' on this line would be table content but
          // since the header line is just the declaration + '{', there's
          // typically no data to extract.
          continue;
        }
        continue;
      }

      // --- We are in the table body area ---

      // Check if this line contains the table-closing '};'
      const tableClosePos = findTableCloseBrace(trimmed);
      if (tableClosePos !== -1) {
        // Extract any data before the '};' as a table row
        const beforeClose = trimmed.substring(0, tableClosePos).trim();
        if (beforeClose.length > 0) {
          table.push({ line: beforeClose, index: i, synthetic: true });
        }
        inFooter = true;
        footer.push(lineEntry);
        continue;
      }

      // Regular table line: track row depth and add to table
      const { opens: lineOpenBraces, closes: lineCloseBraces } = countBraces(trimmed);
      rowDepth += lineOpenBraces - lineCloseBraces;
      table.push(lineEntry);
    }

    return { header, table, footer };
  }

  calculateColumnWidths(dataRows, numCols) {
    const colWidths = [];
    const startOffsets = [0];

    if (numCols > 0) {
      for (let c = 0; c < numCols; c++) {
        let maxLen = 0;
        for (const row of dataRows) {
          const f = row.fields[c] || '';
          let len = f.length;
          if (c === 0) len += 2; // Initial '{'
          if (c < numCols - 1) len += 1; // Trailing ','
          if (len > maxLen) maxLen = len;
        }
        colWidths.push(maxLen + (c === numCols - 1 ? 0 : 1));
      }
      for (let c = 0; c < numCols - 1; c++) {
        startOffsets.push(startOffsets[c] + colWidths[c]);
      }
    }

    return { colWidths, startOffsets };
  }

  
}

module.exports = TableFormatter;