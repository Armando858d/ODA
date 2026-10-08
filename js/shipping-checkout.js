'use strict';
(()=>{
 if(page!=='checkout'||!$('#checkoutForm'))return;
 const form=$('#checkoutForm');let selected=null,selectionKey='',busy=false;
 $('#addressFields').insertAdjacentHTML('beforeend','<label>Teléfono de contacto<input name="phone" type="tel" autocomplete="tel" required maxlength="20"></label><label>Número exterior e interior<input name="number" required maxlength="20"></label><input name="state_code" type="hidden">');
 form.elements.street.parentElement.firstChild.textContent='Calle';
 const stateSelect=document.createElement('select');stateSelect.name='state';stateSelect.required=true;stateSelect.append(new Option('Selecciona tu estado',''));for(const s of window.ENVIA_STATES||[])stateSelect.append(new Option(s.name,s.name));form.elements.state.replaceWith(stateSelect);stateSelect.onchange=()=>{form.elements.state_code.value=(window.ENVIA_STATES||[]).find(s=>s.name===stateSelect.value)?.code||'';invalidate()};
 $('#deliveryMethod').addEventListener('change',()=>{stateSelect.disabled=$('#deliveryMethod').value!=='shipping'});

 form.insertAdjacentHTML('beforeend','<section class="payment-box" id="shippingOptions"><h3>ELIGE CÓMO LLEGA.</h3><p>Compara paqueterías con las medidas reales de tu pieza. Tarifas en MXN; vigencia de 10 minutos. Las entregas en Aguascalientes se coordinan por WhatsApp.</p><button class="btn full" id="quoteShippingButton" type="button">COTIZAR ENVÍO</button><p id="shippingMessage" role="status"></p><div id="shippingChoices"></div></section>');
 form.insertBefore($('#shippingOptions'),form.querySelector('.payment-box'));
 const key=()=>JSON.stringify([cart.map(x=>({id:x.id,variant:x.variant,quantity:x.quantity})),Array.from(new FormData(form)).filter(([k])=>k!=='shippingChoice')]);
 const valid=()=>selected&&selectionKey===key()&&selected.expires_at>Date.now()/1000;
 const original=updateOrderSummary;
 updateOrderSummary=function(){original();if($('#deliveryMethod').value==='shipping'){
  $('#orderShipping').textContent=valid()?money(selected.total):'Cotiza para conocer el costo';
  $('#orderTotal').textContent=money(subtotal()+(valid()?selected.total:0))+(valid()?'':' + envío');
 }};
 function invalidate(){if(!valid()){selected=null;$('#shippingChoices').replaceChildren();}updateOrderSummary();}
 form.addEventListener('input',invalidate);
 $('#deliveryMethod').addEventListener('change',()=>{const shipping=$('#deliveryMethod').value==='shipping';$('#shippingOptions').hidden=!shipping;invalidate()});
 function payload(){const f=new FormData(form);return {items:cart.map(x=>({id:x.id,variant:x.variant,quantity:x.quantity})),customer:Object.fromEntries(['name','email','method','zip','state','city','colony','street','notes','phone','number','state_code'].map(k=>[k,String(f.get(k)||'')]))};}
 $('#quoteShippingButton').onclick=async()=>{
  if(busy)return;
  for(const input of form.querySelectorAll('input:not([type=checkbox]),select'))if(!input.disabled&&!input.reportValidity())return;
  busy=true;selected=null;$('#shippingChoices').replaceChildren();const before=key();$('#quoteShippingButton').disabled=true;$('#shippingMessage').textContent='Consultando paqueterías…';
  try{const d=await api('/api/shipping/quotes',{method:'POST',body:JSON.stringify(payload()),signal:AbortSignal.timeout(40000)});if(before!==key())throw Error('Cambiaste la selección. Vuelve a cotizar.');
   $('#shippingMessage').textContent='Compara servicios. Las tarifas marcadas solo para consulta no se pueden pagar en este modo. '+(d.partial?'Algunas paqueterías no respondieron.':'');
   for(const q of d.quotes){const b=document.createElement('button');b.type='button';b.className='btn full';b.style.marginTop='12px';b.disabled=q.payable===false;b.textContent=`Skydropx · ${q.mode==='test'?'PRUEBA · ':''}${q.payable===false?'SOLO CONSULTA · ':''}${q.description} · ${money(q.total)} MXN · ${q.estimate}${q.drop_off?' · Llevar paquete a sucursal':''}`;b.onclick=()=>{selected=q;selectionKey=key();$('#shippingChoices').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));$('#shippingMessage').textContent='Envío seleccionado: '+q.description;updateOrderSummary()};$('#shippingChoices').append(b)}
  }catch(e){$('#shippingMessage').textContent=e.message}finally{busy=false;$('#quoteShippingButton').disabled=false;updateOrderSummary()}
 };
 window.prepareShippingPayment=p=>{if(p.customer.method!=='shipping')return true;if(!valid()){$('#shippingMessage').textContent='Cotiza y selecciona el envío antes de pagar. Si cambiaste los datos, vuelve a cotizar.';$('#shippingOptions').scrollIntoView({block:'center'});return false;}Object.assign(p.customer,payload().customer);p.shipping_quote_id=selected.id;return true;};
 const originalSubmit=form.onsubmit;
 form.onsubmit=event=>{if($('#deliveryMethod').value!=='shipping'){originalSubmit(event);return;}event.preventDefault();const p=payload(),c=p.customer;const text=`Hola ODA, soy ${c.name}. Quiero consultar este pedido:\n${cart.map(x=>`${x.quantity} × ${productFor(x.id).name} / ${productFor(x.id).variants[x.variant].name}`).join('\n')}\nSubtotal: ${money(subtotal())} MXN\nEntrega: ${c.street} ${c.number}, ${c.colony}, ${c.city}, ${c.state}, CP ${c.zip}\n${valid()?`Envío cotizado: ${selected.description}, ${money(selected.total)} MXN. Total: ${money(subtotal()+selected.total)} MXN.`:'Envío pendiente de cotizar.'}\nNotas: ${c.notes||'Sin notas'}`;$('#orderResult').innerHTML=`<div class="notice"><p style="white-space:pre-line">${esc(text)}</p></div>${whatsappLink(text,'ENVIAR CONSULTA POR WHATSAPP')}<p>No se ha creado ni pagado un pedido.</p>`;};
 setInterval(()=>{if(selected&&!valid()){invalidate();$('#shippingMessage').textContent='La tarifa venció. Vuelve a cotizar antes de pagar.'}},1000);
 updateOrderSummary();
})();
