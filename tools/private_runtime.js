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
    var label = null;
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
            if (label) label.string = 'Speed ' + rate + 'x';
        },
        mount: function () {
            var canvas = cc.Canvas.instance && cc.Canvas.instance.node;
            if (!canvas || canvas.getChildByName('DB2PrivateSpeed')) return;
            var node = new cc.Node('DB2PrivateSpeed');node.parent = canvas;
            node.zIndex = 31000;node.setContentSize(130, 42);
            node.setPosition(canvas.width / 2 - 85, canvas.height / 2 - 100);
            var graphics = node.addComponent(cc.Graphics);
            graphics.fillColor = cc.color(20, 30, 48, 235);
            graphics.roundRect(-65, -21, 130, 42, 8);graphics.fill();
            var text = new cc.Node();text.parent = node;
            label = text.addComponent(cc.Label);label.fontSize = 20;label.lineHeight = 25;
            label.string = 'Speed ' + rate + 'x';
            node.on(cc.Node.EventType.TOUCH_END, function () { api.setSpeed(rate % 10 + 1); });
        },
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
