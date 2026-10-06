'use strict';
const socialPaths={
 instagram:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2"/>',
 facebook:'<path d="M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8H18V2.4c-.4-.1-1.7-.2-3.2-.2-3.1 0-5.1 1.9-5.1 5.3v2H7V13h2.7v9Z"/>',
 tiktok:'<path d="M15.6 2h3a5.5 5.5 0 0 0 3.4 4.8v3.1a8.5 8.5 0 0 1-3.4-1.2v7a6.3 6.3 0 1 1-5.5-6.2v3.2a3.1 3.1 0 1 0 2.5 3V2Z"/>',
 whatsapp:'<path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.4-.2-3 .8.8-2.9-.3-.5A8 8 0 1 1 12 20Z"/><path d="M8.1 6.8c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.7.7 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3-1.9-.9c-.2-.1-.4-.2-.6.1l-.8 1c-.1.2-.3.2-.5.1a7 7 0 0 1-3.3-2.9c-.2-.2 0-.4.1-.5l.5-.6c.2-.2.2-.4.1-.6L9.1 7c-.1-.3-.3-.3-.5-.3h-.5Z"/>'
};
const socialIcon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${socialPaths[name]}</svg>`;
const studioSocials=[['instagram','Instagram','https://www.instagram.com/oda858dj'],['facebook','Facebook','https://www.facebook.com/Service4RTB4N'],['tiktok','TikTok','https://www.tiktok.com/@oda858d'],['whatsapp','WhatsApp','https://wa.me/524492795557']];
const bottom=document.querySelector('.footer-bottom');
if(bottom)bottom.insertAdjacentHTML('beforebegin',`<section class="studio-socials" aria-label="Redes sociales de ODA Studio"><div><span class="eyebrow">EL ESTUDIO TAMBIÉN ESTÁ AQUÍ</span><h3>SIGUE EL MOVIMIENTO.</h3></div><nav class="social-links" aria-label="Redes sociales">${studioSocials.map(([key,label,url])=>`<a class="network ${key}" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label} de ODA Studio (abre otra pestaña)">${socialIcon(key)}</a>`).join('')}</nav></section>`);
document.body.insertAdjacentHTML('beforeend',`<a class="whatsapp-float" href="https://wa.me/524492795557" target="_blank" rel="noopener noreferrer" aria-label="Hablar con ODA Studio por WhatsApp (abre otra pestaña)">${socialIcon('whatsapp')}</a>`);

// Entrega local acordada directamente con el estudio, sin tarifa automática.
if(page==='envios'||page==='checkout'){
 const localContact=document.createElement('section');localContact.className='local-delivery-note';localContact.setAttribute('aria-label','Entrega local en Aguascalientes');
 localContact.innerHTML=`<div><span class="eyebrow">¿ESTÁS EN AGUASCALIENTES, AGS.?</span><h2>COORDINAMOS TU ENTREGA.</h2><p>Si estás dentro de la ciudad de Aguascalientes, contáctanos por WhatsApp para acordar la zona, el costo y el horario de entrega. En otras localidades, consulta el envío por paquetería.</p></div><a class="btn lime" href="https://wa.me/524492795557?text=${encodeURIComponent('Hola ODA Studio, estoy dentro de la ciudad de Aguascalientes, Ags. Quiero coordinar una entrega local. Mi colonia y código postal son: ')}" target="_blank" rel="noopener noreferrer">COORDINAR POR WHATSAPP ↗</a>`;
 document.querySelector('.page-heading')?.after(localContact);
}
