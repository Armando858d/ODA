// ===== VARIABLES GLOBALES COMBINADAS =====
let isMobile = window.innerWidth <= 1024;
let scrollPosition = 0;
let menuOpen = false;

// ===== INICIALIZACIÓN COMPLETA =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c⚡ ODA COMBINED ⚡', 'color: #FFD700; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #00FF88;');
    console.log('%cLuxury Urban + Tecnología Street', 'color: #00FF88; font-size: 14px;');
    console.log('Sistema premium-tecnológico iniciado');
    
    // Inicializar todos los sistemas combinados
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
    initRevealEmail();
    
    // Opcional: Cursor personalizado
    // initCustomCursor();
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
                    value: 60, 
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
    const navLinks = document.querySelectorAll('.nav-link');
    
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
            mobileClose.addEventListener('click', () => {
                closeMenu();
            });
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
                const speed = layer.getAttribute('data-speed') || 0.1;
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
        '.service-card, .step, .gallery-item, .philosophy-item, .info-card, .stat-number'
    );
    
    animatedElements.forEach((el, index) => {
        el.dataset.delay = (index * 0.2).toFixed(1);
        observer.observe(el);
    });
}

// ===== CONTADORES ANIMADOS COMBINADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;
    
    counters.forEach(counter => {
        // Verificar si ya fue animado
        if (counter.classList.contains('counted')) return;
        
        const originalText = counter.textContent;
        let target;
        let suffix = '';
        let prefix = '';
        
        // Detectar tipo de contador
        if (counter.hasAttribute('data-count')) {
            // Contador con data-count
            target = parseInt(counter.getAttribute('data-count'));
            suffix = originalText.includes('%') ? '%' : '';
        } else {
            // Contador con formato especial
            const cleanText = originalText.replace(/[^0-9]/g, '');
            target = parseInt(cleanText) || 100;
            suffix = originalText.includes('%') ? '%' : '';
            prefix = originalText.includes('+') ? '+' : '';
        }
        
        let count = 0;
        const increment = target / 100;
        const duration = 2000; // 2 segundos
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
        animated = true;
    });
    
    return animated;
}

// ===== ANIMACIÓN DE IMPRESIÓN 3D =====
function initPrintingAnimation() {
    const printingObject = document.getElementById('printingObject');
    
    if (printingObject) {
        // Crear efecto de capas de impresión
        let layerCount = 0;
        const maxLayers = 10;
        
        setInterval(() => {
            if (layerCount < maxLayers) {
                const layer = document.createElement('div');
                layer.className = 'print-layer';
                layer.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: ${80 - (layerCount * 2)}px;
                    height: 10px;
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
                    const bottom = index * 10;
                    const opacity = 0.8 - (index * 0.08);
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
        }, 400);
        
        // Sonido de impresión (opcional)
        printingObject.addEventListener('click', () => {
            playPrintSound();
        });
    }
}

// ===== FORMULARIOS COMBINADOS =====
function initForms() {
    // Formulario premium
    const premiumForm = document.getElementById('premiumForm');
    const projectForm = document.getElementById('projectForm');
    
    if (premiumForm) {
        premiumForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (projectForm) {
        projectForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Validación en tiempo real
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Validación de email
        if (input.type === 'email') {
            input.addEventListener('blur', () => {
                const email = input.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (email && !emailRegex.test(email)) {
                    input.style.borderBottomColor = '#FF4757';
                    showInputError(input, 'Email inválido');
                } else {
                    input.style.borderBottomColor = '';
                    hideInputError(input);
                }
            });
        }
        
        // Contador de caracteres para textarea
        if (input.tagName === 'TEXTAREA') {
            const charCounter = document.createElement('div');
            charCounter.className = 'char-counter';
            charCounter.textContent = '0/500';
            input.parentElement.appendChild(charCounter);
            
            input.addEventListener('input', () => {
                const count = input.value.length;
                charCounter.textContent = `${count}/500`;
                
                if (count < 50) {
                    charCounter.style.color = '#FF4757';
                } else if (count < 100) {
                    charCounter.style.color = '#FFD700';
                } else {
                    charCounter.style.color = '#00FF88';
                }
            });
        }
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validar campos requeridos
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderBottomColor = '#FF4757';
            showInputError(field, 'Este campo es requerido');
            isValid = false;
        } else {
            field.style.borderBottomColor = '';
            hideInputError(field);
        }
    });
    
    if (!isValid) {
        shakeForm(form);
        return;
    }
    
    // Simular envío
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    submitBtn.disabled = true;
    
    // Mostrar loader en el formulario
    const formLoader = document.createElement('div');
    formLoader.className = 'form-loader';
    formLoader.innerHTML = '<div class="spinner"></div>';
    form.appendChild(formLoader);
    
    // Simular delay de red
    setTimeout(() => {
        // Remover loader
        formLoader.remove();
        
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
        
        // Enviar datos (simulado)
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
        }, 5000);
    }, 2000);
}

