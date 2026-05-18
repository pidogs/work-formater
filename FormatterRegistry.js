'use strict';

const TableFormatter = require('./formatters/table');
// Example for the future: const SwitchFormatter = require('./formatters/SwitchFormatter');

class FormatterRegistry {
  constructor() {
    // Easily add new formatters here! 
    this.formatters = [
      new TableFormatter(),
      // new SwitchFormatter()
    ];
  }

  /**
   * Loops through all registered formatters.
   * Applies the first one that successfully detects a block under the cursor.
   * 
   * @param {string[]} lines - The document text split into lines
   * @param {number} cursorLineIndex - Current line of the cursor
   * @returns {string[]|null} - The updated document lines, or null if nothing changed
   */
  format(lines, cursorLineIndex, options) {
    if (cursorLineIndex < 0 || cursorLineIndex >= lines.length) return null;
    if (lines[cursorLineIndex].trim() === '') return null;

    for (const formatter of this.formatters) {
      const boundaries = formatter.detectBoundaries(lines, cursorLineIndex);
      
      if (boundaries) {
        const { start, end } = boundaries;
        const blockLines = lines.slice(start, end + 1);
        
        // Let the specific formatter do its job. Pass through editor options.
        const formattedBlock = formatter.formatBlock(blockLines, options);

        // Splice the newly formatted block back into the full lines array
        const resultLines = [...lines];
        
        resultLines.splice(start, blockLines.length, ...formattedBlock);

        return resultLines;
      }
    }

    return null; // No formatter was applicable
  }
}

module.exports = new FormatterRegistry();