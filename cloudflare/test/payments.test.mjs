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
  await applyPayment({...payment(o.order_id),transaction_amount:850,shipping_amount:150},e);
  await assert.rejects(purchaseLabel(o.order_id,1,e),{status:409});
  const result=await Promise.allSettled([purchaseLabel(o.order_id,15000,e),purchaseLabel(o.order_id,15000,e)]);
  assert.ok(result.some(r=>r.status==='fulfilled'));assert.equal(purchases,1);
  await purchaseLabel(o.order_id,15000,e);assert.equal(purchases,1);
 });
});
test('uncertain label response locks retries to prevent a second charge',async()=>{
 const {rates,purchaseLabel}=await import('../src/shipping.mjs');const e=await shippingEnv(),b=shippingBody();let purchases=0;
 await mock(async url=>{if(url.includes('mercadopago'))return preference();if(url.includes('generate')){purchases++;throw Error('timeout')}return rateResponse()},async()=>{
 const v=validate(b,e);b.shipping_quote_id=(await rates(v.items,v.customer,e)).quotes[0].id;const o=await checkout(b,crypto.randomUUID(),e);await applyPayment({...payment(o.order_id),transaction_amount:850,shipping_amount:150},e);
 await assert.rejects(purchaseLabel(o.order_id,15000,e),{status:503});await assert.rejects(purchaseLabel(o.order_id,15000,e),{status:409});assert.equal(purchases,1);
 });
});

test('Envia token accepts harmless copy formatting but rejects hidden placeholders',async()=>{const {enviaToken}=await import('../src/shipping.mjs');assert.equal(enviaToken('  Bearer abc.def.xyz  '),'abc.def.xyz');assert.equal(enviaToken('"abc.def.xyz"'),'abc.def.xyz');assert.throws(()=>enviaToken('********'),{status:409});assert.throws(()=>enviaToken('abc def'),{status:409});});

test('test preference lets the buyer sign in without prefilled payer email',async()=>{const e=env();stock(e);await mock(async(url,opts)=>{assert.equal(Object.hasOwn(JSON.parse(opts.body),'payer'),false);return preference()},async()=>{await checkout(body(),crypto.randomUUID(),e)});});

test('sandbox account may report live_mode true; real account must not approve test order',async()=>{const e=env();stock(e);let order;await mock(async()=>preference(),async()=>{order=await checkout(body(),crypto.randomUUID(),e)});await mock(async()=>Response.json({id:123,tags:['test_user']}),async()=>{await applyPayment({...payment(order.order_id),live_mode:true},e)});assert.equal(e.DB.sql.prepare('SELECT state FROM orders').get().state,'approved');await mock(async()=>Response.json({id:123,tags:[]}),async()=>{await assert.rejects(applyPayment({...payment(order.order_id),live_mode:true},e),{status:409})});});

// CMS: edits must persist and payment validation must use server-side prices.
import {getContent,saveContent,pricedProducts,activePromotions,validateContent} from '../src/content.mjs';
test('catalog edits persist, initialize stock and reject stale writes',async()=>{
 const e=env(),c=await getContent(e);c.products.push({...c.products[0],id:'new-piece',name:'Nueva pieza',price:123});
 const saved=await saveContent(e,c);assert.equal(saved.revision,1);assert.equal((await getContent(e)).products.at(-1).price,123);
 assert.equal(getStock(e,'new-piece'),0);await assert.rejects(()=>saveContent(e,c),/Otra sesión/);
});
test('scheduled collection offers use strongest discount and expire precisely',()=>{
 const c={products:[{id:'p',price:100,variants:[{name:'Pintado',mod:50}],collection:'limited'},{id:'q',price:100,variants:[]}],promotions:[{active:true,title:'Global',percent:10},{active:true,title:'Especial',percent:20,collection:'limited',start:'2026-10-01T00:00:00Z',end:'2026-10-08T00:00:00Z'}]};
 const at=Date.parse('2026-10-07T00:00:00Z');assert.equal(activePromotions(c,at).length,2);const rows=pricedProducts(c,at);assert.equal(rows[0].price,80);assert.equal(rows[0].variants[0].mod,40);assert.equal(rows[1].price,90);assert.equal(pricedProducts(c,Date.parse('2026-10-08T00:00:00Z'))[0].price,90);
});
test('public content and server checkout share current product prices',async()=>{
 const e=env(),c=await getContent(e);c.products[0].price=200;c.promotions=[{id:'offer',title:'Semana especial',active:true,percent:25,collection:'',start:'',end:''}];await saveContent(e,c);
 const response=await worker.fetch(new Request('https://oda.example.com/api/content'),e);assert.equal(response.status,200);const d=await response.json();assert.equal(d.products[0].price,150);assert.equal(validate(body(),{...e,catalog:d.products}).total,15000);
});
test('catalog rejects HTML, executable images, invalid dates and discounts',async()=>{
 const e=env(),c=await getContent(e);c.products[0].image='javascript:alert(1)';assert.throws(()=>validateContent(c));c.products[0].image='ven1.png';c.products[0].name='<script>';assert.throws(()=>validateContent(c));c.products[0].name='Pieza';c.promotions=[{id:'bad',title:'Oferta',active:true,percent:101}];assert.throws(()=>validateContent(c));c.promotions[0].percent=10;c.promotions[0].start='tomorrow';assert.throws(()=>validateContent(c));
});

