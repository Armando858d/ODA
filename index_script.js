// ===== CONFIGURACIÓN GLOBAL =====
'use strict';

console.log('%c🎨 URBAN TECH PREMIUM 🌟', 'font-size: 24px; color: #00D4FF; font-weight: bold;');
console.log('%cEstilo urbano premium cargado', 'color: #888;');

// Estado global
const AppState = {
    soundsEnabled: true,
    theme: 'dark',
    currentSection: 'home',
    scrollY: 0,
    isMobile: window.innerWidth <= 768,
    touchSupported: 'ontouchstart' in window,
    graffitiMode: false
};

// Elementos del DOM
const DOM = {
    preloader: document.getElementById('preloader'),
    logoSpray: document.getElementById('logoSpray'),
    mobileToggle: document.getElementById('mobileToggle'),
    navMenu: document.querySelector('.nav-menu'),
    soundToggle: document.getElementById('soundToggle'),
    themeToggle: document.getElementById('themeToggle'),
    backTop: document.getElementById('backTop'),
    whatsappFloat: document.querySelector('.whatsapp-float'),
    contactForm: document.getElementById('contactForm'),
    exploreBtn: document.getElementById('exploreBtn'),
    quoteBtn: document.getElementById('quoteBtn'),
    viewMoreBtn: document.getElementById('viewMoreBtn'),
    projectModal: document.getElementById('projectModal'),
    modalClose: document.querySelector('.modal-close'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    galleryItems: document.querySelectorAll('.gallery-item')
};

// Elementos de sonido
const Sounds = {
    spray: document.getElementById('spraySound'),
    shake: document.getElementById('shakeSound'),
    print: document.getElementById('printSound'),
    click: document.getElementById('clickSound')
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Verificar preferencias del usuario
    checkUserPreferences();
    
    // Iniciar sistemas
    initPreloader();
    initNavigation();
    initSounds();
    initTheme();
    initAnimations();
    initCounters();
    initForm();
    initScrollEffects();
    initObservers();
    initCanvasEffects();
    initGalleryFilter();
    initGraffitiEffects();
    
    // Optimizaciones para móvil
    if (AppState.isMobile) {
        optimizeForMobile();
    }
    
    // Inicializar controles flotantes
    initFloatingButtons();
    
    console.log('✅ App inicializada correctamente');
}

// ===== PREFERENCIAS DEL USUARIO =====
function checkUserPreferences() {
    // Verificar si el usuario prefiere movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.documentElement.style.setProperty('--transition-normal', '0.01ms');
        document.documentElement.style.setProperty('--transition-slow', '0.01ms');
    }
    
    // Verificar tema preferido
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    AppState.theme = prefersDark ? 'dark' : 'light';
    applyTheme();
    
    // Verificar almacenamiento local
    const savedSounds = localStorage.getItem('urban_sounds');
    if (savedSounds !== null) {
        AppState.soundsEnabled = savedSounds === 'true';
        updateSoundToggle();
    }
}

// ===== PRELOADER =====
function initPreloader() {
    if (!DOM.preloader) return;
    
    // Animar progreso
    const progress = document.querySelector('.loading-progress');
    if (progress) {
        progress.style.animation = 'loadingProgress 2s ease-in-out forwards';
    }
    
    // Animar letras del logo
    const letters = document.querySelectorAll('.brand-letter');
    letters.forEach((letter, index) => {
        letter.style.animation = `letterReveal 0.8s ease ${index * 0.2}s forwards`;
    });
    
    // Ocultar preloader después de 2.5 segundos
    setTimeout(() => {
        DOM.preloader.style.opacity = '0';
        DOM.preloader.style.visibility = 'hidden';
        
        // Iniciar animaciones principales
        setTimeout(() => {
            initTypewriter();
            playSprayEffect();
        }, 500);
    }, 2500);
}

// ===== SISTEMA DE SONIDOS =====
function initSounds() {
    // Configurar volumen de sonidos
    Object.values(Sounds).forEach(sound => {
        if (sound) {
            sound.volume = 0.3;
            sound.preload = 'auto';
        }
    });
    
    // Toggle de sonidos
    if (DOM.soundToggle) {
        DOM.soundToggle.addEventListener('click', toggleSounds);
        updateSoundToggle();
    }
    
    // Agregar event listeners para sonidos
    document.addEventListener('click', handleSoundEvents);
}

