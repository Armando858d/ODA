import {APIError} from './errors.mjs';
export const shopFields=['businessName','contactEmail','contactPhone','businessAddress','production','shipping','changes','cancellations','damages','privacy'];
export async function getShop(e){
 const row=await e.DB.prepare("SELECT value FROM store_settings WHERE key='shop'").bind().first();
 const data=row?JSON.parse(row.value):{};
 return {configured:shopFields.every(k=>typeof data[k]==='string'&&data[k].trim().length>0),...Object.fromEntries(shopFields.map(k=>[k,data[k]||'']))};
}
export async function saveShop(e,body){
 const data={};for(const k of shopFields){if(typeof body?.[k]!=='string'||!body[k].trim()||body[k].length>(k==='privacy'?12000:4000)||/[<>]/.test(body[k]))throw new APIError(400,'Completa todos los datos comerciales con texto, sin HTML.');data[k]=body[k].trim();}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail))throw new APIError(400,'Revisa el correo de atención.');
 await e.DB.prepare("INSERT INTO store_settings(key,value) VALUES('shop',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(data)).run();return {saved:true};
}
