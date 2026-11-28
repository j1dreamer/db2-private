// Cache source/compiled code, but create a fresh VM/module graph for every job.
const fs=require('fs'),vm=require('vm'),path=require('path'),readline=require('readline');
const workerPath=path.join(__dirname,'battle_worker.cjs'),worker=new vm.Script(fs.readFileSync(workerPath,'utf8'),{filename:workerPath});
const files=new Map(),directories=new Map(),compiled=new Map();
class Finished extends Error{}
function execute(input){
 let output='';
 const fileApi={...fs,readFileSync(file,encoding){
  if(file===0)return JSON.stringify(input);
  const key=String(file)+'|'+String(encoding||'');
  if(!files.has(key))files.set(key,fs.readFileSync(file,encoding));
  const value=files.get(key);return Buffer.isBuffer(value)?Buffer.from(value):value;
 },readdirSync(file,...args){const key=String(file);if(!args.length){if(!directories.has(key))directories.set(key,fs.readdirSync(file));return directories.get(key).slice();}return fs.readdirSync(file,...args);},writeFileSync(file,value){if(file!==1)throw Error('Unexpected combat write');output+=String(value);}};
 const vmApi={...vm,runInNewContext(code,sandbox,options={}){
  const key=(options.filename||'')+'|'+code;
  let script=compiled.get(key);if(!script){script=new vm.Script(code,options);compiled.set(key,script);}
  const context=vm.isContext(sandbox)?sandbox:vm.createContext(sandbox);
  return script.runInContext(context,options);
 }};
 class JobDate extends Date{}
 const sandbox={__dirname,Buffer,Uint8Array,Math:Object.create(Math),Date:JobDate,console,
  require:name=>name==='fs'?fileApi:name==='vm'?vmApi:require(name),
  process:{stdout:{write:value=>{output+=String(value);}},exit:code=>{if(code)throw Error('Combat exit '+code);throw new Finished();}}};
 try{worker.runInNewContext(sandbox,{timeout:input.mode==='bestOfThree'||input.mode==='series'?30000:15000});}
 catch(error){if(!(error instanceof Finished))throw error;}
 return JSON.parse(output);
}
const lines=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
lines.on('line',line=>{
 try{const request=JSON.parse(line);const result=execute(request.payload);process.stdout.write(JSON.stringify({id:request.id,result})+'\n');}
 catch(error){process.stdout.write(JSON.stringify({error:String(error.message||error)})+'\n');}
});
