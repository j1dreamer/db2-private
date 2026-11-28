const fs=require('fs'),vm=require('vm'),assert=require('assert'),source=JSON.parse(fs.readFileSync(0,'utf8')).source;
const start=source.indexOf('g.addSelectRewardPanel = function('),end=source.indexOf('\n};',start)+3;assert(start>=0);
const node={},calls=[];const g={addPanel(n){assert.equal(n,node);calls.push('open');},removePanel(n){assert.equal(n,node);calls.push('close');},addHintPanel(){calls.push('hint');}};
const cc={director:{getScene:()=>({getChildByName:()=>({getChildByName:()=>node})})}};
vm.runInNewContext(source.slice(start,end),{window:{DB2PrivateI18n:{t:()=> 'Chest unavailable'}},g,cc,p:{REWARD_PANEL:'reward'},e:name=>({genData2:()=>null})});g.addSelectRewardPanel(999);assert.deepEqual(calls,['open','close','hint']);console.log(JSON.stringify({depletedBoxPreviewCloses:true,noRenderOfNullData:true}));
