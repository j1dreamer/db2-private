// Private startup probe: always finish, then return to the editable login scene.
(function () {
    window.DB2PrivateConnection = {
        isNetworkMessage: function (message) {
            return /mạng.*(kết nối|khả dụng|lỗi)|mất kết nối|kết nối.*(thất bại|lỗi)|network.*(unavailable|error|disconnect)|connection.*(fail|lost)|网络|连接失败|无法连接服务器|连接超时/i.test(String(message || ''));
        },
        recover: function (message) {
            if (this.recovering) return;
            this.recovering=true;
            var self=this;
            try {
                window.DB2_PRIVATE_CONNECTION_ERROR=String(message || window.DB2PrivateI18n.t("connection.001"));
                if(window.DB2PrivateAuto){window.DB2PrivateAuto.finishRecord();window.DB2PrivateAuto.stop();}
                var server=window.__require('serverMain'),socket=window.__require('socket');
                server.uid=null;server.isReconnected=true;socket.queue=[];socket.requestTime=null;socket.isConnected=false;
                clearTimeout(socket._reconnectInterval);socket._reconnectInterval=null;socket.disconnect();server.isReconnected=false;
                var view=window.__require('baseView');view.removeLoading();
                var canvas=cc.Canvas.instance&&cc.Canvas.instance.node;
                if(canvas){
                    ['100001','100002'].forEach(function(name){var n=canvas.getChildByName(name);if(n){n.active=false;n.destroy();}});
                    var mask=canvas.getChildByName('100003');if(mask)mask.active=false;
                }
                var scenes=window.__require('sceneManager');
                if(scenes.getCurSceneInfo().name!==scenes.NAME.LOGIN_SCENE)scenes.popToLoginScene();
                else if(window.DB2PrivateOpenServer)window.DB2PrivateOpenServer(window.DB2_PRIVATE_CONNECTION_ERROR);
            } catch (ignored) { if(window.DB2PrivateOpenServer)window.DB2PrivateOpenServer(window.DB2_PRIVATE_CONNECTION_ERROR); } finally { setTimeout(function(){self.recovering=false;},1000); }
        },
        probe: function (url, done) {
            var match = /^(https?):\/\/([^\s/:?#]+)(?::(\d{1,5}))?$/.exec(String(url || ''));
            if (!match || /\.invalid$/.test(match[2]) || match[3] && (+match[3] < 1 || +match[3] > 65535)) {
                done(window.DB2PrivateI18n.t("connection.002")); return;
            }
            var xhr = new XMLHttpRequest(), settled = false, timer;
            function finish(error, data) {
                if (settled) return;
                settled = true; clearTimeout(timer);
                try { xhr.abort(); } catch (ignored) {}
                done(error, data);
            }
            var error = window.DB2PrivateI18n.t("connection.003") + url + window.DB2PrivateI18n.t("connection.004");
            timer = setTimeout(function () { finish(window.DB2PrivateI18n.t("connection.005")); }, 8000);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4 || settled) return;
                if (xhr.status !== 200) { finish(error); return; }
                var data;
                try { data = JSON.parse(xhr.responseText); } catch (ignored) { finish(window.DB2PrivateI18n.t("connection.006")); return; }
                if (!data || typeof data !== 'object' || !data.runScriptInfo || !Array.isArray(data.inReviewPackageInfos)) {
                    finish(window.DB2PrivateI18n.t("connection.007")); return;
                }
                finish(null, data);
            };
            xhr.onerror = function () { finish(error); };
            xhr.ontimeout = function () { finish(window.DB2PrivateI18n.t("connection.005")); };
            try {
                var platform = cc.sys.os === cc.sys.OS_IOS ? 'ios' : 'android';
                xhr.open('GET', url + '/user/clientConfig?platform=' + platform, true);
                xhr.timeout = 8000; xhr.send();
            } catch (ignored) { finish(error); }
        }
    };
}());
