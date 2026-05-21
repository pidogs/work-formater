export interface TableRange {
  startLine: number;
  endLine: number;
  text: string;
}

/**
 * Find the initializer/table block that contains the cursor line.
 *
 * Heuristic:
 * - Scan backward from the cursor to find the nearest '{'.
 * - From that opening brace, scan forward to find the matching '}' using depth counting.
 * - Expand backward to include a declaration line that contains '=' (if present).
 * - Expand forward to include a trailing semicolon on the same or following lines (if present).
 *
 * Returns `null` if no enclosing initializer block is found.
 */
/**
 * Debug logging utility - only prints if DEBUG_TABLE_PARSER environment variable is set
 */
function debugLog(...args: any[]): void {
  if (process.env.DEBUG_TABLE_PARSER === 'true') {
    console.log('[TABLE_PARSER_DEBUG]', ...args);
  }
}

export function findTableAtCursor(text: string, cursorLine: number): TableRange | null {
  const lines = text.split('\n');

  if (lines.length === 0) return null;

  debugLog(`findTableAtCursor called with cursorLine: ${cursorLine}`);
  debugLog(`Total lines in file: ${lines.length}`);

  // Clamp cursor line
  if (cursorLine < 0) cursorLine = 0;
  if (cursorLine >= lines.length) cursorLine = lines.length - 1;

  debugLog(`Cursor line after clamping: ${cursorLine}`);
  debugLog(`Cursor line content: "${lines[cursorLine]}"`);

  // 1) Find the nearest opening brace '{' scanning backward from the cursor
  let openBraceLine = -1;
  for (let i = cursorLine; i >= 0; i--) {
    if (lines[i].includes('{')) {
      openBraceLine = i;
      break;
    }
  }

  debugLog(`Found opening brace at line: ${openBraceLine}`);
  if (openBraceLine !== -1) {
    debugLog(`Opening brace line content: "${lines[openBraceLine]}"`);
  }

  if (openBraceLine === -1) {
    debugLog('No opening brace found - returning null');
    return null;
  }

  // 2) From the opening brace, find the matching closing brace '}'
  let braceDepth = 0;
  let closeBraceLine = -1;
  debugLog('Starting brace depth search...');
  
  for (let i = openBraceLine; i < lines.length; i++) {
    const line = lines[i];
    debugLog(`Scanning line ${i}: "${line}" (depth: ${braceDepth})`);
    
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '{') {
        braceDepth++;
        debugLog(`  Found '{', depth now: ${braceDepth}`);
      } else if (ch === '}') {
        braceDepth--;
        debugLog(`  Found '}', depth now: ${braceDepth}`);
        if (braceDepth === 0) {
          closeBraceLine = i;
          debugLog(`  Found matching '}' at line ${i}`);
          break;
        }
      }
    }
    if (closeBraceLine !== -1) break;
  }

  debugLog(`Found closing brace at line: ${closeBraceLine}`);
  if (closeBraceLine !== -1) {
    debugLog(`Closing brace line content: "${lines[closeBraceLine]}"`);
  }

  if (closeBraceLine === -1) {
    debugLog('No matching closing brace found - returning null');
    return null;
  }

  // 3) Try to expand upward to include a declaration line (line containing '=')
  let declLine = -1;
  debugLog('Searching for declaration line with "=" above opening brace...');
  
  for (let i = openBraceLine - 1; i >= 0; i--) {
    const line = lines[i];
    debugLog(`Checking line ${i} for '=': "${line}"`);
    
    if (line.includes('=')) {
      declLine = i;
      debugLog(`Found declaration line at ${i}: "${line}"`);
      break;
    }
    // If we hit a statement terminator before finding '=', stop expanding
    if (line.trim().endsWith(';')) {
      debugLog(`Hit semicolon at line ${i}, stopping upward expansion`);
      break;
    }
    // also stop if we hit an unrelated block close
    if (line.trim().startsWith('}')) {
      debugLog(`Hit closing brace at line ${i}, stopping upward expansion`);
      break;
    }
  }

  const startLine = declLine !== -1 ? declLine : openBraceLine;
  debugLog(`Final start line: ${startLine}`);

  // 4) Try to include a trailing semicolon after the close brace (e.g., '};')
  let endLine = closeBraceLine;
  debugLog('Searching for trailing semicolon...');
  
  for (let i = closeBraceLine; i < Math.min(lines.length, closeBraceLine + 4); i++) {
    debugLog(`Checking line ${i} for ';': "${lines[i]}"`);
    if (lines[i].includes(';')) {
      endLine = i;
      debugLog(`Found semicolon at line ${i}`);
      break;
    }
  }

  const blockLines = lines.slice(startLine, endLine + 1);
  debugLog(`Table range: lines ${startLine} to ${endLine}`);
  debugLog(`Table text:\n${blockLines.join('\n')}`);
  
  return {
    startLine,
    endLine,
    text: blockLines.join('\n'),
  };
}

export default findTableAtCursor;
