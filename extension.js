'use strict';

const vscode = require('vscode');
const FormatterRegistry = require('./FormatterRegistry');

function activate(context) {
  const cmd = vscode.commands.registerCommand('cTableFormatter.format', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const cursorLineIndex = editor.selection.active.line;
    const lines = document.getText().split('\n');
    
    try {
      // The registry automatically figures out which formatter to apply
      const result = FormatterRegistry.format(lines, cursorLineIndex);

      if (!result) {
        vscode.window.showInformationMessage('Nothing to format or cursor is not inside a supported block.');
        return;
      }

      // Replace the entire document with the newly formatted lines
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      );

      editor.edit((eb) => eb.replace(fullRange, result.join('\n')));

    } catch (err) {
      vscode.window.showErrorMessage(`C Formatter: ${err.message}`);
    }
  });

  context.subscriptions.push(cmd);
}

function deactivate() {}

module.exports = { activate, deactivate };