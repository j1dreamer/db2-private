const fs=require('fs'),vm=require('vm'),assert=require('assert');
const input=JSON.parse(fs.readFileSync(0,'utf8')),source=input.source;
function factory(name){const begin=source.indexOf(name+': [ function('),start=source.indexOf('function(',begin),end=source.indexOf('cc._RF.pop();',start);return source.slice(start,end);}
// Run the real VIP onLoad method, stopping only at renderer boundaries.
const top=factory('topUpPanel');const method=top.slice(top.indexOf('onLoad: function() {')+'onLoad: '.length,top.indexOf('\nonDestroy:')).replace(/,\s*$/,'');
let scheduled,repaints=0,fade=0;const tween={to(){return this;},repeatForever(){return this;},start(){}};
const cc={tween:()=>tween};const view={goodsItem:{},newTextNode:{},textNode:{},giftItemItem:{},giftRoleItemNode:{},vipMoreSp:{},goodsScrollview:{},scheduleOnce(cb){scheduled=cb;},update_(){repaints++;}};
vm.runInNewContext('('+method+')',{cc,g:{},c:{scrollviewFadeIn(){fade++;}}}).call(view);assert.equal(view.isFadeIn,false);assert(scheduled);scheduled.call(view);assert.equal(view.isFadeIn,true);assert.equal(repaints,1);assert.equal(fade,1);
// Empty reward maps must not create a blocking panel, including cosmetic uses.
const base=factory('baseView'),at=base.indexOf('g.addRewardEffectPanel = function('),stop=base.indexOf('\n};',at)+3;const body=base.slice(at,stop);
let accesses=0;const ctx={g:{},cc:{director:{getScene(){accesses++;throw Error('Renderer accessed');}}}};vm.runInNewContext(body,ctx);ctx.g.addRewardEffectPanel({});ctx.g.addRewardEffectPanel(null);assert.equal(accesses,0);assert.throws(()=>ctx.g.addRewardEffectPanel({120:1}),/Renderer accessed/);
console.log(JSON.stringify({vipDeferredRepaint:true,emptyRewardDoesNotOpenOverlay:true,nonemptyRewardsStillUseOriginalRenderer:true}));
