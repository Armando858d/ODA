// ============================================================
// PROYECTOS.HTML - Carousel & Shuffle
// ============================================================

// Project data for carousel
const projects = [
    { id: 1, title: 'REGALO PERSONALIZADO', subtitle: 'Hecho a tu gusto • Único', tags: ['REGALO', 'NOMBRE', 'ESPECIAL'], class: 'project-1' },
    { id: 2, title: 'FIGURA VENOM', subtitle: 'Impresión premium • Detalle HD', tags: ['ACABADO PRO', 'UN SOLO COLOR', 'COLECCIONABLE'], class: 'project-2' },
    { id: 3, title: 'RECUERDO INOLVIDABLE', subtitle: 'Tu bebé en 3D • Calidad premium', tags: ['RECUERDO', 'ÚNICO', 'PREMIUM'], class: 'project-3' },
    { id: 4, title: 'CORAZÓN ANATÓMICO 3D', subtitle: 'Detalle realista • Alta precisión', tags: ['ANATOMÍA', 'PRO', 'PREMIUM'], class: 'project-4' },
    { id: 5, title: 'CENTROS DE MESA XV AÑOS', subtitle: 'Personalizados • Súper detallados', tags: ['PERSONALIZADO', 'PINTADO', 'PREMIUM'], class: 'project-5' },
    { id: 6, title: 'MUÑECA PERSONALIZADA', subtitle: 'Tu idea en 3D • Alta precisión', tags: ['CUSTOM', 'PRO', 'DETALLADA'], class: 'project-6' },
    { id: 7, title: 'RETRATO 3D PERSONALIZADO', subtitle: 'Personalizado • Con base y nombre', tags: ['PERSONALIZADO', 'PREMIUM', 'COLECCIONABLE'], class: 'project-7' },
    { id: 8, title: 'FIGURA PERSONALIZADA', subtitle: 'Tu personaje favorito • Hecho en 3D', tags: ['PERSONALIZADO', 'COLOR A MANO', 'PRO'], class: 'project-8' },
    { id: 9, title: 'FIGURAS PERSONALIZADAS', subtitle: 'Con detalle • Con estilo • A tu gusto', tags: ['CUSTOM', 'DETALLE', 'CALIDAD'], class: 'project-9' },
    { id: 10, title: 'REGALO ESPECIAL', subtitle: 'Personalizado • Hecho a tu gusto', tags: ['REGALO', 'PERSONAL', 'ÚNICO'], class: 'project-10' },
    { id: 11, title: 'LÁMPARA DE REGALO', subtitle: 'Un detalle único • Súper cute', tags: ['REGALO', 'ÚNICO', 'CUSTOM'], class: 'project-11' },
    { id: 12, title: 'REGALO PERFECTO', subtitle: 'Bonita • Única • Súper cute', tags: ['REGALO', 'CUTE', 'HOGAR'], class: 'project-12' },
    { id: 13, title: 'DECORACIÓN MODERNA', subtitle: 'Minimalista • Elegante', tags: ['HOGAR', 'MODERNO', 'MINIMAL'], class: 'project-13' },
    { id: 14, title: 'REGALO ESPECIAL', subtitle: 'Personalizado • Único', tags: ['REGALO', 'PERSONAL', 'ESPECIAL'], class: 'project-14' },
    { id: 15, title: 'MODELADO EN SOLIDWORKS', subtitle: 'Diseño técnico • Medidas exactas', tags: ['SOLIDWORKS', 'TÉCNICO', 'EXACTO'], class: 'project-15' }
];

// Carousel state
let currentSlide = 0;
let autoRotateInterval;

// Initialize carousel
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');

    if (!track || !indicators) return;

    // Create DocumentFragments to batch DOM updates
    const slidesFragment = document.createDocumentFragment();
    const indicatorsFragment = document.createDocumentFragment();

    // Create project slides
    projects.forEach((project, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
      <div class="slide-background ${project.class}"></div>
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <div class="slide-number">${String(project.id).padStart(2, '0')}</div>
        <h2 class="slide-title">${project.title}</h2>
        <p class="slide-subtitle">${project.subtitle}</p>
        <div class="slide-tags">
          ${project.tags.map(tag => `<span class="slide-tag">${tag}</span>`).join('')}
        </div>
      </div>
    `;
        slidesFragment.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('button');
        indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('aria-label', `Ir a proyecto ${index + 1}`);
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsFragment.appendChild(indicator);
    });

    // Append all at once
    track.appendChild(slidesFragment);
    indicators.appendChild(indicatorsFragment);

    // Navigation buttons
    document.getElementById('prevBtn')?.addEventListener('click', prevSlide);
    document.getElementById('nextBtn')?.addEventListener('click', nextSlide);

    // Auto-rotate
    startAutoRotate();

    // Pause on hover
    const carousel = document.querySelector('.featured-carousel');
    carousel?.addEventListener('mouseenter', stopAutoRotate);
    carousel?.addEventListener('mouseleave', startAutoRotate);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');

    slides[currentSlide]?.classList.remove('active');
    indicators[currentSlide]?.classList.remove('active');

    currentSlide = index;

    slides[currentSlide]?.classList.add('active');
    indicators[currentSlide]?.classList.add('active');
}

function nextSlide() {
    goToSlide((currentSlide + 1) % projects.length);
}

function prevSlide() {
    goToSlide((currentSlide - 1 + projects.length) % projects.length);
}

function startAutoRotate() {
    stopAutoRotate();
    autoRotateInterval = setInterval(nextSlide, 5000);
}

function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
    }
}

// Shuffle projects grid
function shuffleProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    const cards = Array.from(grid.children);

    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Use Fragment for single reflow
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(card));
    grid.appendChild(fragment);
}

// Fullscreen scroll indicator functionality
function initScrollIndicator() {
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (!scrollIndicator) return;

    // Show indicator after page load
    setTimeout(() => {
        scrollIndicator.classList.add('show');
    }, 1500);

    // Hide on any interaction
    let hasInteracted = false;

    const hideIndicator = () => {
        if (!hasInteracted) {
            hasInteracted = true;
            scrollIndicator.classList.remove('show');
            setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 500);
        }
    };

    // Hide on scroll
    window.addEventListener('scroll', hideIndicator, { once: true });

    // Hide on touch/click anywhere
    scrollIndicator.addEventListener('click', () => {
        hideIndicator();
        // Scroll to projects grid
        const projectsGrid = document.querySelector('.projects-grid');
        if (projectsGrid) {
            projectsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Auto-hide after 6 seconds
    setTimeout(hideIndicator, 6000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    shuffleProjects();
    initScrollIndicator();
});
