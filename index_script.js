// ===== ODA 3D - EXPERIENCIA RESPONSIVE OPTIMIZADA =====

class ODAExperience {
    constructor() {
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth < 1024;
        this.isTouchDevice = 'ontouchstart' in window;
        this.scrollPosition = 0;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        console.log('🚀 ODA EXPERIENCE - VERSIÓN RESPONSIVE');
        console.log(`📱 Dispositivo: ${this.isMobile ? 'Móvil' : this.isTablet ? 'Tablet' : 'Desktop'}`);
        console.log(`👆 Touch: ${this.isTouchDevice ? 'Sí' : 'No'}`);
        
        this.setupLoader();
        this.setupNavigation();
        this.setupAnimations();
        this.setupScrollEffects();
        this.setupParticles();
        this.setupForms();
        this.setupVideo();
        this.setupIntersectionObservers();
        this.setupTouchEvents();
        
        if (!this.isMobile) {
            this.setupCursorEffects();
        }
        
        window.addEventListener('load', () => this.onLoad());
        window.addEventListener('resize', () => this.onResize());
        
        window.ODA = this;
    }

    setupLoader() {
        const loader = document.getElementById('printerLoader');
        if (!loader) return;

        const printProgress = document.getElementById('printProgress');
        const globalProgress = document.getElementById('globalProgress');
        const loadingStatus = document.getElementById('loadingStatus');
        const printingFigure = document.getElementById('printingFigure');
        
        if (!printProgress || !globalProgress || !loadingStatus || !printingFigure) return;

        // Crear figura ODA 3D
        this.createODAFigure(printingFigure);

        // Simular progreso de impresión
        let progress = 0;
        let global = 0;
        const isSlowDevice = this.isMobile || this.isTablet;
        const intervalTime = isSlowDevice ? 40 : 30; // Más lento en móviles
        
        const progressInterval = setInterval(() => {
            progress += 1;
            global += 0.8;
            
            printProgress.style.width = `${progress}%`;
            globalProgress.style.width = `${global}%`;
            
            // Actualizar texto del estado
            if (progress < 20) {
                loadingStatus.textContent = 'CALIBRANDO IMPRESORA...';
            } else if (progress < 40) {
                loadingStatus.textContent = 'CARGANDO FILAMENTO...';
            } else if (progress < 60) {
                loadingStatus.textContent = 'PREPARANDO MODELO ODA...';
            } else if (progress < 80) {
                loadingStatus.textContent = 'IMPRIMIENDO CAPAS...';
            } else if (progress < 95) {
                loadingStatus.textContent = 'ACABANDO PIEZA...';
            } else {
                loadingStatus.textContent = 'FINALIZANDO...';
            }
            
            // Animar figura ODA (solo si no es móvil lento)
            if (printingFigure && !isSlowDevice) {
                const height = (progress / 100) * 120;
                printingFigure.style.height = `${height}px`;
                printingFigure.style.opacity = 0.3 + (progress / 150);
                
                // Efecto de brillo al final
                if (progress > 90) {
                    printingFigure.style.filter = `blur(${2 - ((progress - 90) / 10)}px)`;
                    printingFigure.style.boxShadow = `0 0 ${20 + (progress - 90) * 2}px rgba(255, 62, 122, 0.5)`;
                }
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Esperar un momento para mostrar la figura completa
                setTimeout(() => {
                    loader.classList.add('hidden');
                    
                    setTimeout(() => {
                        loader.style.display = 'none';
                        this.startMainAnimations();
                    }, 500);
                }, 800);
            }
        }, intervalTime);
    }

