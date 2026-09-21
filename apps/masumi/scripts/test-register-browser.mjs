// Run the Masumi app locally on port 3109 with register.env.example first.
// All registration API requests are mocked; other external requests are blocked.
// REGISTER_CHROMIUM_PATH may select an existing local Chromium installation.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
mkdirSync('.review-evidence', { recursive: true });
const browser = await chromium.launch({executablePath:process.env.REGISTER_CHROMIUM_PATH || chromium.executablePath(),headless:true,args:['--disable-dev-shm-usage']});
const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
let completeBodies=[], verifies=0, polls=0, mode='pending';
await context.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.pathname.startsWith('/api/public/network/register')) {
  const suffix=url.pathname.replace('/api/public/network/register','');
  let body;
  if(suffix==='/capabilities') body={x402SettleableNetworks:[{caip2Id:'eip155:84532',displayName:'Base Sepolia',isTestnet:true,defaultAsset:null}]};
  else if(suffix==='') body={success:true,email:route.request().postDataJSON().email};
  else if(suffix==='/verify') {verifies++; body={registrationToken:'fixture-ticket',email:'fixture@example.test'};}
  else if(suffix==='/complete') {completeBodies.push(route.request().postDataJSON()); body=mode==='malformed'?{}:mode==='dynamic'?{status:'registered',agentId:'fixture-agent'}:{status:'pending',agentId:'fixture-agent',draftId:'fixture-draft',pollToken:'fixture-poll',continueUrl:'https://should-never-open.example.test/'};}
  else if(suffix==='/status') {polls++; assert.equal(route.request().postDataJSON().pollToken,'fixture-poll');if(mode==='transient') return route.fulfill({status:503,body:'Service unavailable'}); body={status:mode==='endless'||polls===1?'pending':'registered',agentId:'fixture-agent'};}
  else throw new Error('Unexpected API '+suffix);
  return route.fulfill({json:body});
 }
 if(url.origin==='http://127.0.0.1:3109') return route.continue();
 return route.abort();
});
const page=await context.newPage(); page.setDefaultTimeout(10000);

