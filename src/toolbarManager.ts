import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const COMMENT_PREFIX: Record<string, string> = {
  python:     '#@',
  shellscript:'#@',
  ruby:       '#@',
  r:          '#@',
  javascript: '//@',
  typescript: '//@',
  javascriptreact: '//@',
  typescriptreact: '//@',
  c:          '//@',
  cpp:        '//@',
  csharp:     '//@',
  java:       '//@',
  go:         '//@',
  rust:       '//@',
  sql:        '--@',
  lua:        '--@',
  haskell:    '--@',
};

function getPrefixForLanguage(langId: string): string {
  return COMMENT_PREFIX[langId] ?? '//@';
}

function buildRemarqLine(
  prefix: string, type: string, size: number, font: string,
  color: string, align: string, message: string
): string {
  const parts: string[] = [];
  if (size !== 13)        parts.push(`size=${size}`);
  if (font !== 'mono')    parts.push(`font=${font}`);
  if (color)              parts.push(`color=${color}`);
  if (align !== 'left')   parts.push(`align=${align}`);
  const meta = parts.length > 0 ? ` ${parts.join(' ')}` : '';
  return `${prefix} [${type}]${meta} | ${message}`;
}

export class RemarqToolbar {
  private panel: vscode.WebviewPanel | undefined;
  private context: vscode.ExtensionContext;
  private lastCodeEditor: vscode.TextEditor | undefined;
  private lastCursorLine: number = 0;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && editor.document.uri.scheme === 'file') {
        this.lastCodeEditor = editor;
      }
    });

    vscode.window.onDidChangeTextEditorSelection(e => {
      if (e.textEditor.document.uri.scheme === 'file') {
        this.lastCodeEditor = e.textEditor;
        this.lastCursorLine = e.selections[0].active.line;
      }
    });
  }

  show() {
    if (vscode.window.activeTextEditor?.document.uri.scheme === 'file') {
      this.lastCodeEditor = vscode.window.activeTextEditor;
      this.lastCursorLine = vscode.window.activeTextEditor.selection.active.line;
    }

    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Two, true);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'remarqToolbar', 'Remarq Toolbar',
      { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'src'))],
      }
    );

    const htmlPath = path.join(this.context.extensionPath, 'src', 'toolbar.html');
    this.panel.webview.html = fs.readFileSync(htmlPath, 'utf8');

    this.panel.webview.onDidReceiveMessage(
      msg => this.handleWebviewMessage(msg),
      undefined,
      this.context.subscriptions
    );

    this.panel.onDidDispose(() => { this.panel = undefined; });
  }

  prefillFromLine(line: string) {
    if (!this.panel) return;
    const match = /^(\s*)(\/\/@|#@|--@)\s*(?:\[(\w+)\])?\s*(.*?)\s*\|\s*(.+)$/.exec(line);
    if (!match) return;
    const [,, , rawType, rawMeta, message] = match;
    const meta: Record<string, string> = {};
    for (const [, k, v] of rawMeta.matchAll(/(\w+)=([^\s]+)/g)) meta[k] = v;
    this.panel.webview.postMessage({
      command: 'prefill',
      type: rawType?.toLowerCase() ?? 'note',
      size: meta.size ? parseInt(meta.size) : 13,
      font: meta.font ?? 'mono',
      color: meta.color ?? '#97c459',
      align: meta.align ?? 'left',
      message,
    });
  }

  private async handleWebviewMessage(msg: any) {
    if (msg.command !== 'insert') return;

    const editor = this.lastCodeEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Remarq: open a code file first, then press Ctrl+Shift+R.');
      return;
    }

    const prefix = getPrefixForLanguage(editor.document.languageId);
    const cursorLine = this.lastCursorLine;
    const currentLine = editor.document.lineAt(cursorLine).text;
    const isExistingRemarq = /^(\s*)(\/\/@|#@|--@)/.test(currentLine);

    let message = msg.message ?? '';
    if (!message) {
      const m = /\|\s*(.+)$/.exec(currentLine);
      message = m ? m[1].trim() : '';
    }
    if (!message) {
      message = await vscode.window.showInputBox({
        prompt: 'Enter your comment text',
        placeHolder: 'e.g. this function assumes sorted input',
      }) ?? '';
    }
    if (!message) return;

    const newLine = buildRemarqLine(prefix, msg.type, msg.size, msg.font, msg.color, msg.align, message);

    const doc = await vscode.window.showTextDocument(editor.document, vscode.ViewColumn.One, false);
    await doc.edit(editBuilder => {
      if (isExistingRemarq) {
        editBuilder.replace(editor.document.lineAt(cursorLine).range, newLine);
      } else {
        editBuilder.insert(new vscode.Position(cursorLine, 0), newLine + '\n');
      }
    });
  }
}