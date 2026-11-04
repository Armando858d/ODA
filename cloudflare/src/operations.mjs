import {labelRate,purchaseLabel} from './shipping.mjs';
const sql=(e,s,...a)=>e.DB.prepare(s).bind(...a);
const now=()=>Math.floor(Date.now()/1000);
export const emailReady=e=>e.EMAIL_ENABLED==='true'&&!!e.RESEND_API_KEY&&/^[^\r\n]+@[^\r\n]+\.[^\r\n]+$/.test(e.EMAIL_FROM||'');
const issue=(e,id,kind,message)=>sql(e,'INSERT INTO operation_issues(order_id,kind,message,updated_at) VALUES(?,?,?,?) ON CONFLICT(order_id,kind) DO UPDATE SET message=excluded.message,updated_at=excluded.updated_at',id,kind,message,now()).run();
const clear=(e,id,kind)=>sql(e,'DELETE FROM operation_issues WHERE order_id=? AND kind=?',id,kind).run();
export async function publicFulfillment(e,id){
 const row=await sql(e,'SELECT state,label_data FROM order_shipping WHERE order_id=?',id).first();
 let labels=[];if(row?.state==='ready'){try{labels=JSON.parse(row.label_data).labels.map(l=>({carrier:String(l.carrier),tracking:String(l.tracking)}))}catch{}}
 const notes=await sql(e,"SELECT kind,state FROM notifications WHERE order_id=?",id).all();
 return {shipping:row?{state:row.state,labels}:{state:'not_required',labels:[]},notifications:Object.fromEntries(notes.results.map(n=>[n.kind,n.state]))};
}
export async function recoverLateReservation(e,id){
 const row=await sql(e,'SELECT state,inventory_released FROM orders WHERE id=?',id).first();
 if(row?.state!=='approved'||!row.inventory_released)return;
 try{await sql(e,"UPDATE orders SET inventory_released=0,fulfillment_hold=0 WHERE id=? AND state='approved' AND inventory_released=1",id).run();await clear(e,id,'inventory');}
 catch{await sql(e,'UPDATE orders SET fulfillment_hold=1 WHERE id=?',id).run();await issue(e,id,'inventory','Pago confirmado después de liberar la reserva. Reponer existencias y actualizar el pago antes de preparar o enviar.');}
}
export async function releaseExpired(e,mp,apply){
 if(e.RESERVATION_RECOVERY_ENABLED!=='true'||!e.MP_ACCESS_TOKEN)return;
 // 24h de margen. Una preferencia vencida no basta: confirmar todos los pagos.
 const rows=await sql(e,"SELECT * FROM orders WHERE inventory_released=0 AND state IN ('awaiting_payment','pending','in_process','rejected','cancelled') AND preference_id IS NOT NULL AND created_at<? ORDER BY ops_checked_at,created_at LIMIT 2",now()-86400).all();
 for(const row of rows.results){try{
  await sql(e,'UPDATE orders SET ops_checked_at=? WHERE id=?',now(),row.id).run();
  if(row.mode!==e.MP_MODE)continue;
  const pref=await mp(e,'GET','/checkout/preferences/'+encodeURIComponent(row.preference_id));
  const expiry=Date.parse(pref.expiration_date_to);
  if(pref.external_reference!==row.id||pref.expires!==true||!Number.isFinite(expiry)||expiry>Date.now()-3600000)continue;
  const found=await mp(e,'GET','/v1/payments/search?'+new URLSearchParams({external_reference:row.id,limit:'100'}));
  if(!Array.isArray(found.results)||!Number.isInteger(found.paging?.total)||found.paging.total>found.results.length)continue;
  if(found.results.some(p=>p.external_reference!==row.id))continue;
  for(const p of found.results)await apply(p,e);
  if(found.results.some(p=>!['rejected','cancelled'].includes(p.status)))continue;
  await sql(e,"UPDATE orders SET inventory_released=1,state='expired' WHERE id=? AND inventory_released=0 AND state IN ('awaiting_payment','rejected','cancelled') AND NOT EXISTS(SELECT 1 FROM payments WHERE order_id=? AND status NOT IN ('rejected','cancelled'))",row.id,row.id).run();await clear(e,row.id,'reservation');
 }catch{await issue(e,row.id,'reservation','No se pudo verificar la reserva con Mercado Pago; se conserva el inventario apartado.');}}
}
export async function queueNotice(e,row,kind,link,labels=[]){
 if(!emailReady(e)||row.mode!=='live'||JSON.parse(row.customer).method==='payment_test')return;
 const customer=JSON.parse(row.customer);
 const text=kind==='payment'?`Hola ${customer.name}. Mercado Pago confirmó tu pedido ${row.id} por $${(row.total_cents/100).toFixed(2)} MXN. Consulta su estado: ${link}\nUna guía generada no significa que el paquete haya sido entregado a la paquetería.`:`Hola ${customer.name}. La guía de tu pedido ${row.id} está lista:\n${labels.map(l=>`${l.carrier}: ${l.tracking}`).join('\n')}\nConsulta tu pedido: ${link}\nEl movimiento del rastreo comienza cuando la paquetería recibe el paquete.`;
 const payload={from:e.EMAIL_FROM,to:[customer.email],subject:kind==='payment'?'ARTBAN · Pago confirmado':'ARTBAN · Tu guía de rastreo',text};
 // Cuerpo persistido e inmutable: reintentos con misma clave y mismo contenido.
 await sql(e,'INSERT OR IGNORE INTO notifications(id,order_id,kind,payload,created_at) VALUES(?,?,?,?,?)',row.id+'-'+kind,row.id,kind,JSON.stringify(payload),now()).run();
}
export async function sendNotices(e){
 if(!emailReady(e))return;
 const pending=await sql(e,"SELECT * FROM notifications WHERE state IN ('queued','retry','sending') AND lease_until<=? ORDER BY created_at LIMIT 2",now()).all();
 for(const n of pending.results){
  // Resend conserva idempotencia 24h; no reintentar respuestas inciertas después de 23h.
  if(n.first_attempt&&now()-n.first_attempt>=82800){await sql(e,"UPDATE notifications SET state='needs_review',last_error='Verificar el envío en Resend antes de volver a enviarlo' WHERE id=? AND state!='sent'",n.id).run();continue;}
  const claim=await sql(e,"UPDATE notifications SET state='sending',attempts=attempts+1,first_attempt=COALESCE(first_attempt,?),lease_until=? WHERE id=? AND state IN ('queued','retry','sending') AND lease_until<=?",now(),now()+120,n.id,now()).run();if(claim.meta.changes!==1)continue;
  try{
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+e.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':n.id},body:n.payload,signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();if(typeof d.id!=='string'||!d.id)throw Error('Respuesta incompleta');
   await sql(e,"UPDATE notifications SET state='sent',provider_id=?,last_error=NULL WHERE id=?",d.id,n.id).run();
  }catch{await sql(e,"UPDATE notifications SET state='retry',lease_until=?,last_error='No se confirmó el envío; reintento con la misma referencia' WHERE id=?",now()+Math.min(3600,60*2**Math.min(n.attempts,6)),n.id).run();}
 }
}
export async function fulfill(e,sign){
 const auto=e.AUTO_LABELS_ENABLED==='true'&&e.MP_MODE==='live'&&e.SKYDROPX_MODE==='live'&&e.LABEL_PURCHASES_ENABLED==='true'&&e.SKYDROPX_LABEL_PURCHASES_ENABLED==='true';
 const rows=await sql(e,`SELECT * FROM orders WHERE state='approved' AND mode='live' AND json_extract(customer,'$.method')!='payment_test' AND inventory_released=0 AND fulfillment_hold=0 AND
 ((?=1 AND NOT EXISTS(SELECT 1 FROM notifications n WHERE n.order_id=orders.id AND n.kind='payment')) OR
 EXISTS(SELECT 1 FROM order_shipping os WHERE os.order_id=orders.id AND ((os.state!='ready' AND ?=1) OR (os.state='ready' AND ?=1 AND NOT EXISTS(SELECT 1 FROM notifications n WHERE n.order_id=orders.id AND n.kind='shipping')))))
 ORDER BY ops_checked_at,created_at LIMIT 2`,emailReady(e)?1:0,auto?1:0,emailReady(e)?1:0).all();
 for(const row of rows.results){
  await sql(e,'UPDATE orders SET ops_checked_at=? WHERE id=?',now(),row.id).run();
  if(row.inventory_released||row.fulfillment_hold)continue;
  const link=e.SITE_URL.replace(/\/$/,'')+'/pago.html?'+new URLSearchParams({order:row.id,token:await sign(e.STATUS_SIGNING_SECRET,row.id)});
  await queueNotice(e,row,'payment',link);
  let status=await publicFulfillment(e,row.id);
  if(status.shipping.state!=='not_required'&&status.shipping.state!=='ready'&&e.AUTO_LABELS_ENABLED==='true'&&e.MP_MODE==='live'&&e.SKYDROPX_MODE==='live'&&e.LABEL_PURCHASES_ENABLED==='true'&&e.SKYDROPX_LABEL_PURCHASES_ENABLED==='true'){
   try{
    const rate=await labelRate(row.id,e);
    if(rate.state!=='ready'){
     if(status.shipping.state!=='not_started')throw Error('La guía necesita revisión; no repetir la compra.');
     const max=Math.round(Number(e.MAX_LABEL_COST_MXN)*100);
     if(!(max>0)||rate.total_cents>max||rate.total_cents>row.shipping_cents)throw Error('La tarifa excede el límite autorizado o el envío pagado.');
     await purchaseLabel(row.id,rate.total_cents,e);
    }
    await clear(e,row.id,'shipping');status=await publicFulfillment(e,row.id);
   }catch(err){await issue(e,row.id,'shipping',err.message||'Revisar guía en Skydropx.');}
  }
  if(status.shipping.state==='ready')await queueNotice(e,row,'shipping',link,status.shipping.labels);
 }
}
export async function runOperations(e,{mp,apply,sign}){
 await releaseExpired(e,mp,apply);await fulfill(e,sign);await sendNotices(e);
}
