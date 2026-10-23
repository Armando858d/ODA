import {APIError} from './errors.mjs';
const stmt=(e,s,...a)=>e.DB.prepare(s).bind(...a);
const defaults={mercadolibre:'',amazon:'',tiktok:'https://www.tiktok.com/@artb4nn'};
export async function marketplaces(e){const r=await stmt(e,"SELECT value FROM store_settings WHERE key='marketplaces'").first();return r?JSON.parse(r.value):defaults;}
export async function saveMarketplaces(b,e){
 const hosts={mercadolibre:['mercadolibre.com.mx','mercadolibre.com','meli.la'],amazon:['amazon.com.mx','amazon.com','amzn.to'],tiktok:['tiktok.com']};const result={};
 for(const key of Object.keys(hosts)){const value=String(b?.[key]||'').trim();if(!value){result[key]='';continue;}let u;try{u=new URL(value)}catch{}if(!u||u.protocol!=='https:'||u.username||u.password||!hosts[key].some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))throw new APIError(400,'Revisa el enlace de '+key+'. Debe ser HTTPS de esa plataforma.');result[key]=u.href;}
 await stmt(e,"INSERT INTO store_settings(key,value) VALUES('marketplaces',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",JSON.stringify(result)).run();return {saved:true};
}
export async function createRequest(b,key,e){
 if(!/^[a-f0-9-]{36}$/.test(key||''))throw new APIError(400,'Falta la referencia de la solicitud.');
 const v={};for(const [k,max,required] of [['name',100,true],['email',180,true],['phone',20,false],['piece',150,true],['size',60,true],['details',1500,true]]){if(typeof b?.[k]!=='string'||b[k].trim().length>max||(required&&!b[k].trim()))throw new APIError(400,'Revisa el campo '+k+'.');v[k]=b[k].trim();}
 if(!/^\S+@\S+\.\S+$/.test(v.email)||!Number.isInteger(b.quantity)||b.quantity<1||b.quantity>10000||b.website)throw new APIError(400,'Revisa los datos de contacto y cantidad.');v.quantity=b.quantity;
 const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(v))))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const id='COT-'+crypto.randomUUID();await stmt(e,'INSERT INTO custom_requests(id,request_key,fingerprint,name,email,phone,piece,quantity,size,details,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING',id,key,fingerprint,v.name,v.email,v.phone,v.piece,v.quantity,v.size,v.details,Math.floor(Date.now()/1000)).run();
 const row=await stmt(e,'SELECT id,fingerprint FROM custom_requests WHERE request_key=?',key).first();if(row.fingerprint!==fingerprint)throw new APIError(409,'Esta referencia ya corresponde a otra solicitud.');return {id:row.id,received:true};
}
export async function requestAdmin(path,method,b,e){
 if(path==='/api/admin/marketplaces'){if(method==='GET')return marketplaces(e);if(method==='POST')return saveMarketplaces(b,e);}
 if(path==='/api/admin/requests'&&method==='GET')return {requests:(await stmt(e,'SELECT * FROM custom_requests ORDER BY created_at DESC LIMIT 100').all()).results.map(({request_key,fingerprint,...r})=>r)};
 if(path==='/api/admin/requests'&&method==='POST'){
  if(!['new','reviewing','quoted','closed'].includes(b?.status)||typeof b.id!=='string'||typeof b.internal_notes!=='string'||b.internal_notes.length>2000||(b.quote_cents!==null&&(!Number.isSafeInteger(b.quote_cents)||b.quote_cents<0||b.quote_cents>100000000)))throw new APIError(400,'Revisa el estado, importe y notas.');
  const r=await stmt(e,'UPDATE custom_requests SET status=?,quote_cents=?,internal_notes=? WHERE id=?',b.status,b.quote_cents,b.internal_notes,b.id).run();if(!r.meta.changes)throw new APIError(404,'Solicitud no encontrada.');return {saved:true};
 }
 throw new APIError(404,'Ruta no encontrada.');
}
