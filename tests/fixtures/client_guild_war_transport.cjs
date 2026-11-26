// Invoke the exact two source switch branches; no renderer or socket transport.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const input=JSON.parse(fs.readFileSync(0,'utf8'));let checked=0;
for(const [name,alias]of [['newGuildBattle','b'],['activityGuildBattle','v']]){
 const start=input.source.indexOf(alias+'.choose(this.statusData.opts.defenderId, this.data.selectIdxs, this.data.selectShipIdxs, function(e) {'),end=input.source.indexOf('\nbreak;',start),branch=input.source.slice(start,end);let scene;
 const view={statusData:{opts:{defenderId:6}},data:{selectIdxs:[1,2,3,4,5],selectShipIdxs:[]}};const player={extra:{[name]:{battleInfo:{attackTimes:3}}}};const main={diedNum:0,damageMap:{},pkBattleInstant:(a,b,seed)=>{assert.equal(seed,123);return {seed,isWin:true}}};const handler={choose:(id,roles,ships,cb)=>cb({_temp:{attackTeam:{playerId:1,roles:[],ships:[]},defenseTeam:{playerId:6,roles:[],ships:[]},seed:123}}),challenge:(id,died,cb)=>{assert.equal(id,6);assert.equal(died,0);player.extra[name].battleInfo.attackTimes=3;cb({_temp:{attackTimes:3}})}};
 const context={[alias]:handler,r:view,m:{player},d:main,l:{clone:x=>JSON.parse(JSON.stringify(x))},s:{addLoading(){},preload:(infos,cb)=>cb()},F:{buildBattleTeam:()=>({roles:[{kindId:100101}]}),getPreLoadInfos:()=>[]},t:{map:(list,fn)=>list.map(fn)},c:{GUILD_BATTLE_IMG_IDS:[101],BATTLE_TYPE:{ARENA_PK:1}},K:{NAME:{BATTLE_SCENE:'battle'},pushScene:(name,data)=>{scene=data}}};
 vm.runInNewContext('(function(){'+branch+'})',context).call(view);assert.equal(player.extra[name].battleInfo.attackTimes,3);assert.equal(scene.opts.seed,123);checked++;
}
process.stdout.write(JSON.stringify({checked}));
