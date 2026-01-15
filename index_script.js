// ===== CONFIGURACIÓN INICIAL =====
console.log('%c🎨 ODA TALLER DIGITAL 🎨', 'font-size: 24px; color: #00FF88; font-weight: bold;');
console.log('%cSistema de arte urbano-tecnológico iniciado', 'color: #888;');

// ===== VARIABLES GLOBALES =====
let currentStep = 1;
let isPrinting = false;
let isSpraying = false;
let creativeMode = 'day';

// ===== THREE.JS ESCENA 3D =====
function init3DBackground() {
    const canvas = document.getElementById('bgCanvas3D');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Luces direccionales (colores de spray)
    const sprayLight1 = new THREE.DirectionalLight(0x00A8FF, 0.8);
    sprayLight1.position.set(5, 5, 5);
    scene.add(sprayLight1);
    
    const sprayLight2 = new THREE.DirectionalLight(0xFF2E93, 0.6);
    sprayLight2.position.set(-5, 3, -5);
    scene.add(sprayLight2);
    
    // Crear estructura tipo taller
    createWorkshopStructure(scene);
    
    // Partículas flotantes (polvo de pintura)
    createPaintParticles(scene);
    
    // Cámara animation
    camera.position.z = 15;
    camera.position.y = 3;
    
    // Animación
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotación sutil
        scene.rotation.y += 0.001;
        scene.rotation.x += 0.0005;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createWorkshopStructure(scene) {
    // Paredes
    const wallGeometry = new THREE.BoxGeometry(30, 20, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2C2C2C,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -10;
    scene.add(backWall);
    
    // Piso
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1A1A1A,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    scene.add(floor);
    
    // Herramientas 3D flotantes
    createFloatingTools(scene);
}

function createPaintParticles(scene) {
    const particleCount = 500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Colores de spray
    const sprayColors = [
        new THREE.Color(0x00A8FF), // Azul
        new THREE.Color(0xFF2E93), // Rosa
        new THREE.Color(0xFFEA00), // Amarillo
        new THREE.Color(0x00FF88)  // Verde
    ];
    
    for (let i = 0; i < particleCount; i++) {
        // Posiciones aleatorias
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 10 - 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        
        // Colores aleatorios de spray
        const color = sprayColors[Math.floor(Math.random() * sprayColors.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Animación de partículas
    function animateParticles() {
        const positions = particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += 0.01; // Movimiento hacia arriba
            
            // Reset cuando salen de la pantalla
            if (positions[i * 3 + 1] > 10) {
                positions[i * 3 + 1] = -10;
                positions[i * 3] = (Math.random() - 0.5) * 30;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
            }
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// ===== ANIMACIÓN DE IMPRESIÓN 3D =====
function initPrintingAnimation() {
    const printingLogo = document.getElementById('printingLogo');
    const letters = printingLogo.querySelectorAll('span');
    
    // Simular impresión capa por capa
    letters.forEach((letter, index) => {
        // Crear capas para cada letra
        for (let i = 0; i < 5; i++) {
            const layer = document.createElement('div');
            layer.className = 'letter-layer';
            layer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: ${(i + 1) * 20}%;
                background: linear-gradient(to bottom, 
                    rgba(255, 107, 53, 0.8) ${i * 20}%, 
                    rgba(255, 107, 53, 0.2) ${(i + 1) * 20}%);
                clip-path: polygon(${getLetterPath(letter.textContent)});
                z-index: ${5 - i};
                opacity: 0;
                animation: printLayer 0.5s ${(index * 0.5) + (i * 0.1)}s forwards;
            `;
            letter.appendChild(layer);
        }
    });
}

function getLetterPath(letter) {
    // Paths básicos para las letras O, D, A
    const paths = {
        'O': '50% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%, 20% 0%',
        'D': '0% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 0% 100%',
        'A': '50% 0%, 100% 100%, 0% 100%, 25% 50%, 75% 50%'
    };
    
    return paths[letter] || '50% 0%, 100% 50%, 50% 100%, 0% 50%';
}

// ===== SISTEMA DE SPRAY INTERACTIVO =====
function initSpraySystem() {
    const sprayBtn = document.getElementById('startSpray');
    const spraySound = document.getElementById('spraySound');
    
    if (sprayBtn) {
        sprayBtn.addEventListener('click', () => {
            if (!isSpraying) {
                isSpraying = true;
                startSprayAnimation();
                if (spraySound) {
                    spraySound.currentTime = 0;
                    spraySound.play();
                }
                
                // Temporizador para detener
                setTimeout(() => {
                    isSpraying = false;
                    stopSprayAnimation();
                }, 2000);
            }
        });
    }
    
    // Spray con cursor
    document.addEventListener('mousemove', (e) => {
        if (isSpraying) {
            createSprayEffect(e.clientX, e.clientY);
        }
    });
}

function createSprayEffect(x, y) {
    const sprayContainer = document.getElementById('sprayParticles');
    const colors = ['#00A8FF', '#FF2E93', '#FFEA00', '#00FF88'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Crear partícula de spray
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        top: ${y}px;
        left: ${x}px;
        width: ${Math.random() * 20 + 5}px;
        height: ${Math.random() * 20 + 5}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.7;
        transform: translate(-50%, -50%);
        animation: sprayParticle 1s forwards;
    `;
    
    sprayContainer.appendChild(particle);
    
    // Eliminar después de la animación
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// ===== SISTEMA DE PASOS DE IMPRESIÓN =====
function initPrintingSteps() {
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const progressFill = document.getElementById('printProgress');
    const steps = document.querySelectorAll('.process-step');
    
    function updateStep() {
        // Actualizar visibilidad de pasos
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
        });
        
        // Actualizar progreso
        const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Actualizar estadísticas
        updatePrintStats();
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < steps.length) {
                currentStep++;
                updateStep();
            }
        });
    }
    
    // Inicializar
    updateStep();
}

function updatePrintStats() {
    // Actualizar contadores
    const projectsCount = document.getElementById('projectsCount');
    const filamentUsed = document.getElementById('filamentUsed');
    const sprayCans = document.getElementById('sprayCans');
    
    if (projectsCount) {
        animateCounter(projectsCount, 127, 0, 2000);
    }
    
    if (filamentUsed) {
        animateCounter(filamentUsed, 0, 450, 2000, 'm');
    }
    
    if (sprayCans) {
        animateCounter(sprayCans, 0, 89, 2000);
    }
}

function animateCounter(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== GALERÍA INTERACTIVA =====
function initInteractiveGallery() {
    const hybridCanvas = document.getElementById('hybridCanvas');
    if (!hybridCanvas) return;
    
    const ctx = hybridCanvas.getContext('2d');
    hybridCanvas.width = hybridCanvas.offsetWidth;
    hybridCanvas.height = hybridCanvas.offsetHeight;
    
    // Modos de dibujo
    let currentMode = 'spray';
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Configurar canvas
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, hybridCanvas.width, hybridCanvas.height);
    
    // Event listeners
    hybridCanvas.addEventListener('mousedown', startDrawing);
    hybridCanvas.addEventListener('mousemove', draw);
    hybridCanvas.addEventListener('mouseup', stopDrawing);
    hybridCanvas.addEventListener('mouseout', stopDrawing);
    
    // Botones de modo
    document.querySelectorAll('.control-mode').forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            document.querySelectorAll('.control-mode').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const x = e.offsetX;
        const y = e.offsetY;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        
        // Configurar estilo según modo
        switch(currentMode) {
            case 'spray':
                ctx.strokeStyle = getRandomSprayColor();
                ctx.lineWidth = 10;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.strokeStyle;
                break;
                
            case 'print':
                ctx.strokeStyle = '#FF6B35'; // Color filamento
                ctx.lineWidth = 5;
                ctx.lineCap = 'square';
                ctx.setLineDash([5, 3]); // Efecto de capas
                break;
                
            case 'mix':
                ctx.strokeStyle = getRandomSprayColor();
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.setLineDash([10, 5]); // Mezcla de efectos
                break;
        }
        
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    }
    
    function stopDrawing() {
        isDrawing = false;
        ctx.setLineDash([]); // Resetear dash
    }
    
    function getRandomSprayColor() {
        const colors = ['#00A8FF', '#FF2E93', '#FFEA00', '#00FF88'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Botón de reset
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🧹 LIMPIAR';
    resetBtn.style.cssText = `
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        background: #FF4757;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: var(--font-bold);
    `;
    resetBtn.addEventListener('click', () => {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, hybridCanvas.width, hybridCanvas.height);
    });
    
    hybridCanvas.parentElement.appendChild(resetBtn);
}

// ===== SISTEMA DE CONSOLA =====
function initConsoleSystem() {
    const commissionInput = document.getElementById('commissionInput');
    const sendBtn = document.getElementById('sendCommission');
    const terminalOutput = document.querySelector('.terminal-output');
    const revealEmailBtn = document.getElementById('revealEmail');
    const secretEmail = document.querySelector('#secretEmail .hidden');
    
    if (sendBtn && commissionInput) {
        sendBtn.addEventListener('click', sendCommission);
        commissionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendCommission();
        });
    }
    
    if (revealEmailBtn && secretEmail) {
        revealEmailBtn.addEventListener('click', () => {
            secretEmail.textContent = 'contacto@oda.studio';
            revealEmailBtn.textContent = '📧 COPIADO';
            navigator.clipboard.writeText('contacto@oda.studio');
            
            setTimeout(() => {
                revealEmailBtn.textContent = 'REVELAR';
            }, 2000);
        });
    }
    
    function sendCommission() {
        const message = commissionInput.value.trim();
        if (!message) return;
        
        // Agregar mensaje a la consola
        addConsoleLine(`>_ Cliente: "${message}"`);
        addConsoleLine(`>_ Procesando solicitud...`);
        
        // Simular análisis
        setTimeout(() => {
            addConsoleLine(`>_ Análisis completo. Nivel de complejidad: ${getRandomComplexity()}`);
            addConsoleLine(`>_ Tiempo estimado: ${getRandomTime()}`);
            addConsoleLine(`>_ Presupuesto aproximado: ${getRandomBudget()}`);
            addConsoleLine(`>_ ¿Confirmar comisión? (responde por WhatsApp)`);
        }, 1500);
        
        // Limpiar input
        commissionInput.value = '';
    }
    
    function addConsoleLine(text) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.innerHTML = `<span class="prompt">>_</span> ${text}`;
        terminalOutput.appendChild(line);
        
        // Scroll automático
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    function getRandomComplexity() {
        const levels = ['BAJA', 'MEDIA', 'ALTA', 'EXTREMA'];
        return levels[Math.floor(Math.random() * levels.length)];
    }
    
    function getRandomTime() {
        const times = ['2-3 días', '1 semana', '2 semanas', '1 mes'];
        return times[Math.floor(Math.random() * times.length)];
    }
    
    function getRandomBudget() {
        const budgets = ['$5,000 - $10,000 MXN', '$15,000 - $25,000 MXN', '$30,000 - $50,000 MXN', '$75,000+ MXN'];
        return budgets[Math.floor(Math.random() * budgets.length)];
    }
}

// ===== SISTEMA DE MODO =====
function initModeSystem() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar active de todos
            modeButtons.forEach(b => b.classList.remove('active'));
            // Agregar active al clickeado
            btn.classList.add('active');
            
            // Cambiar modo
            creativeMode = btn.dataset.mode;
            applyMode(creativeMode);
        });
    });
}

