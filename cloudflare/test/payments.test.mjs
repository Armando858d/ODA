import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{config,validate,checkout,applyPayment,orderStatus,hmac,signatureValid} from '../src/worker.mjs';

// SQLite runs the actual migration/trigger SQL; this adapter follows D1's atomic batch contract.
class D1 {
 constructor(){this.sql=new DatabaseSync(':memory:');this.sql.exec('PRAGMA foreign_keys=ON');for(const f of ['0001_orders.sql','0002_catalog.sql','0003_shipping.sql'])this.sql.exec(readFileSync(new URL('../migrations/'+f,import.meta.url),'utf8'));}
 prepare(sql){const db=this;return {bind(...args){return {sql,args,async first(){return db.sql.prepare(sql).get(...args)||null},async all(){return {results:db.sql.prepare(sql).all(...args)}},async run(){return {meta:db.sql.prepare(sql).run(...args)}}}}};}
 async batch(statements){this.sql.exec('BEGIN IMMEDIATE');try{const r=statements.map(s=>({meta:this.sql.prepare(s.sql).run(...s.args)}));this.sql.exec('COMMIT');return r}catch(e){this.sql.exec('ROLLBACK');throw e}}
}
function env(){return {DB:new D1(),PAYMENTS_ENABLED:'true',SITE_URL:'https://armando858d.github.io/ODA',API_URL:'https://oda.example.com',MP_ACCESS_TOKEN:'test-only-not-a-real-token',MP_WEBHOOK_SECRET:'test-webhook',STATUS_SIGNING_SECRET:'a'.repeat(48),MP_COLLECTOR_ID:'123',MP_MODE:'test',PICKUP_CONFIRMED:'true',SHIPPING_RATES_CONFIRMED:'true'};}
const body=()=>({items:[{id:'venom-001',variant:0,quantity:1}],customer:{name:'Comprador de prueba',email:'test@example.com',method:'pickup'}});
const stock=(e,id='venom-001',n=3)=>e.DB.sql.prepare('UPDATE inventory SET stock=? WHERE product_id=? AND variant=0').run(n,id);
const getStock=(e,id='venom-001')=>e.DB.sql.prepare('SELECT stock FROM inventory WHERE product_id=? AND variant=0').get(id).stock;
const preference=()=>Response.json({id:'pref-test',sandbox_init_point:'https://sandbox.mercadopago.com.mx/checkout/v1/redirect?pref_id=test'});
const provider=globalThis.fetch;
async function mock(fn,run){globalThis.fetch=fn;try{return await run()}finally{globalThis.fetch=provider}}
const payment=(id,status='approved',updated='2026-10-05T12:00:00Z')=>({id:12345,external_reference:id,currency_id:'MXN',transaction_amount:850,collector_id:123,live_mode:false,status,date_last_updated:updated});

