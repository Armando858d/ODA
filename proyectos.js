// ============================================================
// PROYECTOS.HTML - Carousel & Shuffle
// ============================================================

// Project data for carousel
const projects = [
    { id: 1, title: 'ESCULTURA PERSONALIZADA', subtitle: 'ARTE EN 3D • 15 CM', tags: ['EDICION PERSONALIZADA', 'PINTURA A MANO', 'LISTO PARA REGALO'], class: 'project-1' },
    { id: 2, title: 'IMPRESION', subtitle: 'IMPRESION 3D • 15 CM', tags: ['ACABADO PRO', 'UN SOLO COLOR', 'COLECCIONABLE'], class: 'project-2' },
    { id: 3, title: 'ESCULTURA UNICA', subtitle: 'Diseño • Lujo y detalle', tags: ['RESINA', 'DETALLE', 'EXCLUSIVO'], class: 'project-3' },
    { id: 4, title: 'PROTOTIPO FUNCIONAL', subtitle: 'Ingeniería • Alta precisión', tags: ['ABS', 'FUNCIONAL', 'PRECISO'], class: 'project-4' },
    { id: 5, title: 'MINIATURA DETALLADA', subtitle: 'Colección • 8 CM', tags: ['RESINA', 'ALTA DEFINICIÓN', 'PINTADO'], class: 'project-5' },
    { id: 6, title: 'PIEZA ARQUITECTÓNICA', subtitle: 'Maqueta • 30 CM', tags: ['PLA', 'ARQUITECTURA', 'PROFESIONAL'], class: 'project-6' },
    { id: 7, title: 'ACCESORIO GAMING', subtitle: 'Personalizado • RGB', tags: ['PETG', 'GAMING', 'LED'], class: 'project-7' },
    { id: 8, title: 'FIGURA COLECCIONABLE', subtitle: 'Edición limitada • 20 CM', tags: ['PLA+', 'COLECCIÓN', 'PREMIUM'], class: 'project-8' },
    { id: 9, title: 'HERRAMIENTA CUSTOM', subtitle: 'Funcional • Resistente', tags: ['NYLON', 'RESISTENTE', 'ÚTIL'], class: 'project-9' },
    { id: 10, title: 'DISEÑO PERSONALIZADO', subtitle: 'Único • Premium', tags: ['CUSTOM', 'DISEÑO', 'EXCLUSIVO'], class: 'project-10' },
    { id: 11, title: 'MODELO A ESCALA', subtitle: 'Réplica • Detallada', tags: ['ESCALA', 'PRECISO', 'RÉPLICA'], class: 'project-11' },
    { id: 12, title: 'ARTE DECORATIVO', subtitle: 'Hogar • Moderno', tags: ['DECORACIÓN', 'ARTE', 'HOGAR'], class: 'project-12' },
    { id: 13, title: 'PIEZA TÉCNICA', subtitle: 'Funcional • Industrial', tags: ['TÉCNICO', 'INDUSTRIAL', 'FUNCIONAL'], class: 'project-13' },
    { id: 14, title: 'REGALO ESPECIAL', subtitle: 'Personalizado • Único', tags: ['REGALO', 'PERSONAL', 'ESPECIAL'], class: 'project-14' },
    { id: 15, title: 'EDICIÓN LIMITADA', subtitle: 'Colección • Exclusiva', tags: ['LIMITADO', 'COLECCIÓN', 'EXCLUSIVO'], class: 'project-15' }
];

// Carousel state
let currentSlide = 0;
let autoRotateInterval;

// Initialize carousel
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');

    if (!track || !indicators) return;

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
        track.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('button');
        indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('aria-label', `Ir a proyecto ${index + 1}`);
        indicator.addEventListener('click', () => goToSlide(index));
        indicators.appendChild(indicator);
    });

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

    // Re-append in new order
    cards.forEach(card => grid.appendChild(card));
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
