# Footer Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bare-bones footer with a bold, black, Allbirds-inspired footer featuring brand statement, email newsletter, multi-column navigation (via a new `footer-column` block), social media icons, and a bottom bar with copyright/legal/payment icons.

**Architecture:** The footer section (`sections/footer.liquid`) owns section-level settings (colors, newsletter, social links, bottom bar) and renders `{% content_for 'blocks' %}` in a CSS grid. A new `footer-column` block provides reusable link columns with Alpine.js accordion toggles on mobile. Section colors are passed as CSS custom properties via inline `style` and consumed in scoped `{% stylesheet %}` blocks.

**Tech Stack:** Shopify Liquid, Tailwind CSS v4, Alpine.js v3 (CDN — no Collapse plugin available), Flowbite v4.

## Global Constraints

- **NEVER edit `assets/application.css`** — it is CLI-generated from `tailwind-input.css`.
- **No `x-collapse` available** — Alpine.js CDN build (3.14.9) does not include the Collapse plugin. Use `x-show` + `x-transition` + CSS `display` override instead.
- **Dynamic Tailwind classes must be complete strings** — no Liquid interpolation in class names (e.g., never `bg-{{ color }}-500`).
- **Dynamic colors** (`background_color`, `text_color`, `accent_color`): pass via CSS custom properties on the container, consume in `{% stylesheet %}`.
- **Every block and section MUST have `{% schema %}` + `presets` array** (except the footer section itself, which uses `"default"` for static rendering).
- **Follow existing BEM naming conventions** for scoped CSS classes.
- **Footer is statically rendered** via `footer-group.json` — no section `"presets"` needed (same as header).
- **No edits to Horizon stock files** — only modify our custom files.

---

## File Responsibilities

| File | Action | Responsibility |
|------|--------|----------------|
| `blocks/footer-column.liquid` | **CREATE** | Reusable navigation column block: `heading` (text) + `menu` (link_list). Alpine.js accordion toggle on mobile (`md:` breakpoint). Desktop always shows links. |
| `sections/footer.liquid` | **REWRITE** | Full footer section: all section-level settings, brand statement, newsletter form (`{% form 'customer' %}`), `{% content_for 'blocks' %}` in a responsive grid, social icon SVGs (5 inline), bottom bar (copyright, legal links, payment icons). Scoped styles using CSS custom properties for dynamic colors. |
| `sections/footer-group.json` | **MODIFY** | Default configuration: 3 `footer-column` blocks with placeholder headings "Help", "Shop", "Company", and all section settings set to their defaults. |

---

### Task 1: Create `blocks/footer-column.liquid`

**Files:**
- Create: `blocks/footer-column.liquid`

**Interfaces:**
- Consumes: `block.settings.heading` (text), `block.settings.menu` (link_list — returns `.links` array of `{ title, url }` objects)
- Produces: A `<div>` with `class="footer-column"` and `x-data="{ open: false }"`. Children are: a mobile toggle `<button>`, a desktop `<h3>`, and a `<ul>` link list.

- [ ] **Step 1: Write `blocks/footer-column.liquid`**

