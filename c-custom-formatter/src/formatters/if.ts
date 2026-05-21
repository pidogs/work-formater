import BaseFormatter from "./base";

interface IfBlock {
  startLine: number;
  endLine: number;
  text: string;
}

export default class IfFormatter extends BaseFormatter {
  /**
   * Format only the if-statement at the given cursor position.
   * Returns the line range and formatted text, or null if no if-block found.
   */
  formatAtPosition(text: string, cursorLine: number): { startLine: number; endLine: number; formattedText: string } | null {
    const lines = text.split('\n');
    const ifBlock = this.findIfBlockAtCursor(lines, cursorLine);

    if (!ifBlock) {
      return null;
    }

    const formattedIf = this.formatIfBlock(ifBlock.text);

    return {
      startLine: ifBlock.startLine,
      endLine: ifBlock.endLine,
      formattedText: formattedIf,
    };
  }

  /**
   * Find the if-statement block that contains the cursor line.
   * Searches backward for 'if', then forward for the matching closing brace.
   */
  findIfBlockAtCursor(lines: string[], cursorLine: number): IfBlock | null {
    // Step 1: Find the opening brace by scanning backward from cursor
    let openBraceLine = -1;
    for (let i = cursorLine; i >= 0; i--) {
      if (lines[i].includes('{')) {
        openBraceLine = i;
        break;
      }
    }

    if (openBraceLine === -1) {
      return null;
    }

    // Step 2: Find the matching closing brace by scanning forward from the opening brace
    let closeBraceLine = -1;
    let braceDepth = 0;
    for (let i = openBraceLine; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === '{') braceDepth++;
        else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            closeBraceLine = i;
            break;
          }
        }
      }
      if (closeBraceLine !== -1) break;
    }

    if (closeBraceLine === -1) {
      return null;
    }

    // Step 3: Search backward from the opening brace to find 'if'
    let ifStartLine = -1;
    for (let i = openBraceLine; i >= 0; i--) {
      const trimmed = lines[i].trim();
      // Check if this line starts an if statement
      if (trimmed.startsWith('if')) {
        // Verify there's a '(' between this line and the opening brace
        const textBetween = lines.slice(i, openBraceLine + 1).join('');
        if (textBetween.includes('(')) {
          ifStartLine = i;
          break;
        }
      }
      // Stop if we hit another statement boundary
      if (i < openBraceLine && (trimmed.startsWith('}') || trimmed.startsWith('else'))) {
        break;
      }
    }

    if (ifStartLine === -1) {
      return null;
    }

    // Extract the complete if block text
    const blockLines = lines.slice(ifStartLine, closeBraceLine + 1);
    const blockText = blockLines.join('\n');

    return {
      startLine: ifStartLine,
      endLine: closeBraceLine,
      text: blockText,
    };
  }

  /**
   * Format a single if-statement block according to the expected style.
   *
   * Single condition:
   *   if ( a )
   *       {
   *       print(a);
   *       }
   *
   * Multiple conditions:
   *   if ( a
   *     && b
   *     && c )
   *     {
   *       print(a);
   *     }
   */
  formatIfBlock(blockText: string): string {
    const fullText = blockText;

    // Find the first '(' and matching ')'
    let firstParen = -1;
    let lastParenBeforeBrace = -1;
    let parenCount = 0;
    let bracePos = -1;

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];
      if (char === '(') {
        if (parenCount === 0) firstParen = i;
        parenCount++;
      } else if (char === ')') {
        parenCount--;
        if (parenCount === 0) {
          lastParenBeforeBrace = i;
        }
      } else if (char === '{' && parenCount === 0 && lastParenBeforeBrace !== -1) {
        bracePos = i;
        break;
      }
    }

    if (firstParen === -1 || lastParenBeforeBrace === -1 || bracePos === -1) {
      return blockText;
    }

    // Extract condition content
    const conditionContent = fullText.substring(firstParen + 1, lastParenBeforeBrace);

    // Find closing brace for the body
    let closeBracePos = -1;
    let depth = 0;
    for (let i = bracePos; i < fullText.length; i++) {
      if (fullText[i] === '{') depth++;
      else if (fullText[i] === '}') {
        depth--;
        if (depth === 0) {
          closeBracePos = i;
          break;
        }
      }
    }

    const bodyText = closeBracePos !== -1
      ? fullText.substring(bracePos + 1, closeBracePos)
      : '';

    // Parse condition
    const conditionTrimmed = conditionContent.trim();
    const hasMultipleConditions = /&&|\|\|/.test(conditionTrimmed);

    // Parse body lines
    const bodyLines = bodyText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    // Build formatted output
    const result: string[] = [];

    if (!hasMultipleConditions) {
      // Single condition
      result.push(`if ( ${conditionTrimmed} )`);
      result.push(`    {`);
      for (const bodyLine of bodyLines) {
        result.push(`    ${bodyLine}`);
      }
      result.push(`    }`);
    } else {
      // Multiple conditions
      const parts = conditionTrimmed.split(/(\s*&&\s*|\s*\|\|\s*)/).filter(p => p.trim().length > 0);

      // First part
      if (parts.length > 0) {
        result.push(`if ( ${parts[0].trim()}`);
      }

      // Middle parts with operators - all but the last condition
      for (let i = 1; i < parts.length - 1; i++) {
        const part = parts[i].trim();
        if (part === '&&' || part === '||') {
          continue;
        }
        const prevPart = i > 0 ? parts[i - 1].trim() : '';
        if (prevPart === '||') {
          result.push(`  ${prevPart} ${part}`);
        } else {
          result.push(`  && ${part}`);
        }
      }

      // Last condition: put ) on the same line
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].trim();
        const secondLast = parts[parts.length - 2].trim();
        if (secondLast === '||') {
          result.push(`  || ${lastPart} )`);
        } else {
          result.push(`  && ${lastPart} )`);
        }
      }

      // Opening brace
      result.push(`  {`);

      // Body
      for (const bodyLine of bodyLines) {
        result.push(`    ${bodyLine}`);
      }

      // Closing brace
      result.push(`  }`);
    }

    return result.join('\n');
  }

  /**
   * Original format method - formats all if-statements in the text
   */
  format(text: string): string {
    let formatted = text;
    const ifRegex = /if\s*\(([^)]+)\)\s*\{/g;

    formatted = formatted.replace(ifRegex, (match: string, condition: string) => {
      const cleanCondition = condition.trim();
      return `if ( ${cleanCondition} ) {`;
    });

    return formatted;
  }
}
