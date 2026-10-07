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
  window.productImage = s => /^(https:|data:)/.test(s) ? s : 'assets/images/' + s;
  try {
    const r = await fetch(window.STORE_CONFIG.apiBase + '/api/content', { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (!r.ok) throw Error();
    const c = await r.json();
    if (!Array.isArray(c.products)) throw Error();
    CATALOG.splice(0, CATALOG.length, ...c.products);
    window.ODA_CONTENT = c;
  } catch { window.ODA_CATALOG_OFFLINE = true; }
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
    document.title = 'ARTBAN';
  }
})();
