# AGENTS.md — Allbirds Shopify Theme

This file is a compact supplement to the authoritative references already in the repo:
- [`CLAUDE.md`](CLAUDE.md) — full stack, architecture, conventions (~385 lines)
- [`SKILLS.md`](SKILLS.md) — detailed patterns with code examples (~486 lines)

**Read both before editing any file.** This file only flags things agents commonly miss.

## Repository — what to know first

- **Base theme: Horizon v3.3.1** (NOT Dawn). Blocks live in `/blocks/` as standalone files, are nestable up to 8 levels, and accept children via `{% content_for 'blocks' %}`. The `/blocks/` directory has 94 entries — do not add files that duplicate existing block functionality.
- **No test infrastructure.** `package.json` has no test/lint/typecheck scripts. Do not look for or create test suites unless explicitly asked.
- **No CI/CD.** No `.github/` workflows. Deploy is manual: `npm run build && shopify theme push`.
- **No linter/formatter configs** in the repo. `.prettierrc` and `.eslintrc*` are listed in `.shopifyignore` but don't exist. Do not add them unless asked.

## Build & dev commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Runs Tailwind CLI watch + `shopify theme dev` concurrently |
| `npm run dev:tailwind` | Tailwind v4 CLI watch (input→`assets/application.css`) |
| `npm run build` | Tailwind production build (minified output) |
| `npm run deploy` | `build` then `shopify theme push` |

No other commands exist. There is no test runner, no type checker, no linter.

## Tailwind v4 critical details

- **Source**: `tailwind-input.css` (project root). **Output**: `assets/application.css`. **NEVER edit `application.css`** — it's CLI-generated.
- **Preflight (CSS reset) is intentionally disabled.** The import is:
  ```css
  @import "tailwindcss/theme" layer(theme);
  @import "tailwindcss/utilities" layer(utilities);
  ```
  NOT the full `@import "tailwindcss"`. Horizon has its own `base.css` that conflicts with Tailwind's reset.
- **Flowbite plugin** is loaded via `@plugin "flowbite/plugin"` + `@source "../node_modules/flowbite"` in the CSS source (v4 style).
- **Inter font** is loaded via `@import url(...)` from Google Fonts in `tailwind-input.css` — this must stay before all other CSS rules.
- **Tailwind config** (`tailwind.config.js`) scans all `*.liquid`, `assets/**/*.js`, and `node_modules/flowbite/**/*.js`. It has no safelist yet.
- **Dynamic classes** (e.g., `bg-{{ color }}-500`) will be PURGED by Tailwind's static scanner. Use complete class strings or add to `safelist` in config.

## Horizon block architecture gotchas

- **Blocks CANNOT receive variables** (unlike snippets). No `{% render block with ... %}`. Blocks only access `block`, `section`, and global Liquid objects.
- **Section blocks vs theme blocks cannot mix.** A section uses EITHER `"blocks": [{"type": "@theme"}]` (external blocks from `/blocks/`) OR inline `"blocks": [...]` definitions — never both.
- **Private blocks** (prefix `_`) don't appear in the theme editor block picker unless explicitly listed in a parent's schema.
- **Every section and block MUST have a `{% schema %}`** with a `presets` array.

## JavaScript load order (theme.liquid)

Loading order matters and is not obvious:

1. `<head>`: `application.css` (Tailwind output)
2. `<head>`: Flowbite CSS (CDN)
3. `<head>`: Alpine.js CDN (`defer`)
4. `<head>`: `alpine-stores.js` (`defer`) — must load before Alpine initializes, defer preserves order
5. `{{ content_for_header }}` — Shopify required, never remove
6. Before `</body>`: `theme.js` (`defer`)
7. Before `</body>`: Flowbite JS (CDN, no `defer` — loads synchronously)

## After dynamic DOM updates (critical)

When Section Rendering API or block reordering updates the DOM:

- **Alpine.js**: Call `Alpine.initTree(element)` on the new DOM node.
- **Flowbite**: Call `initFlowbite()` to rebind `data-*` attributes.
- **Both are required** — one does not re-init the other.

## Alpine.js stores

Defined in `assets/alpine-stores.js`, loaded before Alpine initializes:

- `$store.cart` — cart fetch/add/update/remove, reactive `count`, `items`, `total`
- `$store.ui` — `mobileMenuOpen`, `cartDrawerOpen`, `searchOpen` with toggle methods

## Upgradeability rule

Create new files for custom code. Never edit Horizon's stock files. If you must modify behavior, extend via a new block/section/snippet that wraps or replaces the Horizon original.

## .shopifyignore

`AGENTS.md`, `CLAUDE.md`, `SKILLS.md`, `*.md`, `.mcp.json`, `setup.sh`, `.claude/`, `package.json`, `tailwind-input.css`, `tailwind.config.js`, `node_modules/` — none of these get uploaded to Shopify.
