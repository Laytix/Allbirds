# Product Page Rich Details & Accordions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Carbon Footprint badge, a Size & Fit Guide modal, and modular collapsible Allbirds accordions to the product page's sticky info card.

**Architecture:** Global UI state in `assets/alpine-stores.js` ($store.ui.sizeGuideOpen) drives a standalone modal snippet rendered in `layout/theme.liquid`. `sections/product.liquid` hosts section blocks (`type: "accordion"`) with metafield → page → richtext fallback and CSS-grid collapse animation. `templates/product.json` is pre-populated with the 4 default blocks.

**Tech Stack:** Shopify Liquid (OS 2.0), Alpine.js v3, Tailwind CSS v4 (build step), vanilla CSS in section `{% stylesheet %}` + `assets/custom.css`.

**Spec:** `docs/superpowers/specs/2026-09-02-product-page-rich-details-design.md`

## Global Constraints

- Preserve the existing `productForm` Alpine component in `assets/alpine-stores.js` — only touch the `Alpine.store('ui')` block.
- NEVER edit `assets/application.css` (Tailwind CLI output). Custom styles go in `sections/product.liquid` `{% stylesheet %}` or `assets/custom.css`.
- Match the Allbirds design language: mono accents (`var(--font-mono, ui-monospace, monospace)`), 1px `color-mix(in srgb, var(--color-foreground) N%, transparent)` borders, pill radius `9999px`, muted opacity/color-mix text.
- Accordion content resolution order: metafield (`product.metafields.custom[metafield_key]`) → page (`block.settings.page_content.content`) → richtext (`block.settings.content`).
- Modal must close via backdrop click, ESC key, and close button; must set `aria-modal="true"`.
- Commit ONLY the files listed in the task — the repo has unrelated uncommitted changes that must NOT be staged.
- No test infrastructure exists (no test/lint/typecheck scripts) — verification is `npm run build` + manual/markup checks.

---

### Task 1: UI store state (`assets/alpine-stores.js`)

**Files:**
- Modify: `assets/alpine-stores.js` (the `Alpine.store('ui', {...})` block near lines 172–198)

**Interfaces:**
- Produces: `$store.ui.sizeGuideOpen` (Boolean, default false); `closeAll()` resets it.

- [ ] **Step 1: Add `sizeGuideOpen: false,` after `cartPopOpen: false,` in `Alpine.store('ui', {...})`**

- [ ] **Step 2: Add `this.sizeGuideOpen = false;` inside `closeAll()` (after the `cartPopOpen` line)**

- [ ] **Step 3: Verify** — file parses as JS (e.g. `node -e "require('fs').readFileSync('assets/alpine-stores.js','utf8'); new Function(require('fs').readFileSync('assets/alpine-stores.js','utf8'));"` or `node --check` equivalent); confirm `productForm` component untouched.

- [ ] **Step 4: Commit** — `git add assets/alpine-stores.js && git commit -m "feat(product): add sizeGuideOpen state to ui store"`

### Task 2: Size guide modal snippet (`snippets/size-guide-modal.liquid`)

**Files:**
- Create: `snippets/size-guide-modal.liquid`

**Interfaces:**
- Consumes: `$store.ui.sizeGuideOpen`, `$store.ui.closeAll()` (from Task 1)
- Produces: `.size-guide-modal` root with BEM children `__dialog`, `__header`, `__title`, `__subtitle`, `__close`, `__tip`, `__tip-icon`, `__tabs`, `__tab` (+ `is-active`), `__table-scroller`, `__table`, `__footer`, `__footer-text`

- [ ] **Step 1: Create the snippet** — Alpine-driven overlay: root `x-data="{ gender: 'men' }"`, `x-show="$store.ui.sizeGuideOpen"`, `x-cloak`, fade transitions, `@click.self="$store.ui.closeAll()"`, `@keydown.escape.window="$store.ui.sizeGuideOpen && $store.ui.closeAll()"`, `role="dialog"` `aria-modal="true"` `aria-labelledby="size-guide-title"`. Dialog with scale transition + `@click.stop`. Header: title "Size & Fit Guide" (`id="size-guide-title"`), subtitle, round close button (`@click="$store.ui.closeAll()"`).
- [ ] **Step 2: Fit tip callout** — `💡 Fit Tip: Our shoes run true to size. If you wear a half size or have a wider foot, we recommend sizing up to the next full size for optimal comfort.`
- [ ] **Step 3: Tab toggle** — `role="tablist"` with two `role="tab"` buttons "Men's Sizing" / "Women's Sizing", `:class="gender === 'men' && 'is-active'"`, `:aria-selected`, `@click="gender = 'men'"` / `'women'`.
- [ ] **Step 4: Tables** — `__table-scroller` wraps two `__table` tables, `x-show="gender === 'men'"` and `x-show="gender === 'women'" x-cloak`.
  Men's columns: US Men | US Women | UK | EU | CM (Foot Length). Rows: 8/9.5/7/41/26.0 · 8.5/10/7.5/41.5/26.5 · 9/10.5/8/42/27.0 · 9.5/11/8.5/42.5/27.5 · 10/11.5/9/43/28.0 · 10.5/12/9.5/44/28.5 · 11/12.5/10/44.5/29.0 · 11.5/13/10.5/45/29.5 · 12/13.5/11/45.5/30.0 · 13/14.5/12/47/31.0 · 14/15.5/13/48.5/32.0 (cm values suffixed " cm").
  Women's columns: US Women | US Men | UK | EU | CM (Foot Length). Rows: 5/3.5/3/35/22.0 · 5.5/4/3.5/35.5/22.5 · 6/4.5/4/36/23.0 · 6.5/5/4.5/36.5/23.5 · 7/5.5/5/37.5/24.0 · 7.5/6/5.5/38/24.5 · 8/6.5/6/38.5/25.0 · 8.5/7/6.5/39/25.5 · 9/7.5/7/40/26.0 · 9.5/8/7.5/40.5/26.5 · 10/8.5/8/41/27.0 · 11/9.5/9/42.5/28.0.
