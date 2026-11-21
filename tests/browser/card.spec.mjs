import {test,expect} from '@playwright/test';
const seed=Number(process.env.PIXEL_CAT_TEST_SEED||20261120);
test.beforeEach(async({page})=>{
 page.__errors=[];page.on('pageerror',e=>page.__errors.push(e.message));page.on('console',m=>{if(m.type()==='error')page.__errors.push(m.text());});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.addInitScript(seed=>{let state=seed>>>0;Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};},seed);
 await page.goto('/');await expect(page.locator('#bundle-status')).toContainText('loaded');
});
test.afterEach(async({page},info)=>{
  const actors=await page.locator('pixel-cat-home').evaluateAll(nodes=>nodes.map(a=>({id:a.config?.cat_id,paused:a.paused,suspended:a.suspended,frame:a.getAttribute('data-frame'),position:[a.x,a.y],motion:a.motion?.kind}))).catch(()=>[]);
 await info.attach('diagnostics',{body:Buffer.from(JSON.stringify({seed,project:info.project.name,errors:page.__errors,actors},null,2)),contentType:'application/json'});
 expect(page.__errors).toEqual([]);
});
async function placed(page){await expect.poll(()=>page.locator('#first').evaluate(a=>!!a.signature&&!a.layoutPaused&&!a.suspended)).toBe(true);}
async function scratchFocus(page){
 await page.getByRole('button',{name:'Set up edge scratching',exact:true}).click();await placed(page);
 await expect.poll(()=>page.locator('#first').evaluate(a=>!a.needsMeasure&&!a.layoutPaused&&a.verticalCardRects?.some(s=>s.el?.id==='scratch-wall'))).toBe(true);
 // Establish a supported starting stance; this journey exercises the real scratch approach, not travel from home.
 await page.locator('#first').evaluate(a=>{const floor=a.surfaces.find(s=>s.el?.getAttribute?.('aria-label')==='Shared floor'),wall=document.querySelector('#scratch-wall').getBoundingClientRect();a.social?.finish('fixture start');a.motion=null;a.route=[];a.support=floor;a.x=Math.max(floor.min,Math.min(floor.max,wall.left-24*a.scale));a.y=floor.top;a.idle=null;a.deadline=performance.now()+4000;});
 await page.locator('#edge-lab').getByRole('combobox').selectOption('edgeScratch');
 await expect.poll(()=>page.locator('#first').evaluate(a=>a.social?.episode?.kind==='vertical-scratch'&&a.social.episode.stage==='stroke'&&!!a.social.episode.contacts),{timeout:15000}).toBe(true);
 expect(await page.locator('#first').evaluate(a=>a.social.episode.prop.visualOwner.id)).toBe('scratch-wall');
}

