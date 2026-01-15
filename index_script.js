// scroll reveal
const sections = document.querySelectorAll('.bloque');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){ entry.target.classList.add('visible'); }
    });
}, { threshold:0.2 });
sections.forEach(section => observer.observe(section));

// scroll suave
function scrollToSection(id){ document.getElementById(id).scrollIntoView({ behavior:'smooth' }); }

// menú desplegable + animación impresión
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('nav');
const menuLinks = document.querySelectorAll('header nav a');

function animateMachine(){ document.getElementById('menu-machine').classList.add('show'); }
function animateMenu(){
    menuLinks.forEach((link,i)=>{ setTimeout(()=>{ link.classList.add('show'); }, i*200); });
}

menuIcon.addEventListener('click', ()=>{
    nav.classList.toggle('active');
    if(nav.classList.contains('active')){ animateMachine(); animateMenu(); }
    else{ menuLinks.forEach(link=>link.classList.remove('show')); document.getElementById('menu-machine').classList.remove('show'); }
});

// PARTICULAS amarillas
const canvas=document.getElementById('particle-canvas');
const ctx=canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

const particles=[];
for(let i=0;i<100;i++){
    particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*2+1, dx:(Math.random()-0.5)*0.5, dy:(Math.random()-0.5)*0.5});
}

function animateParticles(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="#ffea00";
        ctx.fill();
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0||p.x>canvas.width)p.dx*=-1;
        if(p.y<0||p.y>canvas.height)p.dy*=-1;
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();
window.addEventListener('resize',()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; });

// LOTTIE EMOJIS (simple emoji animado flotante)
document.querySelectorAll('.emoji').forEach(el=>{
    lottie.loadAnimation({
        container:el,
        renderer:'svg',
        loop:true,
        autoplay:true,
        animationData: {
            "v":"5.9.6","fr":30,"ip":0,"op":60,"w":50,"h":50,"nm":"emoji","ddd":0,
            "assets":[],"layers":[{"ty":5,"t":{"d":{"k":[{"s":{"s":20,"f":"Arial","t":el.dataset.lottie,"j":0,"tr":0,"lh":20,"fc":[1,1,0]},"t":0}]}},"ip":0,"op":60,"st":0,"bm":0}]}
    });
});
