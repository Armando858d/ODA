// SCROLL REVEAL
const sections = document.querySelectorAll('.bloque');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

sections.forEach(section => observer.observe(section));

// SCROLL SUAVE BOTONES
function scrollToSection(id){
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}
