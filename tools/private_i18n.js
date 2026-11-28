// Declarative UI catalogs; use the same saved language as the original client.
(function(){
 var catalogs=window.DB2_PRIVATE_UI_LOCALES||{};
 function selected(){return cc.sys.localStorage.getItem('defaultLanguage')||'en';}
 function t(key,args){var lang=selected(),text=(catalogs[lang]||{})[key]||(catalogs.en||{})[key]||key;return String(text).replace(/\$(\d+)/g,function(_,n){return args&&args[Number(n)-1]!==undefined?args[Number(n)-1]:_;});}
 function normalized(desc){return String(desc||'').split(',').filter(Boolean).sort().join(',');}
 function boxMeta(item){
  if(!item)return null;var key=item.kindNameKey;
  if(!key&&Number(item.kindId)===724)key='box.sp60.name';
  if(!key&&Number(item.kindId)===351&&Number(item.selectCount)===1){
   try{var source=window.__require('dataApi').findEntityById(724);if(normalized(item.dropListDesc)===normalized(source.extra.dropListDesc))key='box.sp60.name';}catch(ignored){}
  }
  return key?{name:t(key),desc:t(item.descKey||'box.sp60.desc')}:null;
 }
 window.DB2PrivateI18n={t:t,language:selected,boxMeta:boxMeta};
}());
