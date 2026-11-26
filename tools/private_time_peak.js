// Private control panel: the shipped archive has no Time Peak scene module.
(function () {
    var mapIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130], selectedMap = mapIds[0], panel = null, last = null;
    function req(name, args, callback) {
        window.__require('socket').request('logic.timePeakHandler.' + name, args || {}, function (data) {
            if (!data || data.code !== 200) return;
            last = data;
            if (callback) callback(data);
        });
    }
    function player() { return window.__require('serverMain').player; }
    function hint(text) { window.__require('baseView').addHintPanel(text); }
    function remove() { if (panel && cc.isValid(panel)) panel.destroy(); panel = null; }
    function button(root, text, x, y, run) {
        var node = new cc.Node();node.parent = root;node.setPosition(x, y);node.setContentSize(160, 44);
        var g = node.addComponent(cc.Graphics);g.fillColor = cc.color(39, 78, 113, 255);g.roundRect(-80, -22, 160, 44, 5);g.fill();
        var child = new cc.Node();child.parent = node;var label = child.addComponent(cc.Label);label.fontSize = 17;label.string = text;
        node.on(cc.Node.EventType.TOUCH_END, run);return node;
    }
    function refresh() {
        var s = player().timePeak;
        if (s.bmapId) req('openMap', { bmapId: s.bmapId }, draw);else draw();
    }
    function act(name, args) {
        req(name, args, function (data) {
            var rewards = data._temp && data._temp.entityCountMap;
            if (rewards && Object.keys(rewards).length) window.__require('baseView').addRewardPanel('Time Peak', rewards);
            draw();
        });
    }
    function draw() {
        remove();var p = player();if (!p) return;
        var canvas = cc.Canvas.instance && cc.Canvas.instance.node;if (!canvas) return;
        panel = new cc.Node('PrivateTimePeakPanel');panel.parent = canvas;panel.zIndex = 32000;panel.setContentSize(740, 370);panel.addComponent(cc.BlockInputEvents);
        var g = panel.addComponent(cc.Graphics);g.fillColor = cc.color(14, 28, 45, 250);g.roundRect(-370, -185, 740, 370, 12);g.fill();
        var title = new cc.Node();title.parent = panel;title.setPosition(0, 145);var label = title.addComponent(cc.Label);label.fontSize = 23;label.string = 'TIME PEAK - PRIVATE RULES';
        var s = p.timePeak, data = last && last._temp || {}, tile = data.currentTile;
        function text(value,y,size) { var n = new cc.Node();n.parent = panel;n.setPosition(0,y);var l=n.addComponent(cc.Label);l.fontSize=size||18;l.string=value;return l; }
        button(panel, 'Map ' + selectedMap, -260, 85, function () { selectedMap = mapIds[(mapIds.indexOf(selectedMap) + 1) % mapIds.length];draw(); });
        button(panel, 'Open / Refresh', -85, 85, function () { req('openMap', { bmapId: s.bmapId || selectedMap }, draw); });
        button(panel, 'Close map', 90, 85, function () { if (!s.bmapId) return;window.__require('baseView').addMessageBox('Reset this run? Claimed boxes stay claimed.',function(){act('closeMap', {});}); });
        button(panel, 'Close panel', 265, 85, remove);
        if (!s.bmapId) {text('Open a map after clearing its adventure unlock stage.', 10);text('Enemies and blessings use documented private settings.', -35, 16);return;}
        selectedMap = s.bmapId;
        if (data.mapComplete) {text('Map completed. Close it to select another map.', 0);return;}
        if (!tile) {text('Tap Open / Refresh to load this run.',0);return;}
        text('Map ' + s.bmapId + ' - Tile ' + tile.no + ' / ID ' + tile.kindId, 20);
        text('Temporary HP and borrowed heroes belong to this run.', -15, 16);
        if (tile.type === 1) {
            if (s.smapStatusMap[tile.kindId] === 2) {
                text('Battle won. Choose one passive blessing:', -55);
                [900001,900002,900003].forEach(function(id,i){button(panel,['Precision','Attack','Recovery'][i],(i-1)*190,-110,function(){act('selectBlessing',{smapId:tile.kindId,blessingId:id});});});
            } else button(panel, 'Select team / Fight', 0, -100, function () {
                var manager = window.__require('sceneManager'), selector = window.__require('selectBattleRolesScene');
                var constants = window.__require('battle.consts');remove();
                manager.pushScene(manager.NAME.SELECT_BATTLE_ROLES_SCENE, {type:selector.TYPE.TIME_PEAK_ATTACK_TEAM,opts:{smapId:tile.kindId,defenseTeam:data.defenseTeam,bgImgId:constants.EXPEDITION_IMG_IDS[0]}});
            });
        } else if (tile.type === 5) {
            text('Borrow one level 50 hero for this run:', -55);
            [1000001,1000002,1000003].forEach(function(id,i){button(panel,'Borrow '+(i+1),(i-1)*190,-110,function(){act('borrowRole',{smapId:tile.kindId,roleIdx:id});});});
        } else {
            var names={2:'Open chest',3:'Open box',4:'Heal 50%',6:'Revive 50%',7:'Continue',8:'Complete waypoint'};
            var routes={2:'openBox',3:'openBox',4:'spa',6:'altar',7:'setStatus',8:'setStatus'};
            button(panel,names[tile.type]||'Continue',0,-100,function(){act(routes[tile.type],{smapId:tile.kindId,status:2});});
        }
    }
    var api = window.DB2PrivateTimePeak = {
        mount: function () {
            var p;try { p=player(); } catch(ignored) { return; }
            if (!p || p.level < 50) return;
            var canvas=cc.Canvas.instance && cc.Canvas.instance.node;if(!canvas || canvas.getChildByName('PrivateTimePeakButton')) return;
            var node=button(canvas,'Time Peak',canvas.width/2-100,canvas.height/2-150,function(){selectedMap=p.timePeak.bmapId||selectedMap;refresh();});node.name='PrivateTimePeakButton';node.zIndex=31000;
        }, show: refresh
    };
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH,function(){panel=null;api.mount();});
}());
