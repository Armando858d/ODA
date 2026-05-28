const fs = require('fs');

// 1. UPDATE INDEX.HTML
let html = fs.readFileSync('index.html', 'utf8');

// A. Remove the hover logo (logo.png) from the hero center so only lnombre stays
html = html.replace(/<img src="assets\/images\/logo\.png" alt="4RTB4N Logo" class="hero-icon-img-hover">\s*/, '');

// B. Reorder the Navbar to put the Logo in the middle.
// We need to extract the three blocks: nav-logo-streetwear, nav-menu, nav-actions-streetwear
const logoRegex = /(<!-- LEFT: LOGO -->\s*<div class="nav-logo-streetwear">[\s\S]*?<\/div>)/;
const menuRegex = /(<!-- CENTER: MEN PRINCIPAL -->\s*<div class="nav-menu" id="navMenu">[\s\S]*?<\/div>\s*<\/div>)/; // Wait, menu has nested divs.

// It's safer to extract them using exact string boundaries or simple regex.
// Actually, let's just use CSS flex order!
// CSS order property can rearrange elements visually without touching the fragile HTML DOM.
// We can assign:
// nav-menu -> order: 1
// nav-logo-streetwear -> order: 2
// nav-actions-streetwear -> order: 3

fs.writeFileSync('index.html', html);
console.log('index.html updated (hover logo removed).');

// 2. UPDATE CSS
let css = fs.readFileSync('css/index_estilo.css', 'utf8');

const navFixes = `
/* ============================================================
   CENTER NAV LOGO & DISABLE HERO HOVER FIXES
============================================================ */

/* Disable any lingering hover effects on the hero logo */
.logo-hover-hero-center {
  pointer-events: none; /* Disables interaction completely */
}
.logo-hover-hero-center .hero-name-img-hover {
  opacity: 1 !important;
  transform: translate(-50%, -50%) scale(1) !important;
}
.logo-hover-hero-center .hero-icon-img-hover {
  display: none !important;
}

/* Redesign Desktop Navbar to have the Logo in the center */
@media (min-width: 769px) {
  .nav-grid-streetwear {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr !important;
    align-items: center !important;
  }
  
  /* Visual Reordering using Flex/Grid Order */
  .nav-logo-streetwear {
    order: 2 !important;
    display: flex !important;
    justify-content: center !important;
  }
  
  .nav-menu {
    order: 1 !important;
    display: flex !important;
    justify-content: flex-start !important;
  }
  
  .nav-actions-streetwear {
    order: 3 !important;
    display: flex !important;
    justify-content: flex-end !important;
  }

  /* Make sure the logo is correctly sized when centered */
  .nav-simple-logo {
    height: 40px !important;
    width: auto !important;
  }
}

/* Mobile adjustments for centered logo (often the burger menu is on the left) */
@media (max-width: 768px) {
  .nav-grid-streetwear {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr !important;
    align-items: center !important;
    padding: 0 15px !important;
  }
  
  .nav-mobile-toggle-wrapper {
    order: 1 !important;
    display: flex !important;
    justify-content: flex-start !important;
  }
  
  .nav-logo-streetwear {
    order: 2 !important;
    display: flex !important;
    justify-content: center !important;
  }
  
  .nav-actions-streetwear {
    order: 3 !important;
    display: flex !important;
    justify-content: flex-end !important;
  }
  
  /* The menu itself needs to remain an overlay */
  .nav-menu {
    order: 4 !important;
  }
}
`;

fs.writeFileSync('css/index_estilo.css', css + navFixes);
console.log('CSS updated (Navbar logo centered & hover disabled).');
