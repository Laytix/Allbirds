/**
 * Alpine.js Global Stores
 *
 * This file defines shared state accessible across all Alpine components
 * via Alpine.store('storeName'). Load this BEFORE Alpine.js initializes.
 *
 * Usage in Liquid:
 *   <span x-text="$store.cart.count"></span>
 *   <button @click="$store.cart.add(variantId)">Add to Cart</button>
 */

document.addEventListener('alpine:init', () => {

  // ─── Cart Store ─────────────────────────────────────────────
  Alpine.store('cart', {
    items: [],
    count: 0,
    total: 0,
    loading: false,
    lastAdded: null,

    async fetch() {
      this.loading = true;
      try {
        const res = await fetch('/cart.js');
        const data = await res.json();
        this.items = data.items;
        this.count = data.item_count;
        this.total = data.total_price;
      } catch (err) {
        console.error('Cart fetch error:', err);
      } finally {
        this.loading = false;
      }
    },

    async add(variantId, quantity = 1) {
      this.loading = true;
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity }),
        });
        if (!res.ok) throw new Error(`Add failed: ${res.status}`);
        const item = await res.json();
        this.lastAdded = {
          title: item.product_title,
          variantTitle: item.variant_title,
          image: item.image,
          quantity: item.quantity,
          price: this.formatMoney(item.final_line_price ?? item.price * item.quantity),
        };
        await this.fetch();
      } catch (err) {
        console.error('Cart add error:', err);
      } finally {
        this.loading = false;
      }
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
      } catch (err) {
        console.error('Cart update error:', err);
      }
    },

    async remove(key) {
      await this.update(key, 0);
    },

    formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    },
  });

  // ─── Product form component ─────────────────────────────────
  Alpine.data('productForm', () => ({
    options: {},
    optionNames: [],
    variantId: null,
    priceText: '',
    variants: [],
    justAdded: false,

    init() {
      const root = this.$el;
      const json = root.querySelector('[data-product-variants]');
      try {
        this.variants = JSON.parse(json?.textContent || '[]');
      } catch {
        this.variants = [];
      }
      // Option names in position order — taken from the rendered fieldsets
      this.optionNames = [...root.querySelectorAll('fieldset.product-option')]
        .map((fieldset) => fieldset.querySelector('input[type="radio"]')?.name)
        .filter(Boolean);
      const priceEl = root.querySelector('[data-product-price]');
      if (priceEl) this.priceText = priceEl.dataset.initial || '';
      root.querySelectorAll('input[type="radio"]:checked').forEach((input) => {
        this.options[input.name] = input.value;
      });
      const form = this.$el.querySelector('form[action*="/cart/add"]');
      if (form) {
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          this.addToCart(event);
        });
      }
      this.resolve();
    },

    // Option name by position — mirrors product.options order
    optionName(index) {
      return this.optionNames[index] ?? '';
    },

    onOptionChange(event) {
      this.options[event.target.name] = event.target.value;
      this.resolve();
    },

    get complete() {
      return this.optionNames.every((name) => this.options[name]);
    },

    get matchedVariant() {
      if (!this.complete) return null;
      return this.variants.find((variant) =>
        this.optionNames.every((name) => variant.options.includes(this.options[name]))
      );
    },

    get ready() {
      return Boolean(this.complete && this.matchedVariant?.available);
    },

    get buttonLabel() {
      if (this.justAdded) return 'Added ✓';
      const missing = this.optionNames.filter((name) => !this.options[name]);
      if (missing.length > 0) {
        return missing.length === 1 ? `Select ${missing[0].toLowerCase()}` : 'Select options';
      }
      if (this.matchedVariant && !this.matchedVariant.available) return 'Sold out';
      return 'Add to cart';
    },

    resolve() {
      const variant = this.matchedVariant;
      this.variantId = variant ? variant.id : null;
      if (variant) this.priceText = variant.price;
    },

    async addToCart(event) {
      if (!this.ready || this.justAdded) return;
      const formData = new FormData(event.target);
      const res = await fetch('/cart/add.js', { method: 'POST', body: formData });
      if (!res.ok) return;
      await Alpine.store('cart').fetch();
      Alpine.store('ui').cartPopOpen = true;
      this.justAdded = true;
      setTimeout(() => {
        this.justAdded = false;
      }, 2000);
    },
  }));

  // ─── UI Store (global UI state) ─────────────────────────────
  Alpine.store('ui', {
    mobileMenuOpen: false,
    cartDrawerOpen: false,
    searchOpen: false,
    cartPopOpen: false,
    sizeGuideOpen: false,

    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },

    toggleCartDrawer() {
      this.cartDrawerOpen = !this.cartDrawerOpen;
    },

    toggleSearch() {
      this.searchOpen = !this.searchOpen;
    },

    closeAll() {
      this.mobileMenuOpen = false;
      this.cartDrawerOpen = false;
      this.searchOpen = false;
      this.cartPopOpen = false;
      this.sizeGuideOpen = false;
    },
  });

});
