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
        await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity }),
        });
        await this.fetch();
      } catch (err) {
        console.error('Cart add error:', err);
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

  // ─── UI Store (global UI state) ─────────────────────────────
  Alpine.store('ui', {
    mobileMenuOpen: false,
    cartDrawerOpen: false,
    searchOpen: false,
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
      this.sizeGuideOpen = false;
    },
  });

});