- [ ] **Step 5: Footer** — `Still unsure? Try them risk-free for 30 days. If the fit isn't right, return or exchange for free.`
- [ ] **Step 6: Commit** — `git add snippets/size-guide-modal.liquid && git commit -m "feat(product): size guide modal snippet"`

### Task 3: Modal styles (`assets/custom.css`) + render in layout (`layout/theme.liquid`)

**Files:**
- Modify: `assets/custom.css` (append)
- Modify: `layout/theme.liquid` (after `{% render 'cart-pop' %}`)

**Interfaces:**
- Consumes: Task 2's BEM class names.
- Produces: styled modal; global `{% render 'size-guide-modal' %}`.

- [ ] **Step 1: Append a `/* ===== Size Guide Modal — snippets/size-guide-modal.liquid ===== */` section to `assets/custom.css`** implementing: fixed overlay `inset: 0; z-index: 75; background: rgba(0,0,0,0.45); backdrop-filter: blur(2px); flex-center; padding 1.5rem`; dialog `max-width: 580px; max-height: 90vh; column flex; #fff; radius 1rem; shadow 0 20px 48px rgba(0,0,0,0.16); overflow hidden`; header flex with bottom divider (8% color-mix), serif title `Georgia, 'Times New Roman', serif` `1.375rem/500`, muted `0.8125rem` subtitle, round 2.25rem close button with hover tint; tip callout (4% tint bg, `0.5rem` radius, `0.8125rem` text); pill tabs (mono uppercase `0.75rem/600`, 1px border, `is-active` = inverted fill like `.product-option__pill input:checked + span`); table scroller `max-height: 45vh` overflow-y auto with padding `0.5rem 1.75rem 1rem`; table `border-collapse: collapse; font-size 0.8125rem; text-align left`, sticky mono uppercase `th` (0.6875rem, bottom border 15%, white bg), `td` `0.625rem 0.5rem` with 6% bottom borders, last row no border; footer with top divider + 2% tint bg, centered `0.75rem` muted text.
- [ ] **Step 2: In `layout/theme.liquid`**, add `{% render 'size-guide-modal' %}` immediately after `{% render 'cart-pop' %}`.
- [ ] **Step 3: Verify** — CSS braces balanced; layout renders snippet.
- [ ] **Step 4: Commit** — `git add assets/custom.css layout/theme.liquid && git commit -m "feat(product): size guide modal styles + layout render"`

### Task 4: Product section upgrade (`sections/product.liquid`)

**Files:**
- Modify: `sections/product.liquid` (markup, `{% stylesheet %}`, `{% schema %}`)

**Interfaces:**
- Consumes: `$store.ui.sizeGuideOpen` (Task 1); modal trigger opens Task 2's modal.
- Produces: `.product-info__carbon`, `.product-option__header`, `.product-option__size-guide-btn`, `.product-accordions`, `.product-accordion`, `__header`, `__title`, `__icon` (+ `is-open`), `__collapse` (+ `is-expanded`), `__inner`, `__content` classes; schema settings `show_carbon_footprint`, `carbon_footprint_default`; block type `accordion` with settings `title`, `content`, `page_content`, `metafield_key`, `default_open`; section presets with the 4 Allbirds blocks.