    createODAFigure(container) {
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Crear cubo base (O)
        const cube = document.createElement('div');
        cube.className = 'oda-cube';
        cube.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #ff3e7a, #9d4edd);
            border-radius: 8px;
            animation: cubePulse 2s ease-in-out infinite;
        `;
        container.appendChild(cube);
        
        // Crear cilindro (D)
        const cylinder = document.createElement('div');
        cylinder.className = 'oda-cylinder';
        cylinder.style.cssText = `
            position: absolute;
            bottom: 70px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 50px;
            background: linear-gradient(45deg, #00d9ff, #9d4edd);
            border-radius: 20px 20px 8px 8px;
            animation: cylinderFloat 3s ease-in-out infinite;
        `;
        container.appendChild(cylinder);
        
        // Crear pirámide (A)
        const pyramid = document.createElement('div');
        pyramid.className = 'oda-pyramid';
        pyramid.style.cssText = `
            position: absolute;
            bottom: 130px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 25px solid transparent;
            border-right: 25px solid transparent;
            border-bottom: 40px solid #ff3e7a;
            animation: pyramidRotate 4s linear infinite;
        `;
        container.appendChild(pyramid);
        
        // Agregar estilos CSS para animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cubePulse {
                0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.8; }
                50% { transform: translateX(-50%) scale(1.05); opacity: 1; }
            }
            
            @keyframes cylinderFloat {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-10px); }
            }
            
            @keyframes pyramidRotate {
                from { transform: translateX(-50%) rotate(0deg); }
                to { transform: translateX(-50%) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setupNavigation() {
        const nav = document.getElementById('cyberNav');
        const toggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.nav-link');
        const navProgress = document.getElementById('navProgress');

        if (!nav || !toggle || !navMenu) return;

        // Menú toggle
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isMenuOpen = !this.isMenuOpen;
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', this.isMenuOpen);
            navMenu.classList.toggle('active');
            document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
        });

        // Cerrar menú al hacer clic en enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.isMenuOpen = false;
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && this.isMenuOpen) {
                this.isMenuOpen = false;
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Smooth scroll optimizado
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Cerrar menú en móviles
                    if (window.innerWidth < 1024) {
                        toggle.classList.remove('active');
                        toggle.setAttribute('aria-expanded', 'false');
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                        this.isMenuOpen = false;
                    }
                    
                    // Scroll suave con offset para navegación fija
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Progress bar en navegación
        if (navProgress) {
            const updateProgress = () => {
                const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = (window.scrollY / windowHeight) * 100;
                navProgress.style.width = `${scrolled}%`;
            };
            
            // Debounce para mejor rendimiento
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                if (scrollTimeout) {
                    window.cancelAnimationFrame(scrollTimeout);
                }
                scrollTimeout = window.requestAnimationFrame(updateProgress);
            });
        }

        // Cambiar estilo de navegación al hacer scroll
        const updateNavStyle = () => {
            this.scrollPosition = window.scrollY;
            
            if (this.scrollPosition > 50) {
                nav.style.background = 'rgba(10, 10, 10, 0.95)';
                nav.style.backdropFilter = 'blur(20px)';
                nav.style.borderBottomColor = 'var(--color-primary)';
            } else {
                nav.style.background = 'rgba(10, 10, 10, 0.9)';
                nav.style.backdropFilter = 'blur(20px)';
                nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
            }
        };
        
        // Throttle para mejor rendimiento
        let navScrollTimeout;
        window.addEventListener('scroll', () => {
            if (!navScrollTimeout) {
                navScrollTimeout = setTimeout(() => {
                    updateNavStyle();
                    navScrollTimeout = null;
                }, 100);
            }
        });
    }

    setupAnimations() {
        // Animación de estadísticas
        this.animateStats();
        
        // Animación de elementos flotantes (solo desktop)
        if (!this.isMobile) {
            this.animateFloatingElements();
        }
        
        // Animación de título del hero
        this.animateHeroTitle();
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-value[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const target = parseInt(stat.getAttribute('data-count'));
                    const suffix = stat.querySelector('.percent');
                    
                    this.animateCounter(stat, target, suffix, 2000);
                    observer.unobserve(stat);
                }
            });
        }, { threshold: 0.5, rootMargin: '50px' });
        
        stats.forEach(stat => observer.observe(stat));
    }

    animateCounter(element, target, suffix, duration) {
        let start = 0;
        const increment = target / (duration / 16);
        const startTime = Date.now();
        
        const updateCounter = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function para mejor animación
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            element.textContent = current + (suffix ? suffix.outerHTML : '');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + (suffix ? suffix.outerHTML : '');
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    animateFloatingElements() {
        const elements = document.querySelectorAll('.floating-shape');
        
        elements.forEach((el, index) => {
            const amplitude = 50;
            const speed = 0.002 + (index * 0.001);
            const phase = Math.random() * Math.PI * 2;
            
            const animate = () => {
                const time = Date.now();
                const y = Math.sin(time * speed + phase) * amplitude;
                const rotation = Math.sin(time * speed * 0.5 + phase) * 20;
                
                el.style.transform = `translateY(${y}px) rotate(${rotation}deg)`;
                requestAnimationFrame(animate);
            };
            
            animate();
        });
    }

    animateHeroTitle() {
        const titleWords = document.querySelectorAll('.title-word');
        
        // Solo animar si no es móvil
        if (this.isMobile) {
            titleWords.forEach(word => {
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            });
            return;
        }
        
        titleWords.forEach((word, index) => {
            word.style.opacity = '0';
            word.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                word.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    setupScrollEffects() {
        // Solo usar GSAP ScrollTrigger en desktop
        if (this.isMobile) return;
        
        if (typeof gsap !== 'undefined' && gsap.utils && gsap.registerPlugin) {
            gsap.registerPlugin(ScrollTrigger);
            
            // Parallax optimizado para performance
            const bgElements = document.querySelectorAll('.grid-line, .scan-effect');
            bgElements.forEach(el => {
                gsap.to(el, {
                    y: () => window.innerHeight * 0.1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: "body",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: true,
                        markers: false // Desactivar markers en producción
                    }
                });
            });
            
            // Reveal animations optimizadas
            const revealSections = document.querySelectorAll('.cyber-services, .cyber-process, .cyber-projects, .cyber-contact');
            
            revealSections.forEach(section => {
                gsap.from(section, {
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                        once: true // Solo animar una vez
                    }
                });
            });
        }
    }

    setupParticles() {
        const container = document.getElementById('particles');
        if (!container || this.isMobile) return; // Menos partículas en móviles

        const particleCount = this.isTablet ? 20 : 50; // Reducido para mejor rendimiento
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'cyber-particle';
            
            const size = Math.random() * 2 + 1; // Más pequeño
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const colors = ['#ff3e7a', '#00d9ff', '#9d4edd'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${posX}%;
                top: ${posY}%;
                opacity: ${Math.random() * 0.2 + 0.1};
                pointer-events: none;
                filter: blur(${size / 2}px);
            `;
            
            container.appendChild(particle);
            
            // Animación simple para mejor rendimiento
            const animate = () => {
                const time = Date.now() * 0.001;
                const x = Math.sin(time + i) * 50; // Movimiento reducido
                const y = Math.cos(time * 0.5 + i) * 50;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            };
            
            animate();
        }
    }

