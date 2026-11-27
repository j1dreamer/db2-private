// Use a platform font for Vietnamese glyphs absent from bundled bitmap fonts.
(function () {
    function wrap(Type, method) {
        if (!Type || !Type.prototype || typeof Type.prototype[method] !== 'function') return;
        var original = Type.prototype[method];
        Type.prototype[method] = function () {
            if (!this.__db2FontBusy && (cc.sys.localStorage.getItem('defaultLanguage') || 'vi') === 'vi' && /[\u00c0-\u024f\u1e00-\u1eff]/.test(String(this.string || ''))) {
                this.__db2FontBusy = true;
                try { this.fontFamily = 'Arial'; this.useSystemFont = true; } finally { this.__db2FontBusy = false; }
            }
            return original.apply(this, arguments);
        };
    }
    wrap(cc.Label, '_forceUpdateRenderData');
    wrap(cc.RichText, '_updateRichTextStatus');
}());
