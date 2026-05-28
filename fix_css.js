const fs = require('fs');

// 1. Clean CSS
let css = fs.readFileSync('css/index_estilo.css', 'utf8');

const splitToken = '/* ============================================================\n   GRAFFITI LOADER OVERRIDES & LOGO SIZE OVERRIDES';
const splitToken2 = '/* ============================================================\r\n   GRAFFITI LOADER OVERRIDES & LOGO SIZE OVERRIDES';

let baseCss = css;
if (css.includes(splitToken)) {
  baseCss = css.split(splitToken)[0];
} else if (css.includes(splitToken2)) {
  baseCss = css.split(splitToken2)[0];
}

const cleanOverrides = `
/* ============================================================
   CLEAN RESPONSIVE & HERO OVERRIDES
============================================================ */

/* 1. Hero Logo Size */
.logo-hover-hero-center {
  width: 90% !important;
  max-width: 100% !important;
  height: 500px !important;
  margin-bottom: 20px;
}
.logo-hover-hero-center .hero-icon-img-hover {
  height: 420px !important; 
}
.hero-name-bg-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(255, 62, 122, 0.4) 0%, rgba(0,0,0,0) 65%);
  z-index: -1;
  filter: blur(8px);
  border-radius: 50%;
  transition: all 0.5s ease;
}

/* 2. Hero Responsive (Stack Stats) */
.hero-right-stats {
  position: relative !important;
  right: auto !important;
  top: auto !important;
  transform: none !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  margin-top: 40px !important;
  width: 100% !important;
  gap: 20px !important;
}
.hero-grid-layout {
  flex-direction: column !important;
  justify-content: center !important;
  padding-top: 140px !important;
}
.glass-stat {
  width: auto !important;
  min-width: 150px;
  padding: 15px !important;
  flex: 1 1 auto;
  max-width: 250px;
}

@media (max-width: 1100px) {
  .logo-hover-hero-center {
    width: 95% !important;
    height: 350px !important;
  }
  .logo-hover-hero-center .hero-icon-img-hover {
    height: 280px !important;
  }
}

@media (max-width: 768px) {
  .logo-hover-hero-center {
    width: 95% !important;
    height: 220px !important;
  }
  .logo-hover-hero-center .hero-icon-img-hover {
    height: 180px !important;
  }
  .hero-right-stats {
    gap: 15px !important;
    margin-top: 20px !important;
  }
  .glass-stat {
    min-width: 120px;
    padding: 12px !important;
  }
  .hero-title-center {
    font-size: 2.5rem !important;
  }
}

/* 3. Black Graffiti Loader */
.graffiti-progress-container {
  display: none !important;
}

.printer-loader {
  background-color: #070707 !important;
  background-image: 
    radial-gradient(circle at 15% 25%, rgba(255,255,255,0.9) 1px, transparent 2px),
    radial-gradient(circle at 75% 65%, rgba(255,255,255,0.7) 2px, transparent 3px),
    radial-gradient(circle at 45% 85%, rgba(255,255,255,0.5) 1px, transparent 2px),
    radial-gradient(circle at 85% 15%, rgba(255,255,255,0.8) 3px, transparent 5px),
    radial-gradient(circle at 10% 85%, rgba(255,255,255,0.6) 2px, transparent 4px),
    radial-gradient(circle at 90% 90%, rgba(255,255,255,0.9) 1px, transparent 2px),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%) !important;
  background-size: 130px 130px, 180px 180px, 110px 110px, 220px 220px, 160px 160px, 90px 90px, 100% 100% !important;
}

.graffiti-text-loader {
  font-family: "Permanent Marker", cursive, sans-serif !important;
  font-size: 38px !important;
  text-transform: uppercase;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 2px 2px 0px rgba(100, 100, 100, 0.5) !important;
  animation: flickerGraffiti 0.2s infinite alternate !important;
  letter-spacing: 5px !important;
  transform: rotate(-3deg);
}

@keyframes flickerGraffiti {
  0% { transform: rotate(-3deg) scale(1); text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 2px 2px 0px rgba(100, 100, 100, 0.5); }
  100% { transform: rotate(-2deg) scale(1.02); text-shadow: 0 0 15px rgba(255, 255, 255, 1), 4px 4px 0px rgba(150, 150, 150, 0.5); }
}

.loader-logo-container img {
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.5)) !important;
  animation: pulseGraffiti 1.5s infinite alternate !important;
}

@keyframes pulseGraffiti {
  0% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 0 15px rgba(255,255,255,0.4)); }
  100% { transform: scale(1.1) rotate(3deg); filter: drop-shadow(0 0 30px rgba(255,255,255,0.8)); }
}
`;

fs.writeFileSync('css/index_estilo.css', baseCss + cleanOverrides);

// 2. Clean JS (remove background carousel)
let js = fs.readFileSync('js/index_script.js', 'utf8');

js = js.replace('document.addEventListener("DOMContentLoaded", () => {\r\n  initHeroCarousel();\r\n});', '');
js = js.replace('document.addEventListener("DOMContentLoaded", () => {\n  initHeroCarousel();\n});', '');

// Also try to comment out initHeroCarousel definition or leave it unused.
fs.writeFileSync('js/index_script.js', js);
console.log('Fixed files successfully!');
