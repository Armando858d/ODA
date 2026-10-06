import {APIError} from './errors.mjs';
import {address,origin,packagesFor,envia} from './shipping.mjs';
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
