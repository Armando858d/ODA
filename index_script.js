// scroll reveal
const sections = document.querySelectorAll('.bloque');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){ entry.target.classList.add('visible'); }
    });
}, { threshold:0.2 });
sections.forEach(section => observer.observe(section));

// scroll suave
function scrollToSection(id){
    document.getElementById(id).scrollIntoView({ behavior:'smooth' });
}

// menú desplegable y animación impresión
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('nav');
const menuLinks = document.querySelectorAll('header nav a');

function animateMachine(){
    const machine = document.getElementById('menu-machine');
    machine.classList.add('show');
}

function animateMenu() {
    menuLinks.forEach((link, i) => {
        setTimeout(() => {
            link.classList.add('show');
        }, i * 200);
    });
}

menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
    if(nav.classList.contains('active')){
        animateMachine();
        animateMenu();
    } else {
        menuLinks.forEach(link => link.classList.remove('show'));
        document.getElementById('menu-machine').classList.remove('show');
    }
});
