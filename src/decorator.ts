import * as vscode from 'vscode';
import { RemarqComment, TYPE_DEFAULTS } from './types';

const activeDecorations: vscode.TextEditorDecorationType[] = [];

export function applyDecorations(
  editor: vscode.TextEditor,
  comments: RemarqComment[]
): void {
  for (const d of activeDecorations) d.dispose();
  activeDecorations.length = 0;

  for (const c of comments) {
    const defaults = TYPE_DEFAULTS[c.type];
    const color = c.color ?? defaults.color;
    const bg = defaults.bg;
    const fontSize = c.fontSize ?? 13;
    const fontFamily = c.font === 'serif'
      ? 'Georgia, serif'
      : c.font === 'sans'
      ? '-apple-system, BlinkMacSystemFont, sans-serif'
      : "Consolas, 'Courier New', monospace";

    const align = c.align ?? 'left';

    // for center and right we create TWO decorations:
    // one for the label (before), one for the message (after on a different range trick)
    // VS Code after is always appended at end of line — we can't truly center/right
    // BUT we can fake it: for center/right, put message in `before` of a zero-width range
    // at a calculated column position using a wide left-margin via textDecoration margin-left

    let afterText = `  ${c.message}`;
    let marginLeft = '0px';

    if (align === 'center') {
      marginLeft = '25vw';
    } else if (align === 'right') {
      marginLeft = '55vw';
    }

    const dec = vscode.window.createTextEditorDecorationType({
      letterSpacing: '-100em',
      color: '#00000000',
      backgroundColor: bg,
      isWholeLine: true,
      borderRadius: '4px',
      before: {
        contentText: ` ${defaults.label}`,
        color: color,
        backgroundColor: bg,
        textDecoration: `none; font-size: 11px; font-family: -apple-system, sans-serif; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;`,
      },
      after: {
        contentText: afterText,
        color: color,
        textDecoration: `none; font-size: ${fontSize}px; font-family: ${fontFamily}; margin-left: ${marginLeft};`,
      },
    });

    activeDecorations.push(dec);
    const range = new vscode.Range(c.lineNumber, c.startChar, c.lineNumber, c.endChar);
    editor.setDecorations(dec, [{ range }]);
  }
}

export function clearDecorations(): void {
  for (const d of activeDecorations) d.dispose();
  activeDecorations.length = 0;
}