    setupForms() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Contador de caracteres
        const textarea = form.querySelector('textarea');
        const charCounter = form.querySelector('#charCount');
        
        if (textarea && charCounter) {
            textarea.addEventListener('input', () => {
                const count = textarea.value.length;
                const max = 500;
                charCounter.textContent = count;
                
                // Cambiar color según longitud
                let color;
                if (count < 50) {
                    color = '#ff4757';
                } else if (count < max * 0.9) {
                    color = '#ff3e7a';
                } else {
                    color = '#00ff9d';
                }
                
                charCounter.style.color = color;
            });
        }

        // Envío del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.submit-button');
            if (submitBtn) {
                const originalText = submitBtn.querySelector('.button-text').textContent;
                submitBtn.querySelector('.button-text').textContent = 'ENVIANDO...';
                submitBtn.disabled = true;
                
                // Animación de envío
                submitBtn.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    submitBtn.style.transform = 'scale(1)';
                }, 200);
                
                try {
                    // Simular envío (reemplazar con tu endpoint real)
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    this.showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                    form.reset();
                    
                    if (charCounter) {
                        charCounter.textContent = '0';
                        charCounter.style.color = '#888';
                    }
                    
                } catch (error) {
                    this.showNotification('Error al enviar el mensaje. Intenta de nuevo.', 'error');
                } finally {
                    submitBtn.querySelector('.button-text').textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'cyber-notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: var(--space-md) var(--space-lg);
            background: ${type === 'success' ? 'var(--color-secondary)' : '#ff4757'};
            color: var(--color-dark);
            border-radius: var(--border-radius-md);
            z-index: 9999;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.5s ease, opacity 0.5s ease;
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    setupVideo() {
        // Optimizar video para móviles
        if (this.isMobile) {
            const videoWrapper = document.querySelector('.video-wrapper');
            if (videoWrapper) {
                // Reducir calidad para mejor rendimiento en móviles
                videoWrapper.style.filter = 'grayscale(100%) contrast(150%) brightness(0.3) blur(1px)';
                
                // Pausar efectos pesados en móviles
                const heavyEffects = document.querySelectorAll('.grid-overlay, .hologram-effect');
                heavyEffects.forEach(effect => {
                    effect.style.animationPlayState = 'paused';
                });
            }
        }
    }

    setupIntersectionObservers() {
        // Animación de tarjetas al hacer scroll
        const cards = document.querySelectorAll('.service-card, .info-card, .project-card');
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, index * 100);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px' // Cargar antes de entrar en viewport
        });
        
        cards.forEach(card => {
            card.classList.remove('animated');
            cardObserver.observe(card);
        });

        // Animación de pasos del proceso
        const steps = document.querySelectorAll('.process-step');
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, index * 200);
                }
            });
        }, { threshold: 0.2 });
        
        steps.forEach(step => {
            step.classList.remove('animated');
            stepObserver.observe(step);
        });
    }

    setupTouchEvents() {
        if (!this.isMobile) return;
        
        // Mejora la experiencia táctil
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Evita el zoom doble tap en botones
        const buttons = document.querySelectorAll('button, a, input, textarea, select');
        buttons.forEach(btn => {
            btn.style.touchAction = 'manipulation';
        });
        
        // Optimiza animaciones para móviles
        this.optimizeForMobile();
    }

    optimizeForMobile() {
        // Reduce efectos visuales en móviles para mejor rendimiento
        if (this.isMobile) {
            const heavyEffects = document.querySelectorAll('.grid-overlay, .hologram-effect, .scan-effect');
            heavyEffects.forEach(effect => {
                effect.style.animation = 'none';
                effect.style.opacity = '0.05';
            });
            
            // Desactiva animaciones complejas
            const complexAnimations = document.querySelectorAll('.floating-shape, .printer-light, .head-glow');
            complexAnimations.forEach(anim => {
                anim.style.animation = 'none';
            });
        }
    }

    setupCursorEffects() {
        // Solo en desktop
        if (this.isMobile) return;

        const cursor = document.createElement('div');
        cursor.id = 'cyber-cursor';
        document.body.appendChild(cursor);
        
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.1s ease;
        `;

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.opacity = '1';
        });

        // Animación suave del cursor
        const animateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();

        // Efecto hover en elementos interactivos
        const interactiveElements = document.querySelectorAll('a, button, .cta-button, .card-link, .info-link');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.borderColor = 'var(--color-secondary)';
                cursor.style.backgroundColor = 'var(--color-secondary)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.borderColor = 'var(--color-primary)';
                cursor.style.backgroundColor = 'transparent';
            });
        });

        // Ocultar cursor cuando salga de la ventana
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });
    }

    startMainAnimations() {
        // Mostrar WhatsApp float
        const whatsappBtn = document.getElementById('whatsappFloat');
        if (whatsappBtn) {
            setTimeout(() => {
                whatsappBtn.style.opacity = '1';
                whatsappBtn.style.transform = 'translateY(0) scale(1)';
            }, 500);
        }

        // Animación inicial del logo
        const logoCube = document.querySelector('.logo-cube');
        if (logoCube) {
            logoCube.style.animation = 'rotateCube 10s linear infinite';
        }

        // Mostrar elementos con delay (solo en desktop)
        if (!this.isMobile) {
            const elementsToShow = [
                '.hero-badge',
                '.hero-description',
                '.hero-stats',
                '.hero-cta'
            ];
            
            elementsToShow.forEach((selector, index) => {
                const element = document.querySelector(selector);
                if (element) {
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 300 + (index * 200));
                }
            });
        }
    }

    onLoad() {
        console.log('✅ ODA EXPERIENCE completamente cargado');
        document.body.style.visibility = 'visible';
        
        // Forzar un pequeño scroll para activar efectos
        setTimeout(() => {
            window.scrollTo(0, 0);
            
            setTimeout(() => {
                this.startMainAnimations();
            }, 300);
        }, 100);
    }

    onResize() {
        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth < 1024;
        
        // Cerrar menú en resize si es necesario
        if (window.innerWidth >= 1024 && this.isMenuOpen) {
            this.isMenuOpen = false;
            const toggle = document.getElementById('mobileToggle');
            const navMenu = document.getElementById('navMenu');
            
            if (toggle) {
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
            if (navMenu) navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Actualizar efectos si es necesario
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
        
        // Re-optimizar para el nuevo tamaño
        this.optimizeForMobile();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar contenido hasta que se cargue
    document.body.style.visibility = 'hidden';
    
    // Iniciar experiencia
    try {
        window.odaExp = new ODAExperience();
    } catch (error) {
        console.error('Error al inicializar ODAExperience:', error);
        document.body.style.visibility = 'visible';
    }
});

// Agregar estilos adicionales dinámicamente
const additionalStyles = `
    .service-card, .info-card, .project-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card.animated, .info-card.animated, .project-card.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .process-step {
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .process-step.animated {
        opacity: 1;
        transform: translateX(0);
    }
    
    .hero-badge,
    .hero-description,
    .hero-stats,
    .hero-cta {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    @media (max-width: 768px) {
        .service-card, .info-card, .project-card,
        .process-step,
        .hero-badge,
        .hero-description,
        .hero-stats,
        .hero-cta {
            opacity: 1;
            transform: none;
            transition: none;
        }
    }
    
    /* Mejoras de accesibilidad */
    @media (prefers-reduced-motion: reduce) {
        .service-card, .info-card, .project-card,
        .process-step,
        .hero-badge,
        .hero-description,
        .hero-stats,
        .hero-cta {
            opacity: 1;
            transform: none;
            transition: none;
        }
    }
    
    /* Mejora de foco para accesibilidad */
    *:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
    
    /* Mejora de contraste para enlaces */
    @media (prefers-contrast: high) {
        .nav-link,
        .card-link,
        .info-link {
            text-decoration: underline;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

console.log('🎮 Usa window.odaExp para controlar las animaciones');
