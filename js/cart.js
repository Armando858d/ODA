class CartManager {
  constructor() {
    this.key = '4rtb4n_cart';
    this.items = this.getItems();
  }

  getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  }

  saveItems(items) {
    this.items = items;
    localStorage.setItem(this.key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: this.items }));
  }

  addItem(product) {
    const items = this.getItems();
    const existing = items.find(i => i.id === product.id && i.variant === product.variant);
    
    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        variant: product.variant || '',
        quantity: product.quantity || 1,
        unitPrice: product.price,
        image: product.image
      });
    }
    this.saveItems(items);
    this.showToast(`Agregado: ${product.name}`);
  }

  removeItem(productId, variant) {
    const items = this.getItems().filter(i => !(i.id === productId && i.variant === variant));
    this.saveItems(items);
  }

  updateQuantity(productId, variant, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId && i.variant === variant);
    if (item) {
      item.quantity = Math.max(1, qty);
      this.saveItems(items);
    }
  }

  getTotal() {
    return this.getItems().reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.saveItems([]);
  }

  renderCartDrawer() {
    let drawer = document.querySelector('.cart-drawer');
    let overlay = document.querySelector('.cart-drawer-overlay');

    if (!drawer) {
      overlay = document.createElement('div');
      overlay.className = 'cart-drawer-overlay';
      document.body.appendChild(overlay);

      drawer = document.createElement('div');
      drawer.className = 'cart-drawer';
      document.body.appendChild(drawer);

      overlay.addEventListener('click', () => this.toggleDrawer(false));
    }

    const items = this.getItems();
    const total = this.getTotal();

    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h2>TU CARRITO</h2>
        <button class="close-cart-btn" aria-label="Cerrar"><i class="fas fa-times"></i></button>
      </div>
      <div class="cart-items-container">
        ${items.length === 0 ? '<div class="empty-cart">Tu carrito está vacío</div>' : items.map(item => `
          <div class="cart-item">
            <img src="assets/images/${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='assets/images/logo.png'">
            <div class="cart-item-details">
              <h4>${item.name}</h4>
              <p class="cart-item-variant">${item.variant}</p>
              <div class="cart-item-price">$${item.unitPrice.toLocaleString('es-MX')} MXN</div>
              <div class="cart-item-qty">
                <button class="qty-btn minus" data-id="${item.id}" data-variant="${item.variant}">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn plus" data-id="${item.id}" data-variant="${item.variant}">+</button>
              </div>
            </div>
            <button class="remove-item-btn" data-id="${item.id}" data-variant="${item.variant}"><i class="fas fa-trash"></i></button>
          </div>
        `).join('')}
      </div>
      <div class="cart-drawer-footer">
        <div class="cart-total">
          <span>Total:</span>
          <span>$${total.toLocaleString('es-MX')} MXN</span>
        </div>
        <button class="checkout-btn" ${items.length === 0 ? 'disabled' : ''} onclick="window.location.href='checkout.html'">
          PROCEDER AL PAGO
        </button>
      </div>
    `;

    drawer.querySelector('.close-cart-btn').addEventListener('click', () => this.toggleDrawer(false));
    
    drawer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const variant = e.target.dataset.variant;
        const currentQty = parseInt(e.target.parentElement.querySelector('span').innerText);
        this.updateQuantity(id, variant, e.target.classList.contains('plus') ? currentQty + 1 : currentQty - 1);
      });
    });

    drawer.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        this.removeItem(target.dataset.id, target.dataset.variant);
      });
    });
  }

  renderBadge() {
    const cartToggle = document.querySelector('#cartToggle');
    if (!cartToggle) return;

    let badge = cartToggle.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      cartToggle.appendChild(badge);
    }
    
    const count = this.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  showToast(message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  toggleDrawer(show) {
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.cart-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.toggle('open', show);
      overlay.classList.toggle('open', show);
      if (show) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
    }
  }

  init() {
    this.renderCartDrawer();
    this.renderBadge();

    const cartToggle = document.querySelector('#cartToggle');
    if (cartToggle) {
      cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDrawer(true);
      });
    }

    window.addEventListener('cart-updated', () => {
      this.renderCartDrawer();
      this.renderBadge();
    });
  }
}

window.cartManager = new CartManager();
document.addEventListener('DOMContentLoaded', () => window.cartManager.init());
