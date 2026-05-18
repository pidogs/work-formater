# TableFormatter

A small VS Code extension and utilities for aligning columns in C struct-array initializer tables and related formatting helpers.

## Requirements

- Node.js (recommended >= 16)
- npm (comes with Node.js)
- Visual Studio Code (extension targets `vscode` ^1.85.0)

## Required packages

The project has the following package entries in `package.json`:

- Dev dependencies:
  - `@types/vscode` (for development/typing)

Note: Run `npm install` to install the listed dev dependencies.

## Installation

Clone the repository, install dependencies, and open in VS Code:

```bash
npm install
code .
```

To run the extension during development, press `F5` in VS Code to open an Extension Development Host.

To package for distribution (optional):

```bash
# install vsce if you want to package the extension
npm install -g vsce
vsce package
```

## How to use

- Open a C source file containing a table (struct-array initializer) or the sample files in this repository.
- Run the command `Format C Table` (command id: `cTableFormatter.format`) from the Command Palette, or use the default keybinding `Ctrl+Alt+T` (Windows/Linux) or `Cmd+Alt+T` (mac).

## Quick file descriptions (extension files only)

- `FormatterRegistry.js` : Registers and exposes available formatter implementations to the extension host. Responsible for selecting the appropriate formatter for a given document or selection.
- `extension.js` : Extension activation entrypoint. Registers the `cTableFormatter.format` command, wires contributions from `package.json`, and invokes the formatter logic when the command is run.
- `gitSelecter.js.example` : An example helper script included with the extension sources. Not required for activation, but provided as a utility/example for repository workflows (may be renamed or removed in production builds).
- `package.json` : Extension manifest and metadata for VS Code. Declares the extension `main` entry (`extension.js`), contributed commands, keybindings, and engine compatibility.
- `table.js` : Core formatter logic for detecting C struct-array initializer tables and aligning columns. This is the primary implementation used by the extension command.
- `formatters/base.js` : Base formatter scaffolding and utilities used by formatter implementations (common helpers, normalization, and shared behavior).
- `formatters/table.js` : Table-specific formatter implementation that implements the formatting rules and column alignment algorithm used to rewrite table blocks.

## Development notes

- The extension contributes a command `cTableFormatter.format` and a default keybinding. See `package.json` for more details about contributions and activation.
- If you plan to publish the extension to the VS Code marketplace, follow the `vsce` packaging steps and ensure the `publisher` field in `package.json` is correct.

## Troubleshooting

- If formatting doesn't run, ensure the extension is active (open the Extension Development Host when developing) and that your file has recognizable table structures.
- If dependencies are missing, run `npm install` and check for errors.

---

If you want, I can also update the existing `README.MD` instead of adding this `readme.md`, or add a short example snippet demonstrating before/after formatting. Which would you prefer?
