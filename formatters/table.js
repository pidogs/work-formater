'use strict';

const BaseFormatter = require('./base');

/**
 * Split "{field1, field2, "str,val", field4}" content by top-level commas.
 */
function splitFields(content) {
  const fields = [];
  let current = '';
  let inString = false;
  let depth = 0;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (ch === '\\' && inString) {
      current += ch + (content[i + 1] ?? '');
      i++;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      current += ch;
      continue;
    }

    if (!inString) {
      if (ch === '{') { depth++; current += ch; continue; }
      if (ch === '}') { depth--; current += ch; continue; }
      if (ch === ',' && depth === 0) {
        fields.push(current.trim());
        current = '';
        continue;
      }
    }

    current += ch;
  }

  if (current.trim()) fields.push(current.trim());
  return fields;
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
      if (str[i] === '{') depth++;
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

/**
 * Helper to pull a 1D array item out of a string.
 */
function extractItem(str) {
  let inStr = false;
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\\') { i++; continue; }
    if (str[i] === '"') inStr = !inStr;
    if (!inStr) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        if (depth === 0) {
          if (i === 0) return null; // Let the closing bracket matchers handle it
          return {
            item: str.substring(0, i).trim(),
            rest: str.substring(i).trim()
          };
        }
        depth--;
      }
      else if (str[i] === ',' && depth === 0) {
        return {
          item: str.substring(0, i + 1).trim(),
          rest: str.substring(i + 1).trim()
        };
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
    // Walk UP to find the block boundary
    let start = cursorLineIndex;
    while (start > 0) {
      const prevLine = lines[start - 1].trim();
      if (prevLine === '') break; 
      
      // Found the declaration header (contains '=' near the end or with '{')
      if (prevLine.match(/=\s*\{?$/) || prevLine.includes('={') || prevLine.includes('= {')) {
        start--;
        break;
      }
      
      // Found a lone opening brace; verify if the line above it is the header!
      if (prevLine === '{') {
        if (start > 1 && lines[start - 2].includes('=')) {
          start -= 2;
          break;
        }
      }
      
      // Stop safely if we bump into the previous struct/enum/union/typedef closing brace
      // (e.g. `} Rectangle;`, `} Color;`, `struct Foo { ... };` or `};`).
      // Match any line that ends with a closing brace followed by an optional name and semicolon.
      if (prevLine.match(/\}\s*(?:[A-Za-z_][A-Za-z0-9_]*)?\s*;$/)) break;
      
      start--;
    }

    // Walk DOWN to find the block boundary
    let end = cursorLineIndex;
    while (end < lines.length - 1) {
      const nextLine = lines[end + 1].trim();
      if (nextLine === '') break;
      
      // Found this table's closing brace
      if (nextLine === '};') {
        end++; 
        break;
      }
      
      // Stop safely if we bump into the next table's declaration
      if (nextLine.match(/=\s*\{?$/) || nextLine.includes('={') || nextLine.includes('= {')) {
        break; 
      }
      
      end++;
    }

    return { start, end };
  }

  /**
   * Format the isolated chunk of lines independently.
   */
  formatBlock(blockLines) {
    // 1. Parse raw lines into logical elements
    const logicalElements = this.parseLogicalElements(blockLines);
    
    // 2. Extract fields from rows and comments
    this.parseElementFields(logicalElements);
    
    // 3. Calculate column widths and offsets
    const dataRows = logicalElements.filter(e => e.type === 'row');
    const numCols = dataRows.length > 0 ? Math.max(...dataRows.map(r => r.fields.length)) : 0;
    const { colWidths, startOffsets } = this.calculateColumnWidths(dataRows, numCols);
    
    // 4. Construct the formatted output
    return this.formatLogicalElements(logicalElements, numCols, colWidths, startOffsets);
  }

  /**
   * Parse raw lines into logical elements (headers, rows, comments, braces).
   */
  parseLogicalElements(blockLines) {
    const logicalElements = [];
    let buffer = "";

    for (let i = 0; i < blockLines.length; i++) {
      let line = blockLines[i].trim();
      if (line === '') continue;
      
      // Handle single-line comments (//) as standalone elements - don't concatenate
      if (line.startsWith('//') || line.startsWith('#')) {
        // Process any buffered content first
        if (buffer.length > 0) {
          logicalElements.push({ type: 'raw', raw: buffer });
          buffer = "";
        }
        logicalElements.push({ type: 'comment', raw: line });
        continue;
      }
      
      buffer += (buffer ? ' ' : '') + line;
      
      while (buffer.length > 0) {
        buffer = buffer.trim();
        if (!buffer) break;

        // Match Block Comments (/* ... */)
        if (buffer.startsWith('/*')) {
          let end = buffer.indexOf('*/');
          if (end !== -1) {
            logicalElements.push({ type: 'comment', raw: buffer.substring(0, end + 2) });
            buffer = buffer.substring(end + 2);
            continue;
          } else {
            break;
          }
        }
        
        // Match Struct Array Declaration Header
        let headerMatch = buffer.match(/^([^{]*=\s*)/);
        if (headerMatch && !buffer.startsWith('{')) {
          let rawHeader = headerMatch[1].trim();
          
          let formattedHeader = rawHeader
            .replace(/\s+/g, ' ')
            .replace(/\s+\[/g, '[')
            .replace(/\[\s*([^\]]+?)\s*\]/g, '[ $1 ]')
            .replace(/\s*=\s*$/, ' =');

          logicalElements.push({ type: 'header', raw: formattedHeader });
          buffer = buffer.substring(headerMatch[1].length);
          continue;
        }
        
        if (buffer.startsWith('{')) {
          let isOuter = false;
          if (!logicalElements.some(e => e.type === 'open')) {
            if (logicalElements.some(e => e.type === 'header') || buffer === '{') {
              isOuter = true;
            }
          }
          
          if (isOuter) {
            logicalElements.push({ type: 'open', raw: '{' });
            buffer = buffer.substring(1);
            continue;
          }
          
          let extracted = extractRow(buffer);
          if (extracted) {
            logicalElements.push({ type: 'row', raw: extracted.row });
            buffer = extracted.rest;
            continue;
          } else {
            break;
          }
        }

        // Match 1D array items or unhandled tokens
        let extractedItem = extractItem(buffer);
        if (extractedItem) {
          logicalElements.push({ type: 'raw', raw: extractedItem.item, isArrayItem: true });
          buffer = extractedItem.rest;
          continue;
        }
        
        // Match Struct closing brackets
        let closeMatch = buffer.match(/^\}\s*;/);
        if (closeMatch) {
          logicalElements.push({ type: 'close', raw: closeMatch[0] });
          buffer = buffer.substring(closeMatch[0].length);
          continue;
        }
        if (buffer === '}') {
          logicalElements.push({ type: 'close', raw: '}' });
          buffer = "";
          continue;
        }
        
        break; 
      }
    }
    
    if (buffer) logicalElements.push({ type: 'raw', raw: buffer });
    return logicalElements;
  }

  /**
   * Extract fields from row and comment elements for column alignment.
   */
  parseElementFields(logicalElements) {
    logicalElements.forEach(e => {
      if (e.type === 'row') {
        let match = e.raw.match(/^\{\s*([\s\S]*?)\s*\}(,?)$/);
        if (match) {
          e.fields = splitFields(match[1]);
          e.comma = ',';
        } else {
          e.fields = [e.raw];
          e.comma = ',';
        }
      } else if (e.type === 'comment') {
        let match = e.raw.match(/^\/\*\s*([\s\S]*?)\s*\*\/$/);
        e.fields = match ? splitFields(match[1]) : [];
      }
    });
  }

  /**
   * Calculate column widths and start offsets for alignment.
   */
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

  /**
   * Format logical elements into aligned output lines.
   */
  formatLogicalElements(logicalElements, numCols, colWidths, startOffsets) {
    const formattedLines = [];
    const baseIndent = '    ';

    logicalElements.forEach(e => {
      if (e.type === 'header') {
        formattedLines.push(e.raw);
      } else if (e.type === 'open') {
        formattedLines.push(baseIndent + '{');
      } else if (e.type === 'close') {
        formattedLines.push(baseIndent + '};');
      } else if (e.type === 'row') {
        formattedLines.push(this.formatRowElement(e, numCols, colWidths, baseIndent));
      } else if (e.type === 'comment') {
        // Single-line comments (//) are output as-is without indentation or alignment
        if (e.raw.startsWith('//')) {
          formattedLines.push(e.raw);
        } else {
          formattedLines.push(this.formatCommentElement(e, numCols, colWidths, startOffsets, baseIndent));
        }
      } else if (e.isArrayItem) {
        // 1D array items: ensure trailing comma
        let item = e.raw.trim();
        // Remove existing trailing comma if present, then add one
        if (item.endsWith(',')) {
          item = item.slice(0, -1).trim();
        }
        formattedLines.push(baseIndent + item + ',');
      } else {
        formattedLines.push(baseIndent + e.raw);
      }
    });

    return formattedLines;
  }

  /**
   * Format a single row element with column alignment.
   */
  formatRowElement(row, numCols, colWidths, baseIndent) {
    if (numCols === 0) {
      return baseIndent + row.raw;
    }
    
    let s = baseIndent;
    for (let c = 0; c < numCols; c++) {
      const f = row.fields[c] || '';
      if (c === 0 && c === numCols - 1) {
        s += '{ ' + f + ' }' + row.comma;
      } else if (c === 0) {
        let text = '{ ' + f + ',';
        s += text.padEnd(colWidths[c]);
      } else if (c === numCols - 1) {
        s += f.padEnd(colWidths[c]) + ' }' + row.comma;
      } else {
        let text = f + ',';
        s += text.padEnd(colWidths[c]);
      }
    }
    return s;
  }

  /**
   * Format a single comment element with column alignment.
   */
  formatCommentElement(comment, numCols, colWidths, startOffsets, baseIndent) {
    if (numCols === 0 || !comment.fields || comment.fields.length === 0) {
      return baseIndent + comment.raw;
    }
    
    let s = baseIndent;
    const cFields = comment.fields;
    
    for (let c = 0; c < cFields.length; c++) {
      let text = cFields[c];
      if (c === 0 && c === cFields.length - 1) {
        s += '/* ' + text + ' */';
      } else if (c === 0) {
        text = '/* ' + text + ',';
        let target = startOffsets[1] || (s.length - baseIndent.length + text.length + 1);
        let pad = target - text.length;
        s += text + ' '.repeat(Math.max(1, pad));
      } else if (c === cFields.length - 1) {
        let targetEnd = startOffsets[numCols - 1] + colWidths[numCols - 1] + 1;
        let currentLen = s.length - baseIndent.length;
        let desiredLen = targetEnd + 2;
        let requiredSpaces = desiredLen - currentLen - text.length - 2;
        s += text + ' '.repeat(Math.max(1, requiredSpaces)) + '*/';
      } else {
        text = text + ',';
        let target = startOffsets[c + 1] || 0;
        let currentLen = s.length - baseIndent.length;
        let pad = target - (currentLen + text.length);
        s += text + ' '.repeat(Math.max(1, pad));
      }
    }
    return s;
  }
}

module.exports = TableFormatter;