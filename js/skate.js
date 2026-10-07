'use strict';
// Capa editorial: conserva catálogo, carrusel automático y checkout.
document.body.classList.add('skate-edition');
const studioMark=document.querySelector('.wordmark small');if(studioMark)studioMark.textContent='ODA STUDIO / EST. MX';
if(page==='index'){
 document.querySelector('main').classList.add('skate-home');
 const hero=document.querySelector('.hero');
 hero.querySelector('.eyebrow').textContent='ODA STUDIO — INDEPENDENT CREATIVE CULTURE';
 hero.querySelector('h1').innerHTML='CERO<br><em>MOLDES.</em><br><span class="outline-type">TODO ESTILO.</span>';
 hero.querySelector('.hero-content p').textContent='De la imaginación a tu spot. Piezas personalizadas y lienzos para quienes hacen las cosas a su manera.';
 hero.querySelector('.hero-content .btn').innerHTML='ELIGE TU ESTILO <span>↗</span>';
 hero.querySelector('.hero-content .btn').href='#elige';
 hero.querySelector('.hero-tag').innerHTML='Hecho para<br>salir de lo común.';
 hero.querySelector('.hero-sticker').innerHTML='<span>100%</span><b>ACTITUD</b><small>0% EN SERIE*</small>';
 hero.querySelector('.hero-sticker').setAttribute('aria-label','100 por ciento actitud. Piezas con identidad.');
 hero.querySelector('.hero-sticker small').textContent='DISEÑO CON IDENTIDAD';
 hero.insertAdjacentHTML('beforeend',`<div class="hero-coordinate" aria-hidden="true">AGUASCALIENTES, MX<br>ART • OBJECTS • CULTURE</div>`);
 const ticker=document.querySelector('.ticker');ticker.innerHTML='<div>'+Array(4).fill('<span>FUERA DEL MOLDE</span> ✳ <span>HECHO CON ACTITUD</span> ✳ <span>ODA STUDIO</span> ✳ ').join('')+'</div>';
 const heads=document.querySelectorAll('.skate-home .section-head');
 if(heads[0]){heads[0].querySelector('.eyebrow').textContent='ELIGE LO QUE VA CONTIGO / 01';heads[0].querySelector('h2').innerHTML='TU SPOT.<br><span>TUS REGLAS.</span>';}

 const manifesto=document.querySelector('.manifesto');if(manifesto){manifesto.querySelector('.eyebrow').textContent='DEL ESTUDIO A LA CALLE';manifesto.querySelector('h2').innerHTML='CREA.<br><span>ROMPE.</span><br>REPITE.';}
}
