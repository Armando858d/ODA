const CATALOG = [
  { id: 'venom-001', name: 'Figura Venom', description: 'Figura sólida con recubrimiento de exhibición. Acabado profesional monocolor.', category: 'art-toy', type: 'fixed', price: 850, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 350}], image: 'ven1.png', tags: ['ACABADO PRO', 'COLECCIONABLE'], weight: 180, featured: true },
  { id: 'elefante-002', name: 'Elefante Art Toy', description: 'Pieza decorativa con diseño orgánico. Acabado liso tipo inyección.', category: 'art-toy', type: 'fixed', price: 650, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 300}], image: 'elefante1.png', tags: ['DECORATIVO', 'PREMIUM'], weight: 220, featured: true },
  { id: 'snoopy-003', name: 'Snoopy Figure', description: 'Réplica artesanal de alta fidelidad con acabado de exhibición.', category: 'figura', type: 'fixed', price: 450, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 300}], image: 'snoppy.png', tags: ['FIGURA', 'DETALLADO'], weight: 150, featured: false },
  { id: 'hello-004', name: 'Hello Kitty', description: 'Figura decorativa con diseño cute. Perfecta para regalo.', category: 'figura', type: 'fixed', price: 400, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 300}], image: 'hello1.png', tags: ['REGALO', 'CUTE'], weight: 120, featured: false },
  { id: 'gato-005', name: 'Gato Sentado', description: 'Art Toy minimalista con acabado premium. Edición de estudio.', category: 'art-toy', type: 'fixed', price: 350, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 250}], image: 'cat-sit.png', tags: ['ART TOY', 'MINIMALISTA'], weight: 130, featured: false },
  { id: 'conejo-006', name: 'Conejo Decorativo', description: 'Pieza decorativa con textura orgánica y acabado brillante.', category: 'art-toy', type: 'fixed', price: 380, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 270}], image: 'conejo1.png', tags: ['DECORATIVO', 'ORGÁNICO'], weight: 160, featured: false },
  { id: 'corazon-007', name: 'Corazón Anatómico 3D', description: 'Art Toy custom de colección. Pieza anatómica detallada.', category: 'art-toy', type: 'fixed', price: 550, variants: [{name: 'Sin pintar', mod: 0}, {name: 'Pintado a mano', mod: 350}], image: 'corazon1.png', tags: ['COLECCIÓN', 'ANATÓMICO'], weight: 200, featured: true },
  { id: 'regalo-008', name: 'Regalo Personalizado', description: 'Pieza exclusiva diseñada a tu medida. Edición única irrepetible.', category: 'custom', type: 'custom', price: null, variants: [], image: 'sen1.png', tags: ['EXCLUSIVO', 'PERSONALIZADO'], weight: null, featured: false },
  { id: 'recuerdo-009', name: 'Recuerdo Inolvidable', description: 'Escultura personalizada con calidad de exhibición profesional.', category: 'custom', type: 'custom', price: null, variants: [], image: 'bebe1.png', tags: ['RECUERDO', 'PREMIUM'], weight: null, featured: false },
  { id: 'muneca-010', name: 'Muñeca Personalizada', description: 'Coleccionable custom con nivel de detalle artesanal.', category: 'custom', type: 'custom', price: null, variants: [], image: 'elena1.png', tags: ['CUSTOM', 'DETALLADO'], weight: null, featured: false },
  { id: 'retrato-011', name: 'Retrato 3D', description: 'Pieza de exhibición única basada en fotografía real.', category: 'custom', type: 'custom', price: null, variants: [], image: 'mujer1.png', tags: ['RETRATO', 'ÚNICO'], weight: null, featured: false },
  { id: 'centro-012', name: 'Centro de Mesa XV Años', description: 'Producción a medida para eventos. Diseño exclusivo.', category: 'custom', type: 'custom', price: null, variants: [], image: 'jan1.png', tags: ['EVENTO', 'PRODUCCIÓN'], weight: null, featured: false },
  { id: 'angel-013', name: 'Ángel 3D', description: 'Escultura artística con alas detalladas. Pieza de exhibición.', category: 'custom', type: 'custom', price: null, variants: [], image: 'angel1.png', tags: ['ARTE', 'EXHIBICIÓN'], weight: null, featured: false },
  { id: 'lampara-014', name: 'Lámpara de Regalo', description: 'Pieza funcional con iluminación integrada. Diseño decorativo.', category: 'custom', type: 'custom', price: null, variants: [], image: 'jan2.png', tags: ['FUNCIONAL', 'ILUMINACIÓN'], weight: null, featured: false },
];

function renderProducts(filter = 'todos') {
  const grid = document.querySelector('.store-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const filtered = CATALOG.filter(p => {
    if (filter === 'todos') return true;
    if (filter === 'art-toys' && p.category === 'art-toy') return true;
    if (filter === 'figuras' && p.category === 'figura') return true;
    if (filter === 'custom' && p.category === 'custom') return true;
    return false;
  });

  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let priceHtml = '';
    let actionHtml = '';
    let variantHtml = '';

    if (product.type === 'fixed') {
      priceHtml = \`<div class="product-price" id="price-\${product.id}">$\${product.price.toLocaleString('es-MX')} MXN</div>\`;
      
      if (product.variants && product.variants.length > 0) {
        variantHtml = \`
          <select class="variant-selector" id="var-\${product.id}">
            \${product.variants.map((v, i) => \`<option value="\${i}">\${v.name} (+\$\${v.mod})</option>\`).join('')}
          </select>
        \`;
      }
      
      actionHtml = \`<button class="btn-add-cart" onclick="addToCart('\${product.id}')">AGREGAR AL CARRITO</button>\`;
    } else {
      priceHtml = \`<div class="product-price" style="color: var(--pink);">COTIZAR</div>\`;
      actionHtml = \`<button class="btn-quote" onclick="requestQuote('\${product.name}')">SOLICITAR COTIZACIÓN</button>\`;
    }

    card.innerHTML = \`
      <div class="product-image-container">
        <img src="assets/images/\${product.image}" alt="\${product.name}" class="product-image" onerror="this.src='assets/images/logo.png'">
        <div class="product-tags">
          \${product.tags.map(t => \`<span class="product-tag">\${t}</span>\`).join('')}
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title">\${product.name}</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 15px; flex-grow: 1;">\${product.description}</p>
        \${variantHtml}
        \${priceHtml}
        \${actionHtml}
      </div>
    \`;

    grid.appendChild(card);
    
    // Setup variant price listener
    const select = card.querySelector(\`#var-\${product.id}\`);
    if (select) {
      select.addEventListener('change', (e) => {
        const variantIndex = e.target.value;
        const priceElement = document.getElementById(\`price-\${product.id}\`);
        const newPrice = product.price + product.variants[variantIndex].mod;
        priceElement.innerText = \`$\${newPrice.toLocaleString('es-MX')} MXN\`;
      });
    }
  });
}

window.addToCart = function(productId) {
  const product = CATALOG.find(p => p.id === productId);
  if (!product) return;
  
  let finalPrice = product.price;
  let variantName = '';
  
  const select = document.getElementById(\`var-\${product.id}\`);
  if (select) {
    const v = product.variants[select.value];
    finalPrice += v.mod;
    variantName = v.name;
  }
  
  window.cartManager.addItem({
    ...product,
    price: finalPrice,
    variant: variantName
  });
};

window.requestQuote = function(productName) {
  const url = \`https://wa.me/524492795557?text=Hola%204RTB4N%2C%20me%20interesa%20cotizar%20\${encodeURIComponent(productName)}\`;
  window.open(url, '_blank');
};

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
