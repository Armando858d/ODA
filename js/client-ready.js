'use strict';
// Mejoras de presentación: no altera precios, inventario ni estados de pago.
(()=>{
 const steps=[
 ['01','Una idea con identidad','Elegimos la escala, los detalles y el acabado de tu pieza. En trabajos personalizados, comenzamos con tus referencias.','angel1'],
 ['02','Precisión en cada capa','El diseño toma volumen mediante manufactura digital. Cada pieza necesita su propio tiempo de producción.','cat-sit'],
 ['03','El detalle hace la diferencia','Revisamos la impresión y trabajamos el acabado antes de preparar tu pedido.','corazon1'],
 ['04','Lista para llegar a ti','Protegemos tu pieza y coordinamos la entrega. El rastreo aparece cuando la paquetería confirma la guía.','elefante1']
 ];
 if(page==='index'||page==='proyectos'){
 const section=document.createElement('section');section.className='wrap craft-process';section.id='proceso';
 section.innerHTML=`<div class="section-head"><div><span class="eyebrow">DEL DISEÑO A TUS MANOS</span><h2>HECHO CON TIEMPO.<br><span>HECHO PARA TI.</span></h2></div><p>Tecnología para darle forma.<br>Manos para darle carácter.</p></div><div class="craft-layout"><img src="assets/optimized/angel1.webp" alt="Detalle de una escultura del estudio" loading="lazy" width="700" height="700"><div class="craft-steps">${steps.map(([n,title,copy,img],i)=>`<details ${i===0?'open':''} data-craft-image="${img}"><summary><span>${n}</span>${title}<b aria-hidden="true">+</b></summary><p>${copy}</p></details>`).join('')}</div></div>`;
 const anchor=document.querySelector('.manifesto');if(anchor)anchor.before(section);else document.querySelector('main').append(section);
 section.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{if(!detail.open)return;section.querySelector('img').src=`assets/optimized/${detail.dataset.craftImage}.webp`;section.querySelector('img').alt=detail.querySelector('summary').textContent.replace('+','').trim();section.querySelectorAll('details').forEach(other=>{if(other!==detail)other.open=false})}));
 }
 document.querySelectorAll('.trust-strip p').forEach(p=>{if(p.textContent.includes('Disponible al activar'))p.textContent='Consulta la disponibilidad al confirmar tu pedido.'});
 document.querySelectorAll('img').forEach(img=>{img.decoding='async';if(!img.closest('.hero'))img.loading='lazy'});
})();
