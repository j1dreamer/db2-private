// Execute only recovered model constructors/data generators; no Cocos renderer.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const tables={};for(const name of ['vip','role','entity','soul']){
 const raw=JSON.parse(fs.readFileSync(__dirname+'/../../tables/'+name+'Data.json','utf8'));
 tables[name]=raw.slice(1).map(row=>Object.fromEntries(raw[0].map((key,i)=>[key,row[i]])));
}
// Clock methods mirror the recovered serverMain aliasNow/tTime (zero network).
const server={offsetTime:0,aliasNow(e){this.offsetTime=e;Date._now=()=>Date.now()+(this.offsetTime||0);},tTime(e){return e+this.offsetTime;},player:null};
const api={vip:{findOneBy:(key,val)=>tables.vip.find(r=>r[key]===val)},role:{findById:id=>tables.role.find(r=>r.kindId===id)}};
api.findEntityById=id=>tables.entity.find(r=>r.kindId===id)||tables.role.find(r=>r.kindId===id);
api.findSoulByClassId=id=>tables.soul.find(r=>r.classId===id);
const cache={rulePanel:{},shipScene:{},teamHandler:{},soundComponent:{},roleScene:function(){},http:{},moment:{},guide:{},skillInfoPanel:{},sceneManager:{},socket:{},baseView:{},i18n:{t:s=>s,a:s=>s},buildExt:{},helper:{},bagHandler:{},arenaHandler:{},eyeHandler:{},guildHandler:{},bmapScene:{},dailyBmapScene:{},playerHandler:{},serverMain:server,dataApi:api,
 util:{inherits:(child,parent)=>{child.prototype=Object.create(parent.prototype);child.prototype.constructor=child;},clone:obj=>JSON.parse(JSON.stringify(obj))},
 md5:s=>crypto.createHash('md5').update(s).digest('hex'),serverConfig:{CONSTS:{ENTITY_ID:{COIN:101,GEM:102}},POINT:{CONSTS:{NORMAL_COST_ENTITY_ID:119,ADVANCED_COST_ENTITY_ID:120}}},
 resource:{},soundApi:{},itemItem:{},roleItem:{},skillItem:{},pointHandler:{},clientConfig:{}};
