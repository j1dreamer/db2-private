// Authored quantity/close controls around the original ENG reward panel and RPCs.
(function () {
    function dimensions(view) { var c=cc.Canvas.instance&&cc.Canvas.instance.node;return {w:view.node.width||c&&c.width||960,h:view.node.height||c&&c.height||640}; }
    function label(parent,text,size,x,y,width,height) {
        var n=new cc.Node();n.active=false;n.setPosition(x||0,y||0);
        var l=n.addComponent(cc.Label);l.enabled=false;

        l.fontSize=size||18;l.lineHeight=(size||18)+4;l.overflow=cc.Label.Overflow.CLAMP;l.enableWrapText=true;
        l.horizontalAlign=1;l.verticalAlign=1;l.cacheMode=cc.Label.CacheMode?cc.Label.CacheMode.NONE:0;
        l.string=String(text);n.color=cc.color(238,245,255,255);n.opacity=255;
        n.setContentSize(width||680,height||(size||18)+10);n.parent=parent;l.enabled=true;n.active=true;if(window.DB2PrivateFonts)window.DB2PrivateFonts.custom(l);return l;
    }
    function button(parent,text,x,y,width,cb) {
        var n=new cc.Node();n.parent=parent;n.setPosition(x,y);n.setContentSize(width,36);var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(27,48,70,245);g.roundRect(-width/2,-18,width,36,5);g.fill();
        var l=label(n,text,17,0,0,width-8,28);n.on(cc.Node.EventType.TOUCH_END,function(event){if(event&&event.stopPropagation)event.stopPropagation();cb();});return l;
    }
    function quantity(node,value) {
        var target=node.getChildByName('item_item')||node.getChildByName('role_item')||node;
        var original=target.getComponent('itemItem2')||target.getComponent('itemItem');
        var l=original&&original.countLabel;
        if(l){
            original.setCountLabelActive_&&original.setCountLabelActive_(true);
            l.string='×'+value;
            l.fontSize=17;l.lineHeight=20;
            return;
        }
        var n=target.getChildByName('DB2BoxQuantity');
        if(!n){n=new cc.Node('DB2BoxQuantity');n.parent=target;n.zIndex=100;
            n.setPosition((target.width||80)/2-24,-(target.height||80)/2+12);
            n._label=label(n,'',17,0,0,48,24);
            if(cc.LabelOutline){var outline=n.addComponent(cc.LabelOutline);outline.color=cc.color(0,0,0,255);outline.width=2;}
        }
        n.active=true;n._label.string='×'+value;
    }
    function compact(view) {
        ['roleItemNodeMap','itemItemMap'].forEach(function(map){Object.keys(view[map]||{}).forEach(function(k){
            var node=view[map][k],target=node.getChildByName('item_item')||node.getChildByName('role_item');
            if(!node.active||!target)return;
            var nameNode=node.getChildByName('name_label'),l=nameNode&&nameNode.getComponent(cc.Label);
            if(l){l.string=String(l.string||'');l.fontSize=14;l.lineHeight=17;l.enableWrapText=true;
                l.overflow=cc.Label.Overflow.SHRINK===undefined?cc.Label.Overflow.CLAMP:cc.Label.Overflow.SHRINK;
                nameNode.setContentSize(node.width||100,42);nameNode.setPosition(target.x||0,(target.y||0)-(target.height||80)/2-23);}
            var select=node.getChildByName('select_bt');
            if(select){select.setPosition((target.x||0)+(target.width||80)/2-12,(target.y||0)+(target.height||80)/2-12);
                var bg=cc.Sprite&&select.getComponent(cc.Sprite);if(bg)bg.enabled=false;}
            if(node.setContentSize)node.setContentSize(node.width||100,142);
        });});
        if(view.itemItemsLayout&&cc.Layout){var layout=view.itemItemsLayout.getComponent(cc.Layout);if(layout){layout.spacingY=8;if(layout.cellSize)layout.cellSize.height=142;layout.updateLayout&&layout.updateLayout();}}
        if(view.yesBt&&view.useCountNode&&view.yesBt.setPosition){
            var pos=view.useCountNode.position;
            if(view.useCountNode.convertToWorldSpaceAR&&view.yesBt.parent&&view.yesBt.parent.convertToNodeSpaceAR)pos=view.yesBt.parent.convertToNodeSpaceAR(view.useCountNode.convertToWorldSpaceAR(cc.v2(0,0)));
            if(pos)view.yesBt.setPosition(pos);
        }
    }
    function rowQuantities(view,multiplier) {
        ['roleItemNodeMap','itemItemMap'].forEach(function(map){var nodes=view[map]||{};Object.keys(nodes).forEach(function(key){var node=nodes[key];if(node.active&&node.data){var count=node.data.privateRewardCount;if(count===undefined)count=node.data.count;if(count!==undefined)quantity(node,Number(count)*multiplier);}});});
    }
    function count(view,value) {
        var max=Math.min(1000,Math.max(1,Number(view.data.count)||1));view.data.useCount=Math.max(1,Math.min(max,Math.floor(Number(value)||1)));
        if(view.useCountlabel)view.useCountlabel.string=String(view.data.useCount);api.refresh(view);
    }
    function close(view) {
        // The explicit X cancels the full box popup, including a nested preview.
        view._saveData=null;view._inSave=false;view.onClose_();
    }
    function tools(view,closeAction) {
        var old=view.node.getChildByName('DB2BoxTools');if(old){old.active=false;if(old.removeFromParent)old.removeFromParent();else old.parent=null;old.destroy();}var root=new cc.Node('DB2BoxTools');root.parent=view.node;root.zIndex=30000;
        var size=dimensions(view);if(!view.onClose_)button(root,'×',size.w/2-33,size.h/2-33,42,closeAction);return {root:root,size:size};
    }
    function description(extra,original) {
        return original||'';
    }
    var api=window.DB2PrivateBox={
        describe:description,
        attach:function(view) {
            var ui=tools(view,function(){close(view);}),data=view.data,box=data.privateBoxInfo;
            view._db2BoxInfo=null;view._db2BoxOpen=null;
            if(view.canSelect){
                // Keep the original ENG selection, quantity buttons and confirm action.
                if(view.useCountNode)view.useCountNode.active=false;
                if(view.yesBt)view.yesBt.active=true;
                count(view,1);compact(view);
            } else {
                if(view.yesBt)view.yesBt.active=true;
                if(box){
                    var preview=new cc.Node();preview.parent=ui.root;preview.setPosition(0,-ui.size.h/2+67);preview.scale=Math.min(1,(ui.size.w-36)/680);
                    var owned=Number(box.bagIndex)>0 && Number(box.count)>0;
                    label(preview,owned?window.DB2PrivateI18n.t("box.014")+box.count+window.DB2PrivateI18n.t("box.015"):window.DB2PrivateI18n.t("box.016"),18,0,25);
                    if(owned && box.selectCount)button(preview,window.DB2PrivateI18n.t("box.017"),0,-17,330,function(){
                        var idx=box.bagIndex;close(view);var base=window.__require('baseView');
                        if(box.isExchange)base.addExchangeBoxPanel(idx);else base.addSelectRewardPanel(idx);
                    });
                }
                rowQuantities(view,1);compact(view);
            }
        },
        refresh:function(view) {
            if(!view||!view.data)return;
            var amount=Math.max(1,Number(view.data.useCount)||1),selected=(view.selectBagIdxs||[]).length;
            if(view._db2BoxInfo)view._db2BoxInfo.string=window.DB2PrivateI18n.t("box.018")+view.data.count+window.DB2PrivateI18n.t("box.019")+amount+window.DB2PrivateI18n.t("box.020")+selected+'/'+view.data.selectCount;
            if(view._db2BoxOpen)view._db2BoxOpen.string=window.DB2PrivateI18n.t("box.021")+amount+window.DB2PrivateI18n.t("box.022");
            rowQuantities(view,view.canSelect?amount:1);
        },
        attachEffect:function(view){tools(view,function(){view.onTouch_();});rowQuantities(view,1);},
        attachExchange:function(view){
            var ui=tools(view,function(){view.onClose_();}),size=ui.size,selected=0,total=0;
            (view.data.exchangeItems||[]).forEach(function(row,index){var n=view.rewardIdxCountMap[index]||0;selected+=n;total+=n*(row.privateRewardCount||1);});
            var root=ui.root;
            Object.keys(view.exchangeItemMap||{}).forEach(function(key){var node=view.exchangeItemMap[key],row=node.data;if(node.active&&row){quantity(node,row.privateRewardCount||1);node.getChildByName('count_label').getComponent(cc.Label).string=String(row.count);}});
        },
        setCount:count
    };
}());
