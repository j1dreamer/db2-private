// Execute the real generated logo/login/SDK setup boundaries without rendering.
const fs=require('fs'),vm=require('vm'),input=JSON.parse(fs.readFileSync(0,'utf8'));
let network=0,next=0,nativeCalls=0,frame;
const server={url:'http://db2-server.invalid:20003',staticUrl:'http://db2-server.invalid:20003'};
const sdk={packageInfo:'DB2-private-dev'};
const cache={underscore:{include:()=>false},resource:{},async:{},encoding:{},md5:{},pako:{},buildExt:{},http:{request(){network++;}},helper:{},i18n:{t:x=>x},data:{},dataApi:{},cryptoApi:{},
baseView:{removeLoading(){},addLoading(){}},serverConfig:{},serverMain:server,sceneManager:{},util:{},socket:{},player:{},xxhash:{h32:()=>({})},soundApi:{},playerHandler:{},noticePanel:{},querystring:{},'underscore.string':{}};
const cc={Component:{},_RF:{push(mod){frame=mod;},pop(){}},Class:def=>{frame.exports=def;return def;}};
const context={window:{},cc,console:{log(){}},sdkApi:sdk,storage:{getItem(){return null;}},jsb:{reflection:{callStaticMethod(){nativeCalls++;}}}};
function load(name){
 if(name in cache)return cache[name];
 const source=input.modules[name];if(!source)throw Error('Missing real module '+name);
 const mod={exports:{}};cache[name]=mod.exports;
 const begin=source.indexOf('function('),end=source.lastIndexOf('}, {');
 vm.runInNewContext('('+source.slice(begin,end)+'})',context,{filename:name+'.js'})(load,mod,mod.exports);
 return cache[name]=mod.exports;
}
const logo=load('logoScene');logo.next_.call({isHaveLogo:false,next2_(){next++;}});
const login=load('loginScene');login.initAssetsManager_.call({});
if(network!==0||next!==1)throw Error('Unconfigured client tried networking or failed to proceed');
load('sdkApi');const actualSdk=context.window.sdkApi;actualSdk.init();
if(nativeCalls!==0||actualSdk.sdkName!=='mmx')throw Error('Private initialization invoked native vendor SDK');
server.url=server.staticUrl='https://db2.example';
logo.next_.call({isHaveLogo:false,next2_(){next++;}});
if(network!==1)throw Error('Configured client failed to request its chosen server');
process.stdout.write(JSON.stringify({unconfigured_network_calls:0,unconfigured_login_reached:true,configured_client_config_requests:network,native_sdk_init_calls:nativeCalls}));
