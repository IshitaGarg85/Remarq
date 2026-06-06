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
exports.applyDecorations = applyDecorations;
exports.clearDecorations = clearDecorations;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
// cache decoration types so we don't recreate them every keystroke
const decorationCache = new Map();
function getCacheKey(c) {
    return `${c.type}-${c.color}-${c.fontSize}-${c.font}-${c.bold}-${c.italic}`;
}
function getOrCreateDecoration(c) {
    const key = getCacheKey(c);
    if (decorationCache.has(key))
        return decorationCache.get(key);
    const defaults = types_1.TYPE_DEFAULTS[c.type];
    const color = c.color ?? defaults.color;
    const bg = defaults.bg;
    const fontSize = c.fontSize ?? 13;
    const fontFamily = c.font === 'serif'
        ? 'Georgia, serif'
        : c.font === 'sans'
            ? '-apple-system, sans-serif'
            : "'Fira Code', 'Cascadia Code', monospace";
    const dec = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: bg,
        borderRadius: '6px',
        before: {
            contentText: `  ${defaults.label}  `,
            color: color,
            backgroundColor: bg,
            fontStyle: 'normal',
            fontWeight: '500',
            textDecoration: `none; font-family: -apple-system, sans-serif; letter-spacing: 0.06em; text-transform: uppercase;`,
        },
        after: {
        // empty — we use the line replacement below
        },
        textDecoration: `none; display: none;`, // hides the raw syntax
        color: color,
        fontStyle: c.italic ? 'italic' : 'normal',
        fontWeight: c.bold ? '700' : '400',
    });
    decorationCache.set(key, dec);
    return dec;
}
function applyDecorations(editor, comments) {
    // group comments by their decoration type
    const groups = new Map();
    for (const c of comments) {
        const dec = getOrCreateDecoration(c);
        if (!groups.has(dec))
            groups.set(dec, []);
        const range = new vscode.Range(c.lineNumber, c.startChar, c.lineNumber, c.endChar);
        const defaults = types_1.TYPE_DEFAULTS[c.type];
        const color = c.color ?? defaults.color;
        groups.get(dec).push({
            range,
            renderOptions: {
                after: {
                    contentText: `  ${c.message}`,
                    color: color,
                    fontStyle: c.italic ? 'italic' : 'normal',
                    fontWeight: c.bold ? '700' : '400',
                },
            },
        });
    }
    for (const [dec, opts] of groups) {
        editor.setDecorations(dec, opts);
    }
}
function clearDecorations() {
    for (const dec of decorationCache.values())
        dec.dispose();
    decorationCache.clear();
}
//# sourceMappingURL=decorator.js.map