function toggleSounds() {
    AppState.soundsEnabled = !AppState.soundsEnabled;
    localStorage.setItem('urban_sounds', AppState.soundsEnabled);
    updateSoundToggle();
    
    // Reproducir sonido de confirmación
    if (AppState.soundsEnabled && Sounds.click) {
        Sounds.click.currentTime = 0;
        Sounds.click.play().catch(e => console.log('Sonido no disponible:', e));
    }
}

function updateSoundToggle() {
    if (!DOM.soundToggle) return;
    
    const icon = DOM.soundToggle.querySelector('i');
    if (icon) {
        icon.className = AppState.soundsEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }
    
    DOM.soundToggle.setAttribute('aria-label', 
        AppState.soundsEnabled ? 'Desactivar sonidos' : 'Activar sonidos'
    );
}

function handleSoundEvents(e) {
    if (!AppState.soundsEnabled) return;
    
    const target = e.target.closest('[data-sound]');
    if (!target) return;
    
    const soundType = target.getAttribute('data-sound');
    const sound = Sounds[soundType];
    
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => {
            // Silenciar error si el usuario no ha interactuado
            if (err.name !== 'NotAllowedError') {
                console.log('Error reproduciendo sonido:', err);
            }
        });
    }
}

function playSprayEffect() {
    if (AppState.soundsEnabled && Sounds.spray) {
        setTimeout(() => {
            Sounds.spray.currentTime = 0;
            Sounds.spray.play().catch(e => console.log('Spray sound not available'));
        }, 1000);
    }
}

// ===== SISTEMA DE TEMA =====
function initTheme() {
    if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('urban_theme');
    if (savedTheme) {
        AppState.theme = savedTheme;
        applyTheme();
    }
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('urban_theme', AppState.theme);
    applyTheme();
    
    // Reproducir sonido
    if (AppState.soundsEnabled && Sounds.click) {
        Sounds.click.currentTime = 0;
        Sounds.click.play();
    }
}

function applyTheme() {
    document.body.className = `theme-${AppState.theme}`;
    
    // Actualizar icono
    if (DOM.themeToggle) {
        const icon = DOM.themeToggle.querySelector('i');
        if (icon) {
            icon.className = AppState.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        DOM.themeToggle.setAttribute('aria-label',
            AppState.theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
        );
    }
}

// ===== NAVEGACIÓN =====
function initNavigation() {
    // Toggle menú móvil
    if (DOM.mobileToggle && DOM.navMenu) {
        DOM.mobileToggle.addEventListener('click', toggleMobileMenu);
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (DOM.navMenu.classList.contains('active') &&
                !DOM.navMenu.contains(e.target) &&
                !DOM.mobileToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScroll);
    });
    
    // Botón volver arriba
    if (DOM.backTop) {
        DOM.backTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Actualizar navegación al scroll
    updateNavigationOnScroll();
}

function toggleMobileMenu() {
    if (!DOM.mobileToggle || !DOM.navMenu) return;
    
    const isActive = DOM.navMenu.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
    
    // Sonido
    if (AppState.soundsEnabled && Sounds.click) {
        Sounds.click.currentTime = 0;
        Sounds.click.play();
    }
}

function openMobileMenu() {
    DOM.mobileToggle.classList.add('active');
    DOM.navMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    DOM.mobileToggle.classList.remove('active');
    DOM.navMenu.classList.remove('active');
    document.body.style.overflow = '';
}

function smoothScroll(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    // Cerrar menú móvil si está abierto
    if (DOM.navMenu && DOM.navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
    
    // Scroll suave
    window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
    });
    
    // Actualizar enlace activo
    updateActiveNavLink(targetId);
}

function updateActiveNavLink(targetId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === targetId) {
            item.classList.add('active');
        }
    });
}

