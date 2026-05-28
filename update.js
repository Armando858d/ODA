const fs = require('fs');

// 1. Restore the Hero Carousel in JS
let js = fs.readFileSync('js/index_script.js', 'utf8');
if (!js.includes('initHeroCarousel()')) {
  js += `
// ==========================================
// HERO BACKGROUND CAROUSEL
// ==========================================
function initHeroCarousel() {
  const slides = document.querySelectorAll('#heroCarousel .hero-slide');
  if (slides.length === 0) return;

  let currentSlide = 0;
  
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroCarousel();
});
`;
  fs.writeFileSync('js/index_script.js', js);
}

// 2. Clean up CSS - Remove the bad repeating radial gradients and fix layout
let css = fs.readFileSync('css/index_estilo.css', 'utf8');
const splitToken = '/* ============================================================\n   CLEAN RESPONSIVE & HERO OVERRIDES';
const splitToken2 = '/* ============================================================\r\n   CLEAN RESPONSIVE & HERO OVERRIDES';

let baseCss = css;
if (css.includes(splitToken)) {
  baseCss = css.split(splitToken)[0];
} else if (css.includes(splitToken2)) {
  baseCss = css.split(splitToken2)[0];
}

const newOverrides = `
/* ============================================================
   PERFECT HERO & LOADER OVERRIDES
============================================================ */

/* LOADER FIX FOR DESKTOP (Clean black with spotlight) */
.printer-loader {
  background: #050505 !important;
  background-image: radial-gradient(circle at center, #1a1a1a 0%, #000000 70%) !important;
}

.graffiti-text-loader {
  font-family: "Permanent Marker", cursive, sans-serif !important;
  font-size: clamp(32px, 5vw, 48px) !important; /* Responsive text size */
  text-transform: uppercase;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 2px 2px 0px rgba(80, 80, 80, 0.5) !important;
  animation: flickerGraffiti 0.15s infinite alternate !important;
  letter-spacing: 5px !important;
  transform: rotate(-2deg);
}

.loader-logo-container img {
  width: clamp(150px, 20vw, 250px) !important; /* Scale logo properly on desktop */
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.4)) !important;
  animation: pulseGraffiti 1.5s infinite alternate !important;
}

@keyframes flickerGraffiti {
  0% { transform: rotate(-2deg) scale(1); text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 2px 2px 0px rgba(80, 80, 80, 0.5); }
  100% { transform: rotate(-1deg) scale(1.02); text-shadow: 0 0 15px rgba(255, 255, 255, 1), 4px 4px 0px rgba(120, 120, 120, 0.5); }
}
@keyframes pulseGraffiti {
  0% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); }
  100% { transform: scale(1.05) rotate(2deg); filter: drop-shadow(0 0 35px rgba(255,255,255,0.7)); }
}
.graffiti-progress-container {
  display: none !important;
}

/* MAIN HERO LOGO (LNOMBE) - THE ABSOLUTE CENTERPIECE */
.hero-center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.logo-hover-hero-center {
  position: relative;
  width: 90vw !important;
  max-width: 1200px !important;
  height: 45vh !important;
  min-height: 250px !important;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 30px auto !important;
  cursor: pointer;
}

.logo-hover-hero-center .hero-name-img-hover,
.logo-hover-hero-center .hero-icon-img-hover {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.logo-hover-hero-center .hero-name-img-hover { opacity: 1; }
.logo-hover-hero-center .hero-icon-img-hover { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }

.logo-hover-hero-center:hover .hero-name-img-hover { opacity: 0; transform: translate(-50%, -50%) scale(1.05); }
.logo-hover-hero-center:hover .hero-icon-img-hover { opacity: 1; transform: translate(-50%, -50%) scale(1); }

/* STATS ROW (Neatly below the huge logo) */
.hero-right-stats {
  position: relative !important;
  right: auto !important;
  top: auto !important;
  transform: none !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  gap: 30px !important;
  width: 100% !important;
  max-width: 1000px !important;
  margin: 0 auto !important;
}

.glass-stat {
  flex: 1 1 auto !important;
  min-width: 200px !important;
  max-width: 300px !important;
  padding: 20px !important;
  background: rgba(10, 10, 10, 0.4) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  text-align: center;
}

.hero-grid-layout {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  padding-top: 100px !important; /* Space for navbar */
  min-height: 100vh !important;
}

/* HIDE TITLE IF NAME IS PRINCIPAL */
.hero-title-center {
  display: none !important;
}

/* RESPONSIVE MOBILE TWEAKS */
@media (max-width: 768px) {
  .logo-hover-hero-center {
    width: 95vw !important;
    height: 30vh !important;
  }
  .hero-right-stats {
    gap: 15px !important;
  }
  .glass-stat {
    min-width: 140px !important;
    padding: 15px !important;
  }
  .hero-grid-layout {
    padding-top: 80px !important;
  }
}
`;

fs.writeFileSync('css/index_estilo.css', baseCss + newOverrides);
console.log('Fixed CSS and JS successfully!');
