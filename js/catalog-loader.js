(async () => {
  const scripts = JSON.parse(document.currentScript.dataset.scripts);
  const main = document.querySelector('main');
  const loader = document.createElement('section');
  loader.className = 'studio-loading studio-loading--overlay';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.innerHTML = '<div class="studio-loading__logo"><img src="assets/images/artban-logo.png" alt="" width="159" height="129" fetchpriority="high"></div><strong class="studio-loading__name">ARTBAN</strong><p>Preparando tu colección…</p><div class="studio-loading__track" aria-hidden="true"></div>';
  document.body.append(loader);
  document.body.classList.add('studio-is-loading');
  const surfaces = [main, document.querySelector('header'), document.querySelector('footer')].filter(Boolean);
  const previousInert = surfaces.map(el => el.inert);
  surfaces.forEach(el => { el.inert = true; });
  if (main) main.setAttribute('aria-busy', 'true');
  window.ODA_CONTENT = { collections: [], promotions: [] };
  const optimizedImages = new Set(["bebe1.png", "sen1.png", "ven1.png", "mujer1.png", "conejo1.png", "cat-sit.png", "elena1.png", "angel1.png", "jan2.png", "hello1.png", "sofiplano1.png", "elefante1.png", "corazon1.png", "jan1.png", "snoppy.png", "camaraplano1.png"]);
  window.productImage = s => {
    if(typeof s !== 'string') return 'assets/images/artban-logo.png';
    if(optimizedImages.has(s)) return 'assets/optimized/' + s.replace(/\.png$/,'.webp');
    if(/^https:\/\//.test(s) || /^data:image\/(png|jpeg|webp);base64,/.test(s)) return s;
    return /^[A-Za-z0-9_-]+\.(png|jpe?g|webp)$/.test(s) ? 'assets/images/' + s : 'assets/images/artban-logo.png';
  };
  try {
    const r = await fetch(window.STORE_CONFIG.apiBase + '/api/content', { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (!r.ok) throw Error();
    const c = await r.json();
    if (!Array.isArray(c.products) || !c.products.every(p => p && typeof p.id==='string' && typeof p.name==='string' && Array.isArray(p.variants) && Array.isArray(p.tags) && (p.type==='custom' || (Number.isFinite(p.price) && p.price>=0 && p.variants.length && p.variants.every(v=>typeof v.name==='string'&&Number.isFinite(v.mod)))))) throw Error();
    CATALOG.splice(0, CATALOG.length, ...c.products);
    window.ODA_CONTENT = c;
  } catch { window.ODA_CATALOG_OFFLINE = true; }
  // Traduce el texto original del catálogo; conserva los datos comerciales.
  const spanishCatalogCopy = {"Elefante Art Toy": "Elefante de diseño", "Snoopy Figure": "Figura de Snoopy", "Figura decorativa con diseño cute. Perfecta para regalo.": "Figura decorativa con diseño tierno. Perfecta para regalo.", "Art Toy minimalista con acabado premium. Edición de estudio.": "Figura de diseño minimalista con acabado de alta calidad. Edición de estudio.", "Art Toy custom de coleccion. Pieza anatómica detallada.": "Figura de colección personalizada. Pieza anatómica detallada.", "Coleccionable custom con nivel de detalle artesanal.": "Coleccionable personalizado con nivel de detalle artesanal.", "CUSTOM": "PERSONALIZADO", "PREMIUM": "ALTA CALIDAD", "CUTE": "TIERNO", "ART TOY": "FIGURA DE DISEÑO"};
  for (const product of CATALOG) {
    for (const key of ['name', 'description']) product[key] = spanishCatalogCopy[product[key]] || product[key];
    product.tags = (product.tags || []).map(tag => spanishCatalogCopy[tag] || tag);
  }
  try {
    for (const src of scripts) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        const timeout = setTimeout(() => reject(new Error('Script timeout')), 12000);
        s.onload = () => { clearTimeout(timeout); resolve(); };
        s.onerror = () => { clearTimeout(timeout); reject(new Error('Script unavailable')); };
        document.body.append(s);
      });
    }
    if (window.ODA_CATALOG_OFFLINE && main) {
      const notice = document.createElement('p');
      notice.className = 'catalog-notice';
      notice.textContent = 'Catálogo de referencia: no se pudo consultar la actualización del estudio. Confirma precio y disponibilidad antes de pagar.';
      main.prepend(notice);
    }
  } catch {
    if (main) {
      main.innerHTML = '<section class="studio-loading"><div class="studio-loading__logo"><img src="assets/images/artban-logo.png" alt="Logo ARTBAN" width="159" height="129"></div><strong class="studio-loading__name">ARTBAN</strong><p>No pudimos cargar la colección. Intenta de nuevo.</p><button class="btn lime" id="reloadCollection">Volver a cargar ↻</button></section>';
      document.getElementById('reloadCollection').onclick = () => location.reload();
    }
  } finally {
    const heroImage = document.querySelector('.hero-slide.active img');
    if (heroImage?.decode) await Promise.race([heroImage.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 1200))]);
    if (main) main.removeAttribute('aria-busy');
    surfaces.forEach((el, i) => { el.inert = previousInert[i]; });
    document.body.classList.remove('studio-is-loading');
    loader.classList.add('studio-loading--done');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    setTimeout(() => loader.remove(), 600);
    const names={index:'Figuras y lienzos con actitud',tienda:'Tienda',personalizados:'Crea tu figura',proyectos:'El estudio',envios:'Envíos',checkout:'Tu pedido',pago:'Estado de tu pago','crear-lienzo':'Crea tu lienzo','compra-segura':'Compra con claridad'};
    document.title = (names[(location.pathname.split('/').pop()||'index.html').replace('.html','')]||'Estudio')+' | ARTBAN';
  }
})();
