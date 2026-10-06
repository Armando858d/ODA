import {APIError} from './errors.mjs';
import {address,origin,packagesFor,envia,enviaToken} from './shipping.mjs';
import CATALOG from './catalog.mjs';
const sql=(e,s,...a)=>e.DB.prepare(s).bind(...a);
export async function authenticate(request,e){
 if(!e.ADMIN_TOKEN||e.ADMIN_TOKEN.length<32)throw new APIError(503,'El acceso privado necesita ADMIN_TOKEN de al menos 32 caracteres.');
 const actual=request.headers.get('Authorization')||'';
 const hash=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const [a,b]=await Promise.all([hash(actual),hash('Bearer '+e.ADMIN_TOKEN)]);let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];
 if(d)throw new APIError(401,'La clave del panel no es correcta.');
}
export async function admin(path,method,body,e,mp){
 if(path==='/api/admin/shipping-diagnostic'&&method==='POST'){
  if(!/^4RT-[a-f0-9]{32}$/.test(body?.order_id||''))throw new APIError(400,'Invalid order');
  const row=await sql(e,'SELECT o.created_at,o.mode,s.state,s.updated_at,s.label_data FROM orders o JOIN order_shipping s ON s.order_id=o.id WHERE o.id=?',body.order_id).first();if(!row)throw new APIError(404,'Missing order');
  if(row.mode!==e.ENVIA_MODE)throw new APIError(409,'Mode mismatch');
  const date=new Date(row.created_at*1000),month=String(date.getUTCMonth()+1).padStart(2,'0');
  const r=await fetch((e.ENVIA_MODE==='test'?'https://queries.test.envia.com':'https://queries.envia.com')+'/guide/'+month+'/'+date.getUTCFullYear(),{headers:{Authorization:'Bearer '+enviaToken(e.ENVIA_TOKEN)},signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw new APIError(502,'Envia query HTTP '+r.status);const d=await r.json();
  return {state:row.state,updated_at:row.updated_at,response_keys:Object.keys(d),shipments:Array.isArray(d.data)?d.data.map(x=>({keys:Object.keys(x),id:x.id,shipment_id:x.shipment_id,tracking_number:x.tracking_number,carrier:x.carrier,order_reference:x.order_reference,label:x.label,label_url:x.label_url,total_price:x.total_price,created_at:x.created_at})):[]};
 }

 if(path==='/api/admin/payment-diagnostic'&&method==='POST'){
  if(!/^4RT-[a-f0-9]{32}$/.test(body?.order_id||''))throw new APIError(400,'Referencia no válida.');
  const order=await sql(e,'SELECT id,total_cents,shipping_cents,mode FROM orders WHERE id=?',body.order_id).first();
  if(!order)throw new APIError(404,'Pedido no encontrado.');
  const data=await mp(e,'GET','/v1/payments/search?'+new URLSearchParams({external_reference:order.id,sort:'date_created',criteria:'desc',limit:'30'}));
  const account=await mp(e,'GET','/users/me');return {account_is_test:Array.isArray(account.tags)&&account.tags.includes('test_user'),account_matches:String(account.id)===e.MP_COLLECTOR_ID,order,payments:(data.results||[]).filter(p=>p.external_reference===order.id).map(p=>({id:p.id,status:p.status,transaction_amount:p.transaction_amount,shipping_amount:p.shipping_amount,total_paid_amount:p.transaction_details?.total_paid_amount,currency:p.currency_id,collector_matches:String(p.collector_id)===e.MP_COLLECTOR_ID,live_mode:p.live_mode}))};
 }
 if(path==='/api/admin/status'&&method==='GET'){
  const inventory=await sql(e,'SELECT i.*,p.weight,p.length,p.width,p.height FROM inventory i LEFT JOIN package_profiles p ON p.product_id=i.product_id AND p.variant=i.variant').all();
  const origin=await sql(e,"SELECT value FROM store_settings WHERE key='origin'").first();
  return {mode:e.MP_MODE,payments_enabled:e.PAYMENTS_ENABLED==='true',envia_connected:!!e.ENVIA_TOKEN,origin:origin?JSON.parse(origin.value):null,inventory:inventory.results.map(i=>{const p=CATALOG.find(p=>p.id===i.product_id);return {...i,title:(p?.name||i.product_id)+' / '+(p?.variants[i.variant]?.name||i.variant)}})};
 }
 if(path==='/api/admin/envia-test'&&method==='POST'){
  if(e.ENVIA_MODE!=='test')throw new APIError(409,'Esta comprobaci?n es solo para sandbox.');
  const from=await origin(e);const packages=await packagesFor([{id:'corazon-007',variant:0,quantity:1,title:'Coraz?n anat?mico',price_cents:55000}],e);
  const data=await envia(e,'/ship/rate/',{origin:from,destination:from,packages,shipment:{type:1,carrier:'fedex'},settings:{currency:'MXN',printFormat:'PDF',printSize:'PAPER_4X6'}});
  return {connected:true,services:data.length,note:'Consulta de prueba con origen y destino en el estudio; no se compr? ninguna gu?a.'};
 }
 if(path==='/api/admin/orders'&&method==='GET'){
  const r=await sql(e,'SELECT id,state,total_cents,shipping_cents,created_at,mode,items,customer FROM orders ORDER BY created_at DESC LIMIT 50').all();return {orders:r.results.map(o=>({...o,items:JSON.parse(o.items),customer:JSON.parse(o.customer)}))};
 }
 if(path==='/api/admin/mercadopago'&&method==='POST'){
  const user=await mp(e,'GET','/users/me');return {valid:true,collector_matches:String(user.id)===e.MP_COLLECTOR_ID,mode:e.MP_MODE,message:'Credencial consultada. Todavía hace falta completar una compra de prueba y verificar su notificación.'};
 }
 if(path==='/api/admin/origin'&&method==='POST'){
  const a=address(body);await sql(e,"INSERT INTO store_settings(key,value) VALUES('origin',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",JSON.stringify(a)).run();return {saved:true};
 }
 if(path==='/api/admin/inventory'&&method==='POST'){
  const p=CATALOG.find(p=>p.id===body?.product_id);
  if(!p?.variants[body?.variant]||!Number.isInteger(body.variant)||!Number.isInteger(body.stock)||body.stock<0||body.stock>10000||!Number.isInteger(body.previous_stock))throw new APIError(400,'Revisa el producto y las unidades disponibles.');
  for(const k of ['weight','length','width','height'])if(typeof body[k]!=='number'||!Number.isFinite(body[k])||body[k]<=0||body[k]>(k==='weight'?100:300))throw new APIError(400,'Indica el peso en kg y las medidas en cm del paquete cerrado.');
  // Compare the stock shown in the panel so a sale made meanwhile cannot be overwritten.
  const r=await e.DB.batch([
   sql(e,'UPDATE inventory SET stock=? WHERE product_id=? AND variant=? AND stock=?',body.stock,body.product_id,body.variant,body.previous_stock),
   sql(e,'INSERT INTO package_profiles(product_id,variant,weight,length,width,height) SELECT ?,?,?,?,?,? WHERE changes()=1 ON CONFLICT(product_id,variant) DO UPDATE SET weight=excluded.weight,length=excluded.length,width=excluded.width,height=excluded.height',body.product_id,body.variant,body.weight,body.length,body.width,body.height)
  ]);
  if(r[0].meta.changes!==1)throw new APIError(409,'Las existencias cambiaron. Recarga el panel antes de guardar.');return {saved:true};
 }
 throw new APIError(404,'Ruta no encontrada.');
}
