'use strict';

/**
 * Base class that all block formatters should extend.
 */
class BaseFormatter {
  
  /**
   * Identifies the isolated block around the cursor.
   * @param {string[]} lines - Full document lines
   * @param {number} cursorLineIndex - Line number where cursor is located
   * @returns {{start: number, end: number}|null} Boundary indices, or null if not applicable
   */
  detectBoundaries(lines, cursorLineIndex) {
    throw new Error('detectBoundaries() must be implemented by subclass');
  }

  /**
   * Formats the isolated block of lines independently.
   * @param {string[]} blockLines - The raw lines of the block
   * @returns {string[]} The formatted lines
   */
  formatBlock(blockLines) {
    throw new Error('formatBlock() must be implemented by subclass');
  }
}

module.exports = BaseFormatter;