test('packaged bundle paints independent adult and kitten actors',async({page})=>{
 await placed(page);await expect(page.locator('pixel-cat-home')).toHaveCount(2);
 const scales=await page.locator('pixel-cat-home').evaluateAll(nodes=>nodes.map(a=>a.scale));expect(scales[1]).toBe(scales[0]/2);
 await expect(page.locator('#first').getByRole('button',{name:'Pause',exact:true})).toBeVisible();
 await expect.poll(()=>page.locator('#first').evaluate(a=>a.svg.querySelectorAll('rect').length)).toBeGreaterThan(0);
});
test('real editor saves, reloads and preserves unknown YAML settings',async({page})=>{
 await page.getByRole('button',{name:'Edit cat',exact:true}).click();
 await page.locator('#editor').getByLabel('Name',{exact:true}).fill('Nori');
 await page.locator('#editor').getByLabel('Name',{exact:true}).press('Tab');
 await expect.poll(()=>page.locator('#editor').evaluate(e=>e.config.name)).toBe('Nori');
 await page.getByRole('button',{name:'Save and close',exact:true}).click();await expect(page.locator('#saved-config')).toContainText('Nori');
 await page.reload();await expect(page.locator('#saved-config')).toContainText('Nori');await expect(page.locator('#saved-config')).toContainText('preserve-me');
 await page.getByRole('button',{name:'Edit cat',exact:true}).click();await expect(page.locator('#editor').getByLabel('Name',{exact:true})).toHaveValue('Nori');
});
test('manual Pause survives cached view leave and reconnect',async({page})=>{
 await placed(page);await page.locator('#first').getByRole('button',{name:'Pause',exact:true}).click();
 await expect(page.locator('#first').getByRole('button',{name:'Resume',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Leave dashboard',exact:true}).click();await expect(page.locator('pixel-cat-home')).toHaveCount(0);
 await page.getByRole('button',{name:'Return to dashboard',exact:true}).click();await expect(page.locator('pixel-cat-home')).toHaveCount(2);
 await expect.poll(()=>page.locator('#first').evaluate(a=>a.href===location.pathname&&!a.suspended&&a.paused)).toBe(true);
 await page.locator('#first').getByRole('button',{name:'Resume',exact:true}).click();await placed(page);
});
test('theme and viewport reflow retain usable actors and Pause',async({page})=>{
 await placed(page);await page.locator('#first').getByRole('button',{name:'Pause',exact:true}).click();
 await page.getByRole('button',{name:'Toggle theme',exact:true}).click();await expect(page.locator('body')).toHaveClass('dark');
 const v=page.viewportSize();await page.setViewportSize({width:v.width-40,height:v.height-50});
 await expect.poll(()=>page.locator('#first').evaluate(a=>!a.layoutPaused&&a.paused&&Number.isFinite(a.x)&&Number.isFinite(a.y))).toBe(true);
 await expect(page.locator('#first').getByRole('button',{name:'Resume',exact:true})).toBeVisible();
});
test('reduced-motion preference suspends the actual roaming controller',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>page.locator('#first').evaluate(a=>a.suspended&&a.layer?.style.visibility==='hidden')).toBe(true);
 await page.emulateMedia({reducedMotion:'no-preference'});await placed(page);
});
test('pointer pickup and Escape cancellation preserve manual Pause',async({page})=>{
 await placed(page);await page.locator('#first').getByRole('button',{name:'Pause',exact:true}).click();
 const box=await page.locator('#first').evaluate(a=>{const r=a.svg.querySelector('rect').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};});expect(box.width).toBeGreaterThan(0);
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+40,box.y-20,{steps:5});
 await expect.poll(()=>page.locator('#first').evaluate(a=>!!a.userHeld)).toBe(true);
 await page.keyboard.press('Escape');await page.mouse.up();
 await expect.poll(()=>page.locator('#first').evaluate(a=>!a.userHeld&&!a.dragState&&a.paused)).toBe(true);
});

test('edge scratch focus plants real paws and completes after Pause and Resume',async({page},info)=>{
 await scratchFocus(page);
 await page.screenshot({path:info.outputPath('edge-scratch.png'),fullPage:true});
 expect(await page.locator('#first').evaluate(a=>[a.config.climbing,a.config.card_climbing])).toEqual([false,false]);
 await page.locator('#first').getByRole('button',{name:'Pause',exact:true}).click();
 const clock=await page.locator('#first').evaluate(a=>a.social.clock);await page.waitForTimeout(250);
 expect(await page.locator('#first').evaluate(a=>a.social.clock)).toBe(clock);
 await page.locator('#first').getByRole('button',{name:'Resume',exact:true}).click();
 await expect(page.locator('#edge-lab')).toContainText('Completed: 1',{timeout:15000});
 await page.locator('#edge-lab').getByRole('combobox').selectOption('');
 await expect.poll(()=>page.locator('#first').evaluate(a=>!a.labScratch&&!a.social?.episode)).toBe(true);
});

test('removed scratch edge releases its claim and cancels the focused episode',async({page})=>{
 await scratchFocus(page);
 await page.locator('#first').evaluate(a=>{window.fixtureScratchProp=a.social.episode.prop;window.fixtureScratchProp.visualOwner.remove();a.invalidate();});
 await expect.poll(()=>page.locator('#first').evaluate(a=>!a.labScratch&&!a.social?.episode&&!window.fixtureScratchProp.claimedBy),{timeout:15000}).toBe(true);
 await expect(page.locator('#edge-lab')).toContainText('Interrupted: 1');
 await expect(page.locator('#edge-lab')).toContainText('Completed: 0');
});
