'use strict';
function paymentMotionMarkup(status){
 const kind=status==='approved'?'success':['rejected','cancelled'].includes(status)?'failed':['refunded','charged_back','unverified'].includes(status)?'info':'pending';
 const symbol=kind==='success'?'<path class="draw-mark" d="m30 51 14 14 28-30"/>':kind==='failed'?'<path class="draw-mark" d="m36 36 28 28m0-28L36 64"/>':kind==='info'?'<path class="draw-mark" d="M50 28v28m0 13v2"/>':'<path d="M50 28v23l15 10"/>';
 return `<div class="payment-orbit ${kind}"><span class="orbit-ring"></span><svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" class="draw-ring"/>${symbol}</svg>${kind==='success'?'<i class="confetti a"></i><i class="confetti b"></i><i class="confetti c"></i><i class="confetti d"></i>':''}</div>`;
}
function paintPaymentMotion(status){
 const target=document.getElementById('paymentMotion');if(!target)return;
 target.innerHTML=paymentMotionMarkup(status);
 target.closest('.status-card')?.setAttribute('data-payment-state',status);
}
