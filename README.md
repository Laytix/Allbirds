# Allbirds Clone — Shopify Theme

A portfolio project recreating the [Allbirds](https://www.allbirds.com/) shopping experience using Shopify's **Horizon** theme (v3.3.1) with **Tailwind CSS v4**, **Alpine.js**, and **Flowbite**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Theme | Shopify Horizon v3.3.1 |
| CSS | Tailwind CSS v4 |
| JS | Alpine.js, Flowbite |
| Build | Tailwind CLI |

## Local Development

```bash
npm run dev          # Tailwind watch + Shopify theme dev
npm run build        # Tailwind production build
npm run deploy       # Build + shopify theme push
```

## Features

- Hero slider with Ken Burns effect and overlay text
- Featured collections grid with hover-reveal links
- Cart icon (replaced with Flowbite cart SVG)
- Alpine.js stores for cart state, UI toggles

## Notes

- **No test infrastructure** — `package.json` has no test/lint/typecheck scripts.
- **Tailwind preflight is disabled** — Horizon's base.css handles resets.
- **Dynamic DOM updates** require manual re-init of Alpine.js (`Alpine.initTree`) and Flowbite (`initFlowbite`).
