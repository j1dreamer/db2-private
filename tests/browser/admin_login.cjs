const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const base=process.env.DB2_QA_URL,token=process.env.DB2_QA_TOKEN,out=process.env.DB2_QA_OUTPUT;
if(!base||!token||!out)throw Error('Run tools.check_admin_browser --script admin_login.cjs');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.DB2_QA_BROWSER||'/usr/bin/chromium',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1440,height:1000}}),p=await ctx.newPage(),flows=[],errors=[];p.on('pageerror',e=>errors.push(e.message));
 async function login(remember){await p.locator('#token').fill(token);if(remember)await p.locator('#remember').check();await p.locator('#loginForm button[type=submit]').click();await p.locator('#view h1').waitFor()}
 await p.goto(base+'/admin');await login(true);
 const valid=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('db2.admin.remembered'));return !!s.token&&Math.abs(s.expiresAt-Date.now()-30*86400000)<10000});if(!valid)throw Error('30 day expiry not saved');flows.push('remember-device-30-days');
 const other=await ctx.newPage();await other.goto(base+'/admin');await other.locator('#view h1').waitFor();await other.close();flows.push('new-tab-auto-login');
 await p.reload();await p.locator('#view h1').waitFor();flows.push('reload-auto-login');
 await p.setViewportSize({width:390,height:844});await p.locator('#menuToggle').click();await p.locator('#logout').click();await p.setViewportSize({width:1440,height:1000});await p.locator('#token').waitFor();if(!await p.evaluate(()=>!localStorage.getItem('db2.admin.remembered')&&!sessionStorage.getItem('db2.admin.token')))throw Error('Logout retained token');flows.push('logout-clears-device-and-tab');
 await login(true);await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('db2.admin.remembered'));s.expiresAt=Date.now()-1;localStorage.setItem('db2.admin.remembered',JSON.stringify(s))});await p.reload();await p.locator('#token').waitFor();if(!await p.evaluate(()=>!localStorage.getItem('db2.admin.remembered')))throw Error('Expired token not cleared');flows.push('expired-device-token-cleared');
 await login(false);if(!await p.evaluate(()=>!localStorage.getItem('db2.admin.remembered')))throw Error('Unchecked remember retained token');flows.push('unchecked-does-not-persist');
 await p.evaluate(()=>localStorage.setItem('db2.admin.remembered',JSON.stringify({token:'invalid-qa-token',expiresAt:Date.now()+86400000})));await p.reload();await p.locator('#token').waitFor();if(!await p.evaluate(()=>!localStorage.getItem('db2.admin.remembered')))throw Error('Rejected token not cleared');flows.push('server-rejected-token-cleared');
 await p.evaluate(()=>localStorage.setItem('db2.admin.remembered','bad-json'));await p.reload();await p.locator('#token').waitFor();flows.push('malformed-storage-does-not-crash');
 const blocked=await b.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage disabled')}}));const q=await blocked.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(base+'/admin');await q.locator('#token').fill(token);await q.locator('#remember').check();await q.locator('#loginForm button[type=submit]').click();await q.locator('#view h1').waitFor();await blocked.close();flows.push('storage-unavailable-login-still-works');
 await b.close();const report={passed:!errors.length,flows,errors};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
