const {test}=require('node:test');const assert=require('node:assert/strict');
const D=require('./catalog.js'),E=require('./engine.js');const base={gender:'male',family:'citrus',occasion:'work'};
test('all 144 preference combinations across both tenants return three unique, compatible products',()=>{
for(const store of D.stores)for(const gender of Object.keys(D.genders))for(const family of Object.keys(D.families))for(const occasion of Object.keys(D.occasions)){
 const rows=E.recommend(Object.values(D.catalogs).flat(),store.id,{gender,family,occasion});
 assert.equal(rows.length,3);assert.equal(new Set(rows.map(r=>r.product.id)).size,3);
 for(const r of rows){assert.equal(r.product.storeId,store.id);assert.equal(r.matches.family,true);assert.ok(r.product.gender===gender||gender!=='unisex'&&r.product.gender==='unisex');}
 assert.ok(rows.every((r,i)=>!i||rows[i-1].score>=r.score));
}});
test('male citrus and female powder examples prefer correct family and explain real attributes',()=>{
for(const p of [base,{gender:'female',family:'powdery',occasion:'evening'}])for(const r of E.recommend(D.catalogs.atelier,'atelier',p)){
assert.ok(r.product.families.includes(p.family));assert.equal(E.explain(r,p,D).length,3);
}});
test('unknown preferences fail closed',()=>{for(const key of Object.keys(base))assert.throws(()=>E.recommend([], 'atelier',{...base,[key]:'unknown'}));});
test('stock, foreign tenant, duplicate IDs, unsafe links and invalid price are excluded',()=>{
const p=D.catalogs.atelier[0];const data=[{...p,available:false},{...p,storeId:'ward'},{...p,url:'javascript:alert(1)'},{...p,price:NaN},p,p];
assert.equal(E.recommend(data,'atelier',base).length,1);
});
test('sparse catalogs return fewer results, never incompatible gender',()=>{
assert.equal(E.recommend([], 'atelier',base).length,0);
assert.equal(E.recommend(D.catalogs.atelier.filter(p=>p.gender==='female'), 'atelier',base).length,0);
assert.equal(E.recommend([D.catalogs.atelier[0]],'atelier',base).length,1);
});
test('fallback explanations disclose family and occasion mismatch',()=>{
const p={...D.catalogs.atelier.find(p=>p.families.includes('woody')&&p.gender==='male'),occasions:['evening']};
const [r]=E.recommend([p],'atelier',base);assert.equal(r.matches.family,false);assert.equal(r.matches.occasion,false);
assert.match(E.explain(r,base,D)[0],/لا يطابق/);assert.match(E.explain(r,base,D)[1],/غير مدرجة/);
});
test('family match outranks occasion-only match',()=>{
const a={...D.catalogs.atelier[0],id:'a',occasions:['evening']};const b={...a,id:'b',families:['woody'],occasions:['work']};assert.equal(E.recommend([b,a],'atelier',base)[0].product.id,'a');
});
test('provider rejects unknown tenants and returns copies',async()=>{
const provider=new E.DemoCatalogProvider(D.catalogs);await assert.rejects(provider.getCatalog('unknown'));
const first=await provider.getCatalog('atelier');first[0].name='changed';assert.notEqual((await provider.getCatalog('atelier'))[0].name,'changed');
});
test('only https and controlled demo fragment URLs accepted',()=>{for(const url of ['http://example.com','//example.com','data:text/html,x',undefined])assert.equal(E.safeUrl(url),false);assert.equal(E.safeUrl('https://shop.example/products/1'),true);});
