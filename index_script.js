// ===== ODA STUDIO - EXPERIENCIA COMPLETA =====

class ODAExperience {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        console.log('🚀 ODA STUDIO - Inicializando experiencia premium');
        
        // Configurar video de fondo
        this.setupVideo();
        
        // Inicializar componentes
        this.setupLoader();
        this.setupNavigation();
        this.setupAnimations();
        this.setupForms();
        this.setupParticles();
        this.setupScrollEffects();
        
        // Configuración responsive
        this.setupResponsive();
        
        // Eventos
        window.addEventListener('load', () => this.onPageLoad());
        window.addEventListener('resize', () => this.onResize());
        
        // Exportar para debugging
        window.ODA = this;
    }

    setupVideo() {
        const video = document.getElementById('bgVideo');
        if (!video) return;
        
        // Configurar video para mejor rendimiento
        video.playsInline = true;
        video.muted = true;
        video.loop = true;
        
        // Intentar reproducir
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Video autoplay falló:', error);
                // Fallback: mostrar placeholder
                const placeholder = document.querySelector('.video-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'block';
                }
            });
        }
        
        // Optimizar para móviles
        if (this.isMobile) {
            video.poster = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            video.preload = 'auto';
        }
    }

    setupLoader() {
        const loader = document.getElementById('printerLoader');
        const printProgress = document.getElementById('printProgress');
        const globalProgress = document.getElementById('globalProgress');
        const loadingStatus = document.getElementById('loadingStatus');
        const printingFigure = document.getElementById('printingFigure');
        
        if (!loader) return;

        // Crear figura ODA 3D
        this.createODAFigure(printingFigure);

        // Simular progreso de impresión
        let progress = 0;
        let global = 0;
        const isSlowDevice = this.isMobile || this.isTablet;
        const intervalTime = isSlowDevice ? 40 : 30;
        
        const progressInterval = setInterval(() => {
            progress += 1;
            global += 0.8;
            
            if (printProgress) printProgress.style.width = `${progress}%`;
            if (globalProgress) globalProgress.style.width = `${global}%`;
            
            // Actualizar texto del estado
            if (loadingStatus) {
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
            }
            
            // Animar figura ODA
            if (printingFigure && !isSlowDevice) {
                const height = (progress / 100) * 120;
                printingFigure.style.height = `${height}px`;
                printingFigure.style.opacity = 0.3 + (progress / 150);
                
                if (progress > 90) {
                    printingFigure.style.filter = `blur(${2 - ((progress - 90) / 10)}px)`;
                    printingFigure.style.boxShadow = `0 0 ${20 + (progress - 90) * 2}px rgba(255, 62, 122, 0.5)`;
                }
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
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
        if (!container) return;
        
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
        
        // Agregar estilos CSS
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
        
        if (!toggle || !navMenu) return;
        
        // Toggle menú móvil
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });
        
        // Cerrar menú al hacer clic en enlace
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMobile) {
                    this.closeMenu();
                }
                
                // Smooth scroll
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        const offset = 80;
                        const targetPosition = target.offsetTop - offset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !nav.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Progress bar de navegación
        if (navProgress) {
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                navProgress.style.width = scrolled + "%";
                
                // Cambiar estilo de nav
                if (nav) {
                    if (window.scrollY > 50) {
                        nav.style.background = 'rgba(10, 10, 10, 0.98)';
                        nav.style.backdropFilter = 'blur(20px)';
                    } else {
                        nav.style.background = 'rgba(10, 10, 10, 0.95)';
                        nav.style.backdropFilter = 'blur(20px)';
                    }
                }
            });
        }
        
        // Smooth scroll para todos los enlaces
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Cerrar menú si está abierto
                    if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        toggle.classList.remove('active');
                        document.body.style.overflow = 'auto';
                        ODA.isMenuOpen = false;
                    }
                    
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Activar enlace actual
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
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
        });
    }

    toggleMenu() {
        const toggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!toggle || !navMenu) return;
        
        this.isMenuOpen = !this.isMenuOpen;
        toggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        if (this.isMenuOpen) {
            document.body.style.overflow = 'hidden';
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            document.body.style.overflow = 'auto';
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    closeMenu() {
        const toggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!toggle || !navMenu) return;
        
        this.isMenuOpen = false;
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    setupAnimations() {
        // Animación de contadores
        this.animateCounters();
        
        // Animación de cards al hacer scroll
        this.setupScrollAnimations();
        
        // Animación de título del hero
        if (!this.isMobile) {
            this.animateHeroTitle();
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-value[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'));
                    this.startCounter(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }

    startCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const duration = 1500;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (element.textContent.includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else {
                element.textContent = Math.floor(current);
            }
        }, duration / 50);
    }

    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.service-card, .project-card, .info-card, .process-step');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => observer.observe(el));
    }

    animateHeroTitle() {
        const titleWords = document.querySelectorAll('.title-word');
        
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

    setupParticles() {
        const container = document.getElementById('particles');
        if (!container || this.isMobile) return;

        const particleCount = this.isTablet ? 20 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'cyber-particle';
            
            const size = Math.random() * 2 + 1;
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
            
            // Animación
            const animate = () => {
                const time = Date.now() * 0.001;
                const x = Math.sin(time + i) * 30;
                const y = Math.cos(time * 0.5 + i) * 30;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(animate);
            };
            
            animate();
        }
    }

    setupForms() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        // Contador de caracteres
        const textarea = contactForm.querySelector('textarea');
        const charCounter = contactForm.querySelector('#charCount');
        
        if (textarea && charCounter) {
            textarea.addEventListener('input', () => {
                const count = textarea.value.length;
                const max = 500;
                charCounter.textContent = count;
                
                // Cambiar color
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
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-button');
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
                    // Simular envío
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    this.showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                    contactForm.reset();
                    
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
            padding: 15px 25px;
            background: ${type === 'success' ? '#2ed573' : '#ff4757'};
            color: #000;
            border-radius: 8px;
            z-index: 9999;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(100%);
            opacity: 0;
            transition: transform 0.5s ease, opacity 0.5s ease;
            max-width: 300px;
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

    setupScrollEffects() {
        // Solo usar GSAP en desktop
        if (this.isMobile || typeof ScrollTrigger === 'undefined') return;
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Animaciones suaves para secciones
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                    once: true
                }
            });
        });
        
        // Parallax para efectos de fondo
        const bgElements = document.querySelectorAll('.grid-line, .scan-effect');
        bgElements.forEach(el => {
            gsap.to(el, {
                y: () => window.innerHeight * 0.1,
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true
                }
            });
        });
    }

    setupResponsive() {
        // Aplicar clases responsive
        if (this.isMobile) {
            document.body.classList.add('is-mobile');
            document.body.classList.remove('is-tablet', 'is-desktop');
        } else if (this.isTablet) {
            document.body.classList.add('is-tablet');
            document.body.classList.remove('is-mobile', 'is-desktop');
        } else {
            document.body.classList.add('is-desktop');
            document.body.classList.remove('is-mobile', 'is-tablet');
        }
        
        // Optimizar para móviles
        if (this.isMobile) {
            this.optimizeForMobile();
        }
    }

    optimizeForMobile() {
        // Reducir animaciones en móviles
        const heavyAnimations = document.querySelectorAll('.grid-overlay, .hologram-effect, .floating-shape');
        heavyAnimations.forEach(el => {
            el.style.animation = 'none';
            el.style.opacity = '0.1';
        });
        
        // Mejorar rendimiento
        document.querySelectorAll('.service-card, .project-card').forEach(card => {
            card.style.willChange = 'transform';
        });
    }

    startMainAnimations() {
        // Animación del logo
        const logoCube = document.querySelector('.logo-cube');
        if (logoCube) {
            logoCube.style.animation = 'rotateCube 10s linear infinite';
        }
        
        // Mostrar WhatsApp float
        const whatsappFloat = document.querySelector('.whatsapp-float');
        if (whatsappFloat) {
            setTimeout(() => {
                whatsappFloat.style.opacity = '1';
                whatsappFloat.style.transform = 'translateY(0) scale(1)';
            }, 1000);
        }
        
        // Iniciar animaciones de entrada
        setTimeout(() => {
            const elementsToAnimate = document.querySelectorAll('.hero-badge, .hero-description, .hero-stats, .hero-cta');
            
            elementsToAnimate.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 200 + 300);
            });
        }, 500);
    }

    onPageLoad() {
        console.log('✅ ODA STUDIO - Página completamente cargada');
        
        // Asegurar visibilidad
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        
        // Iniciar animaciones principales
        this.startMainAnimations();
    }

    onResize() {
        // Actualizar flags
        this.isMobile = window.innerWidth <= 768;
        this.isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        // Cerrar menú si se redimensiona a desktop
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
        
        // Re-aplicar config responsive
        this.setupResponsive();
        
        // Refrescar ScrollTrigger si existe
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar contenido temporalmente
    document.body.style.visibility = 'hidden';
    document.body.style.opacity = '0';
    
    try {
        // Iniciar experiencia
        window.odaExperience = new ODAExperience();
    } catch (error) {
        console.error('Error al inicializar ODAExperience:', error);
        
        // Asegurar visibilidad en caso de error
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }
});

// Agregar estilos dinámicos
const dynamicStyles = `
    @keyframes rotateCube {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .service-card.animated,
    .project-card.animated,
    .info-card.animated,
    .process-step.animated {
        animation: fadeInUp 0.8s ease forwards;
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
    
    /* Estilos para notificaciones */
    .cyber-notification {
        font-family: 'Inter', sans-serif;
    }
    
    /* Mejorar focus para accesibilidad */
    *:focus {
        outline: 2px solid #ff3e7a;
        outline-offset: 2px;
    }
    
    /* Clases responsive */
    .is-mobile .hero-visual,
    .is-mobile .scroll-indicator {
        display: none !important;
    }
    
    @media (max-width: 768px) {
        .service-card,
        .project-card,
        .info-card {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
        }
    }
`;

// Inyectar estilos
const styleElement = document.createElement('style');
styleElement.textContent = dynamicStyles;
document.head.appendChild(styleElement);

console.log('🎮 Usa window.odaExperience para controlar las animaciones');
