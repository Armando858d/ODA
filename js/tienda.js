// ================================================================
//  tienda.js — 4RTB4N STUDIO
//  Incluye: skeleton loaders, IntersectionObserver fade-up, ripple
// ================================================================

// ---- SKELETON LOADERS ----
function renderSkeletons(count) {
  const grid = document.querySelector('.store-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    sk.setAttribute('role', 'presentation');
    sk.setAttribute('aria-hidden', 'true');
    sk.innerHTML = '<div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line title"></div><div class="skeleton-line text"></div><div class="skeleton-line text2"></div><div class="skeleton-line price"></div><div class="skeleton-line button"></div></div>';
    grid.appendChild(sk);
  }
}

// ---- INTERSECTION OBSERVER (fade-up entrance) ----
function observeCards() {
  const io = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.style.animationDelay = `${delay}s`;
        delay += 0.07;
        card.classList.add('animate-in');
        io.unobserve(card);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.product-card').forEach(card => io.observe(card));
}

// ---- RIPPLE EFFECT ----
function addRipple(btn, e) {
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// ---- CATALOG ----
const CATALOG = [
  { id: 'venom-001', name: 'Figura Venom', description: 'Figura solida con recubrimiento de exhibicion. Acabado profesional monocolor.', category: 'art-toy', type: 'fixed', price: 850, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 350}], image: 'ven1.png', tags: ['ACABADO PRO', 'COLECCIONABLE'], weight: 180, featured: true },
  { id: 'elefante-002', name: 'Elefante Art Toy', description: 'Pieza decorativa con diseno organico. Acabado liso tipo inyeccion.', category: 'art-toy', type: 'fixed', price: 650, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 300}], image: 'elefante1.png', tags: ['DECORATIVO', 'PREMIUM'], weight: 220, featured: true },
  { id: 'snoopy-003', name: 'Snoopy Figure', description: 'Replica artesanal de alta fidelidad con acabado de exhibicion.', category: 'figura', type: 'fixed', price: 450, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 300}], image: 'snoppy.png', tags: ['FIGURA', 'DETALLADO'], weight: 150, featured: false },
  { id: 'hello-004', name: 'Hello Kitty', description: 'Figura decorativa con diseno cute. Perfecta para regalo.', category: 'figura', type: 'fixed', price: 400, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 300}], image: 'hello1.png', tags: ['REGALO', 'CUTE'], weight: 120, featured: false },
  { id: 'gato-005', name: 'Gato Sentado', description: 'Art Toy minimalista con acabado premium. Edicion de estudio.', category: 'art-toy', type: 'fixed', price: 350, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 250}], image: 'cat-sit.png', tags: ['ART TOY', 'MINIMALISTA'], weight: 130, featured: false },
  { id: 'conejo-006', name: 'Conejo Decorativo', description: 'Pieza decorativa con textura organica y acabado brillante.', category: 'art-toy', type: 'fixed', price: 380, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 270}], image: 'conejo1.png', tags: ['DECORATIVO', 'ORGANICO'], weight: 160, featured: false },
  { id: 'corazon-007', name: 'Corazon Anatomico 3D', description: 'Art Toy custom de coleccion. Pieza anatomica detallada.', category: 'art-toy', type: 'fixed', price: 550, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 350}], image: 'corazon1.png', tags: ['COLECCION', 'ANATOMICO'], weight: 200, featured: true },
  { id: 'regalo-008', name: 'Regalo Personalizado', description: 'Pieza exclusiva disenada a tu medida. Edicion unica irrepetible.', category: 'custom', type: 'custom', price: null, variants: [], image: 'sen1.png', tags: ['EXCLUSIVO', 'PERSONALIZADO'], weight: null, featured: false },
  { id: 'recuerdo-009', name: 'Recuerdo Inolvidable', description: 'Escultura personalizada con calidad de exhibicion profesional.', category: 'custom', type: 'custom', price: null, variants: [], image: 'bebe1.png', tags: ['RECUERDO', 'PREMIUM'], weight: null, featured: false },
  { id: 'muneca-010', name: 'Muneca Personalizada', description: 'Coleccionable custom con nivel de detalle artesanal.', category: 'custom', type: 'custom', price: null, variants: [], image: 'elena1.png', tags: ['CUSTOM', 'DETALLADO'], weight: null, featured: false },
  { id: 'retrato-011', name: 'Retrato 3D', description: 'Pieza de exhibicion unica basada en fotografia real.', category: 'custom', type: 'custom', price: null, variants: [], image: 'mujer1.png', tags: ['RETRATO', 'UNICO'], weight: null, featured: false },
  { id: 'centro-012', name: 'Centro de Mesa XV Anos', description: 'Produccion a medida para eventos. Diseno exclusivo.', category: 'custom', type: 'custom', price: null, variants: [], image: 'jan1.png', tags: ['EVENTO', 'PRODUCCION'], weight: null, featured: false },
  { id: 'angel-013', name: 'Angel 3D', description: 'Escultura artistica con alas detalladas. Pieza de exhibicion.', category: 'custom', type: 'custom', price: null, variants: [], image: 'angel1.png', tags: ['ARTE', 'EXHIBICION'], weight: null, featured: false },
  { id: 'lampara-014', name: 'Lampara de Regalo', description: 'Pieza funcional con iluminacion integrada. Diseno decorativo.', category: 'custom', type: 'custom', price: null, variants: [], image: 'jan2.png', tags: ['FUNCIONAL', 'ILUMINACION'], weight: null, featured: false },
];

