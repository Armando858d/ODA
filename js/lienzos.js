'use strict';
// Lienzos tiene rutas propias; conserva el acceso en el pie de página.
const canvasFooter=document.createElement('a');canvasFooter.href='lienzos.html';canvasFooter.textContent='Lienzos disponibles';
document.querySelector('.footer-top a[href="personalizados.html"]')?.before(canvasFooter);

if(page==='index'){
 const section=document.createElement('section');section.id='lienzos';section.className='wrap canvas-section';section.setAttribute('aria-labelledby','canvasTitle');
 section.innerHTML=`<div class="section-head"><div><span class="eyebrow">ODA STUDIO / ARTE PARA TU ESPACIO</span><h2 id="canvasTitle">CUADROS<br>EN <span>LIENZO.</span></h2></div><p class="canvas-intro">Una idea hecha para ti o una obra del estudio. Elige cómo darle personalidad a tus paredes.</p></div><div class="canvas-grid canvas-two-options">${[
 ['custom','01 / PERSONALIZADOS','Crear mi lienzo','Cuéntanos tu idea, colores y medidas. Cotizamos una obra hecha para tu espacio.','TU<br>VISIÓN.','crear-lienzo.html','CREAR MI LIENZO'],
 ['street','02 / VENTA DE LIENZOS','Lienzos disponibles','Explora las obras publicadas por el estudio, sus fotos, medidas y precios.','TU<br>ESPACIO.','lienzos.html#disponibles','VER LIENZOS DISPONIBLES']
 ].map(([style,kicker,title,copy,art,href,action])=>`<article class="canvas-card"><div class="canvas-preview canvas-${style}" aria-hidden="true"><div class="canvas-art"><span>${art}</span><small>ODA / ARTE EN LIENZO</small></div></div><div class="canvas-copy"><span class="eyebrow">${kicker}</span><h3>${title}</h3><p>${copy}</p><a class="text-link" href="${href}">${action} <span aria-hidden="true">↗</span></a></div></article>`).join('')}</div>`;
 document.querySelector('.manifesto').before(section);
}
