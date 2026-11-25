// Real recovered combat engine. Rendering is replaced by an event sink only.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
const input=JSON.parse(fs.readFileSync(0,'utf8'));const events=[];
const cache={'cryptoApi':{},'buildExt':{},'async':{},'resource':{},'battleScene':{instance:null},'i18n':{t:x=>x,a:x=>x},'md5':s=>crypto.createHash('md5').update(s).digest('hex'),'data':{},
 'battle.msgHandler':{emit:(name,data)=>{if(name==='onOver')events.push(data);}}};
for(const file of fs.readdirSync(path.join(__dirname,'../tables')).filter(x=>x.endsWith('Data.json'))){cache.data[file.slice(0,-9)]=JSON.parse(fs.readFileSync(path.join(__dirname,'../tables',file),'utf8'));}
const context={cc:{macro:{},_RF:{push(){},pop(){}}},console:{log(){},warn(){}},Date,Math,Uint8Array,
 _setTimeout(){throw Error('Unexpected renderer timer');},_clearTimeout(){},_clearInterval(){}};
const records={};
function load(name){
 if(name in records)return records[name].exports;
 if(name in cache)return cache[name];
 const source=fs.readFileSync(path.join(__dirname,'battle_modules',name+'.js'),'utf8');
 const begin=source.indexOf('function('),end=source.lastIndexOf('}, {');
 if(end<0)throw Error('Bad recovered module: '+name);
 const mod={exports:{}};records[name]=mod;
 vm.runInNewContext('('+source.slice(begin,end)+'})',context,{filename:name+'.js'})(load,mod,mod.exports);
 return cache[name]=mod.exports;
}
load('dataApi').init();
if(input.mode==='constants'){process.stdout.write(JSON.stringify({server:load('serverConfig'),client:load('clientConfig')}));process.exit(0);}
const main=load('battleMain'),fight=load('battle.fightHandler');
main.rolesCount=input.team.roles.length;main.isAuto=!!input.auto;main.isInstant=true;main.isShow=false;
main.battleType=load('battle.consts').BATTLE_TYPE.SMAP;
const manual=main.genManualSkillInfo(input.team);main.manualShipSkillIds=manual.shipSkillIds;main.manualSkillIds=manual.roleSkillIds;
main.setSeed(input.seed||1);main.manualRecordMap=input.manualRecordMap1||{};
const trace={};const originalUse=fight.useSkill;
fight.useSkill=function(teamId,skillId){if(input.auto){const zone=trace[this.zoneId]||(trace[this.zoneId]={});const tick=this.area.timer.tickNumber;(zone[tick]||(zone[tick]=[])).push({teamId,skillId});}return originalUse.call(this,teamId,skillId);};
fight.smapBattle(input.team,input.smapId,{});
while(main.isWin&&fight.zoneId<main.zoneCount){main.manualRecordMap=input.manualRecordMap2||{};fight.smapBattleNext();}
const last=events.at(-1);if(!last)throw Error('Battle did not produce an outcome');
process.stdout.write(JSON.stringify({isWin:main.isWin,star:last.star,seed:main.seed,tickNumber:fight.area.timer.tickNumber,zoneId:fight.zoneId,zones:main.zoneCount,team:fight.team,records:trace}));
