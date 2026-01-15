// ===== VARIABLES GLOBALES =====
let isMobile = window.innerWidth <= 1024;
let scrollPosition = 0;
let menuOpen = false;
let ticking = false;

// ===== INICIALIZACIÓN COMPLETA =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c⚡ ODA IMPRESIONES 3D ⚡', 'color: #FFD700; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #00FF88;');
    console.log('%cSistema premium-tecnológico iniciado', 'color: #00FF88; font-size: 14px;');
    
    // Inicializar todos los sistemas
    initLoader();
    initParticles();
    initMenu();
    initParallax();
    initAnimations();
    initCounters();
    initPrintingAnimation();
    initForms();
    initScrollEffects();
    initFloatingElements();
    initSmoothScroll();
    initHeaderScroll();
    initWhatsAppFloat();
    initVisibilityObserver();
    
    // Inyectar estilos adicionales
    injectAdditionalStyles();
});

// ===== LOADER DE LUJO =====
function initLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 1500);
    }
}

// ===== PARTÍCULAS DE FONDO =====
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { 
                    value: 50, 
                    density: { 
                        enable: true, 
                        value_area: 800 
                    }
                },
                color: { 
                    value: ["#FFD700", "#00FF88", "#00A8FF"] 
                },
                shape: { 
                    type: "circle" 
                },
                opacity: { 
                    value: 0.5, 
                    random: true 
                },
                size: { 
                    value: 3, 
                    random: true 
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#FFD700",
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
                    onhover: { 
                        enable: true, 
                        mode: "repulse" 
                    },
                    onclick: { 
                        enable: true, 
                        mode: "push" 
                    },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// ===== MENÚ COMBINADO =====
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');
    const mobileClose = document.querySelector('.mobile-close');
    
    if (menuToggle && navMobile) {
        // Toggle menú móvil
        menuToggle.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navMobile.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = menuOpen ? 'hidden' : '';
            
            // Animación de hamburguesa
            const spans = menuToggle.querySelectorAll('span');
            if (menuOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Cerrar con botón X
        if (mobileClose) {
            mobileClose.addEventListener('click', closeMenu);
        }
        
        // Cerrar con escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuOpen) {
                closeMenu();
            }
        });
        
        // Cerrar al hacer clic en enlace
        const mobileLinks = document.querySelectorAll('.mobile-links a, .nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
                
                // Actualizar enlace activo
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Animación del logo 3D
        const logo3d = document.getElementById('logo3d');
        if (logo3d) {
            logo3d.addEventListener('mouseenter', () => {
                logo3d.style.animation = 'logoFloat 0.5s ease';
                setTimeout(() => {
                    logo3d.style.animation = '';
                }, 500);
            });
            
            logo3d.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
}

function closeMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMobile = document.getElementById('navMobile');
    const spans = menuToggle?.querySelectorAll('span');
    
    menuOpen = false;
    navMobile?.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.style.overflow = '';
    
    if (spans) {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// ===== PARALLAX =====
function initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    if (parallaxLayers.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 0.1;
                const yPos = -(scrolled * speed);
                layer.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// ===== ANIMACIONES AL SCROLL =====
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Retardo personalizado
                if (entry.target.classList.contains('service-card') || 
                    entry.target.classList.contains('step') || 
                    entry.target.classList.contains('gallery-item')) {
                    const delay = entry.target.dataset.delay || '0';
                    entry.target.style.animationDelay = `${delay}s`;
                }
                
                // Contadores cuando sean visibles
                if (entry.target.classList.contains('stat-number')) {
                    initCounters();
                }
            }
        });
    }, observerOptions);
    
    // Observar elementos animables
    const animatedElements = document.querySelectorAll(
        '.service-card, .step, .gallery-item, .philosophy-item, .info-card'
    );
    
    animatedElements.forEach((el, index) => {
        el.dataset.delay = (index * 0.2).toFixed(1);
        observer.observe(el);
    });
}

