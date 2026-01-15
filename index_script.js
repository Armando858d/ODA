// ===== CONFIGURACIÓN GLOBAL =====
console.log('%c🚀 ODA DIGITAL URBAN 🌟', 'font-size: 24px; color: #00FF88; font-weight: bold;');
console.log('%cSistema futurista urbano inicializado', 'color: #888;');

// Variables globales
let isMobile = window.innerWidth <= 768;
let scrollPosition = 0;
let printerAnimation = null;
let particlesSystem = null;

// ===== PRELOADER =====
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressCounts = document.querySelectorAll('.preloader-stats .count');
    
    if (preloader) {
        // Animar contadores del preloader
        progressCounts.forEach((count, index) => {
            let target = 0;
            switch(index) {
                case 0: target = 2500; break; // Partículas
                case 1: target = 87; break;   // Efectos
                case 2: target = 42; break;   // Animaciones
            }
            
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                count.textContent = Math.floor(current);
            }, 30);
        });
        
        // Ocultar preloader después de 2.5 segundos
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            
            // Iniciar todas las animaciones
            setTimeout(() => {
                initAllAnimations();
            }, 500);
        }, 2500);
    }
}

// ===== THREE.JS - FONDO Y PARTÍCULAS =====
function initThreeJSBackground() {
    // Verificar si Three.js está disponible
    if (typeof THREE === 'undefined') {
        console.warn('Three.js no está disponible, usando fondo alternativo');
        return;
    }
    
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    
    // Configurar escena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Configurar cámara
    camera.position.z = 15;
    
    // Crear partículas
    particlesSystem = createParticles(scene);
    
    // Crear grid holográfico
    createHolographicGrid(scene);
    
    // Crear elementos flotantes
    createFloatingElements(scene);
    
    // Animación
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotar partículas
        if (particlesSystem) {
            particlesSystem.rotation.x += 0.0005;
            particlesSystem.rotation.y += 0.001;
        }
        
        // Mover cámara sutilmente
        camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
        camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Manejar resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        isMobile = window.innerWidth <= 768;
    });
}

