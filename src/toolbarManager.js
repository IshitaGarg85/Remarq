"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemarqToolbar = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// maps comment prefix by language
const COMMENT_PREFIX = {
    python: '#@',
    shellscript: '#@',
    ruby: '#@',
    r: '#@',
    javascript: '//@',
    typescript: '//@',
    javascriptreact: '//@',
    typescriptreact: '//@',
    c: '//@',
    cpp: '//@',
    csharp: '//@',
    java: '//@',
    go: '//@',
    rust: '//@',
    sql: '--@',
    lua: '--@',
    haskell: '--@',
};
function getPrefixForLanguage(langId) {
    return COMMENT_PREFIX[langId] ?? '//@';
}
// builds the raw remarq line from toolbar state
function buildRemarqLine(prefix, type, size, font, color, bold, italic, message) {
    const parts = [];
    if (size !== 13)
        parts.push(`size=${size}`);
    if (font !== 'mono')
        parts.push(`font=${font}`);
    if (color)
        parts.push(`color=${color}`);
    if (bold)
        parts.push(`bold`);
    if (italic)
        parts.push(`italic`);
    const meta = parts.length > 0 ? ` ${parts.join(' ')}` : '';
    return `${prefix} [${type}]${meta} | ${message}`;
}
class RemarqToolbar {
    panel;
    context;
    constructor(context) {
        this.context = context;
    }
    show() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
            return;
        }
        this.panel = vscode.window.createWebviewPanel('remarqToolbar', 'Remarq Toolbar', {
            viewColumn: vscode.ViewColumn.Two,
            preserveFocus: true, // don't steal focus from code editor
        }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'src'))
            ],
        });
        // load HTML from file
        const htmlPath = path.join(this.context.extensionPath, 'src', 'toolbar.html');
        this.panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
        // handle messages FROM the webview
        this.panel.webview.onDidReceiveMessage(msg => this.handleWebviewMessage(msg), undefined, this.context.subscriptions);
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    // pre-fill the toolbar if cursor is already on a remarq line
    prefillFromLine(line) {
        if (!this.panel)
            return;
        // parse existing remarq line
        const match = /^(\s*)(\/\/@|#@|--@)\s*(?:\[(\w+)\])?\s*(.*?)\s*\|\s*(.+)$/.exec(line);
        if (!match)
            return;
        const [, , , rawType, rawMeta, message] = match;
        const meta = {};
        for (const [, k, v] of rawMeta.matchAll(/(\w+)=([^\s]+)/g))
            meta[k] = v;
        this.panel.webview.postMessage({
            command: 'prefill',
            type: rawType?.toLowerCase() ?? 'note',
            size: meta.size ? parseInt(meta.size) : 13,
            font: meta.font ?? 'mono',
            color: meta.color ?? '#97c459',
            bold: 'bold' in meta,
            italic: 'italic' in meta,
            message,
        });
    }
    async handleWebviewMessage(msg) {
        if (msg.command !== 'insert')
            return;
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Remarq: no active editor. Click into your code file first.');
            return;
        }
        const langId = editor.document.languageId;
        const prefix = getPrefixForLanguage(langId);
        const cursor = editor.selection.active;
        const currentLine = editor.document.lineAt(cursor.line).text;
        // detect if cursor is ON an existing remarq line — replace it
        const isExistingRemarq = /^(\s*)(\/\/@|#@|--@)/.test(currentLine);
        // if message is empty, prompt for it
        let message = msg.message ?? '';
        if (!message) {
            // try to extract from existing line
            const m = /\|\s*(.+)$/.exec(currentLine);
            message = m ? m[1].trim() : '';
        }
        if (!message) {
            message = await vscode.window.showInputBox({
                prompt: 'Enter your comment text',
                placeHolder: 'e.g. this function assumes sorted input',
            }) ?? '';
        }
        if (!message)
            return;
        const newLine = buildRemarqLine(prefix, msg.type, msg.size, msg.font, msg.color, msg.bold, msg.italic, message);
        await editor.edit(editBuilder => {
            if (isExistingRemarq) {
                // replace existing line
                const lineRange = editor.document.lineAt(cursor.line).range;
                editBuilder.replace(lineRange, newLine);
            }
            else {
                // insert new line above cursor
                const insertPos = new vscode.Position(cursor.line, 0);
                editBuilder.insert(insertPos, newLine + '\n');
            }
        });
        // refocus the editor after insert
        await vscode.window.showTextDocument(editor.document, vscode.ViewColumn.One);
    }
}
exports.RemarqToolbar = RemarqToolbar;
//# sourceMappingURL=toolbarManager.js.map