// ===== CONTADORES ANIMADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    counters.forEach(counter => {
        // Verificar si ya fue animado
        if (counter.classList.contains('counted')) return;
        
        const originalText = counter.textContent;
        let target;
        let suffix = '';
        let prefix = '';
        
        // Detectar tipo de contador
        if (counter.hasAttribute('data-count')) {
            target = parseInt(counter.getAttribute('data-count'));
            suffix = originalText.includes('%') ? '%' : '';
        } else {
            const cleanText = originalText.replace(/[^0-9]/g, '');
            target = parseInt(cleanText) || 100;
            suffix = originalText.includes('%') ? '%' : '';
            prefix = originalText.includes('+') ? '+' : '';
        }
        
        let count = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;
        
        const updateCounter = () => {
            if (count < target) {
                count += increment;
                counter.textContent = prefix + Math.floor(count) + suffix;
                setTimeout(updateCounter, stepTime);
            } else {
                counter.textContent = prefix + target + suffix;
                counter.classList.add('counted');
            }
        };
        
        // Iniciar contador
        updateCounter();
        hasAnimated = true;
    });
    
    return hasAnimated;
}

// ===== ANIMACIÓN DE IMPRESIÓN 3D =====
function initPrintingAnimation() {
    const printingObject = document.getElementById('printingObject');
    
    if (printingObject) {
        // Crear efecto de capas de impresión
        let layerCount = 0;
        const maxLayers = 8;
        
        const printInterval = setInterval(() => {
            if (layerCount < maxLayers) {
                const layer = document.createElement('div');
                layer.className = 'print-layer';
                layer.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: ${80 - (layerCount * 3)}px;
                    height: 12px;
                    background: linear-gradient(to right, #00FF88, #FFD700);
                    opacity: 0.8;
                    border-radius: 2px;
                    z-index: ${layerCount};
                `;
                printingObject.appendChild(layer);
                layerCount++;
                
                // Animar capas existentes
                const layers = printingObject.querySelectorAll('.print-layer');
                layers.forEach((layer, index) => {
                    const bottom = index * 12;
                    const opacity = 0.8 - (index * 0.1);
                    layer.style.bottom = `${bottom}px`;
                    layer.style.opacity = opacity;
                    
                    // Efecto de calor en la capa superior
                    if (index === layers.length - 1) {
                        layer.style.boxShadow = '0 0 10px #FFD700';
                    }
                });
                
                // Limitar número de capas
                if (layers.length > maxLayers) {
                    printingObject.removeChild(layers[0]);
                    layerCount--;
                }
            } else {
                // Resetear animación
                setTimeout(() => {
                    printingObject.innerHTML = '';
                    layerCount = 0;
                }, 1000);
            }
        }, 500);
        
        // Limpiar intervalo cuando se desmonta
        window.addEventListener('beforeunload', () => {
            clearInterval(printInterval);
        });
    }
}

// ===== FORMULARIOS OPTIMIZADOS =====
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Validación en tiempo real
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => validateField(input));
            input.addEventListener('blur', () => validateField(input, true));
            
            // Contador para textareas
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('input', updateCharCounter);
            }
        });
        
        // Submit handler
        form.addEventListener('submit', handleFormSubmit);
    });
}

function validateField(field, showError = false) {
    const parent = field.parentElement;
    let errorEl = parent.querySelector('.input-error');
    
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'input-error';
        parent.appendChild(errorEl);
    }
    
    // Limpiar error previo
    parent.classList.remove('error');
    errorEl.textContent = '';
    
    if (!field.value.trim() && field.required) {
        if (showError) {
            parent.classList.add('error');
            errorEl.textContent = 'Este campo es requerido';
        }
        return false;
    }
    
    // Validaciones específicas
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            if (showError) {
                parent.classList.add('error');
                errorEl.textContent = 'Email inválido';
            }
            return false;
        }
    }
    
    if (field.type === 'textarea' && field.hasAttribute('minlength')) {
        const minLength = parseInt(field.getAttribute('minlength'));
        if (field.value.length < minLength) {
            if (showError) {
                parent.classList.add('error');
                errorEl.textContent = `Mínimo ${minLength} caracteres`;
            }
            return false;
        }
    }
    
    return true;
}

function updateCharCounter(e) {
    const textarea = e.target;
    let counter = textarea.parentElement.querySelector('.char-counter');
    
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'char-counter';
        textarea.parentElement.appendChild(counter);
    }
    
    const count = textarea.value.length;
    const max = 500;
    counter.textContent = `${count}/${max}`;
    
    // Cambiar color según longitud
    if (count < 50) {
        counter.style.color = '#FF4757';
    } else if (count < 100) {
        counter.style.color = '#FFD700';
    } else {
        counter.style.color = '#00FF88';
    }
    
    // Limitar caracteres
    if (count > max) {
        textarea.value = textarea.value.substring(0, max);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validar todos los campos
    const inputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input, true)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        shakeForm(form);
        return;
    }
    
    // Deshabilitar botón y mostrar loader
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    submitBtn.disabled = true;
    
    try {
        // Crear loader
        const formLoader = document.createElement('div');
        formLoader.className = 'form-loader';
        formLoader.innerHTML = '<div class="spinner"></div>';
        form.appendChild(formLoader);
        
        // Enviar formulario a Formspree
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Remover loader
        formLoader.remove();
        
        if (response.ok) {
            showSuccessMessage(form, submitBtn, originalText);
        } else {
            throw new Error('Error en el envío');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al enviar. Intenta nuevamente.', 'error');
        
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showSuccessMessage(form, submitBtn, originalText) {
    // Mostrar éxito
    submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡ENVIADO!';
    submitBtn.style.background = 'linear-gradient(135deg, #00FF88, #00A8FF)';
    submitBtn.style.color = '#000';
    
    // Mostrar mensaje de éxito
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>¡Solicitud enviada con éxito!</h3>
        <p>Te contactaremos en menos de 2 horas hábiles.</p>
        <small>Revisa tu bandeja de spam si no ves nuestro email</small>
    `;
    form.parentElement.appendChild(successMsg);
    
    // Log de datos (simulado)
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('📨 Formulario enviado:', data);
    
    // Resetear después de 5 segundos
    setTimeout(() => {
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        successMsg.remove();
        
        // Resetear contadores
        const charCounters = form.querySelectorAll('.char-counter');
        charCounters.forEach(counter => {
            counter.textContent = '0/500';
            counter.style.color = '';
        });
        
        // Resetear errores
        const errors = form.querySelectorAll('.input-error');
        errors.forEach(error => error.textContent = '');
        
        const errorGroups = form.querySelectorAll('.form-group.error');
        errorGroups.forEach(group => group.classList.remove('error'));
    }, 5000);
}

function shakeForm(form) {
    form.style.animation = 'shake 0.5s';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
}

// ===== EFECTOS DE SCROLL OPTIMIZADOS =====
function initScrollEffects() {
    // Throttle para scroll
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function handleScroll() {
    const scrollPos = window.pageYOffset;
    const header = document.querySelector('.main-nav-combined');
    
    // Header effect
    if (scrollPos > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Update active nav link
    updateActiveNavLink(scrollPos);
    
    // Show/hide WhatsApp button
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.classList.toggle('visible', scrollPos > 500);
    }
}

function updateActiveNavLink(scrollPos) {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.main-nav-combined').offsetHeight;
    const scrollPosition = scrollPos + headerHeight + 100;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').replace('#', '');
        if (href === currentSection) {
            link.classList.add('active');
        }
    });
}

// ===== ELEMENTOS FLOTANTES =====
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-cube, .floating-spray, .floating-diamond');
    
    floatingElements.forEach(el => {
        // Movimiento aleatorio suave
        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;
        
        function moveElement() {
            // Movimiento suave hacia el objetivo
            x += (targetX - x) * 0.05;
            y += (targetY - y) * 0.05;
            
            el.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.5}deg)`;
            
            // Cambiar objetivo aleatoriamente
            if (Math.abs(targetX - x) < 1 && Math.abs(targetY - y) < 1) {
                targetX = (Math.random() * 40 - 20);
                targetY = (Math.random() * 40 - 20);
            }
            
            requestAnimationFrame(moveElement);
        }
        
        // Iniciar animación
        moveElement();
        
        // Interacción con mouse
        el.addEventListener('mouseenter', () => {
            el.style.color = '#FFD700';
            el.style.fontSize = '4rem';
            el.style.transition = 'all 0.3s ease';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.color = '';
            el.style.fontSize = '3rem';
        });
    });
}

// ===== SCROLL SUAVE =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerHeight = document.querySelector('.main-nav-combined').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== HEADER SCROLL =====
function initHeaderScroll() {
    const header = document.querySelector('.main-nav-combined');
    let lastScroll = 0;
    
    if (!header) return;
    
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
    
    if (!floatBtn) return;
    
    // Efecto de pulso periódico
    setInterval(() => {
        floatBtn.classList.add('pulse');
        setTimeout(() => {
            floatBtn.classList.remove('pulse');
        }, 1000);
    }, 8000);
    
    // Click analytics
    floatBtn.addEventListener('click', (e) => {
        console.log('📱 WhatsApp clickeado');
        
        // Añadir efecto de click
        floatBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            floatBtn.style.transform = '';
        }, 200);
    });
}

// ===== OBSERVADOR DE VISIBILIDAD =====
function initVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Elemento visible - puedes agregar animaciones específicas
                entry.target.classList.add('visible');
                
                // Contadores
                if (entry.target.classList.contains('stat-number')) {
                    initCounters();
                }
            }
        });
    }, { threshold: 0.3 });
    
    // Observar elementos importantes
    const importantElements = document.querySelectorAll(
        '.service-card, .philosophy-item, .info-card, .step, .gallery-item'
    );
    
    importantElements.forEach(el => observer.observe(el));
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'success') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== INYECTAR ESTILOS ADICIONALES =====
function injectAdditionalStyles() {
    // Verificar si ya existen
    if (document.querySelector('#additional-styles')) return;
    
    const additionalStyles = `
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
            font-size: 1.5rem;
        }
        
        .success-message p {
            color: #ccc;
            margin-bottom: 0.5rem;
        }
        
        .success-message small {
            color: #888;
            font-size: 0.8rem;
        }
        
        /* Efectos hover mejorados */
        .service-card.luxury:hover .service-icon {
            transform: scale(1.1) rotate(5deg);
            transition: transform 0.3s ease;
        }
        
        .info-card:hover .info-icon {
            transform: rotateY(180deg);
            transition: transform 0.6s ease;
        }
        
        .service-link:hover {
            transform: translateX(5px);
        }
        
        /* Animaciones de entrada */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .fade-in {
            animation: fadeIn 0.8s ease;
        }
        
        .slide-in-up {
            animation: slideInUp 0.8s ease;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'additional-styles';
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}

// ===== RESIZE HANDLER =====
window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 1024;
    
    // Cerrar menú móvil si se cambia a desktop
    if (!isMobile && menuOpen) {
        closeMenu();
    }
    
    // Recalcular elementos si es necesario
    console.log('📐 Ventana redimensionada:', window.innerWidth);
});

// ===== DEBUG HELPERS =====
window.ODA = {
    version: '2.0.0',
    debug: true,
    refreshAnimations: () => {
        console.log('🔄 Refrescando animaciones...');
        initAnimations();
        initCounters();
    },
    showMenu: () => {
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) menuToggle.click();
    },
    scrollToSection: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    },
    testForm: () => {
        const form = document.getElementById('premiumForm');
        if (form) {
            form.querySelector('button[type="submit"]').click();
        }
    }
};

// Log de inicialización completa
console.log('✅ Sistema ODA completamente inicializado');
console.log('📱 Mobile:', isMobile);
console.log('🎨 Estilos inyectados');
console.log('⚡ Listo para imprimir experiencias premium');

// ===== INITIAL SCROLL PARA POSICIONAR ELEMENTOS =====
window.addEventListener('load', () => {
    // Forzar un pequeño scroll para activar efectos
    setTimeout(() => {
        window.scrollTo(0, 1);
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
    }, 100);
});
