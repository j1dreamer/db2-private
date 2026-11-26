// The generated dictionary marks ENG Vietnamese vs newly authored translations.
(function () {
    var store = cc.sys.localStorage;
    if (store.getItem('db2.private.localeBaseline') !== 'longzhidao-17327-vi1') {
        store.setItem('defaultLanguage', 'vi');
        store.setItem('db2.private.localeBaseline', 'longzhidao-17327-vi1');
    }
    window.DB2PrivateLocale = {
        apply: function () {
            var language = window.__require('language');
            language.vi = JSON.parse(JSON.stringify(window.DB2_PRIVATE_VI));
            var selected = store.getItem('defaultLanguage') || 'vi';
            window.__require('buildExt').setLanguage(selected);
        },
        choose: function (language) {
            store.setItem('defaultLanguage', language);
            cc.game.restart();
        }
    };
}());
