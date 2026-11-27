// Authored quantity/close controls around the original ENG reward panel and RPCs.
(function () {
    function dimensions(view) { var c=cc.Canvas.instance&&cc.Canvas.instance.node;return {w:view.node.width||c&&c.width||960,h:view.node.height||c&&c.height||640}; }
    function label(parent,text,size,x,y,width,height) {
        var n=new cc.Node();n.active=false;n.setPosition(x||0,y||0);
        var l=n.addComponent(cc.Label);l.enabled=false;
        l._forceUseCanvas=true;l.font=null;l.fontFamily='Arial';l.useSystemFont=true;
        l.fontSize=size||18;l.lineHeight=(size||18)+4;l.overflow=cc.Label.Overflow.CLAMP;l.enableWrapText=true;
        l.horizontalAlign=1;l.verticalAlign=1;l.cacheMode=cc.Label.CacheMode?cc.Label.CacheMode.NONE:0;
        l.string=String(text);n.color=cc.color(238,245,255,255);n.opacity=255;
        n.setContentSize(width||680,height||(size||18)+10);n.parent=parent;l.enabled=true;n.active=true;return l;
    }
    function button(parent,text,x,y,width,cb) {
        var n=new cc.Node();n.parent=parent;n.setPosition(x,y);n.setContentSize(width,36);var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(27,48,70,245);g.roundRect(-width/2,-18,width,36,5);g.fill();
        var l=label(n,text,17,0,0,width-8,28);n.on(cc.Node.EventType.TOUCH_END,function(event){if(event&&event.stopPropagation)event.stopPropagation();cb();});return l;
    }
    function quantity(node,value) {
        var target=node.getChildByName('item_item')||node;
        var original=target.getComponent('itemItem2')||target.getComponent('itemItem');
        if(original&&original.setCountLabelActive_)original.setCountLabelActive_(false);
        var n=node.getChildByName('DB2BoxQuantity');
        if(!n){n=new cc.Node('DB2BoxQuantity');n.parent=node;n.zIndex=100;n.setPosition(0,-(node.height||100)/2+12);var g=n.addComponent(cc.Graphics);g.fillColor=cc.color(5,18,30,230);g.roundRect(-42,-12,84,24,4);g.fill();n._label=label(n,'',16,0,0,78,22);}
        n.active=true;n._label.string='×'+value;
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
        var size=dimensions(view);button(root,'×',size.w/2-33,size.h/2-33,42,closeAction);return {root:root,size:size};
    }
    function description(extra,original) {
        extra=extra||{};
        var fixed=extra.dropListDesc||'',random=extra.rdDropListDesc||'',select=Number(extra.selectCount)||0;
        var rule=!fixed&&!random?'Chưa có cấu hình thưởng để xác định nội dung rương.':select?'Mở 1 rương: chọn '+select+' loại phần thưởng.':random?'Mở 1 rương: nhận thưởng ngẫu nhiên theo cấu hình rương.':'Mở 1 rương: nhận toàn bộ phần thưởng liệt kê.';
        if(fixed&&random&&!select)rule='Mở 1 rương: nhận phần thưởng cố định và phần thưởng ngẫu nhiên theo cấu hình.';
        var counts=[],parts=String(select?fixed:fixed||random).split(',');
        parts.forEach(function(part){var m=part.trim().match(/x(\d+)(?:_[WR][\d.]+)?$/);if(m&&counts.indexOf(Number(m[1]))<0)counts.push(Number(m[1]));});
        if(counts.length===1)rule+=' Mỗi '+(select?'lựa chọn':'ô thưởng')+' có ×'+counts[0]+'.';
        else if(counts.length>1)rule+=' Số lượng từng phần thưởng ghi ×N trên mỗi ô.';
        if(random&&!select)rule+=' Các ô ngẫu nhiên là khả năng nhận, không đảm bảo nhận tất cả.';
        return rule+(original?'\n'+original:'');
    }
    var api=window.DB2PrivateBox={
        describe:description,
        attach:function(view) {
            var ui=tools(view,function(){close(view);}),data=view.data,box=data.privateBoxInfo;
            view._db2BoxInfo=null;view._db2BoxOpen=null;
            if(view.canSelect){
                // Keep the original ENG selection, quantity buttons and confirm action.
                view._db2BoxInfo=label(ui.root,'',16,0,ui.size.h/2-70,Math.min(680,ui.size.w-100),28);
                if(view.useCountNode)view.useCountNode.active=true;
                if(view.yesBt)view.yesBt.active=true;
                count(view,data.useCount||1);
            } else {
                if(view.yesBt)view.yesBt.active=true;
                if(box){
                    var preview=new cc.Node();preview.parent=ui.root;preview.setPosition(0,-ui.size.h/2+67);preview.scale=Math.min(1,(ui.size.w-36)/680);
                    var owned=Number(box.bagIndex)>0 && Number(box.count)>0;
                    label(preview,owned?'Đang có '+box.count+' rương · Số trên ô là thưởng của 1 rương.':'Số trên mỗi ô là phần thưởng của 1 rương.',18,0,25);
                    if(owned && box.selectCount)button(preview,'Chọn phần thưởng & mở',0,-17,330,function(){
                        var idx=box.bagIndex;close(view);var base=window.__require('baseView');
                        if(box.isExchange)base.addExchangeBoxPanel(idx);else base.addSelectRewardPanel(idx);
                    });
                }
                rowQuantities(view,1);
            }
        },
        refresh:function(view) {
            if(!view||!view.data)return;
            var amount=Math.max(1,Number(view.data.useCount)||1),selected=(view.selectBagIdxs||[]).length;
            if(view._db2BoxInfo)view._db2BoxInfo.string='Đang có: '+view.data.count+' rương · Mở: '+amount+' · Đã chọn: '+selected+'/'+view.data.selectCount;
            if(view._db2BoxOpen)view._db2BoxOpen.string='Mở '+amount+' rương';
            rowQuantities(view,view.canSelect?amount:1);
        },
        attachEffect:function(view){tools(view,function(){view.onTouch_();});rowQuantities(view,1);},
        attachExchange:function(view){
            var ui=tools(view,function(){view.onClose_();}),size=ui.size,selected=0,total=0;
            (view.data.exchangeItems||[]).forEach(function(row,index){var n=view.rewardIdxCountMap[index]||0;selected+=n;total+=n*(row.privateRewardCount||1);});
            var root=ui.root;label(root,'Đã chọn '+selected+'/'+view.data.canUseCount+' lượt · Tổng nhận '+total,18,0,-size.h/2+82);
            Object.keys(view.exchangeItemMap||{}).forEach(function(key){var node=view.exchangeItemMap[key],row=node.data;if(node.active&&row)node.getChildByName('count_label').getComponent(cc.Label).string='Chọn '+row.count+' · Nhận '+row.count*(row.privateRewardCount||1);});
        },
        setCount:count
    };
}());
