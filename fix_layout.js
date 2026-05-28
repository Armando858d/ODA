const fs = require('fs');

let css = fs.readFileSync('css/index_estilo.css', 'utf8');

const splitToken = '/* ============================================================\n   PERFECT HERO & LOADER OVERRIDES';
const splitToken2 = '/* ============================================================\r\n   PERFECT HERO & LOADER OVERRIDES';

let baseCss = css;
if (css.includes(splitToken)) {
  baseCss = css.split(splitToken)[0];
} else if (css.includes(splitToken2)) {
  baseCss = css.split(splitToken2)[0];
}

const finalOverrides = `
/* ============================================================
   STREETWEAR LAYOUT (RESTORED & POLISHED)
============================================================ */

/* LOADER FIX FOR DESKTOP */
.printer-loader {
  background-color: #050505 !important;
  background-image: radial-gradient(circle at center, #1a1a1a 0%, #000000 70%) !important;
}

.graffiti-text-loader {
  font-family: "Permanent Marker", cursive, sans-serif !important;
  font-size: clamp(32px, 5vw, 48px) !important;
  text-transform: uppercase;
  color: #ffffff !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 2px 2px 0px rgba(80, 80, 80, 0.5) !important;
  animation: flickerGraffiti 0.15s infinite alternate !important;
  letter-spacing: 5px !important;
  transform: rotate(-2deg);
}

.loader-logo-container img {
  width: clamp(150px, 20vw, 250px) !important;
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

/* HERO GRID LAYOUT - RESTORE FULL HEIGHT */
.hero-grid-layout {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  min-height: 100vh !important;
  padding-top: 80px !important; /* Space for nav */
  position: relative;
}

/* CENTER CONTENT (LOGO & TEXT) */
.hero-center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  width: 100%;
  max-width: 800px;
}

/* LNOMBE LOGO - LARGE BUT ELEGANT */
.logo-hover-hero-center {
  position: relative;
  width: 90vw !important;
  max-width: 650px !important; /* Fixed max width prevents distortion */
  height: 250px !important;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px auto !important;
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

/* ARTE URBANO - RESTORED BELOW LOGO */
.hero-title-center {
  display: block !important;
  font-size: clamp(24px, 4vw, 36px) !important;
  letter-spacing: 15px !important;
  text-transform: uppercase;
  color: #ffffff !important;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,229,255,0.4) !important;
  margin: 0 !important;
  text-align: center;
  font-weight: 800;
}

/* STATS - RESTORED TO RIGHT SIDE FOR DESKTOP */
.hero-right-stats {
  position: absolute !important;
  right: 5% !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
  z-index: 20 !important;
  width: auto !important;
  margin-top: 0 !important;
}

.glass-stat {
  width: 160px !important;
  padding: 20px !important;
  background: rgba(10, 10, 10, 0.4) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  text-align: center;
}

/* RESPONSIVE STACKING FOR MOBILE */
@media (max-width: 1100px) {
  .hero-right-stats {
    position: relative !important;
    right: auto !important;
    top: auto !important;
    transform: none !important;
    flex-direction: row !important;
    justify-content: center !important;
    margin-top: 40px !important;
    width: 100% !important;
    gap: 15px !important;
  }
  .hero-grid-layout {
    justify-content: flex-start !important;
    padding-top: 120px !important;
  }
}

@media (max-width: 768px) {
  .logo-hover-hero-center {
    height: 180px !important;
    max-width: 400px !important;
  }
  .glass-stat {
    width: 120px !important;
    padding: 12px !important;
  }
}
`;

fs.writeFileSync('css/index_estilo.css', baseCss + finalOverrides);
console.log('Fixed CSS');
