import {APIError} from './errors.mjs';
const fail=(status,message)=>{throw new APIError(status,message)};
const sql=(e,s,...a)=>e.DB.prepare(s).bind(...a);
const first=(e,s,...a)=>sql(e,s,...a).first();
const stamp=()=>Math.floor(Date.now()/1000);
const sha=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');
export const shippingConfigured=e=>!!(e.ENVIA_TOKEN&&e.SHIPPING_PROVIDER==='envia'&&['test','live'].includes(e.ENVIA_MODE));
const base=e=>e.ENVIA_MODE==='live'?'https://api.envia.com':'https://api-test.envia.com';
export function enviaToken(value){
 let token=String(value||'').trim().replace(/^Bearer\s+/i,'').trim();
 if((token.startsWith('"')&&token.endsWith('"'))||(token.startsWith("'")&&token.endsWith("'")))token=token.slice(1,-1).trim();
 if(!token||/[\s*\u2022\u25cf]/u.test(token))fail(409,'El token guardado contiene espacios internos o caracteres de ocultamiento. Copia el valor completo con el boton del portapapeles de Envia.com.');
 return token;
}
export async function envia(e,path,payload,capture){
 if(!shippingConfigured(e))fail(503,'El cotizador está en configuración. Solicita tu envío por WhatsApp.');
 try{const r=await fetch(base(e)+path,{method:'POST',headers:{Authorization:'Bearer '+enviaToken(e.ENVIA_TOKEN),'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});const raw=await r.text();let parsed;try{parsed=JSON.parse(raw)}catch{parsed={message:raw.slice(0,1000)}}if(capture)await capture({http_status:r.status,response:parsed});if(!r.ok)fail(502,'Envia.com HTTP '+r.status+'. Verifica el token del ambiente '+e.ENVIA_MODE+'.');const data=parsed;if(!Array.isArray(data.data)||data.meta==='error')fail(502,'La respuesta de la paquetería no es válida.');return data.data}catch(e){if(e instanceof APIError)throw e;fail(503,'La paquetería no respondió. Consulta el estado antes de repetir una compra de guía.');}
}
function txt(v,max=150){return typeof v==='string'&&v.trim().length<=max?v.trim():'';}
export function address(a){
 if(!a||typeof a!=='object')fail(400,'Falta la dirección completa.');
 const v={name:txt(a.name,100),email:txt(a.email,180),phone:txt(a.phone,20).replace(/[\s()-]/g,''),street:txt(a.street),number:txt(a.number,20),district:txt(a.district,100),city:txt(a.city,80),state:txt(a.state,3).toUpperCase(),country:'MX',postalCode:txt(a.postalCode,5),reference:txt(a.reference,150)};
 if(!v.name||!v.street||!v.number||!v.district||!v.city||!/^\d{5}$/.test(v.postalCode)||!/^\+?\d{10,13}$/.test(v.phone)||!/^[A-Z]{2,3}$/.test(v.state)||!/^\S+@\S+\.\S+$/.test(v.email))fail(400,'Revisa dirección, número, colonia, teléfono y código de estado.');return v;
}
export const destination=c=>address({name:c.name,email:c.email,phone:c.phone,street:c.street,number:c.number,district:c.colony,city:c.city,state:c.state_code,postalCode:c.zip,reference:c.notes});
export async function origin(e){const row=await first(e,"SELECT value FROM store_settings WHERE key='origin'");if(!row)fail(409,'Falta configurar la dirección de origen del estudio.');return address(JSON.parse(row.value));}
export async function packagesFor(items,e){
 // One measured, separately packed box per unit. Do not invent combined dimensions.
 if(items.reduce((n,i)=>n+i.quantity,0)>5)fail(409,'Para más de cinco cajas, solicita una cotización al estudio.');
 const packages=[];for(const i of items){const p=await first(e,'SELECT * FROM package_profiles WHERE product_id=? AND variant=?',i.id,i.variant);if(!p)fail(409,'Faltan peso y medidas de '+i.title+'. Solicita una cotización al estudio.');for(let n=0;n<i.quantity;n++)packages.push({type:'box',content:i.title,amount:1,declaredValue:i.price_cents/100,lengthUnit:'CM',weightUnit:'KG',weight:p.weight,dimensions:{length:p.length,width:p.width,height:p.height}});}
 return packages;
}
export const quoteFingerprint=(items,customer)=>sha(JSON.stringify([items,destination(customer)]));
function normalizeRate(r,carrier){
 const cents=Math.round(Number(r.totalPrice)*100);
 if(r.currency!=='MXN'||!Number.isSafeInteger(cents)||cents<=0||cents>10000000||r.carrier!==carrier||typeof r.service!=='string'||!r.service||![0,2].includes(Number(r.dropOff)))return null;
 return {carrier,service:r.service,description:String(r.carrierDescription||carrier)+' · '+String(r.serviceDescription||r.service),total_cents:cents,estimate:String(r.deliveryEstimate||'Consultar plazo'),dropOff:Number(r.dropOff)};
}
export async function rates(items,customer,e){
 if(!shippingConfigured(e))fail(503,'La cotización por paquetería está en configuración.');
 if(e.ENVIA_MODE!==e.MP_MODE)fail(409,'El modo de Envia.com debe coincidir con el de Mercado Pago.');
 const payload={origin:await origin(e),destination:destination(customer),packages:await packagesFor(items,e),settings:{currency:'MXN',printFormat:'PDF',printSize:'PAPER_4X6'}};
 const carriers=String(e.ENVIA_CARRIERS||'fedex,dhl,estafeta').split(',').map(x=>x.trim()).filter(x=>/^[a-z0-9_-]+$/.test(x)).slice(0,4);
 if(!carriers.length)fail(409,'Falta configurar las paqueterías a consultar.');
 const fingerprint=await quoteFingerprint(items,customer);let successes=0;
 const groups=await Promise.allSettled(carriers.map(async carrier=>{const raw=await envia(e,'/ship/rate/',{...payload,shipment:{type:1,carrier}});successes++;return raw.map(r=>normalizeRate(r,carrier)).filter(Boolean)}));
 const offers=groups.flatMap(g=>g.status==='fulfilled'?g.value:[]).sort((a,b)=>a.total_cents-b.total_cents).slice(0,12);
 if(!offers.length)fail(409,successes?'No hay servicios disponibles para ese paquete y destino. Consulta al estudio.':'No pudimos obtener tarifas. Revisa tu cuenta o consulta al estudio.');
 await sql(e,'DELETE FROM shipping_quotes WHERE expires_at<? AND NOT EXISTS(SELECT 1 FROM order_shipping WHERE quote_id=shipping_quotes.id)',stamp()-86400).run();
 const expires=stamp()+600;
 const list=offers.map(r=>({...r,id:crypto.randomUUID()}));
 await e.DB.batch(list.map(r=>sql(e,'INSERT INTO shipping_quotes(id,fingerprint,payload,carrier,service,description,total_cents,estimate,mode,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)',r.id,fingerprint,JSON.stringify({...payload,shipment:{type:1,carrier:r.carrier,service:r.service}}),r.carrier,r.service,r.description,r.total_cents,r.estimate,e.ENVIA_MODE,expires)));
 return {quotes:list.map(r=>({id:r.id,carrier:r.carrier,service:r.service,description:r.description,total:r.total_cents/100,estimate:r.estimate,drop_off:r.dropOff===2,expires_at:expires})),mode:e.ENVIA_MODE,partial:groups.some(g=>g.status==='rejected')};
}
export async function resolveQuote(id,items,customer,e){
 if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id))fail(409,'Primero cotiza y selecciona una opción de envío.');
 const row=await first(e,'SELECT * FROM shipping_quotes WHERE id=?',id);
 if(!row||row.expires_at<=stamp()||row.mode!==e.MP_MODE||row.mode!==e.ENVIA_MODE||row.fingerprint!==await quoteFingerprint(items,customer))fail(409,'La cotización venció o cambió tu pedido/dirección. Vuelve a cotizar.');return row;
}
export async function purchaseLabel(orderId,expectedCents,e){
 if(e.LABEL_PURCHASES_ENABLED!=='true')fail(409,'La compra de guías aún está desactivada.');
 const row=await first(e,`SELECT o.*,s.state shipping_state,s.label_data,q.payload,q.mode shipping_mode FROM orders o JOIN order_shipping s ON s.order_id=o.id JOIN shipping_quotes q ON q.id=s.quote_id WHERE o.id=?`,orderId);
 if(!row||row.state!=='approved')fail(409,'Solo se generan guías para pedidos con pago aprobado.');
 if(row.shipping_mode!==e.ENVIA_MODE||row.mode!==e.MP_MODE)fail(409,'El modo del pedido no coincide con las cuentas activas.');
 if(row.shipping_state==='ready')return JSON.parse(row.label_data);
 if(row.shipping_state!=='not_started')fail(409,'Esta guía ya se está generando o necesita revisión en Envia.com. No repitas la compra.');
 const payload=JSON.parse(row.payload),current=await envia(e,'/ship/rate/',payload);
 const matched=current.map(r=>normalizeRate(r,payload.shipment.carrier)).find(r=>r?.service===payload.shipment.service);
 if(!matched)fail(409,'El servicio elegido ya no está disponible. Revisa el pedido.');
 const maximum=Number(e.MAX_LABEL_COST_MXN)>0?Math.round(Number(e.MAX_LABEL_COST_MXN)*100):row.shipping_cents;
 if(!Number.isSafeInteger(expectedCents)||expectedCents!==matched.total_cents||expectedCents>row.shipping_cents||!Number.isSafeInteger(maximum)||maximum<=0||expectedCents>maximum)fail(409,'La tarifa cambió o supera el importe autorizado. Revisa la cotización antes de comprar.');
 const attempt=crypto.randomUUID();
 const claim=await sql(e,"UPDATE order_shipping SET state='creating',attempt_id=?,updated_at=? WHERE order_id=? AND state='not_started' AND EXISTS(SELECT 1 FROM orders WHERE id=? AND state='approved')",attempt,stamp(),orderId,orderId).run();
 if(claim.meta.changes!==1)fail(409,'La guía ya se está procesando o cambió el estado del pago.');
 try{
  const data=await envia(e,'/ship/generate/',{...payload,shipment:{...payload.shipment,orderReference:orderId}},async response=>{await sql(e,'UPDATE order_shipping SET label_data=? WHERE order_id=? AND attempt_id=?',JSON.stringify({provider_response:response}),orderId,attempt).run()});
  const labels=data.map(l=>{let url;try{url=new URL(l.label)}catch{}if(!url||url.protocol!=='https:'||url.username||url.password||typeof l.trackingNumber!=='string'||!l.trackingNumber||l.currency!=='MXN'||!l.shipmentId)fail(502,'Guía recibida incompleta. Revisa Envia.com.');return {shipment_id:String(l.shipmentId),tracking:l.trackingNumber,label_url:url.href,carrier:String(l.carrier),service:String(l.service),total:Number(l.totalPrice)};});
  if(!labels.length||labels.some(l=>!Number.isFinite(l.total)||l.total<0))fail(502,'No se confirmó la guía.');
  const result={labels,cost_warning:Math.round(labels.reduce((n,l)=>n+l.total,0)*100)>expectedCents};
  await sql(e,"UPDATE order_shipping SET state='ready',label_data=?,amount_cents=?,updated_at=? WHERE order_id=? AND attempt_id=?",JSON.stringify(result),Math.round(labels.reduce((n,l)=>n+l.total,0)*100),stamp(),orderId,attempt).run();return result;
 }catch(e2){await sql(e,"UPDATE order_shipping SET state='needs_review',updated_at=? WHERE order_id=? AND attempt_id=?",stamp(),orderId,attempt).run();fail(503,'No se confirmó la compra de guía. Revisa Envia.com con la referencia '+orderId+' antes de repetir; podría haberse cobrado.');}
}
export async function labelRate(orderId,e){
 const row=await first(e,`SELECT o.state,o.shipping_cents,s.state shipping_state,s.label_data,q.payload,q.mode FROM orders o JOIN order_shipping s ON s.order_id=o.id JOIN shipping_quotes q ON q.id=s.quote_id WHERE o.id=?`,orderId);
 if(!row||row.state!=='approved')fail(409,'El pedido no tiene envío pagado y aprobado.');
 if(row.mode!==e.ENVIA_MODE)fail(409,'El modo de la cuenta no coincide con el envío.');
 if(row.shipping_state==='ready')return {state:'ready',...JSON.parse(row.label_data)};
 if(row.shipping_state==='needs_review'&&row.label_data){let detail;try{detail=JSON.parse(row.label_data)}catch{}if(detail?.provider_response?.response?.error?.message==='SERVICE_QUOTE_ONLY')fail(409,'Envia.com permite cotizar este servicio, pero no generar su PDF. Elige otra paqueteria para una nueva prueba; esta guia no se creo.');}
 if(row.shipping_state!=='not_started')fail(409,'La guía requiere revisión manual en Envia.com.');
 const p=JSON.parse(row.payload),data=await envia(e,'/ship/rate/',p);const r=data.map(x=>normalizeRate(x,p.shipment.carrier)).find(x=>x?.service===p.shipment.service);if(!r)fail(409,'No hay tarifa disponible para ese servicio.');
 return {state:'not_started',description:r.description,total:r.total_cents/100,total_cents:r.total_cents,paid_shipping:row.shipping_cents/100,estimate:r.estimate};
}
