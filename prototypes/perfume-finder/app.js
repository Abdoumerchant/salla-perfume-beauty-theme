(()=>{
const D=PerfumeData,E=PerfumeEngine,provider=new E.DemoCatalogProvider(D.catalogs);
const $=id=>document.getElementById(id),form=$('preferences'),store=$('store'),results=$('results');
let revision=0;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
for(const s of D.stores){const o=el('option','',s.name);o.value=s.id;store.append(o);}
const groups=[['gender',D.genders],['family',Object.fromEntries(Object.entries(D.families).map(([k,v])=>[k,v.label]))],['occasion',D.occasions]];
for(const [name,options]of groups){for(const [value,label]of Object.entries(options)){
 const wrapper=el('label','option'),input=el('input');input.type='radio';input.name=name;input.value=value;input.required=true;
 const choice=el('span','choice');if(name==='family'){const dot=el('span','scent-dot');dot.style.setProperty('--swatch',D.families[value].color);dot.setAttribute('aria-hidden','true');choice.append(dot);}choice.append(el('span','',label));wrapper.append(input,choice);$(name+'-options').append(wrapper);
}}
function invalidate(){revision++;results.hidden=true;$('cards').replaceChildren();$('status').textContent='';}
form.addEventListener('change',()=>{invalidate();$('progress').textContent=`${new Set([...new FormData(form).keys()]).size} / ٣`;});
store.addEventListener('change',()=>{invalidate();document.documentElement.style.setProperty('--accent',D.stores.find(s=>s.id===store.value).accent);if($('product-dialog').open)$('product-dialog').close();history.replaceState(null,'',location.pathname+location.search);});
function bottle(p){const art=el('div','product-art');art.style.setProperty('--bottle',p.color);art.setAttribute('aria-hidden','true');const b=el('div','bottle'),glass=el('div','glass'),label=el('span','','ذائقة');label.append(el('small','','EAU DE PARFUM · 50 ML'));glass.append(label);b.append(el('div','cap'),glass);art.append(b);return art;}
function details(p){const frag=document.createDocumentFragment();frag.append(el('h3','',p.name),el('div','meta',`${D.genders[p.gender]} · ${p.size} مل`),el('p','notes',p.notes));return frag;}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const request=++revision,tenant=store.value,p=Object.fromEntries(new FormData(form));results.hidden=false;$('status').textContent='جارٍ مطابقة اختياراتك…';$('cards').replaceChildren();
 try{
 const catalog=await provider.getCatalog(tenant);if(request!==revision)return;
 const matches=E.recommend(catalog,tenant,p);
 $('summary').textContent=`${D.stores.find(s=>s.id===tenant).name} / ${D.genders[p.gender]} / ${D.families[p.family].label} / ${D.occasions[p.occasion]}`;
 $('results-title').textContent=matches.length===3?'ثلاثة عطور تستحق التجربة':matches.length?'اختيارات من كتالوج متجرك':'لا توجد عطور مناسبة حاليًا';
 $('status').textContent=matches.length===0?'جرّب تغيير جنس العطر أو مراجعة الكتالوج.':matches.length<3?`وجدنا ${matches.length} من العطور المتاحة فقط؛ لن نكرر المنتجات لإكمال العدد.`:matches.some(x=>!x.matches.family||!x.matches.occasion)?'أضفنا أقرب البدائل المتاحة؛ راجع أسباب الترشيح لمعرفة ما يطابق اختيارك.':'تطابق العطور الثلاثة العائلة والمناسبة اللتين اخترتهما.';
 matches.forEach((r,i)=>{
 const p=r.product,card=el('article','card'),art=bottle(p);art.append(el('span','rank',`0${i+1}`),el('span','match',r.matches.family&&r.matches.occasion?'مطابق لذوقك':'بديل مقترح'));
 const content=el('div','card-content');content.append(details(p));const reasons=el('ul','reasons');E.explain(r,Object.fromEntries(new FormData(form)),D).forEach(t=>reasons.append(el('li','',t)));content.append(reasons);
 const row=el('div','price-row'),price=el('span','price',new Intl.NumberFormat('ar-SA').format(p.price)+' ');price.append(el('small','','ر.س'));const link=el('a','product-link','تفاصيل العطر ←');link.href=p.url;row.append(price,link);content.append(row);card.append(art,content);$('cards').append(card);
 });results.focus();results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 }catch{if(request===revision)$('status').textContent='تعذر تحميل كتالوج المتجر. أعد المحاولة.';}
});
$('reset').addEventListener('click',()=>{invalidate();form.querySelector('input:checked, input').focus();$('finder-title').scrollIntoView({behavior:'smooth'});});
function route(){const match=location.hash.match(/^#product\/([a-z0-9-]+)\/([a-z0-9-]+)$/);if(!match)return;const p=match[1]===store.value?D.catalogs[store.value].find(x=>x.id===match[2]):null;if(!p)return;const box=$('product-details');box.replaceChildren(bottle(p),details(p),el('p','price',`${p.price} ر.س`));$('product-dialog').showModal();}
window.addEventListener('hashchange',route);$('close-dialog').addEventListener('click',()=>$('product-dialog').close());$('product-dialog').addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.search));route();
})();
