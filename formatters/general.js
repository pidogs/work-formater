'use strict';

/**
 * General small utilities used by formatters.
 */

function getBaseIndent(options) {
  const insertSpaces = options && typeof options.insertSpaces !== 'undefined' ? options.insertSpaces : true;
  const tabSize = options && options.tabSize ? Number(options.tabSize) : 4;
  return insertSpaces ? ' '.repeat(Math.max(1, tabSize)) : '\t';
}

function padRight(str, len) {
  str = String(str);
  if (str.length >= len) return str;
  return str + ' '.repeat(len - str.length);
}

/**
 * Parse an enum/item line into its name/value and inline comment (if any).
 * Returns: { rawName, namePart, valuePart, comment }
 */
function parseEnumLine(line) {
  if (!line) return null;
  let s = line.trim();

  // Remove trailing comma for parsing, we'll re-add when formatting
  if (s.endsWith(',')) s = s.slice(0, -1).trim();

  let comment = null;
  const commentStart = s.indexOf('/*');
  if (commentStart !== -1) {
    const commentEnd = s.indexOf('*/', commentStart + 2);
    if (commentEnd !== -1) {
      comment = s.substring(commentStart, commentEnd + 2).trim();
      s = (s.substring(0, commentStart) + ' ' + (s.substring(commentEnd + 2) || '')).trim();
    } else {
      // unclosed comment, treat rest as comment
      comment = s.substring(commentStart).trim();
      s = s.substring(0, commentStart).trim();
    }
  }

  // Separate name and optional assignment (e.g. NAME = 3)
  let namePart = s;
  let valuePart = null;
  const eqIndex = s.indexOf('=');
  if (eqIndex !== -1) {
    namePart = s.substring(0, eqIndex).trim();
    valuePart = s.substring(eqIndex + 1).trim();
  }

  return {
    rawName: line.trim(),
    namePart,
    valuePart,
    comment
  };
}

module.exports = {
  getBaseIndent,
  padRight,
  parseEnumLine
};
