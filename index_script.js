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

// menú desplegable (mobile)
const menuIcon = document.getElementById('menu-icon');
const nav = document.getElementById('nav');
menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
});
