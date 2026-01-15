// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎨 ODA Studio 🚀', 'font-size: 24px; color: #00FF88; font-weight: bold;');
    console.log('Sistema de arte urbano-tecnológico iniciado');
    
    // Inicializar todos los sistemas
    initParticles();
    initMenu();
    initAnimations();
    initCounters();
    initPrintingAnimation();
    initContactForm();
    initScrollEffects();
    initRevealEmail();
});

// ===== PARTÍCULAS DE FONDO =====
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: ["#00FF88", "#00A8FF", "#FF2E93"] },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00FF88",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// ===== MENÚ MÓVIL =====
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Cerrar menú al hacer clic en enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
                
                // Actualizar enlace activo
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Cerrar menú con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ===== ANIMACIONES GSAP =====
function initAnimations() {
    // Animación del logo 3D
    const logo3d = document.getElementById('logo3d');
    if (logo3d) {
        logo3d.addEventListener('mouseenter', () => {
            logo3d.style.animation = 'logoFloat 0.5s ease';
            setTimeout(() => {
                logo3d.style.animation = '';
            }, 500);
        });
    }
    
    // Animación de entrada de elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Animación específica para tarjetas
                if (entry.target.classList.contains('service-card')) {
                    entry.target.style.animationDelay = `${entry.target.dataset.delay || '0'}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observar elementos
    const animatedElements = document.querySelectorAll('.service-card, .step, .gallery-item');
    animatedElements.forEach((el, index) => {
        el.dataset.delay = index * 0.2;
        observer.observe(el);
    });
}

// ===== CONTADORES ANIMADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const suffix = counter.textContent.includes('%') ? '%' : '';
        
        let count = 0;
        const increment = target / 100;
        const updateCounter = () => {
            if (count < target) {
                count += increment;
                counter.textContent = Math.floor(count) + suffix;
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        // Iniciar cuando sea visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCounter();
                observer.unobserve(counter);
            }
        });
        
        observer.observe(counter);
    });
}

// ===== ANIMACIÓN DE IMPRESIÓN =====
function initPrintingAnimation() {
    const printingObject = document.getElementById('printingObject');
    
    if (printingObject) {
        // Efecto de capas de impresión
        setInterval(() => {
            const layer = document.createElement('div');
            layer.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 2px;
                background: #00FF88;
                opacity: 0.7;
            `;
            printingObject.appendChild(layer);
            
            // Limitar número de capas
            if (printingObject.children.length > 10) {
                printingObject.removeChild(printingObject.firstChild);
            }
            
            // Animación de capas
            Array.from(printingObject.children).forEach((layer, index) => {
                layer.style.bottom = `${index * 10}px`;
                layer.style.opacity = 0.7 - (index * 0.07);
            });
        }, 300);
    }
}

// ===== FORMULARIO DE CONTACTO =====
function initContactForm() {
    const form = document.getElementById('projectForm');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Simular envío
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡ENVIADO!';
                submitBtn.style.background = '#00FF88';
                submitBtn.style.color = '#000';
                
                // Mostrar mensaje de éxito
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h3>¡Propuesta enviada!</h3>
                    <p>Te contactaremos en menos de 2 horas.</p>
                `;
                form.appendChild(successMsg);
                
                // Resetear después de 3 segundos
                setTimeout(() => {
                    form.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    successMsg.remove();
                }, 3000);
            }, 1500);
        });
    }
}

// ===== EFECTOS DE SCROLL =====
function initScrollEffects() {
    const header = document.querySelector('.main-header');
    
    // Header scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Actualizar enlaces activos
        updateActiveNavLink();
    });
    
    // Actualizar enlace activo
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href="#${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[href="#${sectionId}"]`)?.classList.remove('active');
            }
        });
    }
}

// ===== REVELAR EMAIL =====
function initRevealEmail() {
    const revealBtn = document.getElementById('revealEmail');
    
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            const placeholder = document.querySelector('.email-placeholder');
            if (placeholder) {
                placeholder.textContent = 'contacto@oda.studio';
                revealBtn.textContent = '📧 COPIADO';
                
                // Copiar al portapapeles
                navigator.clipboard.writeText('contacto@oda.studio');
                
                // Restaurar después de 3 segundos
                setTimeout(() => {
                    revealBtn.textContent = 'REVELAR';
                }, 3000);
            }
        });
    }
}

// ===== EFECTOS DE SONIDO (opcional) =====
function playPrintSound() {
    // Podrías agregar sonidos de impresora 3D aquí
    console.log('🖨️ Sonido de impresión');
}

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

// ===== CARGAR MÁS ANIMACIONES =====
// Agregar estas animaciones al CSS
const additionalAnimations = `
@keyframes logoFloat {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-10px) rotate(2deg); }
    100% { transform: translateY(0) rotate(0); }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated {
    animation: fadeInUp 0.8s ease forwards;
}

.success-message {
    background: rgba(0, 255, 136, 0.1);
    border: 2px solid #00FF88;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    margin-top: 2rem;
    animation: fadeInUp 0.5s ease;
}

.success-message i {
    font-size: 3rem;
    color: #00FF88;
    margin-bottom: 1rem;
}

.success-message h3 {
    color: #00FF88;
    margin-bottom: 0.5rem;
}

.success-message p {
    color: #ccc;
}
`;

// Inyectar animaciones adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalAnimations;
document.head.appendChild(styleSheet);

// ===== RESIZE HANDLER =====
window.addEventListener('resize', () => {
    // Recalcular cosas si es necesario
    console.log('📐 Ventana redimensionada');
});
