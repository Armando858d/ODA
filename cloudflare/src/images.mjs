import {APIError} from './errors.mjs';
export async function saveImage(env,data){
 if(typeof data!=='string'||data.length>190000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(data))throw new APIError(400,'Usa una foto JPG, PNG o WebP optimizada.');
 let bytes;try{bytes=Uint8Array.from(atob(data.split(',')[1]),c=>c.charCodeAt(0));}catch{throw new APIError(400,'Foto no válida.');}
 const type=data.slice(11,data.indexOf(';'));
 const valid=type==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 if(!valid)throw new APIError(400,'El contenido no corresponde a una imagen válida.');
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(data));
 const id=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
 await env.DB.prepare('INSERT OR IGNORE INTO catalog_images(id,data) VALUES(?,?)').bind(id,data).run();
 return {url:env.API_URL.replace(/\/$/,'')+'/api/images/'+id};
}
export async function imageResponse(env,id){
 const row=await env.DB.prepare('SELECT data FROM catalog_images WHERE id=?').bind(id).first();
 if(!row)throw new APIError(404,'Imagen no encontrada.');
 const [prefix,encoded]=row.data.split(',');
 return new Response(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),{headers:{'Content-Type':prefix.slice(5,prefix.indexOf(';')),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
}
export async function externalizeImages(env,body){
 const copy=structuredClone(body);
 for(const item of [...(copy.products||[]),...(copy.collections||[])]){
  if(item.image?.startsWith('data:'))item.image=(await saveImage(env,item.image)).url;
  if(Array.isArray(item.images))for(let i=0;i<item.images.length;i++)if(item.images[i]?.startsWith('data:'))item.images[i]=(await saveImage(env,item.images[i])).url;
 }
 return copy;
}