```liquid
{%- comment -%}
  Block: footer-column
  Description: Navigation column for the footer with heading and links.
  On mobile (< 768px), collapses into an accordion toggle. On desktop,
  links are always visible.
{%- endcomment -%}

<div
  class="footer-column"
  x-data="{ open: false }"
  {{ block.shopify_attributes }}
>
  <button
    class="footer-column__toggle flex md:hidden w-full items-center justify-between py-3 text-left"
    @click="open = !open"
    :aria-expanded="open"
  >
    <span class="text-sm font-semibold tracking-wider uppercase">
      {{ block.settings.heading }}
    </span>
    <span
      x-text="open ? '\u2212' : '+'"
      class="text-xl font-light transition-transform duration-200"
    ></span>
  </button>

  <h3 class="hidden md:block text-sm font-semibold tracking-wider uppercase mb-4">
    {{ block.settings.heading }}
  </h3>

  <ul
    class="footer-column__links space-y-2"
    x-show="open"
    x-transition:enter="transition ease-out duration-200"
    x-transition:enter-start="opacity-0 -translate-y-1"
    x-transition:enter-end="opacity-100 translate-y-0"
    x-transition:leave="transition ease-in duration-150"
    x-transition:leave-start="opacity-100 translate-y-0"
    x-transition:leave-end="opacity-0 -translate-y-1"
    x-cloak
  >
    {% for link in block.settings.menu.links %}
      <li>
        <a
          href="{{ link.url }}"
          class="text-sm opacity-70 hover:opacity-100 transition-opacity duration-200 no-underline inline-block"
        >
          {{ link.title }}
        </a>
      </li>
    {% endfor %}
  </ul>
</div>

{% stylesheet %}
  .footer-column {
    font-family: var(--font-primary--family, inherit);
  }

  .footer-column__toggle {
    background: none;
    border: none;
    cursor: pointer;
    border-bottom: 1px solid;
    border-color: color-mix(in srgb, currentColor 10%, transparent);
  }

  .footer-column__links {
    list-style: none;
    padding: 0 0 1rem 0;
    margin: 0;
  }

  /* Always show links on desktop regardless of Alpine x-show state */
  @media (min-width: 768px) {
    .footer-column__links {
      display: block !important;
    }
    .footer-column__toggle {
      display: none !important;
    }
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Footer Column",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Column heading",
      "default": "Column"
    },
    {
      "type": "link_list",
      "id": "menu",
      "label": "Column menu"
    }
  ],
  "presets": [
    {
      "name": "Footer Column",
      "category": "Footer"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Commit**

```bash
git add blocks/footer-column.liquid
git commit -m "feat: add footer-column block with mobile accordion"
```

---

### Task 2: Rewrite `sections/footer.liquid`

**Files:**
- Modify: `sections/footer.liquid` (full rewrite — keep nothing from the old file)

**Interfaces:**
- Consumes: Section settings (all defined in schema below). `{% content_for 'blocks' %}` renders `footer-column` blocks plus any `@theme` blocks the merchant adds.
- Produces: A `<footer>` element containing 4 sections — brand statement, newsletter, block grid, social icons, bottom bar.
- External deps: `{% form 'customer' %}` (Shopify native), `payment_type_svg_tag` filter, `shop.enabled_payment_types`, `shop.name`.

- [ ] **Step 1: Write `sections/footer.liquid`**

```liquid
{%- comment -%}
  Section: Footer
  Description: Allbirds-inspired bold black footer with newsletter, dynamic
  navigation columns (via theme blocks), social media icons, and bottom bar.
{%- endcomment -%}

{%- liquid
  assign bg = section.settings.background_color
  assign text = section.settings.text_color
  assign accent = section.settings.accent_color
  assign has_social =
    section.settings.social_instagram != blank
    or section.settings.social_pinterest != blank
    or section.settings.social_facebook != blank
    or section.settings.social_tiktok != blank
    or section.settings.social_youtube != blank
-%}

<footer
  class="site-footer w-full"
  style="--footer-bg: {{ bg }}; --footer-text: {{ text }}; --footer-accent: {{ accent }};"
