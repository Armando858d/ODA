import {APIError} from './errors.mjs';
import STATES from './shipping-states.mjs';
const fail=(s,m)=>{throw new APIError(s,m)};
// This account is production. No sandbox hostname or credential is inferred.
export const skyConfigured=e=>!!(e.SKYDROPX_CLIENT_ID&&e.SKYDROPX_CLIENT_SECRET&&e.SKYDROPX_MODE==='live');
const host='https://api-pro.skydropx.com';
let authCache=null;
async function token(e){
 if(!skyConfigured(e))fail(503,'Skydropx necesita las dos claves y SKYDROPX_MODE=live.');
 const key=e.SKYDROPX_CLIENT_ID+'\0'+e.SKYDROPX_CLIENT_SECRET;
 if(authCache?.key===key&&authCache.until>Date.now())return authCache.token;
 const r=await fetch(host+'/api/v1/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:e.SKYDROPX_CLIENT_ID,client_secret:e.SKYDROPX_CLIENT_SECRET}),signal:AbortSignal.timeout(7000)});
 if(!r.ok)fail(502,'Skydropx no aceptó las credenciales de producción (HTTP '+r.status+').');
 const d=await r.json();if(typeof d.access_token!=='string'||!d.access_token||!Number.isFinite(Number(d.expires_in))||Number(d.expires_in)<=60)fail(502,'Skydropx devolvió una autorización incompleta.');
 authCache={key,token:d.access_token,until:Date.now()+(Math.min(Number(d.expires_in),7200)-60)*1000};return d.access_token;
}
export async function sky(e,path,body,capture){
 try{const access=await token(e);const r=await fetch(host+'/api/v1/'+path,{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(7000)});let d;try{d=await r.json()}catch{fail(502,'Skydropx devolvió una respuesta no válida.')}if(capture)await capture(d);if(r.status===401)authCache=null;if(!r.ok)fail(502,'Skydropx HTTP '+r.status+'. Revisa la conexión o la solicitud en tu cuenta.');return d;
 }catch(err){if(err instanceof APIError)throw err;fail(503,'Skydropx no respondió a tiempo. No se repite automáticamente una compra de guía.');}
}
export async function skyCheck(e){await token(e);return {connected:true,mode:'live',note:'Autorización aceptada. No se compró ninguna guía; falta comprobar una cotización.'};}
const address=a=>({country_code:'MX',postal_code:a.postalCode,area_level1:STATES.find(s=>s.code===a.state)?.name||a.state,area_level2:a.city,area_level3:a.district});
export function skyRate(r){
 const cents=Math.round(Number(r.total)*100);
 if(r.success!==true||!['approved','coverage_checked','price_found_internal','price_found_external'].includes(r.status)||r.currency_code!=='MXN'||!Number.isSafeInteger(cents)||cents<=0||cents>10000000||!r.id||!r.provider_name||!r.provider_service_code||r.requires_origin_verification||!['single','multipackage'].includes(r.shipment_creation_type))return null;
 return {rate_id:String(r.id),carrier:String(r.provider_name),service:String(r.provider_service_code),description:String(r.provider_display_name||r.provider_name)+' · '+String(r.provider_service_name||r.provider_service_code),total_cents:cents,estimate:Number.isInteger(r.days)&&r.days>0?r.days+' días estimados':'Consultar plazo',drop_off:r.pickup!==true};
}
export async function skyOffers(from,to,packages,e){
 const quotation={address_from:address(from),address_to:address(to),parcels:packages.map(p=>({length:Math.ceil(p.dimensions.length),width:Math.ceil(p.dimensions.width),height:Math.ceil(p.dimensions.height),weight:p.weight,package_protected:false,declared_value:p.declaredValue}))};
 const initial=await sky(e,'quotations',{quotation});const id=initial.id||initial.quotation_id;if(typeof id!=='string'||!/^[-a-zA-Z0-9]+$/.test(id))fail(502,'Falta la referencia de cotización de Skydropx.');
 let result=initial;const deadline=Date.now()+10000;
 for(let n=0;n<5&&result.is_completed!==true&&Date.now()<deadline;n++){await new Promise(r=>setTimeout(r,650));result=await sky(e,'quotations/'+encodeURIComponent(id));}
 if(result.is_completed!==true)fail(503,'Skydropx sigue calculando sus tarifas. Vuelve a cotizar en unos momentos.');
 if(!Array.isArray(result.rates))fail(502,'Skydropx no devolvió una lista de tarifas.');
 const seen=new Set();return result.rates.map(skyRate).filter(r=>r&&!seen.has(r.rate_id)&&seen.add(r.rate_id)).map(r=>({...r,payload:{provider:'skydropx',quotation_id:id,rate_id:r.rate_id,origin:from,destination:to,packages,quotation}}));
}
export async function skyRefresh(payload,e){const d=await sky(e,'quotations/'+encodeURIComponent(payload.quotation_id));if(d.is_completed!==true)fail(409,'La tarifa de Skydropx no está confirmada.');const r=(d.rates||[]).map(skyRate).find(r=>r?.rate_id===payload.rate_id);if(!r)fail(409,'La tarifa de Skydropx venció o ya no está disponible.');return r;}
export function skyShipment(payload,items,e){
 let codes;try{codes=JSON.parse(e.SKYDROPX_PACKAGE_CODES||'{}')}catch{fail(409,'Revisa SKYDROPX_PACKAGE_CODES.');}
 const packages=[];for(const item of items){const c=codes[item.id];if(!c||!/^\d{8}$/.test(c.consignment_note)||!c.package_type||!/^[A-Za-z0-9]{1,8}$/.test(c.package_type))fail(409,'Configura Carta Porte y tipo de empaque para '+item.title+' antes de comprar la guía.');for(let i=0;i<item.quantity;i++)packages.push({package_number:String(packages.length+1),package_protected:false,declared_value:item.price_cents/100,consignment_note:c.consignment_note,package_type:c.package_type});}
 const full=a=>({...address(a),street1:a.street+' '+a.number,name:a.name.slice(0,30),company:a.name.slice(0,60),phone:a.phone,email:a.email,reference:(a.reference||'').slice(0,30)});
 return {shipment:{rate_id:payload.rate_id,unique_shipment:true,printing_format:'thermal',address_from:full(payload.origin),address_to:full(payload.destination),packages}};
}
export function skyLabels(d,payload){
 const shipment=d.data,a=shipment?.attributes;const total=Number(a?.total);
 if(!shipment?.id||!a||a.payment_status!=='paid'||!Number.isFinite(total)||total<=0)return null;
 const ids=shipment.relationships?.packages?.data?.map(p=>String(p.id))||[];
 if(ids.length!==payload.packages.length)return null;
 const labels=ids.map(id=>{const p=(d.included||[]).find(x=>String(x.id)===id)?.attributes;let u;try{u=new URL(p.label_url)}catch{return null}if(u.protocol!=='https:'||u.username||u.password||!p.tracking_number)return null;return {shipment_id:String(shipment.id),tracking:String(p.tracking_number),label_url:u.href,carrier:String(a.carrier_name||''),service:'Skydropx'};});
 if(labels.some(x=>!x))return null;return {labels,total_cents:Math.round(total*100)};
}
