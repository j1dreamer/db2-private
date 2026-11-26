const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/../..',data=JSON.parse(fs.readFileSync(root+'/tables/localization/vi.merged.json','utf8'));
const values={defaultLanguage:'en'},language={vi:{wrong:'old iOS translation'}},selected=[];let ready=false,restarts=0;
const context={window:{DB2_PRIVATE_VI:data,__require(name){if(!ready)throw Error('Require before bundle initialized');return name==='language'?language:{setLanguage(x){selected.push(x);}};}},cc:{sys:{localStorage:{getItem:k=>values[k],setItem:(k,v)=>values[k]=v}},game:{restart(){restarts++;}}}};
const script=fs.readFileSync(root+'/tools/private_locale.js','utf8');
vm.runInNewContext(script,context);assert.equal(values.defaultLanguage,'vi');ready=true;
context.window.DB2PrivateLocale.apply();assert.equal(selected.at(-1),'vi');assert.equal(language.vi['觉醒成功'],'Thức tỉnh thành công');assert.equal(language.vi['时间静止'],data['时间静止']);assert.equal(Object.keys(language.vi).length,Object.keys(data).length);
context.window.DB2PrivateLocale.choose('en');assert.equal(restarts,1);vm.runInNewContext(script,context);assert.equal(values.defaultLanguage,'en');context.window.DB2PrivateLocale.apply();assert.equal(selected.at(-1),'en');
process.stdout.write(JSON.stringify({dictionaryEntries:Object.keys(language.vi).length,firstLanguage:'vi',explicitSelectionPreserved:true,restarts}));