>
  {%- comment -%} Brand statement {%- endcomment -%}
  {% if section.settings.brand_statement != blank %}
    <div class="px-6 pt-12 pb-4 text-center">
      <p class="site-footer__brand text-lg md:text-xl font-semibold">
        {{ section.settings.brand_statement }}
      </p>
    </div>
  {% endif %}

  {%- comment -%} Newsletter {%- endcomment -%}
  {% if section.settings.show_newsletter %}
    <div
      class="site-footer__newsletter px-6 py-8{% if section.settings.brand_statement == blank %} pt-12{% endif %}"
      x-data="{ newsletterSuccess: false }"
    >
      {% if form.posted_successfully? %}
        <div x-init="newsletterSuccess = true"></div>
      {% endif %}

      <div class="max-w-md mx-auto text-center">
        <h3 class="text-sm font-semibold tracking-wider uppercase mb-4">
          {{ section.settings.newsletter_heading }}
        </h3>

        <div x-show="!newsletterSuccess">
          {% form 'customer' %}
            <input type="hidden" name="contact[tags]" value="newsletter">
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                name="contact[email]"
                class="site-footer__input flex-1 px-4 py-3 text-sm border rounded-none bg-transparent"
                placeholder="{{ 'general.newsletter_form.newsletter_email' | t }}"
                aria-label="{{ 'general.newsletter_form.newsletter_email' | t }}"
                required
              >
              <button
                type="submit"
                class="site-footer__btn px-8 py-3 text-sm font-semibold uppercase tracking-wider border rounded-none transition-colors duration-200"
              >
                {{ 'general.newsletter_form.submit' | t }}
              </button>
            </div>
          {% endform %}
        </div>

        <div x-show="newsletterSuccess" x-cloak class="py-4">
          <p class="text-sm opacity-80">
            {{ section.settings.newsletter_success_message }}
          </p>
        </div>
      </div>
    </div>
  {% endif %}

  {%- comment -%} Divider {%- endcomment -%}
  <div class="site-footer__divider mx-6"></div>

  {%- comment -%} Blocks — footer-column entries + any @theme blocks {%- endcomment -%}
  <div class="px-6 py-10">
    <div class="site-footer__blocks">
      {% content_for 'blocks' %}
    </div>
  </div>

  {%- comment -%} Social media links {%- endcomment -%}
  {% if section.settings.show_social_links and has_social %}
    <div class="site-footer__divider mx-6"></div>
    <div class="px-6 py-8">
      <h3 class="text-sm font-semibold tracking-wider uppercase mb-6 text-center">
        {{ section.settings.social_heading }}
      </h3>
      <div class="flex justify-center gap-5 flex-wrap">
        {% if section.settings.social_instagram != blank %}
          <a
            href="{{ section.settings.social_instagram }}"
            target="_blank"
            rel="noopener noreferrer"
            class="site-footer__social-icon transition-transform duration-200 hover:scale-110"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        {% endif %}
        {% if section.settings.social_pinterest != blank %}
          <a
            href="{{ section.settings.social_pinterest }}"
            target="_blank"
            rel="noopener noreferrer"
            class="site-footer__social-icon transition-transform duration-200 hover:scale-110"
            aria-label="Pinterest"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="16"></line>
            </svg>
          </a>
        {% endif %}
        {% if section.settings.social_facebook != blank %}
          <a
            href="{{ section.settings.social_facebook }}"
            target="_blank"
            rel="noopener noreferrer"
            class="site-footer__social-icon transition-transform duration-200 hover:scale-110"
            aria-label="Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        {% endif %}
        {% if section.settings.social_tiktok != blank %}
          <a
            href="{{ section.settings.social_tiktok }}"
            target="_blank"
            rel="noopener noreferrer"
            class="site-footer__social-icon transition-transform duration-200 hover:scale-110"
            aria-label="TikTok"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
            </svg>
          </a>
        {% endif %}
        {% if section.settings.social_youtube != blank %}
          <a
            href="{{ section.settings.social_youtube }}"
            target="_blank"
            rel="noopener noreferrer"
            class="site-footer__social-icon transition-transform duration-200 hover:scale-110"
            aria-label="YouTube"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"></path>
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
            </svg>
          </a>
        {% endif %}
      </div>
    </div>
  {% endif %}

  {%- comment -%} Bottom bar — copyright, legal, payment icons {%- endcomment -%}
  <div class="site-footer__divider mx-6"></div>
  <div class="px-6 py-6">
    <div class="site-footer__bottom flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-60">
      <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
        <span>
          {%- if section.settings.copyright_text != blank -%}
            {{ section.settings.copyright_text }}
          {%- else -%}
            &copy; {{ 'now' | date: '%Y' }} {{ shop.name }}
          {%- endif -%}
        </span>

        {% if section.settings.legal_menu != blank %}
          <div class="flex items-center gap-2 md:gap-4">
            {% for link in section.settings.legal_menu.links %}
              <a
                href="{{ link.url }}"
                class="hover:opacity-100 transition-opacity duration-200 no-underline"
              >
                {{ link.title }}
              </a>
            {% endfor %}
          </div>
        {% endif %}
      </div>

      {% if section.settings.show_payment_icons %}
        <div class="site-footer__payment flex flex-wrap justify-center gap-2">
          {% for type in shop.enabled_payment_types %}
            {{ type | payment_type_svg_tag }}
          {% endfor %}
        </div>
      {% endif %}
    </div>
  </div>
