'use strict';
// Lienzos tiene rutas propias; conserva el acceso en el pie de página.
const canvasFooter=document.createElement('a');canvasFooter.href='lienzos.html';canvasFooter.textContent='Lienzos disponibles';
document.querySelector('.footer-top a[href="personalizados.html"]')?.before(canvasFooter);
