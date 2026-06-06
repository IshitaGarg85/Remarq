# Remarq

**Rich styled comment annotations for VS Code.** Write notes in your code with custom color, font, and size — without changing your syntax or adding any new file formats.

---

## Get started in 10 seconds

1. Press `Ctrl+Shift+R` anywhere in your code file
2. Pick a type, color, font, and size from the toolbar
3. Hit **Insert** — done

No syntax to memorize. No config files. Just open the toolbar and annotate.

---

## What it looks like

Each comment type has its own color and label:

| Type | Color | Use it for |
|------|-------|------------|
| `note` | 🟢 Green | General notes, reminders, context |
| `warn` | 🟡 Amber | Gotchas, edge cases, things that can break |
| `imp` | 🔴 Pink | Critical lines, never-touch-this, blockers |
| `todo` | 🟣 Purple | Tasks, follow-ups, things left to do |
| `research` | 🔵 Blue | Open questions, things to investigate |

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+R` | Open toolbar — insert or restyle a comment |
| `Ctrl+Shift+E` | Edit the message text of the current comment |
| `Ctrl+Shift+D` | Delete the current comment line |

Right-click in the editor to access all commands from the context menu.

---

## The toolbar

Press `Ctrl+Shift+R` to open the visual toolbar on the right side of your editor.

- **Type** — note, warn, imp, todo, research
- **Align** — left, center, right
- **Size** — font size for the message
- **Font** — Mono, Sans, or Serif
- **Color** — 7 presets or any custom hex via the color picker

Hit **Insert** and the line appears above your cursor. No typing required.

When your cursor is already on a remarq line, the toolbar auto-fills with its current settings — change what you want and hit Insert to update it.

---

## The syntax (for those who want to type it directly)

```python
#@ [warn] | timestamp drift > 1000ms will break auth
#@ [note] font=serif size=15 | returns early if cache hit
#@ [imp] color=#ff6b6b | never remove this line
#@ [todo] | add retry logic with exponential backoff
#@ [research] align=center | is this O(n) or O(n log n)?
```

```javascript
//@ [warn] | don't call this before auth is initialized
//@ [note] | handles both market and limit order types
```

```sql
--@ [imp] | this index is critical — do not drop it
--@ [todo] | optimize this join for large datasets
```

Format: `<prefix> [type] key=value ... | your message`

| Option | Values |
|--------|--------|
| `size` | any number, e.g. `size=16` |
| `font` | `mono` `sans` `serif` |
| `color` | any hex, e.g. `color=#ff6b6b` |
| `align` | `left` `center` `right` |

---

## Hover preview

Hover over any remarq line to see a styled popup with the label and message — useful when decorations are small or the line is hard to read.

---

## Supported languages

| Language | Prefix |
|----------|--------|
| Python, Shell, Ruby, R | `#@` |
| JavaScript, TypeScript, C, C++, Java, Go, Rust | `//@` |
| SQL, Lua, Haskell | `--@` |

Any other language falls back to `//@`.

---

## How it works

The decoration is visual only. The raw syntax is still valid code — it's just a comment. Teammates without Remarq installed see a normal comment. Nothing breaks, nothing changes in your actual file.

---

## License

MIT