function applyMode(mode) {
    const body = document.body;
    
    // Remover clases anteriores
    body.classList.remove('mode-day', 'mode-night', 'mode-neon', 'mode-graffiti');
    
    // Agregar nueva clase
    body.classList.add(`mode-${mode}`);
    
    // Cambiar estilos según modo
    switch(mode) {
        case 'night':
            document.documentElement.style.setProperty('--spray-blue', '#0066CC');
            document.documentElement.style.setProperty('--spray-pink', '#990066');
            break;
            
        case 'neon':
            document.documentElement.style.setProperty('--spray-blue', '#00FFFF');
            document.documentElement.style.setProperty('--spray-pink', '#FF00FF');
            break;
            
        case 'graffiti':
            document.documentElement.style.setProperty('--spray-blue', '#0088FF');
            document.documentElement.style.setProperty('--spray-pink', '#FF0088');
            break;
            
        default: // day
            document.documentElement.style.setProperty('--spray-blue', '#00A8FF');
            document.documentElement.style.setProperty('--spray-pink', '#FF2E93');
    }
}

// ===== ANIMACIONES GSAP =====
function initGSAPAnimations() {
    // Animación del título 3D
    gsap.from('.title-3d', {
        duration: 2,
        y: 100,
        rotationX: -90,
        opacity: 0,
        ease: "power3.out",
        delay: 0.5
    });
    
    // Animación de tarjetas de servicio
    gsap.utils.toArray('.service-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none reverse"
            },
            duration: 1,
            y: 50,
            opacity: 0,
            delay: i * 0.2,
            ease: "power2.out"
        });
    });
    
    // Animación de flotación de herramientas
    gsap.to('.floating-tools .tool', {
        duration: 3,
        y: "+=20",
        rotation: "+=5",
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.5
    });
    
    // Animación de scanner
    gsap.to('.scanner-beam', {
        duration: 3,
        x: "100vw",
        ease: "none",
        repeat: -1
    });
}

