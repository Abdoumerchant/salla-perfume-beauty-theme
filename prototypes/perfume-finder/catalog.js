(function(root){
  const families = {
    citrus: {label:'حمضية',note:'برغموت · ليمون · نيرولي',names:['إشراقة','نسيم كابري','ندى الصباح','شمس','أفق'],color:'#d8bb69'},
    powdery:{label:'بودرية',note:'سوسن · بنفسج · مسك',names:['حرير','غيمة','لمسة مخمل','همس','أوركيد'],color:'#c4a5ba'},
    woody:{label:'خشبية',note:'أرز · صندل · فيتيفر',names:['جذور','غابة','سكون','أرز','ظل'],color:'#b08b64'},
    floral:{label:'زهرية',note:'ورد · ياسمين · زهر البرتقال',names:['بتلات','حديقة','ورد الصباح','تفتح','جوري'],color:'#d8a49b'},
    oriental:{label:'شرقية',note:'عنبر · عود · زعفران',names:['ليل','عنبر','مجلس','وهج','رواية'],color:'#c09a5a'},
    gourmand:{label:'حلوة',note:'فانيلا · لوز · كراميل',names:['دفء','فانيلا','لحظة','لوز','سكر'],color:'#caa783'}
  };
  const genders={male:'رجالي',female:'نسائي',unisex:'للجنسين'};
  const occasions={daily:'كل يوم',work:'العمل',evening:'المساء والمناسبات',gift:'هدية'};
  const stores=[{id:'atelier',name:'أتيليه العطر',accent:'#40534a'},{id:'ward',name:'دار ورد',accent:'#734852'}];
  // Fictitious, explicitly tagged fixtures. Product IDs intentionally repeat between tenants.
  const catalogs=Object.fromEntries(stores.map((store,s)=>[store.id,Object.entries(families).flatMap(([family,f],fidx)=>
    f.names.map((name,i)=>({id:`${family}-${i}`,storeId:store.id,name:`${s?'ورد ':''}${name}`,gender:['male','female','unisex','unisex','unisex'][i],families:[family],occasions:[['daily','work'],['evening','gift'],['daily','gift'],['work','evening'],['evening','daily']][i],notes:f.note,price:145+fidx*15+i*20+s*10,currency:'SAR',size:50,available:true,color:f.color,demo:true,url:`#product/${store.id}/${family}-${i}`})))]));
  const api={families,genders,occasions,stores,catalogs};
  if(typeof module!=='undefined')module.exports=api;else root.PerfumeData=api;
})(typeof globalThis!=='undefined'?globalThis:this);
