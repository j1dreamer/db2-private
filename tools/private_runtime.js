// Private client: persistent engine speed; network/event wall clocks stay unchanged.
(function () {
    var key = 'db2.private.gameSpeed';
    function valid(value) {
        value = Number(value);
        return isFinite(value) && Math.floor(value) === value && value >= 1 && value <= 10;
    }
    var saved = Number(cc.sys.localStorage.getItem(key));
    var rate = valid(saved) ? saved : 1;
    // Native bundle scripts load before Director.init creates its scheduler.
    // Bind lazily, then retry on scene launch; never abort bundle evaluation.
    var scheduler = null, setEngineScale = null, wrappedScale = null;
    var base = 1;
    var label = null, speedNode = null;
    var positionKey = 'db2.private.speedPosition.v1', savedPosition = null;
    try { var position = JSON.parse(cc.sys.localStorage.getItem(positionKey) || 'null');
        if (position && typeof position.x === 'number' && typeof position.y === 'number' && isFinite(position.x) && isFinite(position.y)) savedPosition = position;
    } catch (ignored) {}
    function clampPosition(node, canvas, x, y) {
        var maxX = Math.max(0, canvas.width / 2 - node.width / 2 - 8);
        var maxY = Math.max(0, canvas.height / 2 - node.height / 2 - 8);
        node.setPosition(Math.max(-maxX, Math.min(maxX, x)), Math.max(-maxY, Math.min(maxY, y)));
    }
    function remember(node, canvas) {
        savedPosition = { x: canvas.width ? node.x / canvas.width : 0, y: canvas.height ? node.y / canvas.height : 0 };
        cc.sys.localStorage.setItem(positionKey, JSON.stringify(savedPosition));
    }
    function stop(event) { if(event && event.stopPropagation)event.stopPropagation(); }
    function localPoint(canvas, event) {
        if (!event || !event.getLocation) return null;
        var p = event.getLocation();return canvas.convertToNodeSpaceAR ? canvas.convertToNodeSpaceAR(p) : p;
    }
    function bindScheduler() {
        var current = cc.director.getScheduler();
        if (!current || typeof current.setTimeScale !== 'function') return false;
        if (current === scheduler) return true;
        if (scheduler && scheduler.setTimeScale === wrappedScale) scheduler.setTimeScale = setEngineScale;
        scheduler = current;
        setEngineScale = current.setTimeScale;
        base = current.getTimeScale ? Number(current.getTimeScale()) : 1;
        if (!isFinite(base) || base < 0) base = 1;
        wrappedScale = function (value) {
            base = Number(value);
            if (!isFinite(base) || base < 0) base = 1;
            apply();
        };
        current.setTimeScale = wrappedScale;
        return true;
    }
    function apply() {
        if (bindScheduler()) setEngineScale.call(scheduler, Math.min(base * rate, 10));
    }
    var api = window.DB2PrivateRuntime = {
        getSpeed: function () { return rate; },
        setSpeed: function (value) {
            if (!valid(value)) throw new Error('Speed must be an integer from 1 to 10');
            rate = Number(value);cc.sys.localStorage.setItem(key, String(rate));
            apply();
            try {
                var battle = window.__require('battleScene').instance;
                if (battle && battle.areaNode) battle.areaNode.updateSpinesSpeed_();
            } catch (ignored) {}
            if (label) label.string = rate + 'x';
        },
        mount: function () {
            var canvas = cc.Canvas.instance && cc.Canvas.instance.node;
            if (!canvas) return;
            var existing = canvas.getChildByName('DB2PrivateSpeed');
            if (existing) { speedNode = existing;clampPosition(existing,canvas,savedPosition?savedPosition.x*canvas.width:existing.x,savedPosition?savedPosition.y*canvas.height:existing.y);return; }
            var node = new cc.Node('DB2PrivateSpeed');node.parent = canvas;speedNode = node;
            node.zIndex = 31000;node.setContentSize(84, 30);
            clampPosition(node, canvas, savedPosition ? savedPosition.x * canvas.width : canvas.width / 2 - 60,
                savedPosition ? savedPosition.y * canvas.height : canvas.height / 2 - 100);
            var graphics = node.addComponent(cc.Graphics);
            graphics.fillColor = cc.color(20, 30, 48, 235);
            graphics.roundRect(-42, -15, 84, 30, 6);graphics.fill();
            var text = new cc.Node();text.parent = node;
            label = text.addComponent(cc.Label);label.fontSize = 16;label.lineHeight = 20;label.string = rate + 'x';
            var touch = null;
            node.on(cc.Node.EventType.TOUCH_START, function (event) {
                stop(event);var p = localPoint(canvas, event);touch = p ? { x:p.x, y:p.y, nodeX:node.x, nodeY:node.y, moved:false } : null;
            });
            node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                stop(event);var p = localPoint(canvas, event);if (!touch || !p) return;
                var dx=p.x-touch.x, dy=p.y-touch.y;
                if (dx*dx+dy*dy > 36) touch.moved=true;
                if (touch.moved) clampPosition(node, canvas, touch.nodeX+dx, touch.nodeY+dy);
            });
            node.on(cc.Node.EventType.TOUCH_END, function (event) {
                stop(event);
                if (touch && touch.moved) remember(node,canvas);else api.setSpeed(rate % 10 + 1);
                touch=null;
            });
            node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) { stop(event);if(touch && touch.moved)remember(node,canvas);touch=null; });
        },
        getPosition: function () { return savedPosition ? {x:savedPosition.x,y:savedPosition.y} : null; },
        reportResponseError: function (route, error) {
            var message = 'Client response error [' + route + ']: ' + ((error && (error.stack || error.message)) || String(error));
            console.error(message);
            try {
                var view = window.__require('baseView');view.removeLoading();
                view.addHintPanel('Client error recorded. Return home or restart the game.');
            } catch (ignored) {}
            try { window.__require('helper').sendError(message); } catch (ignored) {}
        }
    };
    apply();
    cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () { api.mount();apply(); });
}());