test('configuration fails closed until all secrets, URLs and delivery are ready',()=>{
 const e=env();assert.equal(config(e).enabled,true);delete e.MP_ACCESS_TOKEN;assert.equal(config(e).enabled,false);
 assert.equal(config({}).enabled,false);assert.equal(config({...env(),SHIPPING_LOCAL:'invalid'}).enabled,false);
});
test('server ignores client prices and calculates shipping',()=>{
 const b=body();b.items[0].price=1;assert.equal(validate(b,env()).total,85000);
 Object.assign(b.customer,{method:'shipping',zip:'20000',state:'Aguascalientes',city:'Aguascalientes',colony:'Centro',street:'Prueba 1'});
 assert.equal(validate(b,env()).total,90000);
});
test('invalid quantity, duplicate item and unknown products are rejected',()=>{
 for(const change of [b=>b.items[0].quantity=1.5,b=>b.items[0].variant=-1,b=>b.items.push({...b.items[0]}),b=>b.items[0].id='fake']){const b=body();change(b);assert.throws(()=>validate(b,env()),{status:400})}
});
test('stock reservation rolls back every item and order if one item is missing',async()=>{
 const e=env();stock(e);const b=body();b.items.push({id:'gato-005',variant:0,quantity:1});
 await assert.rejects(checkout(b,crypto.randomUUID(),e),{status:409});assert.equal(getStock(e),3);assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM orders').get().n,0);
});
test('idempotent checkout creates exactly one preference and reserves once',async()=>{
 const e=env();stock(e);let calls=0;await mock(async()=>{calls++;return preference()},async()=>{
 const key=crypto.randomUUID(),a=await checkout(body(),key,e),b=await checkout(body(),key,e);assert.deepEqual(a,b);assert.equal(calls,1);assert.equal(getStock(e),2);
 const changed=body();changed.items[0].quantity=2;await assert.rejects(checkout(changed,key,e),{status:409});
 });
});
test('parallel same-key requests never create a second preference',async()=>{
 const e=env();stock(e);let calls=0;await mock(async()=>{calls++;return preference()},async()=>{
 const key=crypto.randomUUID(),r=await Promise.allSettled([checkout(body(),key,e),checkout(body(),key,e)]);assert.ok(r.some(x=>x.status==='fulfilled'));assert.equal(calls,1);assert.equal(getStock(e),2);
 });
});
test('two buyers cannot oversell the last unit',async()=>{
 const e=env();stock(e,'venom-001',1);await mock(async()=>preference(),async()=>{
 const r=await Promise.allSettled([checkout(body(),crypto.randomUUID(),e),checkout(body(),crypto.randomUUID(),e)]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal(getStock(e),0);
 });
});
test('uncertain provider response retains reservation, blocks duplicate retry',async()=>{
 const e=env();stock(e);let calls=0;await mock(async()=>{calls++;throw new Error('timeout')},async()=>{
 const key=crypto.randomUUID();await assert.rejects(checkout(body(),key,e),{status:503});await assert.rejects(checkout(body(),key,e),{status:409});assert.equal(calls,1);assert.equal(getStock(e),2);assert.equal(e.DB.sql.prepare('SELECT state FROM orders').get().state,'needs_review');
 });
});
test('payment amount, currency, collector and mode must match',async()=>{
 const e=env();stock(e);await mock(async()=>preference(),async()=>{
 const r=await checkout(body(),crypto.randomUUID(),e);
 for(const fields of [{transaction_amount:1},{transaction_amount:850.001},{currency_id:'USD'},{collector_id:999},{live_mode:true}])await assert.rejects(applyPayment({...payment(r.order_id),...fields},e),{status:409});
 });
});
test('late rejected attempt cannot erase approval; refund updates same payment',async()=>{
 const e=env();stock(e);await mock(async()=>preference(),async()=>{
 const r=await checkout(body(),crypto.randomUUID(),e);await applyPayment(payment(r.order_id),e);
 await applyPayment({...payment(r.order_id,'rejected','2026-10-05T13:00:00Z'),id:999},e);
 assert.equal(e.DB.sql.prepare('SELECT state FROM orders').get().state,'approved');
 await applyPayment(payment(r.order_id,'refunded','2026-10-05T14:00:00Z'),e);
 await applyPayment(payment(r.order_id,'approved','2026-10-05T12:00:00Z'),e);
 assert.equal(e.DB.sql.prepare('SELECT state FROM orders').get().state,'refunded');
 });
});
test('webhook received before preference response does not get overwritten',async()=>{
 const e=env();stock(e);await mock(async(_url,options)=>{await applyPayment(payment(JSON.parse(options.body).external_reference),e);return preference()},async()=>{
 await checkout(body(),crypto.randomUUID(),e);assert.equal(e.DB.sql.prepare('SELECT state FROM orders').get().state,'approved');
 });
});
test('signed webhook verifies id, request, timestamp and secret',async()=>{
 const e=env(),ts=String(Math.floor(Date.now()/1000)),v1=await hmac(e.MP_WEBHOOK_SECRET,`id:123;request-id:req1;ts:${ts};`);
 assert.equal(await signatureValid(`ts=${ts},v1=${v1}`,'req1','123',e),true);
 assert.equal(await signatureValid(`ts=${ts},v1=${v1}`,'req1','124',e),false);
 assert.equal(await signatureValid(`ts=1000,v1=${v1}`,'req1','123',e),false);
});
test('order status requires token and exposes no address or email',async()=>{
 const e=env();stock(e);await mock(async()=>preference(),async()=>{
 const r=await checkout(body(),crypto.randomUUID(),e);delete e.MP_ACCESS_TOKEN;
 await assert.rejects(orderStatus(r.order_id,'bad',e),{status:404});
 assert.deepEqual(Object.keys(await orderStatus(r.order_id,r.status_token,e)).sort(),['mode','order_id','status','total']);
 });
});
test('HTTP CORS, invalid bodies, signatures, config and private paths',async()=>{
 const e=env(),base='https://oda.example.com';
 const wrong=await worker.fetch(new Request(base+'/api/checkout',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'}),e);assert.equal(wrong.status,403);
 const preflight=await worker.fetch(new Request(base+'/api/checkout',{method:'OPTIONS',headers:{Origin:'https://armando858d.github.io'}}),e);assert.equal(preflight.status,204);
 const tooBig=await worker.fetch(new Request(base+'/api/checkout',{method:'POST',headers:{Origin:'https://armando858d.github.io','Content-Type':'application/json'},body:'x'.repeat(16001)}),e);assert.equal(tooBig.status,413);
 assert.equal((await worker.fetch(new Request(base+'/api/webhooks/mercadopago',{method:'POST',body:'{}'}),e)).status,401);
 assert.equal((await worker.fetch(new Request(base+'/.dev.vars'),e)).status,404);
 const response=await worker.fetch(new Request(base+'/api/config'),{...e,PAYMENTS_ENABLED:'false'});assert.equal((await response.json()).enabled,false);
});


test('admin requires private bearer token and allowed origin',async()=>{
 const e=env();e.ADMIN_TOKEN='s'.repeat(40);
 const call=(token,origin='https://armando858d.github.io')=>worker.fetch(new Request('https://api.example/api/admin/status',{headers:{Origin:origin,Authorization:'Bearer '+token}}),e);
 assert.equal((await call('bad')).status,401);
 assert.equal((await call(e.ADMIN_TOKEN,'https://evil.example')).status,403);
 const r=await call(e.ADMIN_TOKEN);assert.equal(r.status,200);const d=await r.json();assert.equal(d.inventory.length,14);assert.ok(!JSON.stringify(d).includes(e.ADMIN_TOKEN));
});
test('admin saves measured packages and rejects concurrent inventory changes',async()=>{
 const {admin}=await import('../src/admin.mjs');const e=env();
 const b={product_id:'venom-001',variant:0,previous_stock:0,stock:2,weight:1,length:20,width:20,height:30};
 await admin('/api/admin/inventory','POST',b,e);assert.equal(getStock(e),2);
 assert.equal(e.DB.sql.prepare('SELECT weight FROM package_profiles').get().weight,1);
 await assert.rejects(admin('/api/admin/inventory','POST',{...b,weight:9,stock:8},e),{status:409});
 assert.equal(getStock(e),2);assert.equal(e.DB.sql.prepare('SELECT weight FROM package_profiles').get().weight,1);
 await assert.rejects(admin('/api/admin/inventory','POST',{...b,weight:0},e),{status:400});
});

async function shippingEnv(){
 const e=env();Object.assign(e,{SHIPPING_PROVIDER:'envia',ENVIA_TOKEN:'mock-token',ENVIA_MODE:'test',ENVIA_CARRIERS:'fedex',LABEL_PURCHASES_ENABLED:'true'});stock(e);
 e.DB.sql.prepare('INSERT INTO package_profiles VALUES(?,?,?,?,?,?)').run('venom-001',0,0.5,10,10,10);
 const a={name:'Test',email:'test@example.com',phone:'4490000000',street:'Prueba',number:'1',district:'Centro',city:'Aguascalientes',state:'AG',country:'MX',postalCode:'20263',reference:''};
 e.DB.sql.prepare('INSERT INTO store_settings VALUES(?,?)').run('origin',JSON.stringify(a));
 return e;
}
function shippingBody(){return {items:body().items,customer:{name:'Test',email:'test@example.com',method:'shipping',phone:'4490000000',street:'Prueba',number:'1',colony:'Centro',city:'Aguascalientes',state:'Aguascalientes',state_code:'AG',zip:'20263',notes:''}};}
const rateResponse=()=>Response.json({meta:'rate',data:[{carrier:'fedex',service:'ground',totalPrice:150,currency:'MXN',dropOff:0,deliveryEstimate:'2 d?as'}]});
test('quote binds destination, server prices and expiry; checkout charges saved tariff',async()=>{
 const {rates,resolveQuote}=await import('../src/shipping.mjs');const e=await shippingEnv(),b=shippingBody();
 await mock(async url=>url.includes('mercadopago')?preference():rateResponse(),async()=>{
  const v=validate(b,e),r=await rates(v.items,v.customer,e);b.shipping_quote_id=r.quotes[0].id;
  await assert.rejects(resolveQuote(b.shipping_quote_id,v.items,{...v.customer,number:'99'},e),{status:409});
  const key=crypto.randomUUID(),order=await checkout({...b,shipping:1,total:1},key,e);assert.equal(order.total,1000);
  e.DB.sql.prepare('UPDATE shipping_quotes SET expires_at=1').run();
  assert.deepEqual(await checkout(b,key,e),order);
  await assert.rejects(checkout(b,crypto.randomUUID(),e),{status:409});
 });
});
test('label needs approved payment and matching price, concurrent requests buy once',async()=>{
 const {rates,purchaseLabel}=await import('../src/shipping.mjs');const e=await shippingEnv(),b=shippingBody();let purchases=0;
 await mock(async url=>{if(url.includes('mercadopago'))return preference();if(url.includes('generate')){purchases++;return Response.json({data:[{shipmentId:1,trackingNumber:'TEST123',label:'https://labels.example/test.pdf',currency:'MXN',totalPrice:150,carrier:'fedex',service:'ground'}]})}return rateResponse()},async()=>{
  const v=validate(b,e);b.shipping_quote_id=(await rates(v.items,v.customer,e)).quotes[0].id;
  const o=await checkout(b,crypto.randomUUID(),e);
  await assert.rejects(purchaseLabel(o.order_id,15000,e),{status:409});
  await applyPayment({...payment(o.order_id),transaction_amount:1000},e);
  await assert.rejects(purchaseLabel(o.order_id,1,e),{status:409});
  const result=await Promise.allSettled([purchaseLabel(o.order_id,15000,e),purchaseLabel(o.order_id,15000,e)]);
  assert.ok(result.some(r=>r.status==='fulfilled'));assert.equal(purchases,1);
  await purchaseLabel(o.order_id,15000,e);assert.equal(purchases,1);
 });
});
test('uncertain label response locks retries to prevent a second charge',async()=>{
 const {rates,purchaseLabel}=await import('../src/shipping.mjs');const e=await shippingEnv(),b=shippingBody();let purchases=0;
 await mock(async url=>{if(url.includes('mercadopago'))return preference();if(url.includes('generate')){purchases++;throw Error('timeout')}return rateResponse()},async()=>{
 const v=validate(b,e);b.shipping_quote_id=(await rates(v.items,v.customer,e)).quotes[0].id;const o=await checkout(b,crypto.randomUUID(),e);await applyPayment({...payment(o.order_id),transaction_amount:1000},e);
 await assert.rejects(purchaseLabel(o.order_id,15000,e),{status:503});await assert.rejects(purchaseLabel(o.order_id,15000,e),{status:409});assert.equal(purchases,1);
 });
});

test('Envia token accepts harmless copy formatting but rejects hidden placeholders',async()=>{const {enviaToken}=await import('../src/shipping.mjs');assert.equal(enviaToken('  Bearer abc.def.xyz  '),'abc.def.xyz');assert.equal(enviaToken('"abc.def.xyz"'),'abc.def.xyz');assert.throws(()=>enviaToken('********'),{status:409});assert.throws(()=>enviaToken('abc def'),{status:409});});
