'use strict';
(()=>{
 const $=id=>document.getElementById(id),base='https://oda-pagos.oda-pagos-cloudflare.workers.dev';let token='',generation=0;
 const say=s=>{$('message').textContent=s};
 async function api(path,body){const r=await fetch(base+'/api/admin/'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo completar la operación.');return d;}
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n};
 async function load(){const g=generation;const [s,o]=await Promise.all([api('status'),api('orders')]);if(g!==generation)return;
 $('connections').textContent=`Mercado Pago: modo ${s.mode==='live'?'real':'prueba'} · Cobros ${s.payments_enabled?'habilitados':'desactivados'} · Envia.com ${s.envia_connected?'credencial guardada (pendiente de prueba)':'pendiente de conectar'}.`;
 if(s.origin)for(const [k,v] of Object.entries(s.origin)){const input=$('origin').elements.namedItem(k);if(input)input.value=v;}
 $('inventory').replaceChildren();for(const item of s.inventory){const f=el('form');f.className='item';f.append(el('h3',item.title));const grid=el('div');grid.className='grid';
 for(const [key,label] of [['stock','Unidades disponibles'],['weight','Peso (kg)'],['length','Largo (cm)'],['width','Ancho (cm)'],['height','Alto (cm)']]){const l=el('label',label),i=el('input');i.name=key;i.type='number';i.required=true;i.min=key==='stock'?'0':'0.01';i.max=key==='stock'?'10000':key==='weight'?'100':'300';i.step=key==='stock'?'1':'0.01';i.value=item[key]??'';l.append(i);grid.append(l)}f.append(grid);const b=el('button','Guardar existencias y paquete');f.append(b);f.onsubmit=async e=>{e.preventDefault();b.disabled=true;try{const data={product_id:item.product_id,variant:item.variant,previous_stock:item.stock};for(const [k,v] of new FormData(f))data[k]=Number(v);await api('inventory',data);await load();say('Existencias y paquete guardados.')}catch(e){say(e.message)}finally{b.disabled=false}};$('inventory').append(f)}
 $('orders').replaceChildren();if(!o.orders.length)$('orders').append(el('p','Todavía no hay pedidos registrados.'));for(const x of o.orders){const d=el('article');d.className='order';d.append(el('h3',x.id),el('p',`${x.state} · ${x.mode==='test'?'PRUEBA':'VENTA REAL'} · ${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(x.total_cents/100)}`),el('p',`${x.customer.name} · ${x.customer.email}`),el('p',x.items.map(i=>`${i.quantity} × ${i.title}`).join(' / ')));$('orders').append(d)}
 $('panel').hidden=false;$('login').hidden=true;$('logout').hidden=false;
 }
 $('login').onsubmit=async e=>{e.preventDefault();token=$('key').value;$('key').value='';say('Abriendo panel…');try{await load();say('Panel conectado.')}catch(e){token='';say(e.message)}};
 $('logout').onclick=()=>{generation++;token='';$('panel').hidden=true;$('panel').querySelectorAll('input').forEach(i=>i.value='');$('inventory').replaceChildren();$('orders').replaceChildren();$('login').hidden=false;$('logout').hidden=true;say('Sesión cerrada.')};
 $('origin').onsubmit=async e=>{e.preventDefault();try{await api('origin',Object.fromEntries(new FormData(e.currentTarget)));say('Origen privado guardado.')}catch(e){say(e.message)}};
 $('refresh').onclick=async()=>{try{await load();say('Datos actualizados.')}catch(e){say(e.message)}};
 $('verify').onclick=async()=>{say('Consultando Mercado Pago…');try{const d=await api('mercadopago',{});say((d.collector_matches?'Credencial válida y vendedor coincidente. ':'La credencial funciona, pero el vendedor no coincide con MP_COLLECTOR_ID. ')+d.message)}catch(e){say(e.message)}};
})();
