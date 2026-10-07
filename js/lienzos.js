'use strict';
// Un solo catálogo: todos los accesos a lienzos disponibles usan su filtro.
const canvasFooter=document.createElement('a');canvasFooter.href='tienda.html?categoria=lienzo';canvasFooter.textContent='Lienzos disponibles';
document.querySelector('.footer-top a[href="personalizados.html"]')?.before(canvasFooter);
