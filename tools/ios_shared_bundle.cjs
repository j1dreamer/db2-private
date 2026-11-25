// Use the selected Android gameplay implementation in the original iOS shell.
// Retain iOS resource mappings/localization and fail on serialized script changes.
const fs=require('fs'),acorn=require('./js-parser/node_modules/acorn');
const [androidPath,iosPath,output,reportPath]=process.argv.slice(2);
const options={ecmaVersion:2020};
function modules(source){
 const ast=acorn.parse(source,options),expression=ast.body[0].expression;
 const table=expression?.right?.arguments?.[0];
 if(table?.type!=='ObjectExpression')throw Error('Unexpected original module table');
 return new Map(table.properties.map(p=>[String(p.key.name??p.key.value),p]));
}
function schema(node){
 const out=[];
 function walk(n){
  if(!n||typeof n!=='object')return;
  if(n.type==='Property'&&(n.key.name??n.key.value)==='properties'&&n.value.type==='ObjectExpression')out.push(n.value.properties.map(p=>p.key.name??p.key.value).sort());
  for(const [key,value]of Object.entries(n)){if(['start','end','raw'].includes(key))continue;if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
 }walk(node);return out;
}
const android=fs.readFileSync(androidPath,'utf8'),ios=fs.readFileSync(iosPath,'utf8');
const a=modules(android),b=modules(ios);
if(JSON.stringify([...a.keys()].sort())!==JSON.stringify([...b.keys()].sort()))throw Error('Module inventories differ');
const rf=s=>(s.match(/cc\._RF\.push\([^,]+, "([^"]+)"/)||[])[1];
for(const [name,p]of a){
 const q=b.get(name);
 if(rf(android.slice(p.start,p.end))!==rf(ios.slice(q.start,q.end)))throw Error('Script UUID differs: '+name);
 if(JSON.stringify(schema(p.value))!==JSON.stringify(schema(q.value)))throw Error('Serialized property schema differs: '+name);
}
const resourceMap=(src,p)=>new Map([...src.slice(p.start,p.end).matchAll(/^(\w+): "([^"]+)"/gm)].map(m=>[m[1],m[2]]));
const ar=resourceMap(android,a.get('resource')),ir=resourceMap(ios,b.get('resource'));
for(const [key,value]of ar)if(ir.get(key)!==value)throw Error('Missing/different iOS resource: '+key);
const preserved=['resource','language'];let result=android;
for(const name of preserved.sort((x,y)=>a.get(y).start-a.get(x).start)){
 const p=a.get(name),q=b.get(name);result=result.slice(0,p.start)+ios.slice(q.start,q.end)+result.slice(p.end);
}
acorn.parse(result,options);fs.writeFileSync(output,result);
fs.writeFileSync(reportPath,JSON.stringify({shared_gameplay_baseline:'android',module_count:a.size,shared_modules:a.size-preserved.length,ios_modules_preserved:preserved,script_uuid_mismatches:0,serialized_property_mismatches:0,android_resource_keys_verified_in_ios:ar.size,native_execution_tested:false},null,2)+'\n');