</footer>

{% stylesheet %}
  .site-footer {
    background-color: var(--footer-bg);
    color: var(--footer-text);
    font-family: var(--font-primary--family, inherit);
  }

  .site-footer__brand {
    color: var(--footer-text);
  }

  .site-footer__input {
    border-color: var(--footer-text);
    color: var(--footer-text);
    opacity: 0.6;
    border-width: 1px;
    outline: none;
  }

  .site-footer__input::placeholder {
    color: var(--footer-text);
    opacity: 0.4;
  }

  .site-footer__input:focus {
    opacity: 0.9;
    border-color: var(--footer-accent);
  }

  .site-footer__btn {
    background-color: var(--footer-accent);
    color: var(--footer-bg);
    border-color: var(--footer-accent);
    cursor: pointer;
  }

  .site-footer__btn:hover {
    background-color: color-mix(in srgb, var(--footer-accent) 85%, transparent);
    border-color: color-mix(in srgb, var(--footer-accent) 85%, transparent);
  }

  .site-footer__divider {
    height: 1px;
    background: color-mix(in srgb, var(--footer-text) 10%, transparent);
  }

  .site-footer__blocks {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .site-footer__blocks {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }
  }

  .site-footer__social-icon {
    color: var(--footer-text);
    opacity: 0.6;
  }

  .site-footer__social-icon:hover {
    opacity: 1;
    color: var(--footer-accent);
  }

  .site-footer__payment svg {
    height: 24px;
    width: auto;
  }

  .site-footer a,
  .site-footer a:visited,
  .site-footer a:active {
    color: inherit;
  }
{% endstylesheet %}

