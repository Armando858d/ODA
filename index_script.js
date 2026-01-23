/* ============================
   ODA STUDIO - JS VIP FINAL ✅
   - Loader impresora realista
   - Gato imprimiéndose por capas (cat-sit.png)
   - Nav progress + active links
   - Menú móvil pro + scroll lock real
   - Contador textarea (500)
   - Video autoplay fallback
============================ */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        fn(...args);
      });
    };
  };

  // ---------- Elements ----------
  const loader = $("#printerLoader");
  const globalBar = $("#globalProgress");
  const printBar = $("#printProgress");
  const statusEl = $("#loadingStatus");
  const printingFigure = $("#printingFigure");

  const navEl = $("#cyberNav");
  const navProgress = $("#navProgress");
  const navLinks = $$("#navMenu .nav-link");
  const mobileToggle = $("#mobileToggle");
  const navMenu = $("#navMenu");
  const mobileBlur = $(".mobile-blur");

  const charCount = $("#charCount");
  const textarea = $('textarea[name="message"]');

  // ---------- Config ----------
  const LOADER_MIN_MS = 2400;
  const LOADER_MAX_MS = 4200;

  const PRINT_LAYERS = 26;
  const PRINT_FPS = 18;
  const PRINT_WOBBLE = 0.65;

  const TEXTAREA_LIMIT = 500;

  // 👉 Tu imagen (silueta gato sentado)
  const CAT_IMAGE_SRC = "cat-sit.png";

  // offset dinámico (nav real + aire)
  const getNavOffset = () => {
    const h = navEl?.getBoundingClientRect().height ?? 78;
    return Math.round(h + 10);
  };

  // ---------- Mobile scroll lock (REAL) ----------
  let savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("nav-open");
  }

  function unlockScroll() {
    const top = document.body.style.top;
    document.body.classList.remove("nav-open");
    document.body.style.top = "";
    const y = top ? Math.abs(parseInt(top, 10)) : savedScrollY;
    window.scrollTo(0, y || 0);
  }

  // ---------- Build figure (loader) ----------
  function initPrintableFigure() {
    if (!printingFigure) return;

    // SVG con clip para “imprimir” de abajo a arriba tu silueta PNG
    printingFigure.innerHTML = `
      <div class="print-figure-inner" aria-hidden="true">
        <svg class="cat-svg" viewBox="0 0 256 256" role="img" aria-label="Silueta de gato sentado en impresión">
          <defs>
            <clipPath id="catClip">
              <rect id="catClipRect" x="0" y="256" width="256" height="0"></rect>
            </clipPath>
          </defs>

          <image
            href="${CAT_IMAGE_SRC}"
            x="0" y="0"
            width="256" height="256"
            preserveAspectRatio="xMidYMid meet"
            clip-path="url(#catClip)"
          />
        </svg>

        <div class="print-figure-shine"></div>
        <div class="print-figure-noise"></div>
        <div class="print-figure-layers" aria-hidden="true"></div>
        <!-- Scanner laser added for preloader -->
        <div class="hero-scanner" style="animation-duration: 2s;"></div>
      </div>
    `;

    const layersWrap = $(".print-figure-layers", printingFigure);
    if (!layersWrap) return;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < PRINT_LAYERS; i++) {
      const layer = document.createElement("div");
      layer.className = "layer";
      layer.style.setProperty("--i", String(i));
      frag.appendChild(layer);
    }
    layersWrap.innerHTML = "";
    layersWrap.appendChild(frag);
  }

  // ---------- Print simulation ----------
  function runPrintSimulation(totalMs) {
    if (!printingFigure || !statusEl) return;

    const steps = [
      { t: 0.08, text: "CALENTANDO BOQUILLA..." },
      { t: 0.22, text: "CALIBRANDO CAMA..." },
      { t: 0.35, text: "CARGANDO FILAMENTO..." },
      { t: 0.52, text: "GENERANDO SOPORTES..." },
      { t: 0.68, text: "IMPRIMIENDO CAPAS..." },
      { t: 0.84, text: "POST-PROCESADO..." },
      { t: 0.95, text: "FINALIZANDO..." },
    ];

    const layers = $$(".print-figure-layers .layer", printingFigure);
    const inner = $(".print-figure-inner", printingFigure) || printingFigure;

    // clip rect del gato (reveal)
    const clipRect = $("#catClipRect", printingFigure);
    const setCatReveal = (p) => {
      if (!clipRect) return;
      const h = Math.round(256 * p);
      clipRect.setAttribute("height", String(h));
      clipRect.setAttribute("y", String(256 - h));
    };

    const start = performance.now();
    let lastFrame = start;

    const setProgressBars = (p) => {
      const pct = Math.round(p * 100);
      if (globalBar) globalBar.style.width = `${pct}%`;
      if (printBar) printBar.style.width = `${pct}%`;
    };

    const setStatus = (p) => {
      let current = steps[0];
      for (let i = 0; i < steps.length; i++) {
        if (p >= steps[i].t) current = steps[i];
      }
      if (statusEl.textContent !== current.text) statusEl.textContent = current.text;
    };

    const setLayers = (p) => {
      const total = layers.length;
      if (!total) return;
      const printed = Math.floor(p * total);
      for (let i = 0; i < total; i++) layers[i].classList.toggle("on", i < printed);
    };

    const wobble = () => {
      if (prefersReduced) return;
      const x = (Math.random() - 0.5) * PRINT_WOBBLE;
      const y = (Math.random() - 0.5) * PRINT_WOBBLE;
      inner.style.transform = `translate(${x}px, ${y}px)`;
    };

    const tick = (now) => {
      const elapsed = now - start;
      const p = clamp(elapsed / totalMs, 0, 1);

      setProgressBars(p);
      setStatus(p);
      setLayers(p);
      setCatReveal(p);

      if (!prefersReduced && now - lastFrame > 1000 / PRINT_FPS) {
        wobble();
        lastFrame = now;
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        inner.style.transform = "";
        statusEl.textContent = "LISTO";
        document.body.classList.remove("loading");
      }
    };

    requestAnimationFrame(tick);
  }

  // ---------- Loader show/hide ----------
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("hidden");
    loader.setAttribute("aria-hidden", "true");

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      loader.style.display = "none";
      loader.removeEventListener("transitionend", finish);
      document.body.classList.remove("loading");
      animateStats(); // ✅ Iniciar stats justo cuando termina el preloader
    };

    loader.addEventListener("transitionend", finish);
    setTimeout(finish, 900);
  }

  function runLoader() {
    if (!loader) return;

    document.body.classList.add("loading");

    loader.classList.remove("hidden");
    loader.style.display = "";
    loader.setAttribute("aria-hidden", "false");

    initPrintableFigure();

    const totalMs = prefersReduced
      ? 900
      : Math.floor(Math.random() * (LOADER_MAX_MS - LOADER_MIN_MS + 1)) + LOADER_MIN_MS;

    runPrintSimulation(totalMs);

    setTimeout(() => hideLoader(), totalMs + (prefersReduced ? 150 : 550));
  }

  // ---------- Nav progress ----------
  function updateNavProgress() {
    if (!navProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const p = docHeight > 0 ? clamp(scrollTop / docHeight, 0, 1) : 0;

    // tu CSS usa scaleX ✅
    navProgress.style.transform = `scaleX(${p})`;
  }

  // ---------- Active nav ----------
  const sectionEls = navLinks
    .map((a) => (a.getAttribute("href") || "").trim())
    .filter((h) => h.startsWith("#"))
    .map((h) => $(h))
    .filter(Boolean);

  function setActiveNav() {
    if (!navLinks.length || !sectionEls.length) return;

    const y = (window.scrollY || 0) + (getNavOffset() + 34);
    let activeIndex = 0;

    for (let i = 0; i < sectionEls.length; i++) {
      if (sectionEls[i].offsetTop <= y) activeIndex = i;
    }

    // 1. Update Active Class
    for (let i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.toggle("active", i === activeIndex);
    }

    // 2. Update Slider Marker (Lava Lamp)
    updateNavMarker();
  }

  // ---------- Sliding Marker Logic ----------
  function moveMarker(el) {
    const marker = $(".nav-marker");
    if (!marker || !el) return;

    // Check if we are in mobile or desktop. 
    // In mobile (fullscreen menu), we might not want the marker or handle it differently.
    // Assuming marker is mainly for desktop "bar" look.
    if (window.innerWidth <= 980) {
      marker.style.opacity = "0";
      return;
    }

    const parentRect = el.parentElement.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const left = elRect.left - parentRect.left;
    const width = elRect.width;

    marker.style.width = `${width}px`;
    marker.style.transform = `translate(${left}px, -50%)`; // Y handled by top:50% in CSS
    marker.style.opacity = "1";
  }

  function updateNavMarker() {
    const activeLink = $(".nav-link.active");
    if (activeLink) moveMarker(activeLink);
    else $(".nav-marker").style.opacity = "0";
  }

  // Bind Hover Effects
  const menuContainer = $(".nav-menu"); // or #navMenu if that's the container
  if (menuContainer) {
    navLinks.forEach(link => {
      link.addEventListener("mouseenter", () => moveMarker(link));
    });
    menuContainer.addEventListener("mouseleave", () => updateNavMarker());
  }

  // ---------- Smooth scroll ----------
  function bindSmoothScroll() {
    if (!navLinks.length) return;

    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      a.addEventListener("click", (e) => {
        e.preventDefault();
        closeMobileMenu();

        const target = $(href);
        if (!target) return;

        const top =
          target.getBoundingClientRect().top +
          (window.scrollY || 0) -
          getNavOffset();

        window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
      });
    });
  }

  // ---------- Mobile menu ----------
  function openMobileMenu() {
    if (!navMenu || !mobileToggle) return;

    // compat con HTML viejo (.active) + HTML nuevo (.open)
    navMenu.classList.add("open");
    navMenu.classList.add("active");

    mobileToggle.classList.add("active");
    mobileToggle.setAttribute("aria-label", "Cerrar menú");
    mobileToggle.setAttribute("aria-expanded", "true");

    lockScroll();
  }

  function closeMobileMenu() {
    if (!navMenu || !mobileToggle) return;

    navMenu.classList.remove("open");
    navMenu.classList.remove("active");

    mobileToggle.classList.remove("active");
    mobileToggle.setAttribute("aria-label", "Abrir menú");
    mobileToggle.setAttribute("aria-expanded", "false");

    unlockScroll();
  }

  function bindMobileMenu() {
    if (!mobileToggle || !navMenu) return;

    // Nuevo: Close button específico para menú fullscreen
    const closeBtn = $(".close-menu-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeMobileMenu);

    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = document.body.classList.contains("nav-open");
      isOpen ? closeMobileMenu() : openMobileMenu();
    });

    // click overlay
    if (mobileBlur) mobileBlur.addEventListener("click", closeMobileMenu);

    // click afuera (opcional si es fullscreen, pero útil)
    document.addEventListener("pointerdown", (e) => {
      if (!document.body.classList.contains("nav-open")) return;
      // Si el click es en el botón de cerrar, ya se maneja
      const isInside = navMenu.contains(e.target) || mobileToggle.contains(e.target);
      if (!isInside) closeMobileMenu();
    });

    // ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeMobileMenu();
    });

    // resize: si ya es desktop, cerrar
    window.addEventListener(
      "resize",
      rafThrottle(() => {
        if (window.innerWidth > 980 && document.body.classList.contains("nav-open")) {
          closeMobileMenu();
        }
      }),
      { passive: true }
    );
  }

  // ---------- Char counter ----------
  function bindCharCounter() {
    if (!textarea || !charCount) return;

    textarea.setAttribute("maxlength", String(TEXTAREA_LIMIT));

    const update = () => {
      if (textarea.value.length > TEXTAREA_LIMIT) {
        textarea.value = textarea.value.slice(0, TEXTAREA_LIMIT);
      }
      charCount.textContent = String(textarea.value.length);
    };

    textarea.addEventListener("input", update);
    update();
  }

  // ---------- Stats counter ----------
  // ---------- Stats counter and Progress Bars ----------
  function animateStats() {
    // Seleccionar elementos con data-count (puede ser el contenedor o un hijo)
    const counters = $$("[data-count]");
    if (!counters.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          io.unobserve(el);

          // 1. Animar el Número
          const target = parseInt(el.getAttribute("data-count"), 10) || 0;
          const duration = prefersReduced ? 450 : 1500;
          const start = performance.now();

          const tick = (now) => {
            const p = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.floor(target * eased);

            el.textContent = String(val);

            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);

          // 2. Animar la Barra de Progreso asociada
          // La barra está en .stat-card > .stat-progress > .progress-track
          // El contador está dentro de .stat-card
          const card = el.closest(".stat-card");
          if (card) {
            const track = card.querySelector(".progress-track");
            if (track) {
              const fillWidth = el.getAttribute("data-fill") || "100"; // Default 100%
              // Pequeño retraso para sincronizar visualmente con el inicio de los números
              setTimeout(() => {
                track.style.width = `${fillWidth}%`;
              }, 100);
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    counters.forEach((c) => io.observe(c));
  }

  // ---------- Hero entry animation ----------
  function animateHeroEntry() {
    const items = $$(".hero-badge, .hero-description, .hero-stats, .hero-cta, .hero-visual");
    if (!items.length) return;

    items.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 120 * i + 220);
    });

    const words = $$(".title-word");
    words.forEach((w, i) => {
      w.style.opacity = "0";
      w.style.transform = "translateY(16px)";
      setTimeout(() => {
        w.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        w.style.opacity = "1";
        w.style.transform = "translateY(0)";
      }, 140 * i + 100);
    });
  }

  // ---------- Scroll reveal cards ----------
  function setupScrollReveal() {
    const animatedElements = $$(".service-card, .project-card, .info-card, .process-timeline .process-step");
    if (!animatedElements.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("animated");
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((el) => io.observe(el));
  }

  // ---------- Particles (ligero) ----------
  function setupParticles() {
    const container = $("#particles");
    if (!container) return;
    if (window.innerWidth <= 768) return;

    const particleCount = window.innerWidth <= 1024 ? 18 : 28;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("div");
      p.className = "cyber-particle";

      const size = Math.random() * 2 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const colors = ["#ff3e7a", "#00d9ff", "#9d4edd"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      p.style.cssText = `
        position:absolute;
        width:${size}px;
        height:${size}px;
        left:${x}%;
        top:${y}%;
        border-radius:999px;
        background:${color};
        opacity:${Math.random() * 0.22 + 0.08};
        pointer-events:none;
        filter: blur(${size / 2}px);
      `;

      container.appendChild(p);

      const animate = () => {
        const t = Date.now() * 0.001;
        const dx = Math.sin(t + i) * 26;
        const dy = Math.cos(t * 0.6 + i) * 26;
        p.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  // ---------- Video fallback ----------
  function setupVideo() {
    const vid = $("#bgVideo");
    if (!vid) return;

    const tryPlay = async () => {
      try {
        await vid.play();
      } catch (_) { }
    };

    setTimeout(tryPlay, 350);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") tryPlay();
    });

    // iOS unlock
    const unlock = () => {
      tryPlay();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
  }

  // ---------- Optional GSAP (si está cargado) ----------
  function setupGSAP() {
    if (prefersReduced) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const sections = $$("section[id]");
    sections.forEach((sec) => {
      gsap.from(sec, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sec,
          start: "top 82%",
          once: true,
        },
      });
    });
  }

  // ---------- Hero Printer Loop (Infinite) ----------
  function initHeroPrinter() {
    const heroFig = $("#heroPrintingFigure");
    if (!heroFig) return;

    // 1. Inyectar SVG (con ID único para clipPath)
    heroFig.innerHTML = `
      <div class="print-figure-inner" aria-hidden="true" style="transform:none; animation:none;">
        <svg class="cat-svg" viewBox="0 0 256 256" style="opacity:1; filter: drop-shadow(0 0 10px rgba(255,62,122,0.4));">
          <defs>
            <clipPath id="heroClip">
              <rect id="heroClipRect" x="0" y="256" width="256" height="0"></rect>
            </clipPath>
          </defs>
          <image 
            href="${CAT_IMAGE_SRC}" 
            x="0" y="0" 
            width="256" height="256" 
            preserveAspectRatio="xMidYMid meet" 
            clip-path="url(#heroClip)"
          />
        </svg>
        <div class="print-figure-shine"></div>
        <div class="print-figure-layers" aria-hidden="true"></div>
      </div>
    `;

    // 2. Crear Layers
    const layersWrap = $(".print-figure-layers", heroFig);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < PRINT_LAYERS; i++) {
      const layer = document.createElement("div");
      layer.className = "layer";
      layer.style.setProperty("--i", String(i));
      frag.appendChild(layer);
    }
    layersWrap.appendChild(frag);

    // 3. Loop infinito
    const clipRect = $("#heroClipRect", heroFig);
    const layers = $$(".layer", layersWrap);

    // Si el usuario prefiere movimiento reducido, mostramos el gato completo y ya
    if (prefersReduced) {
      if (clipRect) {
        clipRect.setAttribute("height", "256");
        clipRect.setAttribute("y", "0");
      }
      layers.forEach(l => l.classList.add("on"));
      return;
    }

    const loopDuration = 3500;

    function startRun() {
      // Verificar si el elemento sigue en el DOM
      if (!document.body.contains(heroFig)) return;

      let start = performance.now();

      function frame(now) {
        let p = (now - start) / loopDuration;
        if (p > 1) p = 1;

        // Actualizar altura
        const h = Math.round(256 * p);
        if (clipRect) {
          clipRect.setAttribute("height", String(h));
          clipRect.setAttribute("y", String(256 - h));
        }

        // Actualizar capas
        const total = layers.length;
        const printed = Math.floor(p * total);
        for (let i = 0; i < total; i++) {
          layers[i].classList.toggle("on", i < printed);
        }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          // ✅ FINAL: Se queda la imagen completa. NO reiniciamos.
          if (clipRect) {
            clipRect.setAttribute("height", "256");
            clipRect.setAttribute("y", "0");
          }
          layers.forEach(l => l.classList.add("on"));
        }
      }
      requestAnimationFrame(frame);
    }

    startRun();
  }

  // ---------- Init ----------
  function init() {
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";

    runLoader();
    initHeroPrinter(); // ✅ Activamos la impresora del hero

    bindMobileMenu();
    bindSmoothScroll();
    bindCharCounter();



    // animateStats(); // ❌ Se llama en hideLoader() para esperar al usuario
    if (!document.getElementById("printerLoader")) animateStats(); // Fallback si no hay loader

    animateHeroEntry();
    setupScrollReveal();
    setupParticles();
    setupVideo();
    setupGSAP();

    const onScroll = rafThrottle(() => {
      updateNavProgress();
      setActiveNav();
    });

    updateNavProgress();
    setActiveNav();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