function createParticles(scene) {
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Colores neón
    const neonColors = [
        new THREE.Color(0x00FF88), // Verde
        new THREE.Color(0x00A8FF), // Azul
        new THREE.Color(0x9D4EDD), // Morado
        new THREE.Color(0xFF2E93)  // Rosa
    ];
    
    for (let i = 0; i < particleCount; i++) {
        // Posiciones aleatorias en un cubo
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        
        // Colores aleatorios
        const color = neonColors[Math.floor(Math.random() * neonColors.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Tamaños aleatorios
        sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Material de partículas
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    return particleSystem;
}

function createHolographicGrid(scene) {
    const gridSize = 20;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x00FF88, 0x003311);
    gridHelper.position.y = -5;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Animación del grid
    function animateGrid() {
        gridHelper.rotation.x += 0.0001;
        gridHelper.rotation.z += 0.0002;
        requestAnimationFrame(animateGrid);
    }
    animateGrid();
}

// ===== ANIMACIÓN DE IMPRESORA 3D =====
function init3DPrinterAnimation() {
    const canvas = document.getElementById('printer3dCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Estado de la impresora
    const printerState = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        nozzleX: canvas.width / 2,
        nozzleY: canvas.height / 2,
        printing: true,
        layers: [],
        currentLayer: 0,
        maxLayers: 100
    };
    
    // Dibujar impresora
    function drawPrinter() {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar base de la impresora
        ctx.fillStyle = 'rgba(42, 42, 42, 0.8)';
        ctx.fillRect(canvas.width * 0.3, canvas.height * 0.7, canvas.width * 0.4, canvas.height * 0.1);
        
        // Dibujar plataforma de impresión
        ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
        ctx.fillRect(canvas.width * 0.35, canvas.height * 0.6, canvas.width * 0.3, canvas.height * 0.1);
        
        // Dibujar estructura
        ctx.strokeStyle = '#00FF88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.3, canvas.height * 0.7);
        ctx.lineTo(canvas.width * 0.3, canvas.height * 0.3);
        ctx.lineTo(canvas.width * 0.7, canvas.height * 0.3);
        ctx.lineTo(canvas.width * 0.7, canvas.height * 0.7);
        ctx.stroke();
        
        // Dibujar cabeza de impresión
        drawPrintHead();
        
        // Dibujar capas de impresión
        drawPrintLayers();
        
        // Dibujar filamento
        drawFilament();
    }
    
    function drawPrintHead() {
        // Cabeza de impresión
        ctx.fillStyle = '#333333';
        ctx.fillRect(printerState.nozzleX - 20, printerState.nozzleY - 10, 40, 20);
        
        // Boquilla
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(printerState.nozzleX, printerState.nozzleY + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Luz de la boquilla
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        ctx.beginPath();
        ctx.arc(printerState.nozzleX, printerState.nozzleY + 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Mover boquilla
        if (printerState.printing) {
            printerState.nozzleX = canvas.width * 0.35 + (Math.sin(Date.now() * 0.002) * 0.5 + 0.5) * canvas.width * 0.3;
            printerState.nozzleY = canvas.height * 0.6 - printerState.currentLayer;
            
            // Agregar nueva capa
            if (Date.now() % 100 < 5 && printerState.currentLayer < printerState.maxLayers) {
                printerState.layers.push({
                    x: printerState.nozzleX,
                    width: 30,
                    color: '#00FF88'
                });
                printerState.currentLayer += 2;
            }
        }
    }
    
    function drawPrintLayers() {
        // Dibujar capas acumuladas
        printerState.layers.forEach((layer, index) => {
            const y = canvas.height * 0.6 - index * 2;
            ctx.fillStyle = layer.color;
            ctx.fillRect(layer.x - layer.width / 2, y, layer.width, 2);
            
            // Efecto de brillo
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(layer.x - layer.width / 2, y, layer.width, 1);
        });
    }
    
    function drawFilament() {
        // Bobina de filamento
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.2, canvas.height * 0.3, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        // Filamento
        ctx.strokeStyle = '#FF6B35';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, canvas.height * 0.3);
        ctx.lineTo(printerState.nozzleX, printerState.nozzleY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Animación
    function animatePrinter() {
        drawPrinter();
        requestAnimationFrame(animatePrinter);
    }
    
    animatePrinter();
    
    // Manejar resize
    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });
}

// ===== TYPOWRITER EFFECT =====
function initTypewriter() {
    const typewriterText = document.getElementById('typewriterText');
    if (!typewriterText) return;
    
    const texts = [
        "Tecnología urbana de vanguardia",
        "Arte digital con esencia callejera",
        "Innovación 3D y diseño futurista",
        "Soluciones digitales premium"
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Borrando
            typewriterText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            // Escribiendo
            typewriterText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            // Pausa al final
            isDeleting = true;
            typingSpeed = 1500;
        } else if (isDeleting && charIndex === 0) {
            // Cambiar texto
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Iniciar después de 2 segundos
    setTimeout(type, 2000);
}

// ===== CONTADORES ANIMADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const suffix = counter.textContent.includes('%') ? '%' : '';
        const increment = target / 100;
        
        let count = 0;
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
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// ===== MENÚ Y NAVEGACIÓN =====
function initNavigation() {
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    
    // Toggle menú móvil
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            document.querySelector('.nav-menu').classList.toggle('active');
            document.body.style.overflow = document.querySelector('.nav-menu').classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Cerrar menú al hacer clic en enlace
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Cerrar menú móvil
            if (navToggle && navToggle.classList.contains('active')) {
                navToggle.classList.remove('active');
                document.querySelector('.nav-menu').classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Scroll suave
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
            
            // Actualizar enlace activo
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Mostrar/ocultar botón "volver arriba"
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Efecto de scroll en navegación
    window.addEventListener('scroll', () => {
        scrollPosition = window.pageYOffset;
        
        if (scrollPosition > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Actualizar enlaces activos según scroll
        updateActiveNavLink();
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ===== EFECTOS DE SCROLL (REVEAL) =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// ===== ELEMENTOS FLOTANTES =====
function initFloatingElements() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    floatingElements.forEach(element => {
        // Posición inicial aleatoria
        const startX = Math.random() * 80 + 10;
        const startY = Math.random() * 80 + 10;
        element.style.left = `${startX}%`;
        element.style.top = `${startY}%`;
        
        // Movimiento aleatorio suave
        setInterval(() => {
            const speed = parseFloat(element.getAttribute('data-speed') || 0.3);
            const moveX = (Math.random() - 0.5) * 40;
            const moveY = (Math.random() - 0.5) * 40;
            
            element.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.5}deg)`;
        }, 3000);
    });
}

// ===== FORMULARIO DE CONTACTO =====
function initContactForm() {
    const form = document.getElementById('quoteForm');
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;
            
            // Simular envío
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Mostrar éxito
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡ENVIADO!';
                submitBtn.style.background = 'linear-gradient(135deg, #00FF88, #00CC6A)';
                
                // Mostrar mensaje de confirmación
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.innerHTML = `
                    <h3><i class="fas fa-check-circle"></i> Solicitud enviada</h3>
                    <p>Te contactaremos en menos de 24 horas.</p>
                `;
                form.appendChild(successMsg);
                
                // Resetear después de 3 segundos
                setTimeout(() => {
                    form.reset();
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    successMsg.remove();
                }, 3000);
            }, 1500);
        });
    }
    
    // Botones de copiar
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            if (text) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        const originalHTML = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        btn.style.background = '#00FF88';
                        btn.style.color = '#000';
                        
                        setTimeout(() => {
                            btn.innerHTML = originalHTML;
                            btn.style.background = '';
                            btn.style.color = '';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error al copiar:', err);
                    });
            }
        });
    });
}

// ===== WHATSAPP FLOTANTE =====
function initWhatsAppFloat() {
    const floatBtn = document.getElementById('whatsappFloat');
    
    if (floatBtn) {
        // Mostrar después de 3 segundos
        setTimeout(() => {
            floatBtn.style.opacity = '1';
            floatBtn.style.transform = 'translateY(0)';
        }, 3000);
        
        // Efecto hover
        floatBtn.addEventListener('mouseenter', () => {
            floatBtn.style.transform = 'translateY(-5px) scale(1.1)';
        });
        
        floatBtn.addEventListener('mouseleave', () => {
            floatBtn.style.transform = 'translateY(0) scale(1)';
        });
    }
}

// ===== EFECTOS DE SONIDO (OPCIONAL) =====
function initSoundEffects() {
    // Podrías agregar sonidos sutiles aquí
    // Por ejemplo: hover en botones, click en enlaces, etc.
    console.log('🔊 Sistema de efectos de sonido listo');
}

// ===== INICIALIZAR TODO =====
function initAllAnimations() {
    initThreeJSBackground();
    init3DPrinterAnimation();
    initTypewriter();
    initCounters();
    initNavigation();
    initScrollReveal();
    initFloatingElements();
    initContactForm();
    initWhatsAppFloat();
    initSoundEffects();
    
    console.log('✅ Todas las animaciones inicializadas');
}

// ===== INICIO =====
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar preloader primero
    initPreloader();
    
    // Configurar resize handler
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
    });
    
    // Configurar teclas de acceso rápido (opcional)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Cerrar menú si está abierto
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.getElementById('navToggle');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
});

// ===== ANIMACIONES CSS ADICIONALES =====
// Inyectar animaciones CSS adicionales
const additionalAnimations = `
@keyframes titleAppear {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes floatElement {
    0%, 100% {
        transform: translate(0, 0) rotate(0deg);
    }
    33% {
        transform: translate(30px, -20px) rotate(10deg);
    }
    66% {
        transform: translate(-20px, 15px) rotate(-10deg);
    }
}

@keyframes scannerMove {
    0% { left: -100px; }
    100% { left: 100%; }
}

@keyframes scrollDot {
    0% {
        top: 0;
        opacity: 0;
    }
    30% {
        opacity: 1;
    }
    100% {
        top: 100%;
        opacity: 0;
    }
}

@keyframes progressLoad {
    0% { width: 0; }
    100% { width: 100%; }
}

@keyframes hologramFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

@keyframes pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
}

@keyframes radar {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

@keyframes whatsappPulse {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

@keyframes loading {
    100% { left: 100%; }
}

@keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
}

@keyframes printWord {
    0% { width: 0; }
    100% { width: 100%; }
}

.success-message {
    background: rgba(0, 255, 136, 0.1);
    border: 2px solid #00FF88;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    margin-top: 2rem;
    animation: titleAppear 0.5s ease;
}

.success-message h3 {
    color: #00FF88;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.success-message p {
    color: #ccc;
}
`;

// Inyectar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalAnimations;
document.head.appendChild(styleSheet);

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce para eventos de scroll y resize
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

// Optimizar animaciones en scroll
window.addEventListener('scroll', debounce(() => {
    // Pausar animaciones pesadas si no son visibles
    if (document.hidden) {
        // Reducir FPS de animaciones
    }
}, 100));

// ===== SERVICE WORKER (OPCIONAL) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('❌ Error registrando Service Worker:', error);
            });
    });
}