// ---- RENDER WITH SKELETONS ----
function renderProducts(filter) {
  if (filter === undefined) filter = 'todos';
  renderSkeletons(6);
  setTimeout(() => _renderProductsReal(filter), 80);
}

function _renderProductsReal(filter) {
  const grid = document.querySelector('.store-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = CATALOG.filter(p => {
    if (filter === 'todos') return true;
    if (filter === 'art-toys' && p.category === 'art-toy') return true;
    if (filter === 'figuras'  && p.category === 'figura')  return true;
    if (filter === 'custom'   && p.category === 'custom')  return true;
    return false;
  });

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    let priceHtml   = '';
    let actionHtml  = '';
    let variantHtml = '';

    if (product.type === 'fixed') {
      priceHtml = `<div class="product-price" id="price-${product.id}">$${product.price.toLocaleString('es-MX')} MXN</div>`;

      if (product.variants && product.variants.length > 0) {
        variantHtml = `
          <select class="variant-selector" id="var-${product.id}">
            ${product.variants.map((v, i) => `<option value="${i}">${v.name} (+$${v.mod})</option>`).join('')}
          </select>`;
      }

      actionHtml = `<button class="btn-add-cart" id="btn-${product.id}" onclick="addToCart('${product.id}', event)">AGREGAR AL CARRITO</button>`;
    } else {
      priceHtml  = `<div class="product-price" style="color: var(--pink);">COTIZAR</div>`;
      actionHtml = `<button class="btn-quote" onclick="requestQuote('${product.name}')">SOLICITAR COTIZACION</button>`;
    }

    card.innerHTML = `
      <div class="product-image-container">
        <img src="assets/images/${product.image}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='assets/images/logo.png'">
        <div class="product-tags">
          ${product.tags.map(t => `<span class="product-tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:15px;flex-grow:1;">${product.description}</p>
        ${variantHtml}
        ${priceHtml}
        ${actionHtml}
      </div>`;

    grid.appendChild(card);

    // Variant price update
    const select = card.querySelector(`#var-${product.id}`);
    if (select) {
      select.addEventListener('change', (e) => {
        const vi = e.target.value;
        const priceEl = document.getElementById(`price-${product.id}`);
        const newPrice = product.price + product.variants[vi].mod;
        priceEl.innerText = `$${newPrice.toLocaleString('es-MX')} MXN`;
      });
    }
  });

  // Animate cards in
  observeCards();
}

// ---- ADD TO CART ----
window.addToCart = function(productId, event) {
  const product = CATALOG.find(p => p.id === productId);
  if (!product) return;

  let finalPrice = product.price;
  let variantName = '';

  const select = document.getElementById(`var-${product.id}`);
  if (select) {
    const v = product.variants[select.value];
    finalPrice  += v.mod;
    variantName  = v.name;
  }

  window.cartManager.addItem({ ...product, price: finalPrice, variant: variantName });

  // Ripple + success state on button
  const btn = document.getElementById(`btn-${productId}`);
  if (btn && event) addRipple(btn, event);
  if (btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> AGREGADO';
    btn.classList.add('success');
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('success');
      btn.disabled = false;
    }, 1500);
  }
};

// ---- QUOTE ----
window.requestQuote = function(productName) {
  const url = `https://wa.me/524492795557?text=Hola%204RTB4N%2C%20me%20interesa%20cotizar%20${encodeURIComponent(productName)}`;
  window.open(url, '_blank');
};

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();

  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      renderProducts(e.target.dataset.filter);
    });
  });
});
