import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('storefront displays actual first and minimum variant prices, matching cart totals',()=>{
 const source=fs.readFileSync(new URL('../../js/store.js',import.meta.url),'utf8');
 const product={id:'hello',type:'fixed',name:'Hello',category:'figura',description:'',price:180,variants:[{name:'Sin pintar',mod:140},{name:'Pintado',mod:180}],images:[]};
 const elements=Object.fromEntries(['#productDialog','#variant','#detailAdd'].map(key=>[key,{}]));
 const context=vm.createContext({CATALOG:[product],localStorage:{getItem:()=>null},document:{querySelector:key=>elements[key]},productImage:()=>'',openDialog:()=>{}});
 vm.runInContext(source.slice(0,source.indexOf('const subtotal=')),context);
 vm.runInContext(source.split('\n').find(line=>line.startsWith('function showProduct(')),context);
 assert.equal(vm.runInContext('startingPrice(CATALOG[0])',context),320);
 assert.equal(vm.runInContext("unit({id:'hello',variant:0})",context),320);
 vm.runInContext("showProduct('hello')",context);
 assert.match(elements['#productDialog'].innerHTML,/id="detailPrice">\$320/);
 elements['#detailPrice']={};
 elements['#variant'].onchange({target:{value:'1'}});
 assert.match(elements['#detailPrice'].innerHTML,/\$360/);
 product.variants.reverse();
 assert.equal(vm.runInContext('startingPrice(CATALOG[0])',context),320);
 assert.equal(vm.runInContext('variantPrice(CATALOG[0])',context),360);
 product.price=0.1;product.variants=[{name:'Decimal',mod:0.2}];
 assert.equal(vm.runInContext('variantPrice(CATALOG[0])',context),0.3);
 assert.equal(vm.runInContext("startingPrice({type:'custom'})",context),null);
});
