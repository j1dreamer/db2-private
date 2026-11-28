const fs=require('fs'),assert=require('assert');
process.env.DB2_QA_LANGUAGE='en';const original=fs.readFileSync(__dirname+'/client_controls.cjs','utf8'),prefix=original.slice(0,original.indexOf('function scene(){'));
const test=`
auto.mount();auto.openQuick();
function texts(n){return n.components.filter(c=>c instanceof Label).map(l=>String(l.string||'')).concat(...n.children.map(texts));}
let strings=texts(canvas);assert(strings.includes('Auto in game'));assert(strings.includes('Single'));assert(!strings.some(s=>/[\\u0102\\u0103\\u0110\\u0111\\u01a0\\u01a1\\u01af\\u01b0\\u1ea0-\\u1ef9]/.test(s)));
function tap(text){const find=n=>n.components.some(c=>c instanceof Label&&c.string===text)?n:n.children.map(find).find(Boolean);const n=find(canvas);assert(n,text);n.parent.events.end({stopPropagation(){}});}
tap('Single');assert(auto.getState().picking);const picker=listeners.find(l=>l.swallowTouches);assert(picker.onTouchBegan(new Touch(200,50,3)));assert.equal(auto.getDraft().points.length,1);assert.equal(auto.getDraft().nameKey,'auto.defaultSingle');
saved.defaultLanguage='vi';auto.openQuick();strings=texts(canvas);assert(strings.includes('Auto trong game'));assert(strings.includes('Một điểm'));assert(strings.some(s=>s.includes('Auto một điểm')));
saved.defaultLanguage='en';auto.openQuick();strings=texts(canvas);assert(strings.some(s=>s.includes('Auto single point')));assert(!strings.some(s=>s.includes('Auto một điểm')));
console.log('English/Vietnamese controls, localized default names and explicit target picking passed');
`;
new Function('require','__dirname',prefix+test)(require,__dirname);
