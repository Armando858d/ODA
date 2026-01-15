// SCROLL REVEAL
const sections = document.querySelectorAll('.bloque');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){ entry.target.classList.add('visible'); }
    });
}, { threshold:0.2 });
sections.forEach(section => observer.observe(section));

// SCROLL SUAVE
function scrollToSection(id){
    document.getElementById(id).scrollIntoView({ behavior:'smooth' });
}

// MENU DESPLEGABLE
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('nav');
menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
});