function updateNavigationOnScroll() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                AppState.scrollY = window.scrollY;
                
                // Actualizar indicador de scroll
                updateScrollIndicator();
                
                // Mostrar/ocultar botón volver arriba
                if (DOM.backTop) {
                    if (AppState.scrollY > 500) {
                        DOM.backTop.classList.add('visible');
                    } else {
                        DOM.backTop.classList.remove('visible');
                    }
                }
                
                // Actualizar sección activa
                updateActiveSection();
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateScrollIndicator() {
    const indicator = document.querySelector('.nav-indicator');
    if (!indicator) return;
    
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollable) * 100;
    indicator.style.width = `${scrolled}%`;
}

function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            AppState.currentSection = sectionId;
            updateActiveNavLink(`#${sectionId}`);
        }
    });
}

// ===== ANIMACIONES =====
function initAnimations() {
    // Tipo máquina de escribir
    initTypewriter();
    
    // Efectos hover en botones
    initButtonEffects();
    
    // Animación de logo spray
    if (DOM.logoSpray) {
        DOM.logoSpray.addEventListener('mouseenter', () => {
            if (AppState.soundsEnabled && Sounds.spray) {
                Sounds.spray.currentTime = 0;
                Sounds.spray.play();
            }
        });
    }
}

function initTypewriter() {
    const typewriter = document.querySelector('.typewriter-text');
    if (!typewriter) return;
    
    const texts = [
        "Impresión 3D • Reparación Expert • Publicidad Impactante",
        "Calidad Premium • Estilo Urbano • Garantía Total",
        "Innovación Tecnológica • Creatividad Sin Límites",
        "Soluciones Personalizadas • Acabados Perfectos"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriter.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            speed = 50;
        } else {
            typewriter.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            speed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            speed = 1500;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            speed = 500;
        }
        
        setTimeout(type, speed);
    }
    
    // Iniciar después de 2 segundos
    setTimeout(type, 2000);
}

function initButtonEffects() {
    // Efecto ripple en botones primarios
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (AppState.touchSupported) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: 0;
                height: 0;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.style.width = '200px';
                ripple.style.height = '200px';
                ripple.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// ===== EFECTOS GRAFITI =====
function initGraffitiEffects() {
    // Efecto de spray en hover de botones principales
    document.querySelectorAll('.btn-primary, .logo').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            if (AppState.soundsEnabled && Sounds.spray && Math.random() > 0.5) {
                Sounds.spray.currentTime = 0;
                Sounds.spray.play();
            }
            
            if (AppState.graffitiMode) {
                createSprayEffect(e.clientX, e.clientY);
            }
        });
    });
    
    // Activar modo grafiti con doble clic en el logo
    if (DOM.logoSpray) {
        let clickCount = 0;
        let clickTimer;
        
        DOM.logoSpray.addEventListener('click', (e) => {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 500);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                toggleGraffitiMode();
            }
        });
    }
}

function toggleGraffitiMode() {
    AppState.graffitiMode = !AppState.graffitiMode;
    
    if (AppState.graffitiMode) {
        document.body.classList.add('graffiti-active');
        showNotification('Modo Grafiti Activado 🎨', 'info');
        
        // Agregar evento para crear sprays al hacer clic
        document.addEventListener('click', createGraffitiOnClick);
    } else {
        document.body.classList.remove('graffiti-active');
        showNotification('Modo Grafiti Desactivado', 'info');
        document.removeEventListener('click', createGraffitiOnClick);
    }
}

function createGraffitiOnClick(e) {
    if (e.target.closest('button, a, input, textarea, select')) return;
    createSprayEffect(e.clientX, e.clientY);
}

