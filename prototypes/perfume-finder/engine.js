(function(root){
  const enums={gender:['male','female','unisex'],family:['citrus','powdery','woody','floral','oriental','gourmand'],occasion:['daily','work','evening','gift']};
  function validatePreferences(p){
    for(const [key,values] of Object.entries(enums))if(!values.includes(p?.[key]))throw new Error(`Invalid preference: ${key}`);
  }
  function safeUrl(value){
    if(typeof value!=='string')return false;
    if(/^#product\/[a-z0-9-]+\/[a-z0-9-]+$/.test(value))return true;
    try{return new URL(value).protocol==='https:';}catch{return false;}
  }
  function recommend(products,storeId,p){
    validatePreferences(p);
    if(!storeId || !Array.isArray(products))throw new Error('Invalid catalog');
    const seen=new Set();
    return products.filter(x=>{
      const eligible=x.storeId===storeId && x.available===true && (x.gender===p.gender || (p.gender!=='unisex'&&x.gender==='unisex')) && Array.isArray(x.families) && Array.isArray(x.occasions) && typeof x.id==='string' && typeof x.name==='string' && Number.isFinite(x.price) && x.price>=0 && safeUrl(x.url);
      if(!eligible||seen.has(x.id))return false;seen.add(x.id);return true;
    }).map(product=>{
      const matches={gender:product.gender===p.gender,family:product.families.includes(p.family),occasion:product.occasions.includes(p.occasion)};
      // Family takes priority over occasion; incompatible gender is never relaxed.
      return {product,matches,score:(matches.family?60:0)+(matches.occasion?25:0)+(matches.gender?15:8)};
    }).sort((a,b)=>b.score-a.score || a.product.id.localeCompare(b.product.id)).slice(0,3);
  }
  // Provider boundary: future server adapter implements getCatalog(authenticatedTenantId).
  // No OAuth tokens or direct Salla requests belong in this browser prototype.
  class DemoCatalogProvider{
    constructor(catalogs){this.catalogs=structuredClone(catalogs);}
    async getCatalog(storeId){
      if(!Object.hasOwn(this.catalogs,storeId))throw new Error('Unknown store');
      return structuredClone(this.catalogs[storeId]);
    }
  }
  function explain(result,p,labels){
    return [result.matches.family?`ينتمي إلى العائلة ${labels.families[p.family].label} التي اخترتها.`:`بديل من العائلة ${labels.families[result.product.families[0]]?.label || 'غير المصنفة'}؛ لا يطابق عائلتك المطلوبة.`,result.matches.occasion?`مصنف ضمن عطور ${labels.occasions[p.occasion]}.`:'المناسبة المطلوبة غير مدرجة لهذا العطر.',result.matches.gender?`تصنيفه ${labels.genders[p.gender]}.`:'عطر للجنسين يناسب اختيارك.'];
  }
  const api={recommend,explain,DemoCatalogProvider,safeUrl};
  if(typeof module!=='undefined')module.exports=api;else root.PerfumeEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
