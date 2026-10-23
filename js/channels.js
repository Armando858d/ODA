'use strict';
(()=>{
 const base=window.STORE_CONFIG.apiBase;let links={mercadolibre:'',amazon:'',tiktok:'https://www.tiktok.com/@artb4nn'};
 const names={mercadolibre:'Mercado Libre',amazon:'Amazon',tiktok:'TikTok'};
 const marks={mercadolibre:'ML',amazon:'a',tiktok:'♪'};
 const hosts={mercadolibre:['mercadolibre.com.mx','mercadolibre.com','meli.la'],amazon:['amazon.com.mx','amazon.com','amzn.to'],tiktok:['tiktok.com']};
 function safe(k,value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&hosts[k].some(h=>u.hostname===h||u.hostname.endsWith('.'+h))?u.href:''}catch{return ''}}
 function cards(){return Object.keys(names).map(k=>{const href=safe(k,links[k]);return `<${href?'a':'div'} class="channel-card ${href?'':'unavailable'}" ${href?`href="${esc(href)}" target="_blank" rel="noopener noreferrer"`:'aria-disabled="true"'}><span class="channel-mark" aria-hidden="true">${marks[k]}</span><strong>${names[k]}</strong><span>${href?'Visitar ↗':'No disponible'}</span></${href?'a':'div'}>`}).join('')}
 const menu=document.createElement('details');menu.className='channel-menu';menu.innerHTML='<summary>Otras tiendas</summary><div class="channel-menu-list"></div>';$('#navLinks')?.append(menu);
 function paint(){menu.querySelector('div').innerHTML=cards();document.querySelectorAll('[data-channels]').forEach(n=>n.innerHTML=cards());}
 if(['tienda','checkout'].includes(page)){
  const section=document.createElement('section');section.className='wrap channel-section';section.innerHTML='<span class="eyebrow">ELIGE DÓNDE COMPRAR</span><h2>TU PIEZA.<br>TU PLATAFORMA.</h2><p>También puedes visitar nuestras otras plataformas. El precio, la disponibilidad, el pago y la entrega se confirman en cada una.</p><div class="channel-grid" data-channels></div><p class="muted">TikTok abre el perfil de @artb4nn; revisa allí los productos y las opciones de compra disponibles.</p><a class="btn lime" href="personalizados.html">PEDIR UNA COTIZACIÓN PERSONALIZADA ↗</a>';$('#main').append(section);
 }
 paint();fetch(base+'/api/marketplaces').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{links=d;paint()}).catch(()=>{});
 document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false});document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.open=false});
 const form=$('#customForm');if(!form)return;
 form.querySelector('p.muted').textContent='Envíanos tu idea. El estudio la recibirá en su panel y te responderá por correo o teléfono.';
 form.querySelector('.form-grid').insertAdjacentHTML('afterbegin','<label class="wide">Correo para recibir respuesta<input name="email" type="email" autocomplete="email" required maxlength="180"></label><label class="wide">Teléfono de contacto (opcional)<input name="phone" type="tel" autocomplete="tel" maxlength="20"></label><label class="request-trap" aria-hidden="true">Sitio web<input name="website" tabindex="-1" autocomplete="off"></label>');
 const note=form.querySelector('p:last-child');note.textContent='Tu solicitud y datos de contacto se guardan de forma privada para atender tu cotización. No se realiza un cobro ni se envía un mensaje a WhatsApp.';
 form.querySelector('button').textContent='ENVIAR SOLICITUD AL ESTUDIO ↗';let key='',last='';
 form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;const body=Object.fromEntries(new FormData(form));body.quantity=Number(body.quantity);const json=JSON.stringify(body);if(last!==json){key=crypto.randomUUID();last=json}const button=form.querySelector('button');button.disabled=true;$('#customResult').textContent='Guardando tu solicitud…';try{const r=await fetch(base+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:json,signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok)throw Error(d.error||'No pudimos guardar tu solicitud.');$('#customResult').textContent='Solicitud recibida. Tu referencia es '+d.id+'. El estudio revisará tu idea y se pondrá en contacto contigo.';form.reset();key='';last='';}catch(e){$('#customResult').textContent=e.message+' Puedes volver a intentar sin cambiar tus datos.'}finally{button.disabled=false}};
})();