function createSprayEffect(x, y) {
    const spray = document.createElement('div');
    spray.className = 'spray-effect';
    spray.style.cssText = `
        position: fixed;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, 
            ${Math.random() > 0.5 ? 'var(--neon-pink)' : 'var(--neon-cyan)'} 0%, 
            transparent 70%);
        opacity: 0.3;
        filter: blur(15px);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        left: ${x - 50}px;
        top: ${y - 50}px;
        transform: scale(0);
        animation: sprayAppear 0.5s ease-out forwards;
    `;
    
    document.body.appendChild(spray);
    
    setTimeout(() => {
        spray.style.opacity = '0';
        setTimeout(() => {
            if (spray.parentNode) {
                spray.parentNode.removeChild(spray);
            }
        }, 500);
    }, 1000);
    
    // Crear estilo para la animación
    if (!document.querySelector('#spray-animation')) {
        const style = document.createElement('style');
        style.id = 'spray-animation';
        style.textContent = `
            @keyframes sprayAppear {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.2); opacity: 0.4; }
                100% { transform: scale(1); opacity: 0.3; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== CONTADORES ANIMADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-value[data-count]');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const suffix = element.textContent.includes('%') ? '%' : '';
    const duration = 2000;
    const step = target / (duration / 16);
    
    let current = 0;
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// ===== FORMULARIO =====
function initForm() {
    if (!DOM.contactForm) return;
    
    DOM.contactForm.addEventListener('submit', handleFormSubmit);
    
    // Botón de copiar email
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', handleCopyEmail);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Simular envío
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    submitBtn.disabled = true;
    
    // Sonido
    if (AppState.soundsEnabled && Sounds.click) {
        Sounds.click.currentTime = 0;
        Sounds.click.play();
    }
    
    setTimeout(() => {
        // Mostrar éxito
        submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡ENVIADO!';
        submitBtn.style.background = 'linear-gradient(135deg, #00FF88, #00CC6A)';
        
        // Mensaje de confirmación
        showNotification('Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
        
        // Reset después de 3 segundos
        setTimeout(() => {
            DOM.contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }, 3000);
    }, 1500);
}

function handleCopyEmail(e) {
    e.preventDefault();
    
    const btn = e.currentTarget;
    const text = btn.getAttribute('data-text');
    
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        // Feedback visual
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
        btn.style.color = '#00FF88';
        
        // Sonido
        if (AppState.soundsEnabled && Sounds.click) {
            Sounds.click.currentTime = 0;
            Sounds.click.play();
        }
        
        // Notificación
        showNotification('Email copiado al portapapeles', 'info');
        
        // Restaurar después de 2 segundos
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar el email', 'error');
    });
}

// ===== NOTIFICACIONES =====
function showNotification(message, type) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== EFECTOS DE SCROLL =====
function initScrollEffects() {
    // Reveal on scroll
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    // Parallax suave
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initParallax();
    }
}

function initParallax() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                
                // Efecto parallax en elementos
                document.querySelectorAll('[data-parallax]').forEach(el => {
                    const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ===== OBSERVERS =====
function initObservers() {
    // Observer para lazy loading de imágenes
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===== CANVAS EFFECTS =====
function initCanvasEffects() {
    // Canvas de impresora 3D simple
    const canvas = document.getElementById('printerCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawPrinter();
    }
    
    function drawPrinter() {
        if (!ctx) return;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar impresora simplificada
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Base
        ctx.fillStyle = 'rgba(42, 42, 42, 0.5)';
        ctx.fillRect(centerX - 100, centerY + 50, 200, 30);
        
        // Plataforma
        ctx.fillStyle = 'rgba(60, 60, 60, 0.6)';
        ctx.fillRect(centerX - 80, centerY - 30, 160, 80);
        
        // Estructura
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY + 50);
        ctx.lineTo(centerX - 100, centerY - 50);
        ctx.lineTo(centerX + 100, centerY - 50);
        ctx.lineTo(centerX + 100, centerY + 50);
        ctx.stroke();
        
        // Cabeza de impresión
        const time = Date.now() * 0.002;
        const headX = centerX - 60 + Math.sin(time) * 120;
        const headY = centerY - 20 + Math.cos(time * 0.7) * 10;
        
        ctx.fillStyle = 'rgba(51, 51, 51, 0.8)';
        ctx.fillRect(headX - 15, headY - 5, 30, 10);
        
        // Boquilla
        ctx.fillStyle = '#FF2E93';
        ctx.beginPath();
        ctx.arc(headX, headY + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Luz de boquilla
        ctx.fillStyle = 'rgba(255, 46, 147, 0.2)';
        ctx.beginPath();
        ctx.arc(headX, headY + 5, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Capas de impresión
        for (let i = 0; i < 10; i++) {
            const layerY = centerY + 20 - i * 2;
            const layerWidth = 30 + Math.sin(time + i) * 10;
            const layerX = centerX - layerWidth / 2;
            
            ctx.fillStyle = `rgba(0, 212, 255, ${0.1 + i * 0.05})`;
            ctx.fillRect(layerX, layerY, layerWidth, 2);
        }
    }
    
    // Inicializar
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animación
    function animate() {
        drawPrinter();
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ===== GALERÍA FILTRO =====
function initGalleryFilter() {
    if (!DOM.filterButtons.length || !DOM.galleryItems.length) return;
    
    DOM.filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover active de todos los botones
            DOM.filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar active al botón clickeado
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filtrar items
            DOM.galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // Sonido
            if (AppState.soundsEnabled && Sounds.click) {
                Sounds.click.currentTime = 0;
                Sounds.click.play();
            }
        });
    });
}

// ===== BOTONES FLOTANTES =====
function initFloatingButtons() {
    // Efecto hover en WhatsApp
    if (DOM.whatsappFloat) {
        DOM.whatsappFloat.addEventListener('mouseenter', () => {
            if (AppState.soundsEnabled && Sounds.click) {
                Sounds.click.currentTime = 0;
                Sounds.click.play();
            }
        });
    }
}

// ===== MODAL =====
function initModal() {
    if (!DOM.projectModal || !DOM.modalClose) return;
    
    // Abrir modal al hacer clic en proyectos
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(this.closest('.gallery-item'));
        });
    });
    
    // Cerrar modal
    DOM.modalClose.addEventListener('click', closeModal);
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.projectModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Cerrar haciendo clic fuera
    DOM.projectModal.addEventListener('click', (e) => {
        if (e.target === DOM.projectModal) {
            closeModal();
        }
    });
}

function openModal(galleryItem) {
    const img = galleryItem.querySelector('img');
    const title = galleryItem.querySelector('h3').textContent;
    const description = galleryItem.querySelector('p').textContent;
    const category = galleryItem.getAttribute('data-category');
    
    const modalBody = DOM.projectModal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="modal-image">
            <img src="${img.src}" alt="${img.alt}">
        </div>
        <div class="modal-content">
            <span class="modal-category">${category.toUpperCase()}</span>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-description">${description}</p>
            <div class="modal-actions">
                <a href="#contacto" class="btn btn-primary">Cotizar Proyecto Similar</a>
            </div>
        </div>
    `;
    
    DOM.projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Sonido
    if (AppState.soundsEnabled && Sounds.print) {
        Sounds.print.currentTime = 0;
        Sounds.print.play();
    }
}

function closeModal() {
    DOM.projectModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Sonido
    if (AppState.soundsEnabled && Sounds.click) {
        Sounds.click.currentTime = 0;
        Sounds.click.play();
    }
}

// ===== OPTIMIZACIONES PARA MÓVIL =====
function optimizeForMobile() {
    // Reducir animaciones complejas en móvil
    document.querySelectorAll('.decoration-cube, .decoration-spray, .decoration-phone, .decoration-film')
        .forEach(el => el.style.display = 'none');
    
    // Ajustar tiempos de animación
    document.documentElement.style.setProperty('--transition-normal', '0.2s');
    document.documentElement.style.setProperty('--transition-slow', '0.3s');
}

// ===== MANEJADORES DE EVENTOS GLOBALES =====
window.addEventListener('resize', debounce(() => {
    AppState.isMobile = window.innerWidth <= 768;
    if (AppState.isMobile) {
        optimizeForMobile();
    }
}, 250));

// Debounce para performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== OFFLINE SUPPORT =====
window.addEventListener('online', () => {
    showNotification('Conexión restablecida', 'info');
});

window.addEventListener('offline', () => {
    showNotification('Estás offline. Algunas funciones pueden no estar disponibles.', 'error');
});

// Inicializar modal después de que todo esté listo
setTimeout(() => {
    initModal();
}, 1000);
