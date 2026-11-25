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
callbackOnly.add('battlefieldRankPanel');callbackOnly.add('worshipRankPanel');
callbackOnly.add('guildBossHandler');
callbackOnly.add('newGuildBattleScene');callbackOnly.add('battleScene');callbackOnly.add('battleWinPanel');
for(const name of callbackOnly)if(!(name in cache))cache[name]=function(){};
const frames=[];
cache.selectBattleRolesScene={TYPE:{ARENA_3V3_DEFENSE_TEAM:7}};
const cc={_RF:{push(mod){frames.push(mod)},pop(){frames.pop()}},Class:def=>{const cls=function(){};Object.assign(cls.prototype,def);Object.assign(cls,def.statics||{});frames.at(-1).exports=cls;return cls;},Component:{},Node:{},Sprite:{},Label:{},SpriteFrame:{},ProgressBar:{},Layout:{},RichText:{}};
const context={cc,window:{},console:{log(...args){process.stderr.write(args.join(' ')+'\n');},warn(...args){process.stderr.write(args.join(' ')+'\n');}},Date,Uint8Array,storage:{getItem(){return null;},setItem(){}},setInterval:()=>1,clearInterval(){}};
context.sp={Skeleton:{}};
context.require=name=>load(name);
function load(name){
 if(name in cache)return cache[name];
 const source=input.moduleOverrides?.[name]||fs.readFileSync(__dirname+'/client_'+name+'.js','utf8');
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
let rosterNavigationCount=0;
if(input.prepareRosterCache){cache.sceneManager.teamData={teamItemMap:Object.fromEntries(Object.keys(player.team.roles).map(key=>[key,{}])),roleSceneMap:Object.fromEntries(Object.keys(player.team.roles).map(key=>[key,{}]))};cache.sceneManager.popToHomeScene=()=>{rosterNavigationCount++;};}
const snapshots=[];
for(const delta of input.deltas||[]){player.update(delta);snapshots.push({gem:player.gem,bag:JSON.parse(JSON.stringify(player.bag.items)),team:JSON.parse(JSON.stringify(player.team.roles))});}
if(input.guildApprovalDelta){
 const applicant=player.guild.applyPlayerList[0];cache.baseView.addLoading=()=>{};
 cache.guildHandler.handleApply=(agree,id,name,cb)=>{player.update(input.guildApprovalDelta);cb(input.guildApprovalDelta);};
 delete cache.guildScene;const view=new (load('guildScene'))();view.update_=()=>{};
 view.onApplyAgree_({target:{data:applicant,memberItem:{}}});
}
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
 delete cache.dreamExtActivityPanel;load('dreamExtActivityPanel');
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
let arenaThree;if(input.checkArena3v3){delete cache.roleItem;delete cache.shipItem;load('roleItem');load('shipItem');arenaThree=load('arena3v3Scene').genData();}
let guildView;if(input.checkGuild){delete cache.itemItem;load('itemItem');delete cache.guildScene;guildView=load('guildScene').genData();}
let bossViews;if(input.checkBosses){delete cache.itemItem;load('itemItem');delete cache.roleItem;load('roleItem');bossViews={world:load('worldBossScene').genData(),guild:load('guildBossPanel').genData()};}
let practiceViews;if(input.checkPractice){cc.ScrollView={};cache.startPracticePanel={};cache.practiceHandler={};cache.sixPracticeHandler={};delete cache.itemItem;load('itemItem');delete cache.roleItem;load('roleItem');delete cache.shipItem;load('shipItem');delete cache.playerItem;load('playerItem');delete cache.viewBattleTeamPanel;const view=load('viewBattleTeamPanel');practiceViews={normal:load('practiceScene').genData(),six:load('sixType1Scene').genData(),team:input.practiceDefense?view.genData(input.practiceDefense,{battleType:input.practiceMode==='sixPractice'?view.BATTLE_TYPE.SIX_PRACTICE:view.BATTLE_TYPE.PRACTICE}):null};}
let eyeView;if(input.checkEye){delete cache.eyeScene;eyeView=load('eyeScene').genData('public');}
let endlessViews;if(input.checkEndless){cc.ScrollView={};cache.endlessHandler={};cache.rankHandler={};cache.battleMain={};cache.helper.floatStrip=value=>parseFloat(value.toPrecision(12));delete cache.itemItem;load('itemItem');endlessViews={main:load('endlessScene').genData(401),fruit:load('fruitBmapScene').genData(),star:load('starSignBmapScene').genData()};}
let expeditionViews;if(input.checkExpedition){cc.ScrollView={};cache.expeditionHandler={};cache.sixExpeditionHandler={};expeditionViews={normal:load('expeditionScene').genData(),six:load('sixType3Scene').genData()};}
let commerceViews;if(input.checkCommerce){delete cache.itemItem;load('itemItem');delete cache.topUpPanel;cache.buildExt.moneyTicketId=2;cache.buildExt.moneyTicket2Id=1;const top=load('topUpPanel');commerceViews={goods:top.genData(),vip:top.genVipItemData(player.vip.level),exchange:load('exchangePanel').genData(),exchange2:load('exchange2Panel').genData(),exchange4:load('exchange4Panel').genData(),vouchers:load('pointBuyConfirmPanel').genData(1,false),dailyVouchers:load('pointBuyConfirmPanel').genData(1,true),voucherNames:[load('dataApi').findEntityById(1).kindName,load('dataApi').findEntityById(2).kindName]};}
let tournamentControls;if(input.checkTournamentControls){let theme,rows,network=0,loading=0,hints=0;cache.doubleBattleHandler.worshipRank=(value,cb)=>{theme=value;cb({_temp:{list:[{playerId:1}]}})};cache.arenaHandler.report=()=>network++;cache.baseView.addLoading=()=>loading++;cache.baseView.addHintPanel=()=>hints++;delete cache.worshipRankPanel;const rank=load('worshipRankPanel'),view=new rank();view.updateRankItems=value=>rows=value;view.update_({type:rank.RANK_TYPE.DOUBLE_BATTLE,opts:{themeNo:3}});const rankLoading=loading;delete cache.arena3v3Scene;const trio=new (load('arena3v3Scene'))();trio.onPlay_({target:{data:{reportId:null}}});tournamentControls={enumValue:rank.RANK_TYPE.DOUBLE_BATTLE,theme,rows,network,hints,loadingExtra:loading-rankLoading};}
let resourceViews;if(input.checkResources){cc.ScrollView={};const view=load('allServerBattleScene');resourceViews={open:view.genData(),battle:view.genBattleData(),resource:view.genViewResourceData(4)};}
let entryViews;if(input.entryResponses){const responses=input.entryResponses;cache.baseView.addLoading=()=>{};const scenes=[];cache.sceneManager.NAME={WORLD_BOSS_SCENE:'world',ALL_SERVER_BATTLE_SCENE:'resources',WORSHIP_BATTLE_SCENE:'worship',ARENA3V3_SCENE:'trio',DOUBLE_BATTLE_SCENE:'double'};cache.sceneManager.pushScene=name=>scenes.push(name);for(const [handler,key,method]of [['worldBossHandler','world','openInfo'],['allServerBattleHandler','resources','openInfo'],['worshipBattleHandler','worship','openInfo'],['arena3v3Handler','trio','info'],['doubleBattleHandler','double','openInfo']])cache[handler][method]=callback=>{player.update(responses[key]);callback(responses[key]);};delete cache.crossServerScene;const cross=new (load('crossServerScene'))();for(const method of ['onMap3_','onMap4_','onMap6_','onMap7_','onMap8_'])cross[method](null);entryViews={scenes,worldOpen:player.extra.worldBoss.openInfo,resourceOpen:player.extra.allServerBattle.openInfo,worshipOpen:player.extra.worshipBattle.openInfo,doubleInfos:player.extra.doubleBattle.infos,trioRank:player.arena3v3.rank};load('homeScene').genData();}
let tournamentReplay;if(input.tournamentReport)tournamentReplay=load('nvnBattleLogPanel').genData(input.tournamentReport);
let tournamentViews;if(input.checkTournaments){cc.ScrollView={};for(const name of ['doubleBattleScene','worshipBattleScene'])delete cache[name];const double=load('doubleBattleScene'),worship=load('worshipBattleScene');tournamentViews={themes:double.genData(),double:double.genWorshipData(1),doubleBattle:double.genBattleData(),worship:worship.genData(),worshipBattle:worship.genBattleData()};}
let eventViews;if(input.checkEvents){cc.ScrollView={};for(const name of ['dialPanel','dial2Panel','spActivityPanel','dreamExtActivityPanel','endlessRewardPanel','scorePointPanel'])delete cache[name];eventViews={dial:load('dialPanel').genData('luck'),pay:load('dial2Panel').genData(),sp:load('spActivityPanel').genData(),dream:load('dreamExtActivityPanel').genData(),repeat:load('endlessRewardPanel').genData(),score:load('scorePointPanel').genData()};}
let activityCalls;if(input.checkActivityCallbacks){activityCalls=[];cache.baseView.addLoading=()=>{};cache.baseView.addMessageBox=(message,yes)=>yes();cache.playerHandler.fillTaskActive=(name,cost,callback)=>{activityCalls.push({name,cost});callback({});};cache.playerHandler.fillLoginTopUp=(name,callback)=>{activityCalls.push({name});callback({});};delete cache.activityPanel;delete cache.dreamExtActivityPanel;const task=new (load('activityPanel'))();task.update_=()=>activityCalls.push({updated:'task'});task.onTaskActiveBuyActive_({target:{data:{activityName:'privateTask',maxActive:100,curActive:20}}});const login=new (load('dreamExtActivityPanel'))();login.update_=()=>activityCalls.push({updated:'login'});login.onBuyActive_({target:{data:{activityName:'privateLogin',maxPoint:7,curPoint:1}}});}
let point;
if(input.checkPoint)point=load('pointScene').genData();
let roles;if(input.checkRoles){if(!cache.roleItem.genData){delete cache.roleItem;load('roleItem');}roles=Object.values(player.team.roles).map(r=>load('roleItem').genData(r));}
player.destroy();process.stdout.write(JSON.stringify({snapshots,roleScenes,effects,topBar,quick,home,daily,point,roles,teamItems,friendship,arenaThree,guildView,bossViews,practiceViews,eyeView,endlessViews,expeditionViews,commerceViews,tournamentControls,resourceViews,entryViews,tournamentReplay,tournamentViews,eventViews,activityCalls,guildMemberIds:(player.guild?.members||[]).map(member=>member.playerId),rosterNavigationCount,rosterCachedIds:Object.keys(cache.sceneManager.teamData?.roleSceneMap||{}),gem:player.gem,bag:player.bag.items,team:player.team.roles}));
