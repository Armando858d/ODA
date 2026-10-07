 'use strict';
(()=>{
 const $=id=>document.getElementById(id),base='https://oda-pagos.oda-pagos-cloudflare.workers.dev';let token='',generation=0;
 const say=s=>{$('message').textContent=s};
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n};
 async function api(path,body){const r=await fetch(base+'/api/admin/'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo completar la operación.');return d;}
 function filter(){const query=$('inventorySearch').value.toLocaleLowerCase().trim();let count=0;const rows=$('inventory').querySelectorAll('.item');rows.forEach(row=>{row.hidden=!row.querySelector('h3').textContent.toLocaleLowerCase().includes(query);if(!row.hidden)count++});$('inventoryCount').textContent=count+' de '+rows.length+' acabados';}
 async function load(){const g=generation;const s=await api('status');if(g!==generation)return;
 $('inventory').replaceChildren();for(const item of s.inventory){const f=el('form');f.className='item';f.append(el('h3',item.title));const grid=el('div');grid.className='grid';
 for(const [key,label] of [['stock','Unidades disponibles'],['weight','Peso (kg)'],['length','Largo (cm)'],['width','Ancho (cm)'],['height','Alto (cm)']]){const l=el('label',label),i=el('input');i.name=key;i.type='number';i.required=true;i.min=key==='stock'?'0':'0.01';i.max=key==='stock'?'10000':key==='weight'?'100':'300';i.step=key==='stock'?'1':'0.01';i.value=item[key]??'';l.append(i);grid.append(l)}f.append(grid);const b=el('button','Guardar existencias y paquete');f.append(b);f.onsubmit=async e=>{e.preventDefault();b.disabled=true;try{const data={product_id:item.product_id,variant:item.variant,previous_stock:item.stock};for(const [k,v] of new FormData(f))data[k]=Number(v);await api('inventory',data);await load();say('Existencias y paquete guardados.')}catch(e){say(e.message)}finally{b.disabled=false}};$('inventory').append(f)}

 filter();$('panel').hidden=false;$('login').hidden=true;$('logout').hidden=false;
 }
 $('inventorySearch').oninput=filter;
 $('login').onsubmit=async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;token=$('key').value;$('key').value='';say('Consultando inventario…');try{await load();say('Inventario conectado.')}catch(error){token='';say(error.message)}finally{button.disabled=false}};
 $('refresh').onclick=async()=>{const button=$('refresh');button.disabled=true;try{await load();say('Inventario actualizado.')}catch(error){say(error.message)}finally{button.disabled=false}};
 $('logout').onclick=()=>{generation++;token='';$('inventory').replaceChildren();$('inventorySearch').value='';$('panel').hidden=true;$('login').hidden=false;$('logout').hidden=true;say('Sesión cerrada.');$('key').focus()};
})();
