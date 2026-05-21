import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  DocumentFormattingParams,
  DocumentRangeFormattingParams,
  TextEdit,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import FormatterRegistry from "./FormatterRegistry";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      documentFormattingProvider: true,
      documentRangeFormattingProvider: true,
    },
  };
});

/**
 * Format entire document
 */
connection.onDocumentFormatting((params: DocumentFormattingParams): TextEdit[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const formattedText = FormatterRegistry.format(text);

  return [
    TextEdit.replace(
      {
        start: { line: 0, character: 0 },
        end: { line: document.lineCount, character: 0 },
      },
      formattedText
    ),
  ];
});

/**
 * Format range - used when formatting selection or at cursor position
 */
connection.onDocumentRangeFormatting((params: DocumentRangeFormattingParams): TextEdit[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const cursorLine = params.range.start.line;
  
  // Try to format the if-statement at cursor position
  const result = FormatterRegistry.formatAtPosition(text, cursorLine);
  
  if (result) {
    // Return edit for just the if-statement block
    return [
      TextEdit.replace(
        {
          start: { line: result.startLine, character: 0 },
          end: { line: result.endLine, character: document.getText().split('\n')[result.endLine].length },
        },
        result.formattedText
      ),
    ];
  }

  // If no if-statement found, return empty (no changes)
  return [];
});

documents.listen(connection);
connection.listen();