{% schema %}
{
  "name": "t:general.footer",
  "tag": "footer",
  "class": "site-footer",
  "settings": [
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color",
      "id": "background_color",
      "label": "Background color",
      "default": "#000000"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text color",
      "default": "#FFFFFF"
    },
    {
      "type": "color",
      "id": "accent_color",
      "label": "Accent color",
      "default": "#A8D8B9"
    },
    {
      "type": "header",
      "content": "Brand"
    },
    {
      "type": "text",
      "id": "brand_statement",
      "label": "Brand statement",
      "default": ""
    },
    {
      "type": "header",
      "content": "Newsletter"
    },
    {
      "type": "checkbox",
      "id": "show_newsletter",
      "label": "Show newsletter signup",
      "default": true
    },
    {
      "type": "text",
      "id": "newsletter_heading",
      "label": "Newsletter heading",
      "default": "Subscribe to our emails"
    },
    {
      "type": "text",
      "id": "newsletter_success_message",
      "label": "Success message",
      "default": "Thanks for subscribing!"
    },
    {
      "type": "header",
      "content": "Social media"
    },
    {
      "type": "checkbox",
      "id": "show_social_links",
      "label": "Show social links",
      "default": true
    },
    {
      "type": "text",
      "id": "social_heading",
      "label": "Social heading",
      "default": "Follow The Flock"
    },
    {
      "type": "url",
      "id": "social_instagram",
      "label": "Instagram URL"
    },
    {
      "type": "url",
      "id": "social_pinterest",
      "label": "Pinterest URL"
    },
    {
      "type": "url",
      "id": "social_facebook",
      "label": "Facebook URL"
    },
    {
      "type": "url",
      "id": "social_tiktok",
      "label": "TikTok URL"
    },
    {
      "type": "url",
      "id": "social_youtube",
      "label": "YouTube URL"
    },
    {
      "type": "header",
      "content": "Bottom bar"
    },
    {
      "type": "text",
      "id": "copyright_text",
      "label": "Copyright text",
      "default": "",
      "info": "Leave blank to auto-generate: © YEAR Shop Name"
    },
    {
      "type": "link_list",
      "id": "legal_menu",
      "label": "Legal links"
    },
    {
      "type": "checkbox",
      "id": "show_payment_icons",
      "label": "Show payment icons",
      "default": true
    }
  ],
  "blocks": [
    { "type": "footer-column" },
    { "type": "group" },
    { "type": "@theme" }
  ],
  "default": {
    "settings": {
      "background_color": "#000000",
      "text_color": "#FFFFFF",
      "accent_color": "#A8D8B9",
      "show_newsletter": true,
      "newsletter_heading": "Subscribe to our emails",
      "newsletter_success_message": "Thanks for subscribing!",
      "show_social_links": true,
      "social_heading": "Follow The Flock",
      "show_payment_icons": true
    },
    "blocks": [
      {
        "type": "footer-column",
        "settings": {
          "heading": "Help"
        }
      },
      {
        "type": "footer-column",
        "settings": {
          "heading": "Shop"
        }
      },
      {
        "type": "footer-column",
        "settings": {
          "heading": "Company"
        }
      }
    ]
  },
  "enabled_on": {
    "groups": ["footer"]
  }
}
{% endschema %}
```

- [ ] **Step 2: Commit**

```bash
git add sections/footer.liquid
git commit -m "feat: rewrite footer with newsletter, dynamic columns, social icons, and bottom bar"
```

---

### Task 3: Update `sections/footer-group.json`

**Files:**
- Modify: `sections/footer-group.json`

**Interfaces:**
- Consumes: N/A (standalone JSON config)
- Produces: The `footer-group` section group default configuration. Must match the `"default"` block in `footer.liquid`'s schema exactly.

- [ ] **Step 1: Write `sections/footer-group.json`**

```json
{
  "type": "footer",
  "name": "t:general.footer",
  "sections": {
    "footer": {
      "type": "footer",
      "settings": {
        "background_color": "#000000",
        "text_color": "#FFFFFF",
        "accent_color": "#A8D8B9",
        "brand_statement": "",
        "show_newsletter": true,
        "newsletter_heading": "Subscribe to our emails",
        "newsletter_success_message": "Thanks for subscribing!",
        "show_social_links": true,
        "social_heading": "Follow The Flock",
        "social_instagram": "",
        "social_pinterest": "",
        "social_facebook": "",
        "social_tiktok": "",
        "social_youtube": "",
        "copyright_text": "",
        "legal_menu": "",
        "show_payment_icons": true
      },
      "blocks": {
        "block-1": {
          "type": "footer-column",
          "settings": {
            "heading": "Help",
            "menu": ""
          }
        },
        "block-2": {
          "type": "footer-column",
          "settings": {
            "heading": "Shop",
            "menu": ""
          }
        },
        "block-3": {
          "type": "footer-column",
          "settings": {
            "heading": "Company",
            "menu": ""
          }
        }
      },
      "block_order": ["block-1", "block-2", "block-3"]
    }
  },
  "order": ["footer"]
}
```

- [ ] **Step 2: Commit**

```bash
git add sections/footer-group.json
git commit -m "feat: update footer-group defaults with 3 footer-column blocks"
```

---

### Task 4: Verify Tailwind Build

**Files:**
- No file changes — verification only.

**Interfaces:**
- Consumes: All `.liquid` files in the project (scanned by Tailwind's `content` glob)
- Produces: `assets/application.css` — must build without errors. Any Tailwind class in the new footer files that isn't in the utility set will be silently absent in the output — verify no missing styles.

- [ ] **Step 1: Run Tailwind production build**

```bash
npm run build
```

- [ ] **Step 2: Verify build succeeded**

Confirm the command exits with code 0 and `assets/application.css` is updated. Check that the diff shows Footer-related classes:

```bash
ls -la assets/application.css
```

Expected: The file exists and is non-empty. No build errors in stderr.

- [ ] **Step 3: Commit (if any CSS changed)**

If `application.css` was modified (should only happen if new Tailwind classes were added), commit it:

```bash
git add assets/application.css
git commit -m "build: update application.css with footer styles"
```
