import * as vscode from 'vscode';
import { parseDocument } from './parser';
import { applyDecorations, clearDecorations } from './decorator';
import { RemarqToolbar } from './toolbarManager';
import { RemarqHoverProvider } from './hoverProvider';

let timeout: NodeJS.Timeout | undefined;
let toolbar: RemarqToolbar;

function triggerUpdate(editor: vscode.TextEditor) {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
   const comments = parseDocument(editor.document);
    applyDecorations(editor, comments);
  }, 200);
}

// edit message inline via input box
async function editRemarqUnderCursor(editor: vscode.TextEditor) {
  const line = editor.selection.active.line;
  const lineText = editor.document.lineAt(line).text;
  if (!/^(\s*)(\/\/@|#@|--@)/.test(lineText)) return;

  // extract current message
  const msgMatch = /\|\s*(.+)$/.exec(lineText);
  const currentMsg = msgMatch ? msgMatch[1].trim() : '';

  const newMsg = await vscode.window.showInputBox({
    prompt: 'Edit comment text',
    value: currentMsg,
    valueSelection: [0, currentMsg.length],
  });

  if (newMsg === undefined) return; // cancelled
  if (newMsg === currentMsg) return; // unchanged

  // replace just the message part after |
  const newLine = lineText.replace(/\|\s*.+$/, `| ${newMsg}`);
  await editor.edit(eb => {
    eb.replace(editor.document.lineAt(line).range, newLine);
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Remarq activated');
  toolbar = new RemarqToolbar(context);

  if (vscode.window.activeTextEditor) {
    triggerUpdate(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) triggerUpdate(editor);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        triggerUpdate(editor);
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(e => {
      const line = e.textEditor.document.lineAt(e.selections[0].active.line).text;
      if (/^(\s*)(\/\/@|#@|--@)/.test(line)) {
        toolbar.prefillFromLine(line);
      }
    })
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { scheme: 'file' },
      new RemarqHoverProvider()
    )
  );

  // Ctrl+Shift+R — open toolbar
  context.subscriptions.push(
    vscode.commands.registerCommand('remarq.openToolbar', () => {
      toolbar.show();
    })
  );
context.subscriptions.push(
  vscode.commands.registerCommand('remarq.deleteLine', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const line = editor.selection.active.line;
    const lineText = editor.document.lineAt(line).text;
    if (!/^(\s*)(\/\/@|#@|--@)/.test(lineText)) return;
    await editor.edit(eb => {
      const fullLine = editor.document.lineAt(line);
      // delete the line including the newline character
      const deleteRange = editor.document.lineAt(line).rangeIncludingLineBreak;
      eb.delete(deleteRange);
    });
  })
);
  // Ctrl+Shift+E — quick edit message on current remarq line
  context.subscriptions.push(
    vscode.commands.registerCommand('remarq.editMessage', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) await editRemarqUnderCursor(editor);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('remarq.toggle', () => {
      clearDecorations();
      vscode.window.showInformationMessage('Remarq: decorations cleared. Edit file to re-apply.');
    })
  );
}

export function deactivate() {
  clearDecorations();
}