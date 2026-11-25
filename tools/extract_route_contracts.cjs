// Index actual RPC calls and request expressions from the recovered module table.
const fs=require('fs'),acorn=require('./js-parser/node_modules/acorn');
const source=fs.readFileSync(process.argv[2],'utf8');
const ast=acorn.parse(source,{ecmaVersion:2020});const modules=ast.body[0].expression.right.arguments[0];
const contracts=new Map();
function walk(node,visit,bindings=new Map()){
 if(!node||typeof node!=='object')return;
 if(['FunctionExpression','FunctionDeclaration','ArrowFunctionExpression'].includes(node.type)){
  bindings=new Map(bindings);for(const p of node.params)if(p.type==='Identifier')bindings.delete(p.name);
 }
 if(node.type==='VariableDeclarator'&&node.id.type==='Identifier'&&node.init?.type==='Literal')bindings.set(node.id.name,node.init);
 visit(node,bindings);
 for(const [k,v] of Object.entries(node)){
  if(k==='start'||k==='end')continue;
  if(Array.isArray(v))v.forEach(x=>walk(x,visit,bindings));else if(v&&typeof v==='object')walk(v,visit,bindings);
 }
}
for(const module of modules.properties){
 const moduleName=String(module.key.name??module.key.value);
 walk(module.value.elements[0],(node,bindings)=>{
  if(node.type!=='CallExpression'||node.callee.type!=='MemberExpression')return;
  if(!['request','notify'].includes(node.callee.property.name))return;
  const arg=node.arguments[0];const route=arg?.type==='Identifier'?bindings.get(arg.name):arg;if(route?.type!=='Literal'||typeof route.value!=='string'||! /^(logic|chat|gate|connector)\.[\w]+\.[\w]+$/.test(route.value))return;
  const body=node.arguments[1];const fields=body?.type==='ObjectExpression'?body.properties.map(p=>String(p.key?.name??p.key?.value)):null;
  const entry={module:moduleName,line:source.slice(0,node.start).split('\n').length,request_fields:fields,request_expression:body?source.slice(body.start,body.end):null};
  const current=contracts.get(route.value)||{route:route.value,calls:[]};current.calls.push(entry);contracts.set(route.value,current);
 });
}
const rows=[...contracts.values()].sort((a,b)=>a.route.localeCompare(b.route));
fs.writeFileSync(process.argv[3],JSON.stringify({source:'client/main.decoded.js',route_count:rows.length,contracts:rows},null,2)+'\n');
console.log('RPC contracts:',rows.length);
