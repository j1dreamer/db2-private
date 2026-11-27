const fs=require('fs'),vm=require('vm'),assert=require('assert');const supplied=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):fs.readFileSync(__dirname+'/../../tools/private_ui.js','utf8');
const first=[];let activated=0;
class Node{
 constructor(){this.children=[];this.components=[];this._active=true;this.width=0;this.height=0;}
 set active(v){const before=this.activeInHierarchy;this._active=v;if(!before&&this.activeInHierarchy)this.activate();}get active(){return this._active;}
 get activeInHierarchy(){return this._active&&!!this._parent&&this._parent.activeInHierarchy;}
 set parent(p){this._parent=p;p.children.push(this);if(this.activeInHierarchy)this.activate();}get parent(){return this._parent;}
 activate(){this.components.forEach(c=>{if(c.enabled)c.onEnable();});this.children.forEach(c=>{if(c.active)c.activate();});}
 addComponent(T){const c=new T();c.node=this;this.components.push(c);if(this.activeInHierarchy&&c.enabled)c.onEnable();return c;}
 setContentSize(w,h){this.width=w;this.height=h;}setPosition(){}on(){}getChildByName(){return null;}
}
Node.EventType={SIZE_CHANGED:'size',ANCHOR_CHANGED:'anchor',COLOR_CHANGED:'color'};
class Label{
 constructor(){this.enabled=true;this.string='';this.overflow=0;this.fontSize=40;this.useSystemFont=true;this._forceUseCanvas=false;}
 _super(){}setVertsDirty(){} _nodeSizeChanged(){} _nodeColorChanged(){}
 _forceUpdateRenderData(){if(!this.seen){this.seen=true;first.push({width:this.node.width,height:this.node.height,string:this.string,overflow:this.overflow,canvas:this._forceUseCanvas});}activated++;}
}
Label.Overflow={CLAMP:1,SHRINK:2};Label.CacheMode={NONE:0};const cc={Node,Label,color:(...rgba)=>rgba};
Label.prototype.onEnable=vm.runInNewContext(fs.readFileSync(__dirname+'/cocos_label_enable.js','utf8'),{cc});
class EditBox{constructor(){this.enabled=true;}onEnable(){}}EditBox.InputMode={ANY:0};EditBox.LineType={SINGLE_LINE:0};EditBox.InputFlag={DEFAULT:0};cc.EditBox=EditBox;cc.Graphics=class {roundRect(){}fill(){}};
const root=new Node();Object.defineProperty(root,'activeInHierarchy',{get:()=>true});cc.Canvas={instance:{node:root}};const ctx=vm.createContext({cc,window:{}});vm.runInContext(supplied,ctx);
const ui=ctx.window.DB2PrivateUI;
for(const text of ['Server riêng','Đóng','Tốc độ','Auto','Ghi','0','http://100.1.2.3:20003']){
 const l=ui.text(root,text,18,0,0,240,36);const snapshot=first[first.length-1];assert.equal(snapshot.string,text);assert.equal(snapshot.width,240);assert.equal(snapshot.height,36);assert.equal(snapshot.overflow,1);assert(snapshot.canvas);assert.equal(l.fontSize,18);assert.equal(l.node.opacity,255);
}
const edit=ui.edit(root,0,240,0,0);assert.equal(edit.string,'0');assert(edit.textLabel._forceUseCanvas);assert(edit.placeholderLabel._forceUseCanvas);assert(edit.textLabel.node.width>0);assert(edit.placeholderLabel.node.height>0);
vm.runInContext(fs.readFileSync(__dirname+'/../../tools/private_box.js','utf8'),ctx);
ctx.window.DB2PrivateBox.attach({node:root,data:{count:12,useCount:1,selectCount:1},canSelect:true,selectBagIdxs:[],roleItemNodeMap:{},itemItemMap:{},useCountNode:{},yesBt:{},useCountlabel:{},onClose_(){},onYes_(){}});
for(const snapshot of first){assert(snapshot.width>0&&snapshot.height>0);assert(snapshot.canvas);assert.equal(snapshot.overflow,1);}
console.log(JSON.stringify({label_enable_runs_only_after_configuration:true,fixed_nonzero_bounds:true,no_shrink_mode:true,canvas_text_path:true,box_labels_configured_before_activation:true,ascii_vietnamese_url_and_zero_labels:7,input_labels_configured:true,activation_count:activated}));
