"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = parseDocument;
const types_1 = require("./types");
// matches: //@ or #@ or --@ at start of trimmed line
const REMARQ_REGEX = /^(\s*)(\/\/@|#@|--@)\s*(?:\[(\w+)\])?\s*(.*?)\s*\|\s*(.+)$/;
function parseDocument(document) {
    const results = [];
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const match = REMARQ_REGEX.exec(line.text);
        if (!match)
            continue;
        const [, indent, , rawType, rawMeta, message] = match;
        const type = rawType?.toLowerCase() in types_1.TYPE_DEFAULTS
            ? rawType.toLowerCase()
            : 'custom';
        // parse key=value pairs from meta string
        const meta = {};
        const metaPairs = rawMeta.matchAll(/(\w+)=([^\s]+)/g);
        for (const [, key, val] of metaPairs) {
            meta[key] = val;
        }
        results.push({
            type,
            message: message.trim(),
            color: meta.color,
            fontSize: meta.size ? parseInt(meta.size) : undefined,
            font: meta.font,
            bold: 'bold' in meta || meta.bold === 'true',
            italic: 'italic' in meta || meta.italic === 'true',
            lineNumber: i,
            startChar: indent.length,
            endChar: line.text.length,
        });
    }
    return results;
}
//# sourceMappingURL=parser.js.map