- [ ] **Step 1: Carbon badge** — after the `.product-info__price` `<p>`, add: liquid assign `carbon_val = product.metafields.custom.carbon_footprint | default: section.settings.carbon_footprint_default`; if `section.settings.show_carbon_footprint` and `carbon_val != blank`, render `.product-info__carbon` with `🌱` icon span + `Carbon Footprint: {{ carbon_val | escape }}`.
- [ ] **Step 2: Size option header** — inside the options loop, extend the existing `{% liquid %}` assignment block with `assign is_size = false; if option_name_lower == 'size'; assign is_size = true; endif`. Wrap the existing `<legend>` in `<div class="product-option__header">` and, when `is_size`, append the trigger button: `type="button"`, `class="product-option__size-guide-btn"`, `@click="$store.ui.sizeGuideOpen = true"`, `aria-haspopup="dialog"`, text `Size Guide`. Close the wrapper div where the fieldset's label row ends (keep swatch/pill markup unchanged).
- [ ] **Step 3: Accordions** — after the shipping-note conditional, inside `.product-info`, render when `section.blocks.size > 0`: container `.product-accordions`, loop `section.blocks` where `block.type == 'accordion'`; resolve content per Global Constraints order in a `{% liquid %}` block; skip if title or resolved content blank; each item: `x-data="{ isOpen: {{ block.settings.default_open | json }} }"`, `{{ block.shopify_attributes }}`, header `<button>` (`@click="isOpen = !isOpen"`, `:aria-expanded="isOpen"`) with mono title span + chevron `<svg class="product-accordion__icon" :class="isOpen && 'is-open'">` (polyline `6 9 12 15 18 9`); collapse div `:class="isOpen && 'is-expanded'"` wrapping `__inner` > `__content rte` with `{{ accordion_content }}`.
- [ ] **Step 4: Stylesheet** — append to the existing `{% stylesheet %}`: carbon badge (mono pill, 4% bg, 10% border, `margin-top: -0.5rem; align-self: flex-start`); option header flex `align-items: baseline; justify-content: space-between`; size-guide btn (mono uppercase 0.6875rem/500, underline offset 3px, no bg/border, 70% color-mix → full on hover); accordions column flex with 10% top border, per-item bottom border; header button (full width, `1rem 0` padding, no bg/border, text-left); title mono `0.75rem/600` uppercase `0.12em` letter-spacing; icon rotate 180° `.is-open` with `0.25s cubic-bezier(0.4, 0, 0.2, 1)`; collapse `display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);` → `1fr` on `.is-expanded`; inner `overflow: hidden`; content `padding-bottom: 1.25rem; font-size: 0.875rem; line-height: 1.6; color: color-mix(in srgb, var(--color-foreground) 80%, transparent)`.
- [ ] **Step 5: Schema** — settings: add `show_carbon_footprint` checkbox (default true) and `carbon_footprint_default` text (default `"5.4 kg CO2e"`) before existing `shipping_note`. Add `"blocks": [{ "type": "accordion", "name": "Accordion Item", settings: title (text, default "Highlights"), content (richtext, default "<p>Ultra-breathable natural materials engineered for all-day comfort and lightweight movement.</p>"), page_content (page), metafield_key (text, info mentions product.metafields.custom), default_open (checkbox, default false) }]`. Add `"presets": [{ "name": "Default Product", "blocks": [...4 blocks...] }]` with exact Allbirds copy from the spec file `docs/superpowers/specs/2026-09-02-product-page-rich-details-design.md` §3 (Highlights / Materials & Sustainability / Care Guide / Shipping & Free Returns). Keep `disabled_on` unchanged.
- [ ] **Step 6: Verify** — schema JSON valid; all Liquid `{%- if -%}`/`{%- for -%}`/`{% endstylesheet %}`/`{% endschema %}` tags balanced.
- [ ] **Step 7: Commit** — `git add sections/product.liquid && git commit -m "feat(product): carbon badge, size guide trigger, accordion blocks"`

### Task 5: Default template blocks (`templates/product.json`)

**Files:**
- Modify: `templates/product.json`

**Interfaces:**
- Consumes: Task 4's `accordion` block type.

- [ ] **Step 1: Update the `main` section** — settings: `show_carbon_footprint: true`, `carbon_footprint_default: "5.4 kg CO2e"`, `shipping_note: "Free Shipping on Orders over $100"`; add the 4 accordion blocks (`accordion_highlights`, `accordion_materials`, `accordion_care`, `accordion_shipping`) with the exact Allbirds copy from the spec §3, and `block_order` listing them in that order. Preserve the auto-generated comment header and `"order": ["main"]`.
- [ ] **Step 2: Verify** — file parses as JSON with `node -e "JSON.parse(require('fs').readFileSync('templates/product.json','utf8'))"` — NOTE: the file has a `/* ... */` comment header, so strip comment lines before parsing or validate structure manually.
- [ ] **Step 3: Commit** — `git add templates/product.json && git commit -m "feat(product): default accordion blocks in product template"`

### Task 6: Build & verification

**Files:**
- Run: `npm run build`

- [ ] **Step 1: `npm run build`** — Tailwind compiles cleanly.
- [ ] **Step 2: Markup checks** — `templates/product.json` valid (modulo comment header); Liquid tag balance in `sections/product.liquid` and `snippets/size-guide-modal.liquid`; `{% render 'size-guide-modal' %}` present in `layout/theme.liquid`.
- [ ] **Step 3: Report** — document verification results; no commit expected (unless build output `assets/application.css` changed, then commit it as `chore: rebuild tailwind output`).
