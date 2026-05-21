import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export function activate(context: any) {
  const serverModule = context.asAbsolutePath(path.join("out", "server.js"));

  const serverOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc },
  };

  const clientOptions = {
    documentSelector: [
      { scheme: "file", language: "c" },
      { scheme: "file", language: "cpp" },
    ],
  };

  client = new LanguageClient(
    "cCustomFormatter",
    "C Custom Formatter Language Server",
    serverOptions,
    clientOptions
  );

  client.start();

  // Register command to format at cursor position
  // This will format only the if-statement block containing the cursor
  const disposable = vscode.commands.registerCommand(
    "cCustomFormatter.formatAtCursor",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor found");
        return;
      }

      const document = editor.document;
      const selection = editor.selection;

      // If there's a selection, format the selection
      if (!selection.isEmpty) {
        await vscode.commands.executeCommand("editor.action.formatSelection");
      } else {
        // Format at cursor position - use range formatting
        // This will trigger onDocumentRangeFormatting in the server
        const position = selection.active;

        // Create a range that covers just the cursor line
        // The server will find the complete if-statement block
        const range = new vscode.Range(
          position.line,
          0,
          position.line,
          document.lineAt(position.line).text.length
        );

        // Execute range format which will use our custom formatter
        await vscode.commands.executeCommand("editor.action.formatSelection", range);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (!client) return undefined;
  return client.stop();
}
