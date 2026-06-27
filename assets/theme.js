/**
 * Theme JavaScript
 *
 * Custom vanilla JS and web components for the Shopify theme.
 * Alpine.js handles most UI state — use this file for:
 *   - Custom web components (product forms, cart drawer, etc.)
 *   - Shopify-specific JS (section rendering API, predictive search)
 *   - Third-party integrations
 *   - Utilities that don't fit Alpine's declarative model
 */

// ─── Utility: Debounce ────────────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Utility: Fetch with error handling ───────────────────────
async function shopifyFetch(url, options = {}) {
  const defaults = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  const res = await fetch(url, { ...defaults, ...options });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// ─── Section Rendering API Helper ─────────────────────────────
async function renderSection(sectionId, url) {
  const separator = url.includes('?') ? '&' : '?';
  const sectionUrl = `${url}${separator}section_id=${sectionId}`;
  const res = await fetch(sectionUrl);
  return res.text();
}

// ─── Initialize on DOM ready ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize cart count on page load
  if (window.Alpine) {
    // Alpine is already available, fetch cart
  } else {
    document.addEventListener('alpine:init', () => {
      Alpine.store('cart').fetch();
    });
  }
});
