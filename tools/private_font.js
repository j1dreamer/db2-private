// Keep source fonts for source UI. Use a packaged Unicode font for Vietnamese.
(function(){
 var fonts={},pending={},cacheFixed=false;
 function custom(label){label.__db2CustomFont=true;style(label);}
 function language(){return window.DB2PrivateI18n?window.DB2PrivateI18n.language():cc.sys.localStorage.getItem('defaultLanguage')||'en';}
 function style(label){
  if(!label||label.__db2FontBusy)return;
  var text=String(label.string||''),viet=/[\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01a0\u01a1\u01af\u01b0\u1ea0-\u1ef9\u0300-\u036f]/.test(text),useViet=language()==='vi'||viet;
  if(/[\u3400-\u9fff]/.test(text)&&!viet)useViet=false;
  var font=fonts[useViet?'vi':'original'];
  if(!font||!useViet&&!label.__db2CustomFont)return;
  label.__db2FontBusy=true;
  try{
   if(label.font!==font)label.font=font;
   if(label.useSystemFont)label.useSystemFont=false;
   if(label.spacingX)label.spacingX=0;
   if(label.cacheMode!==undefined&&cc.Label.CacheMode)label.cacheMode=cc.Label.CacheMode.NONE;
   if(text.normalize&&text!==text.normalize('NFC'))label.string=text.normalize('NFC');
  }finally{label.__db2FontBusy=false;}
 }
 function walk(node){if(!node)return;if(node.getComponent)style(node.getComponent(cc.Label));(node.children||[]).forEach(walk);}
 function refresh(){try{walk(cc.director.getScene());}catch(ignored){}}
 function prepare(){
  if(!cacheFixed&&window.__require){try{var descriptor=Object.getOwnPropertyDescriptor(cc.Label.prototype,'cacheMode');if(!descriptor||descriptor.configurable){var view=window.__require('baseView');if(view.fixFont)view.fixFont();}cacheFixed=true;}catch(ignored){}}
  ['vi','original'].forEach(function(key){
   if(fonts[key]||pending[key])return;
   var file=key==='vi'?'db2/fonts/NotoSans-Regular.ttf':'assets/main/native/77/770a9fbb-5dde-487b-bec4-e3824b4924c5/font.ttf';
   if(typeof jsb!=='undefined'&&jsb.fileUtils)file=jsb.fileUtils.fullPathForFilename(file);
   var load=cc.assetManager&&cc.assetManager.loadRemote?function(url,cb){cc.assetManager.loadRemote(url,cb);}:cc.loader&&cc.loader.load?function(url,cb){cc.loader.load(url,cb);}:null;
   if(!load)return;pending[key]=true;
   load(file,function(error,font){pending[key]=false;if(error||!font){console.error('DB2 font asset:',key,error);return;}fonts[key]=font;if(font.addRef)font.addRef();refresh();});
  });
 }
 ['_forceUpdateRenderData','setVertsDirty'].forEach(function(method){
  var old=cc.Label&&cc.Label.prototype[method];if(!old)return;
  cc.Label.prototype[method]=function(){style(this);return old.apply(this,arguments);};
 });
 ['_updateRichText','_updateRichTextStatus'].forEach(function(method){var old=cc.RichText&&cc.RichText.prototype[method];if(!old)return;cc.RichText.prototype[method]=function(){style(this);return old.apply(this,arguments);};});
 window.DB2PrivateFonts={custom:custom,style:style,prepare:prepare,refresh:refresh};
 if(cc.director&&cc.director.on)cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,function(){prepare();refresh();});
}());
