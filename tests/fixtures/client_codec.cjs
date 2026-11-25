const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync(__dirname+'/client_protocol.js','utf8');
const begin=source.indexOf('function('),end=source.lastIndexOf('}, {} ]');
const context={cc:{_RF:{push(){},pop(){}}},Uint8Array};
const factory=vm.runInNewContext('('+source.slice(begin,end)+'})',context);
const moduleObject={exports:{}};factory(()=>{throw Error('Unexpected dependency')},moduleObject);
const p=moduleObject.exports,input=JSON.parse(fs.readFileSync(0,'utf8'));
if(input.operation==='request') {
 const data=p.Message.encode(input.id,p.Message.TYPE_REQUEST,0,input.route,p.strencode(JSON.stringify(input.body)));
 process.stdout.write(Buffer.from(p.Package.encode(p.Package.TYPE_DATA,data)).toString('base64'));
}else{
 const packet=p.Package.decode(Uint8Array.from(Buffer.from(input.data,'base64')));
 const msg=p.Message.decode(packet.body);
 process.stdout.write(JSON.stringify({type:packet.type,id:msg.id,...(msg.route?{route:msg.route}:{}),body:JSON.parse(p.strdecode(msg.body))}));
}