// ===== INICIALIZACIÓN COMPLETA =====
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar sistemas
    init3DBackground();
    initPrintingAnimation();
    initSpraySystem();
    initPrintingSteps();
    initInteractiveGallery();
    initConsoleSystem();
    initModeSystem();
    initGSAPAnimations();
    
    // Configurar botones
    setupActionButtons();
    
    // Efectos de sonido (opcional)
    setupSoundEffects();
    
    console.log('✅ Sistema ODA completamente operativo');
});

function setupActionButtons() {
    // Botón de impresión
    const printBtn = document.getElementById('startPrint');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            const printSound = document.getElementById('printSound');
            if (printSound) {
                printSound.currentTime = 0;
                printSound.play();
            }
            
            // Animación de impresión
            gsap.to('.print-progress', {
                duration: 3,
                width: "100%",
                ease: "power2.inOut",
                onComplete: () => {
                    printBtn.querySelector('.action-text').textContent = '¡IMPRESIÓN COMPLETA!';
                    setTimeout(() => {
                        printBtn.querySelector('.action-text').textContent = 'IMPRIMIR EXPERIENCIA';
                        gsap.set('.print-progress', { width: "0%" });
                    }, 2000);
                }
            });
        });
    }
}

function setupSoundEffects() {
    // Los sonidos ya están configurados en el HTML
    // Aquí podemos agregar más control si es necesario
    document.addEventListener('click', () => {
        // Activar sonidos en la primera interacción
        const spraySound = document.getElementById('spraySound');
        const printSound = document.getElementById('printSound');
        
        if (spraySound) spraySound.volume = 0.3;
        if (printSound) printSound.volume = 0.2;
    }, { once: true });
}

// ===== EFECTOS CSS ADICIONALES =====
// Agregar estas animaciones al CSS
const additionalStyles = `
@keyframes sprayParticle {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.7;
    }
    100% {
        transform: translate(
            calc(-50% + ${Math.random() * 100 - 50}px),
            calc(-50% + ${Math.random() * 100 - 50}px)
        ) scale(0);
        opacity: 0;
    }
}

@keyframes printLayer {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.mode-day { filter: brightness(1); }
.mode-night { filter: brightness(0.7) contrast(1.2); }
.mode-neon { filter: brightness(1.2) saturate(1.5); }
.mode-graffiti { filter: contrast(1.3) saturate(1.2); }
`;

// Inyectar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
