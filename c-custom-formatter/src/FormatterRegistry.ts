import IfFormatter from "./formatters/if";

export interface FormatResult {
  startLine: number;
  endLine: number;
  formattedText: string;
}

export default class FormatterRegistry {
  /**
   * Format the entire document
   */
  static format(rawText: string): string {
    let outputText = rawText;

    const ifFormatter = new IfFormatter();

    outputText = ifFormatter.format(outputText);

    return outputText;
  }

  /**
   * Format only the if-statement at the given cursor line
   * Returns null if no if-statement found at cursor position
   */
  static formatAtPosition(rawText: string, cursorLine: number): FormatResult | null {
    const ifFormatter = new IfFormatter();
    return ifFormatter.formatAtPosition(rawText, cursorLine);
  }
}
