// Port verified gameplay modules into the ENG/iOS resource and language shell.
const fs=require('fs'),acorn=require('./js-parser/node_modules/acorn');
const [baseFile,sourceFile,outFile,reportFile]=process.argv.slice(2);
const selected=['serverConfig','acePackPanel','activityPanel','bagScene','dial2Panel','diyGiftPack2Panel','diyGiftPackPanel','dreamExtActivityPanel','firstTopUpPanel','homeScene','itemItem2','itemItem','roleScene','rulePanel','shopScene','skillInfoPanel','spActivityPanel','starSignPointPanel','taskActiveTopUpPanel','triggerTopUpPanel'];
function parse(s){const a=acorn.parse(s,{ecmaVersion:2020});const tables=a.body.map(n=>n.expression?.right?.arguments?.[0]).filter(n=>n?.type==='ObjectExpression'&&n.properties.length>100);if(tables.length!==1)throw Error('Expected one verified module table');return new Map(tables[0].properties.map(p=>[String(p.key.name??p.key.value),p]));}
function properties(n){let out=[];function walk(x){if(!x||typeof x!=='object')return;if(x.type==='Property'&&(x.key.name??x.key.value)==='properties'&&x.value.type==='ObjectExpression')out.push(x.value);for(let [k,v]of Object.entries(x)){if(['start','end','raw'].includes(k))continue;if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}walk(n);return out;}
const base=fs.readFileSync(baseFile,'utf8'),source=fs.readFileSync(sourceFile,'utf8'),a=parse(base),b=parse(source);let output=base,preservedProperties=[];
for(const name of selected.sort((x,y)=>a.get(y).start-a.get(x).start)){
 const x=a.get(name),y=b.get(name);if(!x||!y)throw Error('Missing module '+name);
 const uuid=s=>(s.match(/cc\._RF\.push\([^,]+,\s*"([^"]+)"/)||[])[1];
 if(uuid(base.slice(x.start,x.end))!==uuid(source.slice(y.start,y.end)))throw Error('Script UUID mismatch: '+name);
 const xp=properties(x.value),yp=properties(y.value);if(xp.length!==yp.length)throw Error('Serialized class count mismatch: '+name);
 let replacement=source.slice(y.start,y.end);
 for(let i=yp.length-1;i>=0;i--){
  const targetKeys=xp[i].properties.map(p=>p.key.name??p.key.value),sourceKeys=yp[i].properties.map(p=>p.key.name??p.key.value);
  if(sourceKeys.some(k=>!targetKeys.includes(k)))throw Error('Source needs missing serialized property: '+name);
  if(JSON.stringify([...targetKeys].sort())!==JSON.stringify([...sourceKeys].sort())){
   replacement=replacement.slice(0,yp[i].start-y.start)+base.slice(xp[i].start,xp[i].end)+replacement.slice(yp[i].end-y.start);preservedProperties.push(name);
  }
 }
 output=output.slice(0,x.start)+replacement+output.slice(x.end);
}
acorn.parse(output,{ecmaVersion:2020});fs.writeFileSync(outFile,output);
fs.writeFileSync(reportFile,JSON.stringify({baseline:'longzhidao-17327',ported_modules:selected.sort(),preserved_shell_modules:['buildExt','resource','language','sdkApi','serverMain','settingPanel','soundApi'],target_serialized_property_supersets_preserved:preservedProperties,script_uuid_mismatches:0,missing_serialized_properties:0,native_device_tested:false},null,2)+'\n');
