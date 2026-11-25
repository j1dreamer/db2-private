// Execute only recovered model constructors/data generators; no Cocos renderer.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const tables={};for(const name of ['vip','role','entity','soul']){
 const raw=JSON.parse(fs.readFileSync(__dirname+'/../../tables/'+name+'Data.json','utf8'));
 tables[name]=raw.slice(1).map(row=>Object.fromEntries(raw[0].map((key,i)=>[key,row[i]])));
}
const server={aliasNow(){},player:null};
const api={vip:{findOneBy:(key,val)=>tables.vip.find(r=>r[key]===val)},role:{findById:id=>tables.role.find(r=>r.kindId===id)}};
api.findEntityById=id=>tables.entity.find(r=>r.kindId===id)||tables.role.find(r=>r.kindId===id);
api.findSoulByClassId=id=>tables.soul.find(r=>r.classId===id);
const cache={rulePanel:{},shipScene:{},teamHandler:{},soundComponent:{},roleScene:function(){},http:{},moment:{},guide:{},skillInfoPanel:{},sceneManager:{},socket:{},baseView:{},i18n:{t:s=>s,a:s=>s},buildExt:{},helper:{},bagHandler:{},serverMain:server,dataApi:api,
 util:{inherits:(child,parent)=>{child.prototype=Object.create(parent.prototype);child.prototype.constructor=child;},clone:obj=>JSON.parse(JSON.stringify(obj))},
 md5:s=>crypto.createHash('md5').update(s).digest('hex'),serverConfig:{CONSTS:{ENTITY_ID:{COIN:101,GEM:102}},POINT:{CONSTS:{NORMAL_COST_ENTITY_ID:119,ADVANCED_COST_ENTITY_ID:120}}},
 resource:{},soundApi:{},itemItem:{},roleItem:{},skillItem:{},pointHandler:{},clientConfig:{}};
const frames=[];
const cc={_RF:{push(mod){frames.push(mod)},pop(){frames.pop()}},Class:def=>{const cls=function(){};Object.assign(cls.prototype,def);Object.assign(cls,def.statics||{});frames.at(-1).exports=cls;return cls;},Component:{},Node:{},Sprite:{},Label:{},SpriteFrame:{},ProgressBar:{},Layout:{},RichText:{}};
const context={cc,window:{},console:{log(...args){process.stderr.write(args.join(' ')+'\n');},warn(...args){process.stderr.write(args.join(' ')+'\n');}},Date,Uint8Array,setInterval:()=>1,clearInterval(){}};
function load(name){
 if(name in cache)return cache[name];
 const source=fs.readFileSync(__dirname+'/client_'+name+'.js','utf8');
 const begin=source.indexOf('function('),end=source.lastIndexOf('}, {');
 if(end<0)throw Error('Bad module '+name);
 const mod={exports:{}};cache[name]=mod.exports;
 const factory=vm.runInNewContext('('+source.slice(begin,end)+'})',context);
 factory.call(mod.exports,load,mod,mod.exports);return cache[name]=mod.exports;
}
// Initialize the recovered data layer with the shipped tables as the client does.
cache.data={};for(const file of fs.readdirSync(__dirname+'/../../tables').filter(x=>x.endsWith('Data.json'))){cache.data[file.slice(0,-9)]=JSON.parse(fs.readFileSync(__dirname+'/../../tables/'+file,'utf8'));}
delete cache.dataApi;load('dataApi').init();delete cache.serverConfig;cache.cryptoApi={};load('serverConfig');delete cache.clientConfig;load('clientConfig');
const Player=load('player');const player=server.player=new Player(input.profile);
const snapshots=[];
for(const delta of input.deltas||[]){player.update(delta);snapshots.push({gem:player.gem,bag:JSON.parse(JSON.stringify(player.bag.items)),team:JSON.parse(JSON.stringify(player.team.roles))});}
let teamItems,friendship;
if(input.checkTeam){delete cache.roleItem;load('roleItem');delete cache.itemItem;load('itemItem');friendship=load('teamScene').genFriendshipData();teamItems=Object.values(player.team.roles).map(r=>load('teamScene').genTeamItemData(r));}
let point;
if(input.checkPoint)point=load('pointScene').genData();
let roles;if(input.checkRoles){if(!cache.roleItem.genData){delete cache.roleItem;load('roleItem');}roles=Object.values(player.team.roles).map(r=>load('roleItem').genData(r));}
player.destroy();process.stdout.write(JSON.stringify({snapshots,point,roles,teamItems,friendship,gem:player.gem,bag:player.bag.items,team:player.team.roles}));
