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
document.addEventListener('alpine:init', () => {
  Alpine.store('cart').fetch();
});

// ─── Product Slider (scroll-snap carousel) ────────────────────
class ProductSlider extends HTMLElement {
  connectedCallback() {
    this.scroller = this.querySelector('[data-ps-scroller]');
    this.prevButton = this.querySelector('[data-ps-prev]');
    this.nextButton = this.querySelector('[data-ps-next]');

    if (!this.scroller) return;

    this.onResize = () => this.updateButtons();

    this.prevButton?.addEventListener('click', () => this.scrollByCard(-1));
    this.nextButton?.addEventListener('click', () => this.scrollByCard(1));
    this.scroller.addEventListener('scroll', () => this.updateButtons(), { passive: true });
    window.addEventListener('resize', this.onResize);

    this.updateButtons();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.onResize);
  }

  cardStep() {
    const card = this.scroller.querySelector('.product-card');
    if (!card) return this.scroller.clientWidth;
    const gap = parseFloat(getComputedStyle(this.scroller).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  scrollByCard(direction) {
    this.scroller.scrollBy({ left: direction * this.cardStep(), behavior: 'smooth' });
  }

  updateButtons() {
    const maxScroll = this.scroller.scrollWidth - this.scroller.clientWidth - 1;
    if (this.prevButton) this.prevButton.disabled = this.scroller.scrollLeft <= 0;
    if (this.nextButton) this.nextButton.disabled = this.scroller.scrollLeft >= maxScroll;
  }
}

customElements.define('product-slider', ProductSlider);

// ─── Collection Facets (filter bar, sort drawer, Load More) ───
class CollectionFacets extends HTMLElement {
  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.grid = this.querySelector('[data-facets-grid]');
    if (!this.grid) return;

    // Instant-apply on checkbox toggle (price inputs apply via button)
    this.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"][data-facets-control]')) this.apply();
    });

    this.querySelector('[data-facets-apply]')?.addEventListener('click', () => this.apply());

    // Sort buttons (desktop dropdown + drawer rows)
    this.addEventListener('click', (e) => {
      const sortButton = e.target.closest('[data-facets-sort]');
      if (!sortButton) return;
      this.dataset.currentSort = sortButton.dataset.sortValue;
      this.querySelectorAll('[data-facets-sort]').forEach((b) =>
        b.classList.toggle('is-active', b === sortButton)
      );
      const label = this.querySelector('[data-facets-sort-label]');
      if (label) label.textContent = sortButton.textContent.trim();
      this.apply();
    });

    this.querySelector('[data-facets-load]')?.addEventListener('click', () => this.loadMore());

    this.onPopState = () => this.fetchAndSwap(window.location.href);
    window.addEventListener('popstate', this.onPopState);
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', this.onPopState);
  }

  buildParams() {
    const params = new URLSearchParams();
    this.querySelectorAll('input[data-facets-control]:checked').forEach((input) => {
      params.append(input.name, input.value);
    });
    this.querySelectorAll('input[data-facets-control]:not([type="checkbox"])').forEach((input) => {
      if (input.value !== '') params.append(input.name, input.value);
    });
    if (this.dataset.currentSort) params.set('sort_by', this.dataset.currentSort);
    return params;
  }

  apply() {
    const query = this.buildParams().toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.pushState({}, '', url);
    return this.fetchAndSwap(url);
  }

  async fetchAndSwap(url) {
    const separator = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${separator}section_id=${this.sectionId}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const newRoot = doc.querySelector('collection-facets');
    const newGrid = doc.querySelector('[data-facets-grid]');
    if (!newRoot || !newGrid) return;

    // Sync control states (back/forward navigation)
    const states = new Map();
    newRoot.querySelectorAll('input[data-facets-control]').forEach((input) =>
      states.set(`${input.name}=${input.value}`, input.checked)
    );
    this.querySelectorAll('input[data-facets-control]').forEach((input) => {
      const key = `${input.name}=${input.value}`;
      if (states.has(key)) input.checked = states.get(key);
    });
    this.dataset.currentSort = newRoot.dataset.currentSort || this.dataset.currentSort;

    this.grid.innerHTML = newGrid.innerHTML;
    this.grid.dataset.nextUrl = newGrid.dataset.nextUrl || '';

    const newCount = newRoot.querySelector('[data-facets-count]');
    const count = this.querySelector('[data-facets-count]');
    if (newCount && count) count.textContent = newCount.textContent;

    this.updateLoadMore();
  }

  async loadMore() {
    const nextUrl = this.grid.dataset.nextUrl;
    if (!nextUrl) return;
    const separator = nextUrl.includes('?') ? '&' : '?';
    const res = await fetch(`${nextUrl}${separator}section_id=${this.sectionId}`);
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const newGrid = doc.querySelector('[data-facets-grid]');
    if (!newGrid) return;
    while (newGrid.firstChild) this.grid.appendChild(newGrid.firstChild);
    this.grid.dataset.nextUrl = newGrid.dataset.nextUrl || '';
    this.updateLoadMore();
  }

  updateLoadMore() {
    const button = this.querySelector('[data-facets-load]');
    if (button?.parentElement) button.parentElement.hidden = !this.grid.dataset.nextUrl;
  }
}

customElements.define('collection-facets', CollectionFacets);
