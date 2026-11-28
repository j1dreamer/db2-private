# v18 · Input, language and font repair

The v17 auto counter only proved that its timer dispatched events. It did not prove a game control received them. v18 uses the original Cocos node listeners, sorted by their scene priority, with the original hit test and mask checks. It retains the selected listener from touch-down through move/release/cancel. It does not call game RPCs or invoke button actions directly.

- Creating a quick single/multiple-point plan now waits for an explicit tap on the desired game button. It no longer silently puts the first point in the middle of the screen.
- A missed target stops playback and shows an error. A separate confirmed-touch count increases after a completed gesture over a valid game node.
- Tests execute recovered original Cocos Node J/K callbacks and Button `_onTouchBegan`/`_onTouchEnded`. They assert that click handlers run twice, presses persist until release, and an empty point does not activate a handler.
- The original background pause, scene handling, record, saved plans and entitlement behavior remain tested. Native-device verification is still required; this is not a claim of testing on the user's iPhone.

## Localization

All new controls use keys from `tables/localization/private-ui.json`. English and Vietnamese are selected from the same `defaultLanguage` setting as the original client. Generated plan names are localized separately from names entered by the user.

SP #724 and the known 20-choice SP #351 preset receive localized names/descriptions from data identity, including old #351 instances whose server text was already Vietnamese. Arbitrary administrator-authored names are preserved. The extra authored chest-description paragraph is removed; source descriptions and source icon quantity labels are retained.

## Fonts

The original regular TTF (FZZhunYuan-M02) is reused by asset path. The original bold/regular assets in the APK/IPA are unchanged. Their Vietnamese cmap gaps are recorded in `client/fonts/provenance.json`.

The X7 `baseView.fixFont` routine disables the label cache; it does not add Vietnamese glyphs. That cache policy is used without forcing canvas text or Arial globally. Vietnamese uses a packaged Noto Sans Regular TTF with Vietnamese coverage (SIL OFL, license included). Font loading uses the native asset loader, offline; no external font service. English source labels keep their original font; new English controls use the original regular font. Source label sizes, spacing/layout and rich-text semantics remain intact.

Install/sign APK/IPA v18 to get the changes. Current v17 server remains compatible with this client; updating the VPS is optional for these UI repairs. New server build: `eng-sp-sss-input-locale-v18`, schema 30. Account balances and inventory are not reset. Downloaded JavaScript execution remains disabled.