// Dependencies used only by renderer callbacks or networking in these generators.
// Missing methods deliberately stay undefined: calling a stub fails the check.
const callbackOnly = new Set(["allServerBattleHandler", "arena3v3Handler", "arenaHandler", "arenaScene", "bagHandler", "bagScene", "baseView", "bmapScene", "buildExt", "canUseRolesPanel", "coinTopNode", "cryptoApi", "dailyBmapScene", "data", "dial2Panel", "dialPanel", "doubleBattleHandler", "dreamActivityPanel", "dreamExtActivityPanel", "eyeHandler", "friendHandler", "guide", "guideNode", "guildHandler", "guildScene", "helper", "http", "i18n", "idfaPanel", "mailHandler", "md5", "moment", "newGuildBattleHandler", "playerHandler", "pointHandler", "prestigeBattleHandler", "rankHandler", "rankPanel", "renamePanel", "resource", "roleScene", "rulePanel", "sceneManager", "serverMain", "settingPanel", "shipScene", "shopHandler", "skillInfoPanel", "skillItem", "socket", "soundApi", "soundComponent", "stringUtil", "strongGoalMorePanel", "teamBattleHandler", "teamHandler", "topUpPanel", "util", "viewBattleTeamPanel", "worldBossHandler", "worshipBattleHandler", "upgradeShowPanel"]);
for(const name of callbackOnly)if(!(name in cache))cache[name]=function(){};
const frames=[];
const cc={_RF:{push(mod){frames.push(mod)},pop(){frames.pop()}},Class:def=>{const cls=function(){};Object.assign(cls.prototype,def);Object.assign(cls,def.statics||{});frames.at(-1).exports=cls;return cls;},Component:{},Node:{},Sprite:{},Label:{},SpriteFrame:{},ProgressBar:{},Layout:{},RichText:{}};
const context={cc,window:{},console:{log(...args){process.stderr.write(args.join(' ')+'\n');},warn(...args){process.stderr.write(args.join(' ')+'\n');}},Date,Uint8Array,storage:{getItem(){return null;},setItem(){}},setInterval:()=>1,clearInterval(){}};
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
// Exercise actual top-bar lifecycle and touch handlers with renderer-only adapters.
delete cache.moment;load('moment');
delete cache.coinTopNode;
const topClass=load('coinTopNode');const top=new topClass();
const label=()=>({string:'',node:{}});
for(const key of ['coinLabel','gemLabel','apLabel','maxApLabel','apRecoverDescLabel','apRecoverNextApLabel','apRecoverFullApLabel','apRecoverBuyApTimesLabel'])top[key]=label();
top.apRecoverBt={targetOff(){},on(){}};top.apRecoverPanel={};
top.unschedule=()=>{};top.schedule=()=>{};
cc.Node.EventType={TOUCH_START:'start',TOUCH_END:'end',TOUCH_CANCEL:'cancel'};
cache.helper.replaceLabel=(node,values)=>{node.values=values;};
cache.helper.scaleEffect=()=>{};
// Recovered helper.floatStrip.
cache.helper.floatStrip=value=>parseFloat(value.toPrecision(12));
// Real moment handles the recovery branch if a stored profile has an active timer.
cache.helper.formatDuration=(...values)=>values.join(':');
top.onLoad();
top.onViewApRecover_({type:cc.Node.EventType.TOUCH_START});
top.onViewApRecover_({type:cc.Node.EventType.TOUCH_END});
const topBar={coin:top.coinLabel.string,gem:top.gemLabel.string,actionPoint:top.apLabel.string,maxActionPoint:top.maxApLabel.values[0],nextRecoveryLabel:top.apRecoverNextApLabel.string,buyTimes:top.apRecoverBuyApTimesLabel.values};
let quick;
let home;
if(input.checkHome){
 for(const name of ['itemItem','roleItem'])delete cache[name];
 home=load('homeScene').genData();
 for(const name of ['shipScene','skillItem','skillInfoPanel'])delete cache[name];
 load('shipScene');load('skillItem');
 // sceneManager caches the real team item generator output before loading scenes.
 cache.sceneManager.teamData={teamItemMap:Object.fromEntries(Object.values(player.team.roles).map(r=>[r.idx,load('teamScene').genTeamItemData(r)]))};
 quick=load('quickNode').genData();
}
if(input.checkNoGuide){
 delete cache.guide;cache.async={};cache.buildExt.isSkipGuide=true;
 // The actual guide must return before probing tutorial steps or local storage.
 const guide=load('guide');guide.run([{test(){throw Error('Tutorial must not start');}}]);
 if(!guide.firstBattle.test())throw Error('New player must not have a fabricated victory');
 guide.smapBattleTo.test();
}
let roleScenes,effects=[];
if(input.checkGameplay){
 cache.forgePanel={};cache.artifactUpgradePanel={};
 delete cache.roleScene;load('roleScene');
 cache.sceneManager.teamData={teamItemMap:Object.fromEntries(Object.values(player.team.roles).map(r=>[r.idx,load('teamScene').genTeamItemData(r)]))};
 roleScenes=Object.values(player.team.roles).map(r=>load('roleScene').genData(r));
 for(const delta of input.deltas||[]){
  if(!delta._temp||!delta._temp.dropList)continue;
  const map={};for(const r of Object.values(delta.team?.roles||{}))map[r.kindId]=r;
  effects.push(load('pointScene').genPointEffectData(3,delta._temp.dropList,map));
 }
}
const daily=load('dailyTaskPanel').genData();
let point;
if(input.checkPoint)point=load('pointScene').genData();
let roles;if(input.checkRoles){if(!cache.roleItem.genData){delete cache.roleItem;load('roleItem');}roles=Object.values(player.team.roles).map(r=>load('roleItem').genData(r));}
player.destroy();process.stdout.write(JSON.stringify({snapshots,roleScenes,effects,topBar,quick,home,daily,point,roles,teamItems,friendship,gem:player.gem,bag:player.bag.items,team:player.team.roles}));
