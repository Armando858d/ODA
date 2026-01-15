// ===== CONFIGURACIÓN INMEDIATA =====
console.log('%c🚀 ODA URBAN - CARGADO', 'color: #00FF88; font-size: 20px; font-weight: bold;');

// Estado inicial
let soundsEnabled = true;
let isMobile = window.innerWidth <= 768;

// ===== QUITAR PRELOADER INMEDIATO =====
function removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Mostrar contenido inmediato
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        document.body.style.overflow = 'auto';
        
        // Remover después de la animación
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
            }
        }, 500);
    }
}

// ===== INICIAR TODO RÁPIDO =====
function initAll() {
    // 1. Quitar preloader YA
    setTimeout(removePreloader, 1000); // Máximo 1 segundo
    
    // 2. Iniciar sistemas básicos
    initNavigation();
    initAnimations();
    initSounds();
    initButtons();
    initScroll();
    
    // 3. Ajustes para móvil
    if (isMobile) {
        optimizeMobile();
    }
    
    console.log('✅ Página lista en ' + performance.now().toFixed(0) + 'ms');
}

// ===== NAVEGACIÓN SIMPLE =====
function initNavigation() {
    // Menú móvil
    const menuToggle = document.getElementById('mobileToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            
            // Sonido
            playSound('click');
        });
    }
    
    // Scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil
                if (navMenu && navMenu.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
    
    // Botón volver arriba
    const backTop = document.getElementById('backTop');
    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.style.display = window.scrollY > 500 ? 'flex' : 'none';
        });
        
        backTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            playSound('click');
        });
    }
}

// ===== ANIMACIONES BÁSICAS =====
function initAnimations() {
    // Contadores animados
    const counters = document.querySelectorAll('.stat-value[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const suffix = counter.textContent.includes('%') ? '%' : '';
        
        let count = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(count) + suffix;
        }, 30);
    });
    
    // Tipo máquina de escribir
    const typewriter = document.querySelector('.typewriter-text');
    if (typewriter) {
        const texts = [
            "Tecnología urbana de vanguardia",
            "Arte digital con esencia callejera",
            "Innovación 3D y diseño futurista"
        ];
        
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentText = texts[index];
            
            if (isDeleting) {
                typewriter.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriter.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let speed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                speed = 1500;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % texts.length;
                speed = 500;
            }
            
            setTimeout(type, speed);
        }
        
        setTimeout(type, 1000);
    }
    
    // Elementos flotantes
    const floaters = document.querySelectorAll('.decoration-cube, .decoration-spray, .decoration-phone, .decoration-film');
    floaters.forEach((floater, i) => {
        floater.style.animationDelay = `${i * 2}s`;
    });
}

// ===== SISTEMA DE SONIDOS =====
function initSounds() {
    // Toggle de sonidos
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundsEnabled = !soundsEnabled;
            const icon = soundToggle.querySelector('i');
            icon.className = soundsEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            playSound('click');
        });
    }
    
    // Botones con sonido
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-sound]');
        if (button && soundsEnabled) {
            const soundType = button.getAttribute('data-sound');
            playSound(soundType);
        }
    });
}

function playSound(type) {
    if (!soundsEnabled) return;
    
    // Crear audio dinámico (más confiable)
    const audio = new Audio();
    
    switch(type) {
        case 'spray':
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-spray-paint-829.mp3';
            break;
        case 'shake':
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-shaking-a-spray-can-1388.mp3';
            break;
        case 'click':
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3';
            break;
        default:
            return;
    }
    
    audio.volume = 0.3;
    audio.play().catch(e => {
        // Ignorar error si el usuario no ha interactuado
        if (e.name !== 'NotAllowedError') {
            console.log('Sonido no disponible:', e);
        }
    });
}

// ===== BOTONES INTERACTIVOS =====
function initButtons() {
    // WhatsApp flotante
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            playSound('click');
        });
        
        // Efecto hover en desktop
        if (!isMobile) {
            whatsappBtn.addEventListener('mouseenter', () => {
                whatsappBtn.style.width = '180px';
                whatsappBtn.style.borderRadius = '30px';
            });
            
            whatsappBtn.addEventListener('mouseleave', () => {
                whatsappBtn.style.width = '60px';
                whatsappBtn.style.borderRadius = '50%';
            });
        }
    }
    
    // Botones de acción
    document.querySelectorAll('.btn-primary, .btn-secondary, .card-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Efecto visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    // Formulario
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Mostrar loading
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
            submitBtn.disabled = true;
            
            playSound('click');
            
            // Simular envío
            setTimeout(() => {
                // Mostrar éxito
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡ENVIADO!';
                
                // Notificación visual
                showNotification('Mensaje enviado. Te contactaremos pronto.', 'success');
                
                // Resetear después de 2 segundos
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
    
    // Botón de copiar email
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            if (text) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        const icon = this.querySelector('i');
                        const original = icon.className;
                        icon.className = 'fas fa-check';
                        playSound('click');
                        
                        setTimeout(() => {
                            icon.className = original;
                        }, 2000);
                    })
                    .catch(err => console.log('Error copiando:', err));
            }
        });
    });
}

// ===== SCROLL EFFECTS =====
function initScroll() {
    // Reveal animations
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    reveals.forEach(el => observer.observe(el));
    
    // Actualizar navegación
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.main-nav');
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 100);
        }
    });
}

// ===== OPTIMIZACIONES MÓVIL =====
function optimizeMobile() {
    // Reducir animaciones
    document.querySelectorAll('.hero-decoration').forEach(el => {
        el.style.display = 'none';
    });
    
    // Mejorar performance
    document.body.style.webkitOverflowScrolling = 'touch';
}

// ===== NOTIFICACIONES =====
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00FF88' : '#00A8FF'};
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        ">
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== INYECTAR ANIMACIONES CSS =====
function injectAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Revelar elementos */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease;
        }
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Logo spray */
        .spray-dot {
            animation: sprayFloat 3s infinite;
        }
        @keyframes sprayFloat {
            0%, 100% { transform: translate(0, 0); opacity: 0.8; }
            50% { transform: translate(5px, -5px); opacity: 0.4; }
        }
    `;
    document.head.appendChild(style);
}

// ===== INICIAR CUANDO EL DOM ESTÉ LISTO =====
document.addEventListener('DOMContentLoaded', () => {
    // Inyectar animaciones CSS
    injectAnimations();
    
    // Iniciar todo
    initAll();
    
    // Fallback: asegurar que el preloader se quite
    setTimeout(removePreloader, 3000);
});

// ===== FALLBACK PARA ERRORES =====
window.addEventListener('error', (e) => {
    console.log('Error capturado:', e.message);
    removePreloader(); // Asegurar que se quite el preloader
});

// ===== EXPORTAR PARA DEBUG =====
if (window.location.search.includes('debug')) {
    window.debugMode = {
        removePreloader,
        playSound,
        showNotification
    };
}
