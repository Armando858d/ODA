// ===== VARIABLES GLOBALES =====
let isMobile = window.innerWidth <= 1024;
let scrollPosition = 0;

// ===== LOADER =====
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 1500);
});

// ===== MENÚ MÓVIL =====
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const mobileClose = document.querySelector('.mobile-close');

if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
        navMobile.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    mobileClose.addEventListener('click', () => {
        navMobile.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Cerrar menú al hacer clic en enlace
    const mobileLinks = document.querySelectorAll('.mobile-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMobile.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== PARALLAX =====
function initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxLayers.forEach(layer => {
            const speed = layer.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            layer.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ===== ANIMACIONES AL SCROLL =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Animación específica para tarjetas de servicio
                if (entry.target.classList.contains('service-card')) {
                    entry.target.style.animationDelay = `${entry.target.dataset.delay || '0'}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observar elementos
    const animatedElements = document.querySelectorAll('.service-card, .gallery-item, .philosophy-item, .info-card');
    animatedElements.forEach((el, index) => {
        el.dataset.delay = index * 0.2;
        observer.observe(el);
    });
}

// ===== FORMULARIO =====
function initForm() {
    const form = document.getElementById('premiumForm');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular envío
            const submitBtn = form.querySelector('.form-submit');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ENVIADO';
                submitBtn.style.background = '#25D366';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    form.reset();
                }, 3000);
            }, 2000);
        });
    }
}

// ===== CONTADORES ANIMADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace('+', '').replace('%', ''));
        const suffix = counter.textContent.includes('%') ? '%' : '';
        const prefix = counter.textContent.includes('+') ? '+' : '';
        
        let count = 0;
        const increment = target / 100;
        const interval = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(interval);
            }
            counter.textContent = prefix + Math.floor(count) + suffix;
        }, 20);
    });
}

// ===== ELEMENTOS FLOTANTES =====
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-cube, .floating-spray, .floating-diamond');
    
    floatingElements.forEach(el => {
        // Movimiento aleatorio
        setInterval(() => {
            const x = Math.random() * 20 - 10;
            const y = Math.random() * 20 - 10;
            el.style.transform = `translate(${x}px, ${y}px)`;
        }, 3000);
    });
}

// ===== SCROLL SUAVE =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== HEADER SCROLL =====
function initHeaderScroll() {
    const header = document.querySelector('.nav-premium');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
}

// ===== WHATSAPP FLOTANTE =====
function initWhatsAppFloat() {
    const floatBtn = document.querySelector('.whatsapp-float');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            floatBtn.classList.add('visible');
        } else {
            floatBtn.classList.remove('visible');
        }
    });
}

// ===== INICIALIZAR TODO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c⚡ ODA LUXURY URBAN ⚡', 'color: #FFD700; font-size: 24px; font-weight: bold;');
    console.log('%cExperiencia premium cargada', 'color: #888;');
    
    // Inicializar componentes
    initParallax();
    initScrollAnimations();
    initForm();
    initFloatingElements();
    initSmoothScroll();
    initHeaderScroll();
    initWhatsAppFloat();
    
    // Observar elementos para animaciones
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stat-number')) {
                    initCounters();
                }
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.5 });
    
    // Observar contadores
    document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
});

// ===== RESIZE HANDLER =====
window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 1024;
});

// ===== CURSOR PERSONALIZADO (opcional premium) =====
function initCustomCursor() {
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Cambiar cursor en elementos interactivos
        const interactiveElements = document.querySelectorAll('a, button, .service-card, .gallery-item');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }
}

// Descomentar para activar cursor personalizado
// initCustomCursor();

// ===== ANIMACIÓN DE TEXTO TIPOWRITER =====
function initTypewriter() {
    const elements = document.querySelectorAll('[data-typewriter]');
    
    elements.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        
        let i = 0;
        const type = () => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        };
        
        // Iniciar cuando sea visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                type();
                observer.unobserve(el);
            }
        });
        
        observer.observe(el);
    });
}
