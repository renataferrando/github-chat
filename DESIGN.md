# Design system

## Tokens — two files, two jobs

- `app/globals.css` — CSS tokens via `@theme`. Anything that becomes a Tailwind utility class (colors, font sizes, radii).
- `src/lib/tokens.ts` — runtime constants consumed by JS code only (avatar palette + per-user overrides). Not Tailwind-related.
- Rule: referenced in className → globals.css; referenced in JS → tokens.ts.

## Semantic colors

| Token       | Meaning                            |
|-------------|------------------------------------|
| `accent`    | AI / Copilot only                  |
| `link`      | Repos, usernames, hyperlinks       |
| `success`   | Active / done / positive delta     |
| `warning`   | Compute steps                      |
| `danger`    | Destructive / negative delta       |
| `fg`        | Primary text                       |
| `fg-dim`    | Secondary text                     |
| `fg-faint`  | Tertiary text / labels / metadata  |

## Typography

- **Inter** (`font-sans`) — narrative text, UI copy.
- **JetBrains Mono** (`font-mono`) — code, IDs, timestamps, metadata, scope chips, keyboard shortcuts.

## Radius

`rounded-sm` 4px · `rounded-md` 6px · `rounded-lg` 8px · `rounded-full` 999px.

## Spacing

Default Tailwind scale (no custom tokens).
