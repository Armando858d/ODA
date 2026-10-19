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
// Condiciones reales guardadas por el propietario; nunca insertar HTML del panel.
if(page==='compra-segura'){
 const policyLabels={businessName:'Responsable del negocio',contactEmail:'Correo de atención',contactPhone:'Teléfono de atención',businessAddress:'Domicilio de atención',production:'Elaboración y disponibilidad',shipping:'Envíos y entregas',changes:'Cambios y devoluciones',cancellations:'Cancelaciones',damages:'Daños durante el transporte',privacy:'Aviso de privacidad'};
 const policies=document.createElement('section');policies.className='wrap';policies.id='condiciones';policies.innerHTML='<div class="section-head"><h2>ANTES DE COMPRAR.</h2></div><p role="status">Consultando las condiciones del estudio…</p>';document.querySelector('main').append(policies);
 fetch(STORE_CONFIG.apiBase+'/api/shop',{cache:'no-store',signal:AbortSignal.timeout(6000)}).then(async r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
  policies.querySelector('p').textContent=data.configured?'Condiciones y datos de atención publicados por el estudio.':'Consulta las condiciones de tu proyecto con el estudio antes de pagar.';
  if(!data.configured)return;
  for(const [key,label] of Object.entries(policyLabels)){const detail=document.createElement('details'),summary=document.createElement('summary'),copy=document.createElement('p');detail.className='panel';summary.textContent=label;copy.textContent=data[key];copy.style.whiteSpace='pre-line';detail.append(summary,copy);policies.append(detail)}
 }).catch(()=>{policies.querySelector('p').textContent='No pudimos consultar las condiciones actualizadas. Contáctanos por WhatsApp antes de confirmar tu pedido.'});
}
