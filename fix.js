const fs = require('fs');
let content = fs.readFileSync('js/index_script.js', 'utf8');

content = content.replace('window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;', 'window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;');
content = content.replace('const h = navEl?.getBoundingClientRect().height ?? 78;', 'const h = navEl ? navEl.getBoundingClientRect().height : 78;');

const formLogic = `    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const btn = form.querySelector("button");
      const btnIcon = btn.querySelector(".button-icon");
      const btnText = btn.querySelector(".button-text");

      const originalIcon = btnIcon ? btnIcon.innerHTML : "";
      const originalText = btnText ? btnText.textContent : "ENVIAR";

      if (btnText) btnText.textContent = "ENVIANDO...";
      if (btnIcon) btnIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      fetch("https://formspree.io/f/mzddzvkj", {
        method: "POST",
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function(response) {
        if (response.ok) {
          if (btnText) btnText.textContent = "¡ENVIADO!";
          if (btnIcon) btnIcon.innerHTML = '<i class="fas fa-check"></i>';
          form.reset();
          if (document.querySelector("#charCount")) document.querySelector("#charCount").textContent = "0";

          setTimeout(function() {
            if (btnText) btnText.textContent = originalText;
            if (btnIcon) btnIcon.innerHTML = originalIcon;
          }, 4000);
        } else {
          throw new Error('Error en el envío');
        }
      })
      .catch(function(error) {
        if (btnText) btnText.textContent = "ERROR";
        if (btnIcon) btnIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';

        setTimeout(function() {
          if (btnText) btnText.textContent = originalText;
          if (btnIcon) btnIcon.innerHTML = originalIcon;
        }, 3000);
      });
    });
  }
`;

let parts = content.split('form.addEventListener("submit", async (e) => {');
if (parts.length > 1) {
  let bottom = parts[1].split('// ---------- Init ----------');
  content = parts[0] + formLogic + '\n  // ---------- Init ----------' + bottom[1];
}

const carouselLogic = `
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
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroCarousel();
});
`;

if (!content.includes('initHeroCarousel')) {
  content += carouselLogic;
}

content = content.replace(/ODA STUDIO/g, "4RTB4N");
content = content.replace(/\bODA\b/g, "4RTB4N");
content = content.replace(/oda\.png/g, "logo.png");

fs.writeFileSync('js/index_script.js', content);
console.log('Fixed js/index_script.js successfully!');
