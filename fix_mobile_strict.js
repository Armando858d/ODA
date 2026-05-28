const fs = require('fs');

let css = fs.readFileSync('css/index_estilo.css', 'utf8');

const mobileFixes = `
/* ============================================================
   STRICT MOBILE RESPONSIVE FIXES
============================================================ */
@media (max-width: 768px) {
  /* Prevent horizontal overflow on mobile */
  html, body {
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100vw !important;
  }
  
  /* Fix Hero Logo size on mobile */
  .logo-hover-hero-center {
    width: 90vw !important;
    max-width: 100% !important;
    height: 140px !important;
    margin-bottom: 10px !important;
  }
  
  .logo-hover-hero-center .hero-icon-img-hover {
    height: 120px !important;
    width: auto !important;
  }

  .logo-hover-hero-center .hero-name-img-hover {
    height: 100% !important;
    width: 100% !important;
    object-fit: contain !important;
  }

  /* Title resize on mobile */
  .hero-title-center {
    font-size: 20px !important;
    letter-spacing: 8px !important;
    margin-bottom: 20px !important;
  }

  /* Force stats to column on small phones to prevent overflow */
  .hero-right-stats {
    flex-direction: column !important;
    align-items: center !important;
    gap: 15px !important;
    width: 100% !important;
    margin-top: 10px !important;
  }
  
  .glass-stat {
    width: 90% !important;
    max-width: 320px !important;
    padding: 15px !important;
  }

  /* Fix the nav grid spacing on mobile so it doesn't push off screen */
  .nav-grid-streetwear {
    padding: 0 10px !important;
  }
}

/* Extra small devices */
@media (max-width: 480px) {
  .logo-hover-hero-center {
    height: 110px !important;
  }
  .hero-title-center {
    font-size: 18px !important;
    letter-spacing: 5px !important;
  }
  .glass-stat {
    width: 95% !important;
  }
}
`;

fs.writeFileSync('css/index_estilo.css', css + mobileFixes);
console.log('Mobile fixes applied.');
