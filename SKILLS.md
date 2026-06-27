# SKILLS.md — Shopify Horizon Theme Development with Tailwind CSS, Alpine.js & Flowbite

> Drop this in your project root or reference it from CLAUDE.md.
> This teaches Claude Code the patterns, conventions, and gotchas for this stack.
> **Base theme: Horizon** (NOT Dawn). Horizon uses theme blocks (`/blocks` directory).

---

## Stack Quick Reference

| Tool          | Version | Method     | Purpose                          |
|---------------|---------|------------|----------------------------------|
| Tailwind CSS  | v4      | CLI build  | Utility-first CSS                |
| Alpine.js     | v3      | CDN script | Declarative UI reactivity        |
| Flowbite      | v4      | CDN + npm  | Pre-built Tailwind components    |
| Shopify Liquid| 2.0     | Native     | Server-side templating           |
| Horizon Theme | Latest  | Base theme | Theme blocks, nestable, modern   |

---

## Skill: Creating a New Theme Block (blocks/)

Theme blocks are Horizon's primary building unit. They live in `/blocks` and are reusable across sections.

```liquid
{%- comment -%}
  Block: [block-name]
  Description: [what this block does]
  Usage: Add to any section that accepts @theme blocks
{%- endcomment -%}

<div class="py-4" style="--block-spacing: {{ block.settings.spacing }}px">
  {%- comment -%} Block content here {%- endcomment -%}
</div>

{% stylesheet %}
  /* Scoped styles — auto-deduplicated by Shopify */
{% endstylesheet %}

{% schema %}
{
  "name": "Block Name",
  "settings": [],
  "presets": [
    {
      "name": "Block Name"
    }
  ]
}
{% endschema %}
```

Rules:
- ALWAYS include a `{% schema %}` block with a `presets` array (required for theme editor visibility)
- Use CSS variables for single-property settings, CSS classes for multi-property
- Use `{% stylesheet %}` for scoped CSS (Shopify deduplicates automatically)
- Private blocks: prefix with `_` (e.g., `_slide.liquid`) — only usable where explicitly listed
- Blocks that accept children MUST include `"blocks": [{"type": "@theme"}]` in schema and `{% content_for 'blocks' %}` in markup
- Block filename must be kebab-case: `featured-image.liquid`
- Blocks CANNOT access variables from outside — no Liquid `assign` passthrough like snippets
- Blocks CAN access the `block` and `section` objects, plus all global Liquid objects

## Skill: Creating a New Section (Horizon)

Sections in Horizon accept theme blocks via `@theme` type.

```liquid
{%- comment -%}
  Section: [section-name]
  Description: [what this section does]
{%- endcomment -%}

<section
  class="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
  style="--gap: {{ section.settings.gap }}px"
>
  <div class="flex flex-col" style="gap: var(--gap)">
    {% content_for 'blocks' %}
  </div>
</section>

{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section",
  "settings": [
    {
      "type": "range",
      "id": "gap",
      "label": "Block spacing",
      "min": 0,
      "max": 80,
      "step": 4,
      "unit": "px",
      "default": 16
    }
  ],
  "blocks": [{"type": "@theme"}],
  "presets": [
    {
      "name": "Section Name"
    }
  ]
}
{% endschema %}
```

Rules:
- Use `{% content_for 'blocks' %}` to render child theme blocks
- Use `"blocks": [{"type": "@theme"}]` to accept ALL theme blocks
- To restrict: `"blocks": [{"type": "heading"}, {"type": "text"}, {"type": "@app"}]`
- Sections use EITHER theme blocks OR section blocks — never both
- Include at least one preset for sections addable by merchants
- Use CSS variables (`--gap`, `--padding`, etc.) for settings → CSS mapping

---

## Skill: Using Flowbite Components in Liquid

When integrating Flowbite components, adapt the HTML to use Liquid data:

### Modal Example
```liquid
<button data-modal-target="modal-{{ section.id }}"
        data-modal-toggle="modal-{{ section.id }}"
        class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5">
  {{ section.settings.button_text }}
</button>

<div id="modal-{{ section.id }}" tabindex="-1" aria-hidden="true"
     class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
  <div class="relative p-4 w-full max-w-2xl max-h-full">
    <div class="relative bg-white rounded-lg shadow-sm">
      <div class="flex items-center justify-between p-4 border-b rounded-t">
        <h3 class="text-xl font-semibold text-gray-900">{{ section.settings.modal_title }}</h3>
        <button data-modal-hide="modal-{{ section.id }}" class="text-gray-400 hover:text-gray-900">
          <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
      <div class="p-4">{{ section.settings.modal_content }}</div>
    </div>
  </div>
</div>
```

