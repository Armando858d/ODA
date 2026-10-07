'use strict';
function paymentMotionMarkup(status){
 const kind=status==='approved'?'success':['rejected','cancelled'].includes(status)?'failed':['refunded','charged_back','unverified'].includes(status)?'info':'pending';
 const caption=kind==='success'?'Pago confirmado · El estudio preparará tu pedido':kind==='failed'?'El pago no se completó · Puedes volver a intentarlo':kind==='info'?'Revisa el estado de tu pago':'Consultando la confirmación de tu pago…';
 return `<div class="payment-journey ${kind}"><div class="journey-track" aria-hidden="true"><div class="journey-cart"><svg viewBox="0 0 100 80"><path d="M7 12h13l10 42h48l11-30H25M33 60h43"/><path d="M43 22V9h25v22M43 9l12 7 13-7M55 16v14"/><circle cx="37" cy="69" r="5"/><circle cx="73" cy="69" r="5"/>${kind==='success'?'<path d="m70 9 6 6 12-13"/>':''}</svg></div></div><p class="journey-caption">${caption}</p></div>`;
}
function paintPaymentMotion(status){const target=document.getElementById('paymentMotion');if(!target)return;target.innerHTML=paymentMotionMarkup(status);target.closest('.status-card')?.setAttribute('data-payment-state',status);}