test('canvas products persist with photos, variants and zero initial stock',async()=>{
 const e=env(),c=await getContent(e);c.products.push({...c.products[0],id:'canvas-test',category:'lienzo',type:'fixed',price:450,variants:[{name:'40 × 60 cm',mod:0},{name:'60 × 80 cm',mod:200}],images:['angel1.png']});
 await saveContent(e,c);const saved=(await getContent(e)).products.at(-1);assert.equal(saved.category,'lienzo');assert.equal(saved.price,450);assert.equal(saved.variants[1].mod,200);assert.deepEqual(saved.images,['angel1.png']);assert.equal(getStock(e,'canvas-test'),0);
 const response=await worker.fetch(new Request('https://oda.example.com/api/content'),e);assert.equal((await response.json()).products.at(-1).category,'lienzo');
});

const skyRateFixture=()=>({id:'sky-rate',success:true,status:'approved',currency_code:'MXN',total:'120.50',provider_name:'fedex',provider_service_code:'ground',provider_display_name:'FedEx',provider_service_name:'Terrestre',days:3,shipment_creation_type:'single',pickup:true});
async function dualEnv(){const e=await shippingEnv();Object.assign(e,{SHIPPING_PROVIDER:'both',SKYDROPX_CLIENT_ID:crypto.randomUUID(),SKYDROPX_CLIENT_SECRET:'mock-only',SKYDROPX_MODE:'live'});return e;}
const skyFetch=async(url,opts)=>{if(url.includes('oauth/token'))return Response.json({access_token:'mock-access',expires_in:7200});if(url.includes('quotations'))return Response.json({id:'sky-quote',is_completed:true,rates:[skyRateFixture()]});return rateResponse();};
test('dual-provider quotes retain provider, exact cents and distinguish live from test',async()=>{
 const {rates,resolveQuote}=await import('../src/shipping.mjs');const e=await dualEnv(),b=shippingBody(),v=validate(b,e);
 await mock(skyFetch,async()=>{const r=await rates(v.items,v.customer,e);assert.equal(r.quotes.length,2);const q=r.quotes.find(q=>q.provider==='skydropx');assert.equal(q.total,120.5);assert.equal(q.payable,false);assert.equal(r.quotes[0].provider,'envia');await assert.rejects(resolveQuote(q.id,v.items,v.customer,e),{status:409});});
});
test('one provider failure preserves rates from the other provider',async()=>{
 const {rates}=await import('../src/shipping.mjs');const e=await dualEnv(),v=validate(shippingBody(),e);
 await mock(async(url,opts)=>url.includes('skydropx')?Response.json({error:'unavailable'},{status:503}):rateResponse(),async()=>{const r=await rates(v.items,v.customer,e);assert.equal(r.partial,true);assert.deepEqual(r.unavailable_providers,['skydropx']);assert.equal(r.quotes[0].provider,'envia');});
 await mock(async(url,opts)=>url.includes('skydropx')?skyFetch(url,opts):Response.json({error:'down'},{status:503}),async()=>{const r=await rates(v.items,v.customer,e);assert.equal(r.quotes[0].provider,'skydropx');assert.equal(r.partial,true);});
});
test('Skydropx request uses real package measurements and ignores incomplete unsafe rates',async()=>{
 const {skyRate,skyOffers}=await import('../src/skydropx.mjs');const e=await dualEnv();
 for(const patch of [{success:false},{status:'pending'},{currency_code:'USD'},{total:-1},{total:'bad'},{requires_origin_verification:true},{shipment_creation_type:'multishipment'}])assert.equal(skyRate({...skyRateFixture(),...patch}),null);
 await mock(async(url,o)=>{if(url.includes('oauth'))return skyFetch(url,o);const b=JSON.parse(o.body);assert.equal(b.quotation.address_from.area_level1,'Aguascalientes');assert.equal(b.quotation.parcels[0].length,11);assert.equal(b.quotation.parcels[0].weight,0.5);assert.equal(b.quotation.parcels[0].package_protected,false);return Response.json({id:'quote',is_completed:true,rates:[skyRateFixture()]});},async()=>{await skyOffers({state:'AG',postalCode:'20263',city:'Aguascalientes',district:'Centro'},{state:'AG'},[{dimensions:{length:10.1,width:10,height:10},weight:0.5,declaredValue:850}],e);});
});
test('Skydropx label purchase requires explicit switch, approved live payment and never duplicates',async()=>{
 const {rates,purchaseLabel,labelRate}=await import('../src/shipping.mjs');const e=await dualEnv();e.MP_MODE='live';e.SKYDROPX_PACKAGE_CODES=JSON.stringify({'venom-001':{consignment_note:'12345678',package_type:'4G'}});let purchases=0;
 await mock(async(url,o)=>{
  if(url.includes('mercadopago'))return Response.json({id:'pref',init_point:'https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=test'});
  if(url.endsWith('/shipments')){purchases++;assert.equal(JSON.parse(o.body).shipment.unique_shipment,true);return Response.json({data:{id:'shipment',attributes:{payment_status:'paid',total:'120.50',carrier_name:'fedex'},relationships:{packages:{data:[{id:'pkg'}]}}},included:[{id:'pkg',attributes:{tracking_number:'TEST',label_url:'https://labels.example/sky.pdf'}}]});}
  return skyFetch(url,o);
 },async()=>{const b=shippingBody(),v=validate(b,e);const quotes=await rates(v.items,v.customer,e);b.shipping_quote_id=quotes.quotes.find(q=>q.provider==='skydropx').id;const o=await checkout(b,crypto.randomUUID(),e);await assert.rejects(purchaseLabel(o.order_id,12050,e),{status:409});e.DB.sql.prepare("UPDATE orders SET state='approved' WHERE id=?").run(o.order_id);await assert.rejects(purchaseLabel(o.order_id,12050,e),{status:409});e.SKYDROPX_LABEL_PURCHASES_ENABLED='true';await assert.rejects(purchaseLabel(o.order_id,1,e),{status:409});assert.equal((await labelRate(o.order_id,e)).provider,'skydropx');const result=await Promise.allSettled([purchaseLabel(o.order_id,12050,e),purchaseLabel(o.order_id,12050,e)]);assert(result.some(r=>r.status==='fulfilled'));assert.equal(purchases,1);await purchaseLabel(o.order_id,12050,e);assert.equal(purchases,1);});
});
test('Skydropx label timeout retains lock and does not fall through to Envia',async()=>{
 const {rates,purchaseLabel}=await import('../src/shipping.mjs');const e=await dualEnv();e.MP_MODE='live';e.SKYDROPX_LABEL_PURCHASES_ENABLED='true';e.SKYDROPX_PACKAGE_CODES=JSON.stringify({'venom-001':{consignment_note:'12345678',package_type:'4G'}});let purchases=0;
 await mock(async(url,o)=>{if(url.includes('mercadopago'))return Response.json({id:'pref',init_point:'https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=test'});if(url.endsWith('/shipments')){purchases++;throw Error('lost response')}return skyFetch(url,o);},async()=>{const b=shippingBody(),v=validate(b,e);b.shipping_quote_id=(await rates(v.items,v.customer,e)).quotes.find(q=>q.provider==='skydropx').id;const order=await checkout(b,crypto.randomUUID(),e);e.DB.sql.prepare("UPDATE orders SET state='approved' WHERE id=?").run(order.order_id);await assert.rejects(purchaseLabel(order.order_id,12050,e),{status:503});await assert.rejects(purchaseLabel(order.order_id,12050,e),{status:409});assert.equal(purchases,1);});
});