Key Flowbite patterns:
- Use `section.id` to make IDs unique when multiple sections exist on a page
- Flowbite uses `data-modal-target`, `data-modal-toggle`, `data-modal-hide` attributes
- Flowbite uses `data-dropdown-toggle`, `data-tooltip-target`, `data-accordion` similarly
- All Flowbite interactive components require `flowbite.min.js` loaded before `</body>`

### When Flowbite re-init is needed

After Shopify section rendering API updates the DOM OR when theme blocks are dynamically loaded, Flowbite components lose their bindings. Re-initialize with:

```javascript
// After section/block DOM update
if (typeof initFlowbite === 'function') {
  initFlowbite();
}
```

Note: In Horizon, since blocks are nestable and reorderable, Flowbite re-init is especially important after any theme editor reorder or dynamic content swap.

---

## Skill: Horizon Theme Blocks — Settings Patterns

### Single CSS property → use CSS variables
```liquid
<div class="my-component" style="--gap: {{ block.settings.gap }}px">
  {% content_for 'blocks' %}
</div>

{% stylesheet %}
.my-component { gap: var(--gap); }
{% endstylesheet %}

{% schema %}
{
  "settings": [{
    "type": "range",
    "label": "Gap",
    "id": "gap",
    "min": 0,
    "max": 100,
    "unit": "px",
    "default": 16
  }]
}
{% endschema %}
```

### Multiple CSS properties → use CSS classes
```liquid
{%- comment -%} Layout setting controls multiple properties {%- endcomment -%}
<div class="collection {{ block.settings.layout }}">
  {% content_for 'blocks' %}
</div>

{% stylesheet %}
.collection.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.collection.list { display: flex; flex-direction: column; gap: 0.5rem; }
{% endstylesheet %}

{% schema %}
{
  "settings": [{
    "type": "select",
    "id": "layout",
    "label": "Layout",
    "options": [
      {"value": "grid", "label": "Grid"},
      {"value": "list", "label": "List"}
    ],
    "default": "grid"
  }]
}
{% endschema %}
```

### When to use `{% stylesheet %}` vs Tailwind classes
- **`{% stylesheet %}`**: Use for CSS that depends on dynamic settings via CSS variables. Shopify auto-deduplicates these.
- **Tailwind classes**: Use for static layout and styling that doesn't change per-setting. Better DX, purged in production.
- **Combine both**: Tailwind for base layout + `{% stylesheet %}` for setting-driven dynamic values.

---

## Skill: Alpine.js Patterns in Shopify

### Component-scoped state (inline)
```liquid
<div x-data="{ quantity: 1, maxQty: {{ product.selected_or_first_available_variant.inventory_quantity | default: 99 }} }">
  <button @click="quantity = Math.max(1, quantity - 1)" class="px-3 py-1 border">-</button>
  <input type="number" x-model.number="quantity" :max="maxQty" min="1" class="w-16 text-center border">
  <button @click="quantity = Math.min(maxQty, quantity + 1)" class="px-3 py-1 border">+</button>
</div>
```

### Global store access
```liquid
{%- comment -%} Cart count in header {%- endcomment -%}
<span x-data x-text="$store.cart.count" class="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5"></span>

{%- comment -%} Toggle mobile menu {%- endcomment -%}
<button x-data @click="$store.ui.toggleMobileMenu()" class="lg:hidden">
  <svg>...</svg>
</button>
<nav x-data x-show="$store.ui.mobileMenuOpen" x-transition class="lg:hidden">
  ...
</nav>
```

### Alpine + Liquid data injection
```liquid
<div x-data='{ product: {{ product | json }}, selectedVariant: null }'>
  {%- comment -%} This passes the full Shopify product object to Alpine {%- endcomment -%}
  <template x-for="variant in product.variants" :key="variant.id">
    <button @click="selectedVariant = variant"
            :class="selectedVariant?.id === variant.id ? 'ring-2 ring-blue-500' : ''"
            class="px-3 py-1 border rounded"
            x-text="variant.title">
    </button>
  </template>
</div>
```

### Important Alpine.js rules
- `x-data` MUST be on an ancestor element — Alpine directives only work inside `x-data` scope
- Use `x-data` (empty) when you only need store access: `<div x-data>`
- `x-cloak` hides elements until Alpine initializes — add CSS: `[x-cloak] { display: none !important; }`
- Alpine `x-transition` works great for show/hide animations
- For complex reusable components, register with `Alpine.data('name', () => ({...}))` in `alpine-stores.js`
- Alpine processes the DOM on load — for dynamically injected HTML (section rendering), you may need `Alpine.initTree(element)`

