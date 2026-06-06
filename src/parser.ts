import * as vscode from 'vscode';
import { RemarqComment, RemarqType, RemarqAlign, TYPE_DEFAULTS } from './types';

const REMARQ_REGEX = /^(\s*)(\/\/@|#@|--@)\s*(?:\[(\w+)\])?\s*(.*?)\s*\|\s*(.+)$/;

export function parseDocument(document: vscode.TextDocument): RemarqComment[] {
  const results: RemarqComment[] = [];

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const match = REMARQ_REGEX.exec(line.text);
    if (!match) continue;

    const [, indent, , rawType, rawMeta, message] = match;
    const type = rawType?.toLowerCase() in TYPE_DEFAULTS
      ? (rawType.toLowerCase() as RemarqType)
      : 'custom';

    const meta: Record<string, string> = {};
    for (const [, key, val] of rawMeta.matchAll(/(\w+)=([^\s]+)/g)) {
      meta[key] = val;
    }

    const align = (['left','center','right'].includes(meta.align ?? ''))
      ? meta.align as RemarqAlign
      : 'left';

    results.push({
      type,
      message: message.trim(),
      color: meta.color,
      fontSize: meta.size ? parseInt(meta.size) : undefined,
      font: meta.font as any,
      align,
      lineNumber: i,
      startChar: indent.length,
      endChar: line.text.length,
    });
  }

  return results;
}