function showInputError(input, message) {
    let errorElement = input.parentElement.querySelector('.input-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        input.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideInputError(input) {
    const errorElement = input.parentElement.querySelector('.input-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function shakeForm(form) {
    form.style.animation = 'shake 0.5s';
    setTimeout(() => {
        form.style.animation = '';
    }, 500);
}

// ===== EFECTOS DE SCROLL =====
function initScrollEffects() {
    const header = document.querySelector('.main-nav-combined');
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        scrollPosition = window.pageYOffset;
        
        // Header scroll
        if (scrollPosition > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Actualizar enlaces activos
        updateActiveNavLink();
        
        // Mostrar/ocultar botón de WhatsApp
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (whatsappBtn) {
            if (scrollPosition > 500) {
                whatsappBtn.classList.add('visible');
            } else {
                whatsappBtn.classList.remove('visible');
            }
        }
        
        // Efecto parallax en elementos
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-parallax-speed') || 0.5;
            const yPos = -(scrollPosition * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
    
    // Actualizar enlace activo
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollPos = scrollPosition + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
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
    
    // Efecto de pulso
    setInterval(() => {
        floatBtn.classList.add('pulse');
        setTimeout(() => {
            floatBtn.classList.remove('pulse');
        }, 1000);
    }, 5000);
    
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

// ===== REVELAR EMAIL =====
function initRevealEmail() {
    const revealBtn = document.getElementById('revealEmail');
    
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            const placeholder = document.querySelector('.email-placeholder');
            if (placeholder) {
                // Revelar email real
                placeholder.textContent = 'contacto@oda.studio';
                revealBtn.textContent = '📧 COPIADO';
                revealBtn.style.background = 'linear-gradient(135deg, #00FF88, #00A8FF)';
                revealBtn.style.color = '#000';
                
                // Copiar al portapapeles
                navigator.clipboard.writeText('contacto@oda.studio')
                    .then(() => {
                        console.log('📋 Email copiado al portapapeles');
                        
                        // Mostrar notificación
                        showNotification('Email copiado al portapapeles');
                    })
                    .catch(err => {
                        console.error('Error al copiar:', err);
                    });
                
                // Restaurar después de 3 segundos
                setTimeout(() => {
                    revealBtn.textContent = 'REVELAR';
                    revealBtn.style.background = '';
                    revealBtn.style.color = '';
                }, 3000);
            }
        });
    }
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'success') {
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

// ===== SONIDOS (opcional) =====
function playPrintSound() {
    // Podrías agregar sonidos reales aquí
    console.log('🖨️ Sonido de impresión 3D (agregar archivo de sonido)');
    
    // Crear elemento de audio (necesitarías archivos de sonido)
    /*
    const audio = new Audio('print-sound.mp3');
    audio.volume = 0.3;
    audio.play();
    */
}

// ===== CURSOR PERSONALIZADO (opcional) =====
function initCustomCursor() {
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Animación suave del cursor
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            
            requestAnimationFrame(animateCursor);
        }
        
        animateCursor();
        
        // Cambiar cursor en elementos interactivos
        const interactiveElements = document.querySelectorAll(
            'a, button, .service-card, .gallery-item, .info-card, .nav-link'
        );
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursor.style.width = '40px';
                cursor.style.height = '40px';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursor.style.width = '20px';
                cursor.style.height = '20px';
            });
        });
    }
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

// ===== OBSERVADOR DE ELEMENTOS VISIBLES =====
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
                
                // Tipo escritura
                if (entry.target.hasAttribute('data-typewriter')) {
                    initTypewriter(entry.target);
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

// ===== ANIMACIÓN DE TEXTO TIPOWRITER =====
function initTypewriter(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    let i = 0;
    const speed = 50; // ms por caracter
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ===== INYECTAR ESTILOS ADICIONALES =====
function injectAdditionalStyles() {
    const additionalStyles = `
        /* Animaciones adicionales */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        /* Estilos de formulario */
        .input-error {
            color: #FF4757;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            display: none;
        }
        
        .char-counter {
            position: absolute;
            right: 0;
            bottom: -20px;
            font-size: 0.8rem;
            color: #666;
        }
        
        .form-loader {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            z-index: 10;
        }
        
        .form-loader .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid transparent;
            border-top-color: #FFD700;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Notificaciones */
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 10px;
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 10000;
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            border-color: #00FF88;
            background: rgba(0, 255, 136, 0.1);
        }
        
        .notification.error {
            border-color: #FF4757;
            background: rgba(255, 71, 87, 0.1);
        }
        
        .notification i {
            font-size: 1.5rem;
        }
        
        .notification.success i {
            color: #00FF88;
        }
        
        .notification.error i {
            color: #FF4757;
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
        
        /* Responsive adicional */
        @media (max-width: 480px) {
            .hero-stats {
                flex-direction: column;
                gap: 1rem;
            }
            
            .stat {
                flex: 1;
            }
            
            .notification {
                top: auto;
                bottom: 100px;
                left: 20px;
                right: 20px;
                max-width: none;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
}

// ===== INICIALIZACIÓN FINAL =====
// Inyectar estilos adicionales
injectAdditionalStyles();

// Inicializar observador de visibilidad
setTimeout(() => {
    initVisibilityObserver();
}, 1000);

// ===== DEBUG HELPERS =====
window.ODA = {
    version: '1.0.0',
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
    }
};

// Log de inicialización completa
console.log('✅ Sistema ODA Combined completamente inicializado');
console.log('📱 Mobile:', isMobile);
console.log('🎨 Estilos inyectados');
console.log('⚡ Listo para crear arte urbano de lujo');
