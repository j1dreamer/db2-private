const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const base=process.env.DB2_QA_URL,token=process.env.DB2_QA_TOKEN,out=process.env.DB2_QA_OUTPUT;
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,executablePath:process.env.DB2_QA_BROWSER||'/usr/bin/chromium',args:['--no-sandbox']}),p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));const ready=async()=>p.waitForFunction(()=>document.querySelector('#view').getAttribute('aria-busy')!=='true');
 await p.goto(base+'/admin');await p.locator('#token').fill(token);await p.locator('#loginForm button[type=submit]').click();await p.locator('#view h1').waitFor();
 await p.evaluate(()=>location.hash='events');await p.locator('[data-act=x7-presets]').click();await p.locator('[data-act=x7-objective][data-metric=gem_spent]').click();
 if(await p.locator('[name=eventMetric]').inputValue()!=='gem_spent'||await p.locator('[name=eventTarget]').inputValue()!=='1000')throw Error('Spending preset missing');
 await p.locator('#editForm button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#modal').open);await ready();
 await p.locator('[data-act=sp-list]').click();await p.locator('[data-act=sp-new]').click();await p.locator('[data-act=sp-direct-hero]').click();
 if(await p.locator('#spRows_offers .sp-tier').count()!==2)throw Error('Direct hero row not added');
 if(await p.locator('#spRows_offers .sp-tier').last().locator('.reward-id').inputValue()!=='105504')throw Error('Direct hero reward missing');
 await p.locator('#editForm button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#modal').open);await ready();
 await p.locator('[data-act=x7-presets]').click();await p.screenshot({path:path.join(out,'x7-presets-mobile.png'),fullPage:true});
 if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error('Mobile overflow');
 await p.locator('#modal [data-route=economy]').click();await p.locator('#view h1').filter({hasText:'Shop & vé nạp'}).waitFor();if(await p.locator('#modal').evaluate(e=>e.open))throw Error('Catalog navigation left modal open');
 await p.evaluate(()=>location.hash='events');await p.locator('[data-act=x7-presets]').click();await p.locator('#modal [data-act=event-tab]').click();await ready();if(await p.locator('#modal').evaluate(e=>e.open))throw Error('Builtin tab left modal open');
 if(errors.length)throw Error(errors.join('; '));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,flows:['mobile-spending-preset-save','direct-hero-offer-save','catalog-navigation','builtin-event-navigation'],errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