---

## Skill: Tailwind CSS in Liquid Templates

### Responsive patterns
```liquid
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-{{ section.settings.columns }} gap-6">
  {%- for product in collection.products -%}
    <div class="group relative">
      <img src="{{ product.featured_image | image_url: width: 600 }}"
           alt="{{ product.featured_image.alt | escape }}"
           class="w-full aspect-square object-cover rounded-lg group-hover:opacity-75 transition-opacity"
           loading="lazy"
           width="600"
           height="600">
      <h3 class="mt-2 text-sm font-medium text-gray-900">{{ product.title }}</h3>
      <p class="text-sm text-gray-500">{{ product.price | money }}</p>
    </div>
  {%- endfor -%}
</div>
```

### Dynamic classes with Liquid
```liquid
{%- comment -%} Section with configurable background {%- endcomment -%}
{%- case section.settings.bg_color -%}
  {%- when 'white' -%}{% assign bg_class = 'bg-white' %}
  {%- when 'light' -%}{% assign bg_class = 'bg-gray-50' %}
  {%- when 'dark' -%}{% assign bg_class = 'bg-gray-900 text-white' %}
  {%- when 'brand' -%}{% assign bg_class = 'bg-blue-600 text-white' %}
{%- endcase -%}

<section class="py-12 {{ bg_class }}">
  ...
</section>
```

**IMPORTANT**: Tailwind's purge scanner uses static analysis. It cannot detect dynamically constructed class names like `bg-{{ color }}-500`. Always use complete class strings or add them to `safelist` in tailwind.config.js.

### Safelist for dynamic classes
```javascript
// tailwind.config.js
export default {
  safelist: [
    // Add classes that are dynamically constructed in Liquid
    'bg-gray-50',
    'bg-gray-900',
    'text-white',
    // Or use patterns:
    { pattern: /^grid-cols-(1|2|3|4|5|6)$/ },
  ],
}
```

---

## Skill: Section Rendering API (AJAX section updates — Horizon)

When building sections that update without full page reload. In Horizon, since blocks are nested and reorderable, you must re-initialize both Alpine and Flowbite after DOM updates:

```javascript
async function updateSection(sectionId, url) {
  const separator = url.includes('?') ? '&' : '?';
  const response = await fetch(`${url}${separator}section_id=${sectionId}`);
  const html = await response.text();

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const newSection = tempDiv.querySelector(`[id^="shopify-section-"]`) || tempDiv.firstElementChild;
  const oldSection = document.getElementById(`shopify-section-${sectionId}`);

  if (oldSection && newSection) {
    oldSection.innerHTML = newSection.innerHTML;

    // Re-initialize Alpine.js on the updated DOM (critical for nested blocks)
    Alpine.initTree(oldSection);

    // Re-initialize Flowbite on the updated DOM
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }
}
```

---

## Skill: Combining All Three (Tailwind + Alpine + Flowbite)

Example: Product card with quick-view modal

```liquid
{%- for product in collection.products -%}
  <div class="group relative" x-data="{ quickView: false }">
    {%- comment -%} Product image with hover overlay {%- endcomment -%}
    <div class="relative overflow-hidden rounded-lg">
      <img src="{{ product.featured_image | image_url: width: 600 }}"
           alt="{{ product.featured_image.alt | escape }}"
           class="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
           loading="lazy">

      {%- comment -%} Quick view button (shown on hover) {%- endcomment -%}
      <button @click="quickView = true"
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm">
          Quick View
        </span>
      </button>
    </div>

    {%- comment -%} Product info {%- endcomment -%}
    <div class="mt-3">
      <h3 class="text-sm font-medium text-gray-900">
        <a href="{{ product.url }}">{{ product.title }}</a>
      </h3>
      <p class="mt-1 text-sm text-gray-500">{{ product.price | money }}</p>
    </div>

    {%- comment -%} Alpine-powered quick view modal {%- endcomment -%}
    <div x-show="quickView"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         @keydown.escape.window="quickView = false"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
         x-cloak>
      <div @click.outside="quickView = false"
           class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
        <h2 class="text-lg font-semibold">{{ product.title }}</h2>
        <p class="mt-2 text-gray-600">{{ product.description | strip_html | truncate: 150 }}</p>
        <p class="mt-2 text-lg font-bold">{{ product.price | money }}</p>
        <div class="mt-4 flex gap-3">
          <a href="{{ product.url }}"
             class="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            View Product
          </a>
          <button @click="quickView = false"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{%- endfor -%}
```

