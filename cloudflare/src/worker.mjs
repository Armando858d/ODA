import CATALOG from './catalog.mjs';

import {APIError} from './errors.mjs';
export {APIError} from './errors.mjs';
import {authenticate,admin} from './admin.mjs';
import {shippingConfigured,rates,resolveQuote,labelRate,purchaseLabel} from './shipping.mjs';
const fail = (status, message) => { throw new APIError(status, message); };
const encoder = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
const now = () => Math.floor(Date.now()/1000);
export const digest = async value => hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
export async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));
}
function equal(a,b) {
  if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;
}
const stmt=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const one=(env,sql,...args)=>stmt(env,sql,...args).first();
export function config(env) {
  const rates=Object.fromEntries(['local','centro','nacional'].map(k=>[k,Number(env['SHIPPING_'+k.toUpperCase()]??({local:50,centro:150,nacional:220}[k]))]));
  const validRates=Object.values(rates).every(n=>Number.isSafeInteger(n)&&n>=0&&n<=100000);
  let urls=false;try{urls=new URL(env.SITE_URL).protocol==='https:'&&new URL(env.API_URL).protocol==='https:'}catch{}
  const shipping=shippingConfigured(env)||env.SHIPPING_RATES_CONFIRMED==='true',pickup=env.PICKUP_CONFIRMED==='true';
  return {enabled:!!(env.DB&&env.PAYMENTS_ENABLED==='true'&&env.MP_ACCESS_TOKEN&&env.MP_WEBHOOK_SECRET&&env.STATUS_SIGNING_SECRET?.length>=32&&/^\d+$/.test(env.MP_COLLECTOR_ID||'')&&['test','live'].includes(env.MP_MODE)&&urls&&validRates&&(shipping||pickup)),
    mode:env.MP_MODE||'test',max_installments:Math.max(1,Math.min(12,parseInt(env.MP_MAX_INSTALLMENTS,10)||12)),shipping_provider:shippingConfigured(env)?'envia':'manual',shipping_enabled:shipping,pickup_enabled:pickup,shipping_rates:rates};
}
function field(obj,key,max,required=true) {
  const value=obj[key]??'';if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))fail(400,'Revisa el campo '+key+'.');return value.trim();
}
export function validate(body,env) {
  if(!body||!Array.isArray(body.items)||body.items.length<1||body.items.length>14||!body.customer||typeof body.customer!=='object')fail(400,'El carrito o los datos de entrega no son válidos.');
  const cfg=config(env),c={};for(const [key,max] of [['name',100],['email',180],['method',20]])c[key]=field(body.customer,key,max);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))fail(400,'Revisa tu correo electrónico.');
  c.notes=field(body.customer,'notes',500,false);let shipping=0;
  if(c.method==='shipping'&&cfg.shipping_enabled){
    for(const [key,max] of [['zip',5],['state',60],['city',80],['colony',100],['street',150]])c[key]=field(body.customer,key,max);
    if(!/^\d{5}$/.test(c.zip)||Number(c.zip)<1000)fail(400,'Revisa tu código postal.');
    if(shippingConfigured(env)){for(const [key,max] of [['phone',20],['number',20],['state_code',3]])c[key]=field(body.customer,key,max);}
    const zip=Number(c.zip),zone=zip>=20000&&zip<=20999?'local':zip>=10000&&zip<=50000?'centro':'nacional';shipping=shippingConfigured(env)?0:cfg.shipping_rates[zone]*100;
  }else if(!(c.method==='pickup'&&cfg.pickup_enabled))fail(409,'La modalidad de entrega no está habilitada.');
  const seen=new Set();const items=body.items.map(i=>{
    if(!i||typeof i.id!=='string'||!Number.isInteger(i.variant)||!Number.isInteger(i.quantity))fail(400,'Producto o cantidad no válidos.');
    const p=CATALOG.find(p=>p.id===i.id),v=p?.variants[i.variant],key=i.id+':'+i.variant;
    if(!v||i.quantity<1||i.quantity>20||seen.has(key))fail(400,'Revisa las cantidades y los acabados.');seen.add(key);
    return {id:i.id,variant:i.variant,quantity:i.quantity,title:p.name+' / '+v.name,price_cents:Math.round((p.price+v.mod)*100)};
  }).sort((a,b)=>a.id.localeCompare(b.id)||a.variant-b.variant);
  return {items,customer:c,shipping,total:items.reduce((s,i)=>s+i.quantity*i.price_cents,shipping)};
}
async function mp(env,method,path,payload) {
  try{
    const response=await fetch('https://api.mercadopago.com'+path,{method,headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN,'Content-Type':'application/json'},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(18000)});
    if(!response.ok)fail(502,'Mercado Pago no pudo completar la operación.');return await response.json();
  }catch(e){if(e instanceof APIError)throw e;fail(503,'Mercado Pago no respondió. Consulta al estudio antes de repetir el pedido.');}
}
async function checkoutResult(row,env){return {order_id:row.id,status_token:await hmac(env.STATUS_SIGNING_SECRET,row.id),checkout_url:row.checkout_url,total:row.total_cents/100};}
async function existing(row,fingerprint,env){
  if(row.fingerprint!==fingerprint)fail(409,'Esta referencia pertenece a otra selección.');
  if(row.checkout_url&&['awaiting_payment','pending','in_process'].includes(row.state)&&now()-row.created_at<1800)return checkoutResult(row,env);
  fail(409,'El intento ya está registrado. Consulta al estudio con referencia '+row.id+'.');
}
export async function checkout(body,key,env) {
  if(!config(env).enabled)fail(503,'El pago en línea está en activación.');
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(key||''))fail(400,'Falta una referencia válida del intento.');
  let {items,customer,shipping,total}=validate(body,env);
  const dynamic=customer.method==='shipping'&&shippingConfigured(env);
  const fingerprint=await digest(JSON.stringify([items,customer,dynamic?body.shipping_quote_id:shipping]));
  const old=await one(env,'SELECT * FROM orders WHERE request_key=?',key);if(old)return existing(old,fingerprint,env);
  const quote=dynamic?await resolveQuote(body.shipping_quote_id,items,customer,env):null;
  if(quote){shipping=quote.total_cents;total+=shipping;}
  const id='4RT-'+crypto.randomUUID().replaceAll('-','');
  try{
    await env.DB.batch([
      stmt(env,'INSERT INTO orders(id,request_key,fingerprint,items,customer,total_cents,shipping_cents,state,created_at,mode) VALUES(?,?,?,?,?,?,?,?,?,?)',id,key,fingerprint,JSON.stringify(items),JSON.stringify(customer),total,shipping,'creating',now(),env.MP_MODE),
      ...items.map(i=>stmt(env,'INSERT INTO order_items(order_id,product_id,variant,quantity) VALUES(?,?,?,?)',id,i.id,i.variant,i.quantity)),
      ...(quote?[stmt(env,'INSERT INTO order_shipping(order_id,quote_id) VALUES(?,?)',id,quote.id)]:[])
    ]);
  }catch(e){
    const concurrent=await one(env,'SELECT * FROM orders WHERE request_key=?',key);if(concurrent)return existing(concurrent,fingerprint,env);
    if(String(e.message).includes('insufficient_stock'))fail(409,'No hay suficientes unidades. Consulta disponibilidad con el estudio.');throw e;
  }
  const token=await hmac(env.STATUS_SIGNING_SECRET,id),callback=env.SITE_URL.replace(/\/$/,'')+'/pago.html?'+new URLSearchParams({order:id,token});
  try{
    const response=await mp(env,'POST','/checkout/preferences',{
      items:items.map(i=>({id:i.id,title:i.title,quantity:i.quantity,unit_price:i.price_cents/100,currency_id:'MXN'})),
      payer:{email:customer.email,name:customer.name},external_reference:id,
      back_urls:{success:callback,pending:callback,failure:callback},auto_return:'approved',
      notification_url:env.API_URL.replace(/\/$/,'')+'/api/webhooks/mercadopago',
      payment_methods:{installments:config(env).max_installments},expires:true,
      expiration_date_to:new Date(Date.now()+1800000).toISOString(),shipments:{cost:shipping/100,mode:'not_specified'},statement_descriptor:'4RTB4N STUDIO'
    });
    const target=env.MP_MODE==='test'?response.sandbox_init_point:response.init_point;let valid=false;
    try{const u=new URL(target);valid=u.protocol==='https:'&&['www.mercadopago.com.mx','sandbox.mercadopago.com.mx'].includes(u.hostname)&&!u.username&&!u.password}catch{}
    if(!valid||!response.id)fail(502,'No se recibió un enlace válido.');
    // A webhook may have already confirmed the payment. Do not overwrite its state.
    await stmt(env,"UPDATE orders SET preference_id=?,checkout_url=?,state=CASE WHEN state='creating' THEN 'awaiting_payment' ELSE state END WHERE id=?",String(response.id),target,id).run();
    return checkoutResult(await one(env,'SELECT * FROM orders WHERE id=?',id),env);
  }catch{
    await stmt(env,"UPDATE orders SET state='needs_review' WHERE id=? AND state='creating'",id).run();
    fail(503,'No se pudo confirmar el enlace. No repitas el pedido; consulta al estudio con referencia '+id+'.');
  }
}
export async function signatureValid(signature,requestId,dataId,env) {
  try{
    const parts=Object.fromEntries(signature.split(',').map(s=>s.trim().split('='))),ts=Number(parts.ts),seconds=ts>1e12?ts/1000:ts;
    if(!env.MP_WEBHOOK_SECRET||!requestId||!dataId||!Number.isFinite(seconds)||Math.abs(Date.now()/1000-seconds)>600)return false;
    return equal(await hmac(env.MP_WEBHOOK_SECRET,`id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`),parts.v1);
  }catch{return false;}
}
export async function applyPayment(p,env) {
  if(typeof p.external_reference!=='string')return;
  const row=await one(env,'SELECT * FROM orders WHERE id=?',p.external_reference);if(!row)return;
  const cents=Number(p.transaction_amount)*100;
  if(p.currency_id!=='MXN'||!Number.isFinite(cents)||Math.abs(cents-row.total_cents)>0.000001||String(p.collector_id)!==env.MP_COLLECTOR_ID||p.live_mode!==(row.mode==='live'))fail(409,'El pago no coincide con el pedido.');
  const id=String(p.id),statuses=['approved','pending','in_process','rejected','cancelled','refunded','charged_back'],updated=Date.parse(p.date_last_updated);
  if(!/^\d+$/.test(id)||!statuses.includes(p.status)||!Number.isFinite(updated))fail(502,'Respuesta de pago no válida.');
  await env.DB.batch([
    stmt(env,`INSERT INTO payments(id,order_id,status,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at WHERE payments.order_id=excluded.order_id AND payments.updated_at<excluded.updated_at`,id,row.id,p.status,updated),
    stmt(env,`UPDATE orders SET state=COALESCE((SELECT status FROM payments WHERE order_id=? ORDER BY CASE status WHEN 'approved' THEN 1 WHEN 'charged_back' THEN 2 WHEN 'refunded' THEN 3 WHEN 'in_process' THEN 4 WHEN 'pending' THEN 5 WHEN 'rejected' THEN 6 ELSE 7 END LIMIT 1),state) WHERE id=?`,row.id,row.id)
  ]);
}
export async function orderStatus(id,token,env) {
  if(!env.STATUS_SIGNING_SECRET||!equal(await hmac(env.STATUS_SIGNING_SECRET,id),token))fail(404,'No se encontró ese pedido.');
  let row=await one(env,'SELECT * FROM orders WHERE id=?',id);if(!row)fail(404,'No se encontró ese pedido.');
  if(env.MP_ACCESS_TOKEN){
    const claim=await stmt(env,'UPDATE orders SET checked_at=? WHERE id=? AND checked_at<=?',now(),id,now()-15).run();
    if(claim.meta.changes){
      const result=await mp(env,'GET','/v1/payments/search?'+new URLSearchParams({external_reference:id,sort:'date_created',criteria:'desc',limit:'30'}));
      for(const p of result.results||[])if(p.external_reference===id)await applyPayment(p,env);
    }
  }
  row=await one(env,'SELECT * FROM orders WHERE id=?',id);return {order_id:id,status:row.state,total:row.total_cents/100,mode:row.mode};
}
async function readBody(request) {
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))fail(400,'Se requiere JSON.');
  if(Number(request.headers.get('content-length'))>16000)fail(413,'Solicitud demasiado grande.');
  const reader=request.body?.getReader();if(!reader)fail(400,'Solicitud vacía.');let length=0,chunks=[];
  while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>16000){await reader.cancel();fail(413,'Solicitud demasiado grande.');}chunks.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes))}catch{fail(400,'JSON no válido.');}
}
// Isolate-local guard. Configure account-level protection for larger traffic volumes.
const limits=new Map();
function limit(request,path){
  const ip=request.headers.get('CF-Connecting-IP')||'local',key=ip+':'+(path.includes('/orders/')?'orders':path),minute=Math.floor(Date.now()/60000);
  if(limits.size>5000)limits.clear();let item=limits.get(key);if(!item||item.minute!==minute)item={minute,hits:0};item.hits++;limits.set(key,item);
  if(item.hits>(['/api/checkout','/api/shipping/quotes'].includes(path)?15:120))fail(429,'Demasiadas solicitudes. Intenta en un minuto.');
}
export default {
  async fetch(request,env){
    const u=new URL(request.url),path=u.pathname,origin=request.headers.get('Origin')||'';let siteOrigin='';try{siteOrigin=new URL(env.SITE_URL).origin}catch{}
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Origin'};
    if(origin&&origin===siteOrigin)Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Content-Type, Idempotency-Key, Authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS'});
    try{
      let result;
      if(request.method==='OPTIONS'){if(!siteOrigin||origin!==siteOrigin)fail(403,'Origen no permitido.');return new Response(null,{status:204,headers});}
      if(path==='/api/config'&&request.method==='GET')result=config(env);
      else if(path==='/api/health'&&request.method==='GET'){if(!env.DB)fail(503,'Base de datos pendiente.');await one(env,'SELECT id FROM orders LIMIT 1');result={ok:true,payments_enabled:config(env).enabled};}
      else if(path.startsWith('/api/')){
        limit(request,path);
        if(path.startsWith('/api/admin/')){
          if(!siteOrigin||origin!==siteOrigin)fail(403,'Origen no permitido.');
          await authenticate(request,env);
          const body=request.method==='POST'?await readBody(request):null;
          const match=path.match(/^\/api\/admin\/orders\/(4RT-[a-f0-9]{32})\/(rate|label|payment)$/);
          if(match&&request.method==='POST'){
            const payment=await orderStatus(match[1],await hmac(env.STATUS_SIGNING_SECRET,match[1]),env);
            result=match[2]==='payment'?payment:match[2]==='rate'?await labelRate(match[1],env):await purchaseLabel(match[1],body.expected_cents,env);
          }else if(path==='/api/admin/test-checkout'&&request.method==='POST'){
            if(env.MP_MODE!=='test'||env.ENVIA_MODE!=='test')fail(409,'Disponible solo en modo de prueba.');
            result=await checkout(body,request.headers.get('Idempotency-Key'),{...env,PAYMENTS_ENABLED:'true',PICKUP_CONFIRMED:'true'});
          }else result=await admin(path,request.method,body,env,mp);
        }else if(path==='/api/shipping/quotes'&&request.method==='POST'){
          if(!siteOrigin||origin!==siteOrigin)fail(403,'Origen no permitido.');
          const v=validate(await readBody(request),env);if(v.customer.method!=='shipping')fail(400,'Selecciona env?o a domicilio.');
          for(const i of v.items){const stock=await one(env,'SELECT stock FROM inventory WHERE product_id=? AND variant=?',i.id,i.variant);if(!stock||stock.stock<i.quantity)fail(409,'No hay suficientes unidades de '+i.title+'.');}
          result=await rates(v.items,v.customer,env);
        }else if(path==='/api/checkout'&&request.method==='POST'){
          if(!siteOrigin||origin!==siteOrigin)fail(403,'Origen no permitido.');result=await checkout(await readBody(request),request.headers.get('Idempotency-Key'),env);
        }else if(path==='/api/webhooks/mercadopago'&&request.method==='POST'){
          const id=u.searchParams.get('data.id')||'';
          if(!await signatureValid(request.headers.get('x-signature')||'',request.headers.get('x-request-id'),id,env))fail(401,'Firma no válida.');
          const body=await readBody(request);
          if(body?.type==='payment'&&/^\d+$/.test(id)){
            if(String(body.data?.id)!==id)fail(400,'Referencia no válida.');
            const p=await mp(env,'GET','/v1/payments/'+id);if(String(p.id)!==id)fail(400,'Referencia no válida.');await applyPayment(p,env);
          }result={received:true};
        }else if(/^\/api\/orders\/4RT-[a-f0-9]{32}$/.test(path)&&request.method==='GET')result=await orderStatus(path.split('/').pop(),u.searchParams.get('token')||'',env);
        else fail(404,'Ruta no encontrada.');
      }else fail(404,'Ruta no encontrada.');
      return new Response(JSON.stringify(result),{status:200,headers});
    }catch(e){return new Response(JSON.stringify({error:e instanceof APIError?e.message:'No se pudo completar la operación. Contacta al estudio.'}),{status:e instanceof APIError?e.status:500,headers});}
  }
};
