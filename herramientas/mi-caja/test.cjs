const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];new Function(code);
const names=['line','saleCalc','calcCost','calcTik','validateBackup','allocate','terminalRows'];const funcs=names.map(n=>code.split('\n').find(l=>l.startsWith('function '+n+'('))).join('\n');const ctx={};vm.createContext(ctx);vm.runInContext('const round=n=>Math.round((n+Number.EPSILON)*100)/100;'+funcs,ctx);
const item={name:'Test',price:116,qty:2,tax:'16',mode:'included',cost:40,discount:0};const s=ctx.saleCalc([item],'point',3.5,0);assert.equal(s.total,232);assert.equal(s.base,200);assert.equal(s.iva,32);assert.equal(s.deposit,222.58);assert.equal(s.balance,110.58);
assert.equal(ctx.line({...item,price:100,mode:'excluded'}).total,232);assert.equal(ctx.line({...item,discount:16}).total,200);assert.equal(ctx.line({...item,tax:'exento'}).iva,0);assert.equal(ctx.saleCalc([item],'cash').fee,0);assert.equal(ctx.saleCalc([item],'point',3.5,4.69).fee,19);
const c=ctx.calcCost({kg:300,grams:100,hours:4,pieces:2,watts:150,kwh:3,wear:0,waste:0,minutes:60,labor:70,paint:5,primer:0,finish:0,packing:10,other:0,markup:100});assert.equal(c.total,100.9);assert.ok(Math.abs(c.energy-.9)<1e-9);assert.equal(c.price,234.09);
const v={tkPrice:116,tkQty:2,tkDiscount:0,tkCost:40,tkRate:6,tkVat:'included',tkFixed:6,affiliate:0,sfp:'yes',sfpRate:8,sfpCap:40,shipping:0,buyerShip:0,ads:0,tkIsr:2.5,tkIvaRet:50,tkIsrBase:'net'};const t=ctx.calcTik(v);assert.equal(t.isr,5);assert.equal(t.ivaRet,16);assert.equal(t.sfp,18.56);assert.equal(t.balance,70.52);assert.equal(ctx.calcTik({...v,tkIvaRet:100}).balance,t.balance);assert.equal(ctx.calcTik({...v,tkPrice:1000}).sfp,80);assert.equal(ctx.calcTik({...v,sfp:'no'}).sfp,0);
ctx.validateBackup({version:1,fields:{},cart:[item],sales:[]});assert.throws(()=>ctx.validateBackup({version:1,fields:{},cart:[{...item,qty:-1}],sales:[]}));assert.throws(()=>ctx.validateBackup({}));console.log('20 arithmetic, tax, fee, cost and backup checks passed');

// A single 800 MXN charge: canvas 500 + figure 300.
const canvas={...item,name:'Lienzo',price:500,qty:1};const figure={...item,name:'Figura',price:300,qty:1};
const mixed=ctx.saleCalc([canvas,figure],'point',3.5,0),detail=ctx.terminalRows(mixed);
assert.equal(mixed.total,800);assert.equal(detail[0].terminalFee,17.5);assert.equal(detail[0].terminalVat,2.8);assert.equal(detail[0].terminalTotal,20.3);assert.equal(detail[0].terminalNet,479.7);assert.equal(detail[1].terminalTotal,12.18);assert.equal(detail[1].terminalNet,287.82);assert.equal(mixed.deposit,767.52);
for(const prices of [[.01,.01,.01],[.15,.15,.15],[99.99,123.45,0,51.27],[500,300,116]]){const sale=ctx.saleCalc(prices.map(price=>({...figure,price})),'point',3.5,4.69),rs=ctx.terminalRows(sale);for(const [key,total] of [['terminalFee',sale.fee],['terminalVat',sale.feeVat],['terminalNet',sale.deposit]])assert.equal(Math.round(rs.reduce((s,r)=>s+r[key],0)*100),Math.round(total*100));}
const zero=ctx.terminalRows(ctx.saleCalc([{...figure,discount:300}],'point',3.5));assert.equal(zero[0].terminalTotal,0);
assert.equal(ctx.terminalRows(ctx.saleCalc([figure],'cash'))[0].terminalTotal,0);
console.log('Per-product Point allocation verified, including mixed carts, MSI, zero totals and rounding.');