---

## Decision Guide: When to Use What

| Task                              | Use This         | Why                                              |
|-----------------------------------|------------------|--------------------------------------------------|
| Reusable UI component             | Theme Block      | Lives in `/blocks`, reusable across sections      |
| Full-width page section           | Section          | Sections define page-level layout                 |
| Nestable layout container         | Theme Block      | Blocks nest up to 8 levels with `{% content_for 'blocks' %}` |
| Private/internal component        | `_private.liquid` | Underscore prefix, only where explicitly allowed  |
| Styling / layout                  | Tailwind CSS     | Utility classes, responsive, purged in production |
| Setting-driven dynamic style      | `{% stylesheet %}`| CSS variables + scoped styles, auto-deduplicated  |
| Show/hide toggle                  | Alpine.js        | `x-show` + `x-transition` is simplest            |
| Simple dropdown                   | Flowbite         | `data-dropdown-toggle` — zero JS to write         |
| Complex dropdown with state       | Alpine.js        | When you need `x-data` state logic                |
| Modal (simple)                    | Flowbite         | `data-modal-toggle` is quickest                   |
| Modal (dynamic content/state)     | Alpine.js        | When modal content depends on runtime data        |
| Accordion                         | Flowbite         | `data-accordion` handles it                       |
| Tabs                              | Flowbite         | `data-tabs-toggle` is built-in                    |
| Cart operations                   | Alpine.js store  | Shared state, needs fetch + reactivity            |
| Variant selection                 | Web Component    | Shopify's native pattern, most robust             |
| Predictive search                 | Vanilla JS       | Needs debounce + Section Rendering API            |
| Animations                        | Tailwind + Alpine| Tailwind `transition-*` + Alpine `x-transition`   |
| Tooltips                          | Flowbite         | `data-tooltip-target` — trivial                   |
| Form validation                   | Alpine.js        | Reactive validation state                         |

---

## Gotchas & Troubleshooting

1. **Tailwind classes not applying**: The CLI watcher might have missed a new class. Restart `npm run dev:tailwind` or ensure the file is in the `content` paths in `tailwind.config.js`.

2. **Flowbite components not working after AJAX update**: Call `initFlowbite()` after DOM changes. In Horizon, this is extra important after block reordering.

3. **Alpine.js not working on dynamically added HTML**: Call `Alpine.initTree(newElement)` on the injected DOM node.

4. **`x-data` not recognized**: Make sure Alpine.js CDN script is loaded with `defer` in `<head>` and the element is in the visible DOM (not inside `<template>` without `x-if`).

5. **Tailwind dynamic classes purged**: Never interpolate Liquid variables into class names like `text-{{ color }}-500`. Use complete strings or safelist patterns.

6. **Flowbite + Alpine conflict on same element**: Don't put both `data-modal-toggle` and `@click` handlers on the same button for the same action. Pick one approach per component.

7. **Flash of unstyled Alpine content**: Add `x-cloak` to elements with `x-show` and ensure `[x-cloak] { display: none !important; }` is in your CSS.

8. **Shopify section ID uniqueness**: Always use `{{ section.id }}` or `{{ block.id }}` in HTML `id` attributes to avoid collisions when sections/blocks appear multiple times.

9. **Theme blocks can't receive variables**: Unlike snippets, you CANNOT pass variables into theme blocks with `{% render %}`. Blocks only have access to `block`, `section`, and global Liquid objects.

10. **Section blocks vs theme blocks — can't mix**: A section uses EITHER `"blocks": [{"type": "@theme"}]` (theme blocks from `/blocks`) OR defines blocks inline in its own schema. Never both.

11. **Private blocks ignored by editor**: If a block filename starts with `_`, it won't appear in the block picker unless explicitly listed in a parent's `blocks` schema array.

12. **Horizon CSS conflicts with Tailwind**: Horizon has its own CSS. Tailwind's reset (Preflight) may conflict. If you see style issues, either disable Preflight in `tailwind.config.js` or load Tailwind CSS after Horizon's base CSS and use `!important` sparingly.

13. **Horizon upgrade breaks customizations**: Always create NEW files for custom code. Never edit Horizon's stock files. Track upstream with `git remote add upstream`.

14. **`{% content_for 'blocks' %}` renders nothing**: The section or parent block must have `"blocks": [{"type": "@theme"}]` in its schema, AND the merchant must have added blocks in the theme editor (or the JSON template must include them).
