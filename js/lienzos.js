 'use strict';
const canvasLink='index.html#lienzos';
const canvasNav=document.createElement('a');canvasNav.href=canvasLink;canvasNav.textContent='Lienzos';
document.querySelector('#navLinks a[href="personalizados.html"]')?.before(canvasNav);
const canvasFooter=document.createElement('a');canvasFooter.href=canvasLink;canvasFooter.textContent='Cuadros en lienzo';
document.querySelector('.footer-top a[href="personalizados.html"]')?.before(canvasFooter);
if(page==='index'||page==='tienda'){
 const section=document.createElement('section');section.id='lienzos';section.className='wrap canvas-section';section.setAttribute('aria-labelledby','canvasTitle');
 section.innerHTML=`<div class="section-head"><div><span class="eyebrow">ODA STUDIO / ARTE PARA TU ESPACIO</span><h2 id="canvasTitle">CUADROS<br>EN <span>LIENZO.</span></h2></div><p class="canvas-intro">Dale otra actitud a tus paredes. Cuéntanos tu idea y armamos contigo una propuesta de diseño, tamaño y acabado.</p></div><div class="canvas-grid">${[
 ['street','01 / INSPIRACIÓN URBANA','Actitud callejera','Tipografía, contraste y color para darle personalidad a tu espacio.','STREET<br>SOUL.'],
 ['abstract','02 / EXPLORA EL COLOR','Abstracción con carácter','Formas y paletas que conectan con tu estilo. Tú eliges el rumbo.','FUERA<br>DE LÍNEA.'],
 ['custom','03 / TU IDEA, TU LIENZO','Una pieza personal','Comparte tu referencia o idea y consulta cómo llevarla a un lienzo.','TU<br>VISIÓN.']
 ].map(([style,kicker,title,copy,art])=>`<article class="canvas-card"><div class="canvas-preview canvas-${style}" aria-hidden="true"><div class="canvas-art"><span>${art}</span><small>ODA / CONCEPTO VISUAL</small></div></div><div class="canvas-copy"><span class="eyebrow">${kicker}</span><h3>${title}</h3><p>${copy}</p><a class="text-link" href="personalizados.html?pieza=${encodeURIComponent('Cuadro en lienzo — '+title)}">COTIZAR LIENZO <span aria-hidden="true">↗</span></a></div></article>`).join('')}</div><div class="canvas-note"><span>Los diseños mostrados son referencias visuales.</span><span>Precio, medidas, técnica y entrega se confirman al cotizar.</span></div>`;
 const anchor=page==='index'?document.querySelector('.manifesto'):document.querySelector('main .benefits');
 if(anchor)anchor.before(section);else document.querySelector('main').append(section);
}
