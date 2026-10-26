'use strict';
(()=>{
 const section=document.createElement('section');section.dataset.panel='settings';
 section.innerHTML=`<h2>Prueba privada de $1 MXN</h2><p>Cobro real de un peso en total. Sin producto, fabricación, envío ni guía. El cupón solo funciona en este panel privado, vence en una hora y permite un pedido. No modifica los precios públicos.</p><button type="button" id="createPaymentCoupon">Generar cupón privado</button><form id="paymentTestForm" class="grid"><label>Cupón privado<input name="code" type="password" autocomplete="off" required maxlength="80"></label><label>Nombre del comprador<input name="name" autocomplete="name" required maxlength="100"></label><label>Correo del comprador<input name="email" type="email" autocomplete="email" required maxlength="180"></label><label><input name="confirm_real_payment" type="checkbox" required>Entiendo que completaré un pago real de $1 MXN, sin recibir un producto ni generar envío.</label><button>Preparar enlace de $1 MXN</button></form><p id="paymentTestResult" role="status"></p>`;
 document.getElementById('panel').append(section);
 const form=section.querySelector('form'),result=section.querySelector('#paymentTestResult'),generate=section.querySelector('#createPaymentCoupon');
 let session=0;
 generate.onclick=async()=>{const generation=session;generate.disabled=true;try{const data=await window.odaAdmin.api('payment-test-coupon',{});if(generation!==session)return;form.elements.code.value=data.code;result.textContent='Cupón privado preparado en este formulario. Vence a las '+new Date(data.expires_at*1000).toLocaleTimeString('es-MX')+'. Completa los datos del comprador. No se hizo ningún cobro.';}catch(e){if(generation===session)result.textContent=e.message;}finally{generate.disabled=false}};
 form.onsubmit=async event=>{event.preventDefault();const generation=session,button=form.querySelector('button');button.disabled=true;result.textContent='Preparando la prueba de $1 MXN…';try{
  const data=await window.odaAdmin.api('payment-test-checkout',{code:form.elements.code.value.trim(),name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),confirm_real_payment:form.elements.confirm_real_payment.checked});
  if(generation!==session)return;
  const url=new URL(data.checkout_url);if(data.total!==1||url.protocol!=='https:'||url.hostname!=='www.mercadopago.com.mx'||url.username||url.password)throw Error('No se recibió un enlace válido por $1 MXN. Consulta al estudio.');
  const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Abrir Mercado Pago · $1 MXN total';
  const note=document.createElement('span');note.textContent=' · Pedido '+data.order_id+'. El cobro solo se realiza cuando tú autorizas el pago en Mercado Pago. Este cupón no crea otro pedido: repetir muestra el mismo enlace.';
  result.replaceChildren(link,note);
 }catch(e){if(generation===session)result.textContent=e.message;}finally{button.disabled=false}};
 window.addEventListener('oda-admin-logout',()=>{session++;form.reset();result.replaceChildren()});
})();
