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
 let source=fs.readFileSync(path.join(__dirname,'battle_modules',name+'.js'),'utf8');
 if(name==='battle.timer'&&input.mode==='expedition'){
  const old='[ n.BATTLE_TYPE.SMAP, n.BATTLE_TYPE.TAIL, n.BATTLE_TYPE.BOSS, n.BATTLE_TYPE.GUILD_BOSS ]';
  if(source.split(old).length!==3)throw Error('Unexpected expedition record boundary');
  source=source.split(old).join('[ n.BATTLE_TYPE.SMAP, n.BATTLE_TYPE.TAIL, n.BATTLE_TYPE.BOSS, n.BATTLE_TYPE.GUILD_BOSS, n.BATTLE_TYPE.EXPEDITION ]');
 }
 const begin=source.indexOf('function('),end=source.lastIndexOf('}, {');
 if(end<0)throw Error('Bad recovered module: '+name);
 const mod={exports:{}};records[name]=mod;
 vm.runInNewContext('('+source.slice(begin,end)+'})',context,{filename:name+'.js'})(load,mod,mod.exports);
 return cache[name]=mod.exports;
}
load('dataApi').init();
if(input.mode==='constants'){process.stdout.write(JSON.stringify({server:load('serverConfig'),client:load('clientConfig'),battle:load('battle.consts')}));process.exit(0);}
if(input.mode==='progression'){
 const cfg=load('serverConfig'),role=cfg.ROLE.FUNS;
 const values={starCosts:Array.from({length:20},(_,i)=>role.getUpgradeCost(i)),awakeCosts:Array.from({length:20},(_,i)=>role.getAwakeCost(i)),maxLevels:Array.from({length:31},(_,i)=>role.getMaxLevel(100,i,0)),soulCosts:{},soulMaxLevels:{},powerFactors:{}};
 for(const sp of [false,true]){values.soulCosts[+sp]={};for(let type=1;type<=9;type++)values.soulCosts[+sp][type]=Array.from({length:10},(_,i)=>role.getSoulCost(type,i+1,sp));}
 for(let star=1;star<=20;star++)values.soulMaxLevels[star]=Object.fromEntries(Array.from({length:9},(_,i)=>[i+1,role.getSoulMaxLevel(i+1,50,star)]));
 const base={hp:0,atk:0,def:0,mdef:0};
 for(const key of new Set([...role.getPower.toString().matchAll(/e\.(\w+)/g)].map(m=>m[1])))values.powerFactors[key]=role.getPower({...base,[key]:1},0,0);
 process.stdout.write(JSON.stringify(values));process.exit(0);
}
if(input.mode==='practiceRewards'){
 const cfg=load('serverConfig');
 process.stdout.write(JSON.stringify(input.cases.map(c=>c.mode==='practice'?cfg.PRACTICE.FUNS.getRewardDropList(c.type,c.level,c.trainingLevel,c.ratio,c.raid):cfg.SIX_PRACTICE.FUNS.getRewardDropList(c.vip,c.ratio))));process.exit(0);
}
if(input.mode==='clientTeam'){
 const source=fs.readFileSync(path.join(__dirname,'../client/main.decoded.js'),'utf8');
 const start=source.indexOf('F.buildBattleTeam = function('),end=source.indexOf('F.buildBlessingSkills = function(',start);
 if(start<0||end<0)throw Error('Missing original team builder');
 const F={};vm.runInNewContext(source.slice(start,end),{F,t:load('underscore'),o:load('dataApi'),u:load('serverConfig'),l:{clone:x=>JSON.parse(JSON.stringify(x))}});
 const p=input.player;process.stdout.write(JSON.stringify(F.buildBattleTeam(p.id,(input.shipIndices||[]).map(i=>p.bag.items[i]),input.indices.map(i=>p.team.roles[i]),null,input.hpMap,input.mpMap)));process.exit(0);
}
const main=load('battleMain'),fight=load('battle.fightHandler');
if(input.mode==='expedition'){
 const trace={},useSkill=fight.useSkill;
 fight.useSkill=function(teamId,skillId){if(input.auto){const tick=this.area.timer.tickNumber;(trace[tick]||(trace[tick]=[])).push({teamId,skillId});}return useSkill.call(this,teamId,skillId);};
 const manual=main.genManualSkillInfo(input.team,input.defender);main.manualShipSkillIds=manual.shipSkillIds;main.manualSkillIds=manual.roleSkillIds;
 main.manualRecordMap=input.manualRecordMap||{};main.isAuto=!!input.auto;main.isInstant=true;main.isShow=false;main.battleType=load('battle.consts').BATTLE_TYPE.EXPEDITION;main.damageMap={};main.usedMap={};main.setSeed(input.seed);fight.pkBattle(input.team,input.defender);
 process.stdout.write(JSON.stringify({isWin:main.isWin,tickNumber:fight.area.timer.tickNumber,attacker:fight.team1,defender:fight.team2,records:trace}));process.exit(0);
}
if(input.mode==='boss'){
 if(!['TAIL','BOSS','GUILD_BOSS'].includes(input.bossType))throw Error('Unknown boss mode');
 main.BOSS_CONFIG=input.config;main.manualRecordMap=input.manualRecordMap||{};main.setSeed(input.seed);
 let outcome;
 if(input.bossType==='TAIL')outcome=main.tailBattleInstant(input.team,input.defender,!!input.auto);
 else if(input.bossType==='BOSS')outcome=main.bossBattleInstant(input.team,input.defender,!!input.auto);
 else outcome=main.guildeBossBattleInstant(input.team,input.defender,!!input.auto);
 const boss=fight.area.getEntityBy({teamId:2,idx:0})[0];
 process.stdout.write(JSON.stringify({...outcome,bossHp:boss?boss.hp:0,tickNumber:fight.area.timer.tickNumber,damageMap:main.damageMap}));process.exit(0);
}
if(input.mode==='bestOfThree'||input.mode==='series'){
 const needed=input.mode==='series'?Math.floor(input.pairs.length/2)+1:2;
 if(input.mode==='series'&&![3,5].includes(input.pairs.length))throw Error('Series requires three or five teams');
 const rounds=[];let wins=0,losses=0;
 for(const pair of input.pairs){
  const outcome=main.pkBattleInstant(pair.team,pair.defender,input.seed||1);
  rounds.push({key:pair.key,isWin:outcome.isWin,damageMap:JSON.parse(JSON.stringify(main.damageMap))});
  outcome.isWin?wins++:losses++;
  if(wins===needed||losses===needed)break;
 }
 process.stdout.write(JSON.stringify({isWin:wins===needed,rounds}));process.exit(0);
}
if(input.mode==='pvp'||input.mode==='practice'){
 const outcome=input.mode==='practice'?main.practiceBattleInstant(input.team,input.defender,input.seed||1):main.pkBattleInstant(input.team,input.defender,input.seed||1);
 process.stdout.write(JSON.stringify({...outcome,diedNum:main.diedNum,tickNumber:fight.area.timer.tickNumber,damageMap:main.damageMap,attacker:fight.team1,defender:fight.team2}));process.exit(0);
}
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
