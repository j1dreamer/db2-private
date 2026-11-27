// Private startup probe: always finish, then return to the editable login scene.
(function () {
    window.DB2PrivateConnection = {
        probe: function (url, done) {
            var match = /^(https?):\/\/([^\s/:?#]+)(?::(\d{1,5}))?$/.exec(String(url || ''));
            if (!match || /\.invalid$/.test(match[2]) || match[3] && (+match[3] < 1 || +match[3] > 65535)) {
                done('Chưa có địa chỉ server hợp lệ. Nhập http://IP-TAILSCALE:20003.'); return;
            }
            var xhr = new XMLHttpRequest(), settled = false, timer;
            function finish(error, data) {
                if (settled) return;
                settled = true; clearTimeout(timer);
                try { xhr.abort(); } catch (ignored) {}
                done(error, data);
            }
            var error = 'Không kết nối được ' + url + '. Kiểm tra IP, server và Tailscale rồi thử lại.';
            timer = setTimeout(function () { finish('Hết thời gian kết nối (8 giây). Kiểm tra IP, server và Tailscale.'); }, 8000);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4 || settled) return;
                if (xhr.status !== 200) { finish(error); return; }
                var data;
                try { data = JSON.parse(xhr.responseText); } catch (ignored) { finish('Địa chỉ trả về dữ liệu không phải server DB2. Kiểm tra lại IP và cổng.'); return; }
                if (!data || typeof data !== 'object' || !data.runScriptInfo || !Array.isArray(data.inReviewPackageInfos)) {
                    finish('Địa chỉ không phải server DB2 tương thích. Kiểm tra lại IP và cổng.'); return;
                }
                finish(null, data);
            };
            xhr.onerror = function () { finish(error); };
            xhr.ontimeout = function () { finish('Hết thời gian kết nối (8 giây). Kiểm tra IP, server và Tailscale.'); };
            try {
                var platform = cc.sys.os === cc.sys.OS_IOS ? 'ios' : 'android';
                xhr.open('GET', url + '/user/clientConfig?platform=' + platform, true);
                xhr.timeout = 8000; xhr.send();
            } catch (ignored) { finish(error); }
        }
    };
}());
