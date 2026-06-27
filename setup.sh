#!/bin/bash
# ─────────────────────────────────────────────────────────────
# setup.sh — Initialize Tailwind + Alpine + Flowbite in a Shopify theme
#
# Usage: Run this from your Shopify theme root directory
#   chmod +x setup.sh && ./setup.sh
# ─────────────────────────────────────────────────────────────

set -e

echo "🚀 Setting up Shopify theme with Tailwind CSS + Alpine.js + Flowbite"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required."; exit 1; }

echo "✅ Node.js $(node -v) detected"
echo ""

# 1. Initialize package.json if not present
if [ ! -f "package.json" ]; then
  echo "📦 Creating package.json..."
  npm init -y --silent
fi

# 2. Install dependencies
echo "📦 Installing Tailwind CSS, Flowbite, and concurrently..."
npm install -D @tailwindcss/cli tailwindcss flowbite concurrently

# 3. Add scripts to package.json
echo "📝 Updating package.json scripts..."
node -e "
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'dev': 'concurrently -n tailwind,shopify -c blue,green \"npm run dev:tailwind\" \"npm run dev:shopify\"',
  'dev:tailwind': 'npx @tailwindcss/cli -i ./tailwind-input.css -o ./assets/application.css --watch',
  'dev:shopify': 'shopify theme dev',
  'build': 'npx @tailwindcss/cli -i ./tailwind-input.css -o ./assets/application.css --minify',
  'deploy': 'npm run build && shopify theme push'
};
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# 4. Create tailwind-input.css if not present
if [ ! -f "tailwind-input.css" ]; then
  echo "📝 Creating tailwind-input.css..."
  cat > tailwind-input.css << 'CSS'
@import "tailwindcss";

/* Flowbite plugin */
@plugin "flowbite/plugin";
@source "../node_modules/flowbite";

/* Import Inter font for Flowbite default theme */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Alpine.js cloak */
[x-cloak] {
  display: none !important;
}
CSS
fi

# 5. Create tailwind.config.js if not present
if [ ! -f "tailwind.config.js" ]; then
  echo "📝 Creating tailwind.config.js..."
  cat > tailwind.config.js << 'JS'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.liquid",
    "./assets/**/*.js",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
JS
fi

# 6. Create .shopifyignore if not present
if [ ! -f ".shopifyignore" ]; then
  echo "📝 Creating .shopifyignore..."
  cat > .shopifyignore << 'IGNORE'
node_modules/
tailwind-input.css
tailwind.config.js
package.json
package-lock.json
postcss.config.js
CLAUDE.md
SKILLS.md
.claude/
.mcp.json
.git/
.github/
*.md
setup.sh
IGNORE
fi

# 7. Create alpine-stores.js if not present
if [ ! -f "assets/alpine-stores.js" ]; then
  echo "📝 Creating assets/alpine-stores.js..."
  mkdir -p assets
  cat > assets/alpine-stores.js << 'ALPINEJS'
document.addEventListener('alpine:init', () => {
  Alpine.store('cart', {
    items: [],
    count: 0,
    total: 0,
    loading: false,
    async fetch() {
      this.loading = true;
      try {
        const res = await fetch('/cart.js');
        const data = await res.json();
        this.items = data.items;
        this.count = data.item_count;
        this.total = data.total_price;
      } catch (err) { console.error('Cart fetch error:', err); }
      finally { this.loading = false; }
    },
    async add(variantId, quantity = 1) {
      this.loading = true;
      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity }),
        });
        await this.fetch();
      } catch (err) { console.error('Cart add error:', err); }
    },
    async update(key, quantity) {
      this.loading = true;
      try {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity }),
        });
        await this.fetch();
      } catch (err) { console.error('Cart update error:', err); }
    },
    async remove(key) { await this.update(key, 0); },
    formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },
  });

  Alpine.store('ui', {
    mobileMenuOpen: false,
    cartDrawerOpen: false,
    searchOpen: false,
    toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; },
    toggleCartDrawer() { this.cartDrawerOpen = !this.cartDrawerOpen; },
    toggleSearch() { this.searchOpen = !this.searchOpen; },
    closeAll() { this.mobileMenuOpen = false; this.cartDrawerOpen = false; this.searchOpen = false; },
  });
});
ALPINEJS
fi

# 8. Create .mcp.json for Claude Code
if [ ! -f ".mcp.json" ]; then
  echo "📝 Creating .mcp.json (Flowbite MCP for Claude Code)..."
  cat > .mcp.json << 'MCP'
{
  "mcpServers": {
    "flowbite": {
      "command": "npx",
      "args": ["-y", "flowbite-mcp"],
      "env": {}
    }
  }
}
MCP
fi

# 9. Run initial Tailwind build
echo ""
echo "🔨 Running initial Tailwind build..."
npx @tailwindcss/cli -i ./tailwind-input.css -o ./assets/application.css --minify 2>/dev/null || echo "⚠️  Initial build had warnings (this is normal before adding Tailwind classes)"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add these tags to layout/theme.liquid <head>:"
echo ""
echo "     {{ 'application.css' | asset_url | stylesheet_tag }}"
echo '     <link href="https://cdn.jsdelivr.net/npm/flowbite@4.0.1/dist/flowbite.min.css" rel="stylesheet">'
echo '     <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js"></script>'
echo '     <script src="{{ '"'"'alpine-stores.js'"'"' | asset_url }}" defer></script>'
echo ""
echo "  2. Add before </body> in theme.liquid:"
echo ""
echo '     <script src="https://cdn.jsdelivr.net/npm/flowbite@4.0.1/dist/flowbite.min.js"></script>'
echo ""
echo "  3. Start developing:"
echo "     npm run dev"
echo ""
echo "  4. For Claude Code, the Flowbite MCP is configured in .mcp.json"
echo "     Run: claude mcp add flowbite -- npx -y flowbite-mcp"
echo "════════════════════════════════════════════════════════════"
