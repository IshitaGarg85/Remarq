import * as vscode from 'vscode';
import { parseDocument } from './parser';
import { TYPE_DEFAULTS } from './types';

export class RemarqHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const comments = parseDocument(document);
    const comment = comments.find(c => c.lineNumber === position.line);
    if (!comment) return undefined;

    const defaults = TYPE_DEFAULTS[comment.type];
    const color = comment.color ?? defaults.color;

    // build a markdown hover card
    const md = new vscode.MarkdownString('', true);
    md.isTrusted = true;
    md.supportHtml = true;

    md.appendMarkdown(
      `<div style="padding:6px 10px; border-left: 3px solid ${color};">`+
      `<span style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.07em; color:${color};">${defaults.label}</span>`+
      `<br/>`+
      `<span style="font-size:${comment.fontSize ?? 13}px; color:${color}; font-weight:${'400'}; font-style:${'normal'};">`+
      `${comment.message}`+
      `</span>`+
      `</div>`
    );

    const range = new vscode.Range(position.line, 0, position.line, document.lineAt(position.line).text.length);
    return new vscode.Hover(md, range);
  }
}