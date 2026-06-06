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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const parser_1 = require("./parser");
const decorator_1 = require("./decorator");
const toolbarManager_1 = require("./toolbarManager");
let timeout;
let toolbar;
function triggerUpdate(editor) {
    if (timeout)
        clearTimeout(timeout);
    timeout = setTimeout(() => {
        const comments = (0, parser_1.parseDocument)(editor.document);
        (0, decorator_1.applyDecorations)(editor, comments);
    }, 200);
}
function activate(context) {
    console.log('Remarq activated');
    toolbar = new toolbarManager_1.RemarqToolbar(context);
    // decorate on open
    if (vscode.window.activeTextEditor) {
        triggerUpdate(vscode.window.activeTextEditor);
    }
    // decorate on file switch
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor)
            triggerUpdate(editor);
    }));
    // decorate as you type
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            triggerUpdate(editor);
        }
    }));
    // when cursor moves, check if it's on an existing remarq line and prefill toolbar
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => {
        const line = e.textEditor.document.lineAt(e.selections[0].active.line).text;
        if (/^(\s*)(\/\/@|#@|--@)/.test(line)) {
            toolbar.prefillFromLine(line);
        }
    }));
    // command: open toolbar (Ctrl+Shift+R)
    context.subscriptions.push(vscode.commands.registerCommand('remarq.openToolbar', () => {
        toolbar.show();
    }));
    // command: toggle decorations
    context.subscriptions.push(vscode.commands.registerCommand('remarq.toggle', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        (0, decorator_1.clearDecorations)();
        vscode.window.showInformationMessage('Remarq: decorations cleared. Edit file to re-apply.');
    }));
}
function deactivate() {
    (0, decorator_1.clearDecorations)();
}
//# sourceMappingURL=extension.js.map