const errors=[];page.on('pageerror',e=>errors.push(e.message));
const ready=page.waitForResponse(r=>r.url().endsWith('/register/capabilities'));
await page.goto('http://127.0.0.1:3109/register',{waitUntil:'domcontentloaded'}); await ready;
await page.getByRole('button',{name:'Next',exact:true}).click();
await page.getByRole('alert').filter({hasText:'Name is required.'}).waitFor();
await page.getByLabel('Name',{exact:true}).fill('Fixture');
await page.getByLabel('Email',{exact:true}).fill('fixture@example.test');
await page.getByRole('checkbox').check();
await page.evaluate(()=>scrollTo(0,0));  await page.screenshot({path:'.review-evidence/desktop-account.png',fullPage:true});
await page.getByRole('button',{name:'Next',exact:true}).click();
await page.getByRole('dialog',{name:'Check your email'}).waitFor();
await page.getByRole('button',{name:'Resend code',exact:true}).focus();
await page.keyboard.press('Tab');
assert.equal(await page.evaluate(()=>document.querySelector('[aria-labelledby=register-verify-title]').contains(document.activeElement)),true);
await page.getByLabel('Verification code',{exact:true}).fill('123456');
await page.getByLabel('Agent name',{exact:true}).waitFor();
assert.equal(verifies,1);
await page.getByLabel('Agent name',{exact:true}).fill('Fixture agent');
await page.getByLabel('API base URL',{exact:true}).fill('https://example.test');
await page.getByLabel('Tags',{exact:true}).fill('research');
await page.getByRole('button',{name:'Add',exact:true}).click();
await page.getByRole('checkbox').check();
await page.getByLabel('Price',{exact:true}).fill('');
await page.getByLabel('Price',{exact:true}).pressSequentially('2.01');
assert.equal(await page.getByLabel('Price',{exact:true}).inputValue(),'2.01');
await page.getByLabel('Receive payments at',{exact:true}).fill('0x'+'2'.repeat(40));
await page.getByRole('button',{name:'Other',exact:true}).click();
await page.getByLabel('Token contract address',{exact:true}).fill('0x'+'3'.repeat(40));
await page.getByText('Optional settings',{exact:true}).click();
await page.getByRole('button',{name:'Show technical fields'}).click();
await page.getByLabel('Token decimals',{exact:true}).fill('0');
await page.getByLabel('Price',{exact:true}).fill('2');
await page.getByRole('button',{name:'Next',exact:true}).click();
await page.getByRole('button',{name:'Register agent',exact:true}).waitFor();
await page.evaluate(()=>scrollTo(0,0));  await page.screenshot({path:'.review-evidence/desktop-review.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>scrollTo(0,0));  await page.screenshot({path:'.review-evidence/mobile-review.png',fullPage:true});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.getByRole('button',{name:'Register agent',exact:true}).dblclick();
await page.waitForURL('**/register/success?**');
await page.getByText('Fixture agent is registered',{exact:true}).waitFor({timeout:20000});
assert.equal(completeBodies.length,1);
assert.equal(completeBodies[0].payment.amount,'2');
assert.equal(completeBodies[0].payment.decimals,0);
assert.equal(completeBodies[0].cardanoNetwork,'Preprod');
assert.equal(completeBodies[0].mint.destination,'managed');
assert.equal(polls,2);
assert.equal(new URL(page.url()).searchParams.has('pollToken'),false);
await page.evaluate(()=>scrollTo(0,0));  await page.screenshot({path:'.review-evidence/mobile-success.png',fullPage:true});
await page.goto('http://127.0.0.1:3109/register/success');
assert.equal(await page.getByText('Your agent is registered',{exact:true}).count(),0);
await page.goto('http://127.0.0.1:3109/register/success?draftId=missing');
await page.getByText('Registration session expired',{exact:true}).waitFor();
assert.equal(polls,2);

mode='dynamic';
const readyAgain=page.waitForResponse(r=>r.url().endsWith('/register/capabilities'));
await page.goto('http://127.0.0.1:3109/register'); await readyAgain;
await page.getByLabel('Name',{exact:true}).fill('Fixture');
await page.getByLabel('Email',{exact:true}).fill('fixture@example.test');
await page.getByRole('checkbox').check();
await page.getByRole('button',{name:'Next',exact:true}).click();
await page.getByLabel('Verification code',{exact:true}).fill('123456');
await page.getByLabel('Agent name',{exact:true}).fill('Fixture agent');
await page.getByLabel('API base URL',{exact:true}).fill('https://example.test');
await page.getByLabel('Tags',{exact:true}).fill('research');
await page.getByRole('button',{name:'Add',exact:true}).click();
await page.getByRole('button',{name:'Next',exact:true}).click();
await page.getByRole('button',{name:'Register agent',exact:true}).click();
await page.getByText('Fixture agent is registered',{exact:true}).waitFor();
assert.equal(completeBodies.length,2);
assert.equal('payment' in completeBodies[1],false);
console.log('Dynamic registration without payment passed');
mode='transient'; polls=0;
await page.evaluate(()=>sessionStorage.setItem('masumi:network-reg-poll:fixture-draft','fixture-poll'));
await page.goto('http://127.0.0.1:3109/register/success?draftId=fixture-draft&agentId=fixture-agent');
await page.getByText('Could not confirm registration',{exact:true}).waitFor({timeout:20000});
assert.equal(polls,3);
await page.waitForTimeout(5500); assert.equal(polls,3);
console.log('Non-JSON 503 retries terminate after three failures');
mode='endless'; polls=0;
const pendingResponse=page.waitForResponse(r=>r.url().endsWith('/register/status'));
await page.goto('http://127.0.0.1:3109/register/success?draftId=fixture-draft&agentId=fixture-agent');
await pendingResponse;
await page.goto('http://127.0.0.1:3109/register');
const before=polls; await page.waitForTimeout(5500); assert.equal(polls,before);
console.log('Polling stops after unmount');
assert.deepEqual(errors,[]);
console.log('Browser passed: validation, OTP once, dialog focus, fractional input, zero decimals, pending-to-registered, local redirect, missing credentials, desktop/mobile overflow. All API traffic mocked; no live mutations.');
await browser.close();
