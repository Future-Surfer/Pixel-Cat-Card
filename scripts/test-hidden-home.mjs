import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},innerWidth:900,innerHeight:700,HTMLElement:class{},customElements:{get:()=>true}};
vm.runInNewContext(['prototype/cat-polish.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\n'+fs.readFileSync('prototype/cat-hidden-home.js','utf8')+'\nglobalThis.api={PixelCatHome,sharedHomeSurfaceAllowed};',box);
const {PixelCatHome,sharedHomeSurfaceAllowed}=box.api,select=box.window.pixelCatHiddenHomeV1.select;
const surface=(id,top,extra={})=>({id,top,left:40,right:400,min:40,max:352,el:{isConnected:true},...extra});
const a=Object.assign(Object.create(PixelCatHome.prototype),{config:{show_home:false},scale:2,size:48,surfaces:[surface('offscreen',-100),surface('tiny',200,{narrow:true}),surface('candidate',220,{candidate:true}),surface('shelf',280)],route:[]});
select(a);assert.equal(a.home.id,'shelf');assert.equal(a.home.home,undefined,'Return anchor stays an ordinary graph surface');a.reconcileLayout(null,[],100);assert.equal(a.support,a.home);assert.equal(a.y,280);assert.ok(a.x>=a.home.min&&a.x<=a.home.max);assert.equal(a.stranded,false);
a.surfaces=[surface('new',160),surface('shelf',340)];select(a);assert.equal(a.home.id,'shelf','Stable anchor survives discovery order/reflow');a.reconcileLayout(a.support,[],200);assert.equal(a.y,340);
a.surfaces=[];select(a);a.reconcileLayout(a.support,[],300);assert.equal(a.waitingForSurface,true);assert.equal(a.home,null);assert.equal(a.stranded,true);assert.equal(a.y,340,'No teleport to the hidden dock');
const fresh=Object.assign(Object.create(PixelCatHome.prototype),{config:{show_home:false},scale:2,size:48,surfaces:[]});select(fresh);fresh.reconcileLayout(null,[],0);assert.equal(fresh.x,undefined);fresh.surfaces=[surface('late',180)];select(fresh);fresh.reconcileLayout(null,[],1000);assert.equal(fresh.y,180);assert.equal(fresh.stranded,false);
const owner={localName:'pixel-cat-home',active:true,config:{shared_home_surfaces:true,show_home:false}},el={localName:'ha-card',getRootNode:()=>({host:owner})};owner.shadowRoot={querySelector:()=>el};assert.equal(sharedHomeSurfaceAllowed(el,{shared_home_surfaces:true}),false);owner.config.show_home=true;assert.equal(sharedHomeSurfaceAllowed(el,{shared_home_surfaces:true}),true);
assert.equal(a.getCardSize(),0);a.config.show_home=true;assert.equal(a.getCardSize(),2);
console.log('PASS: visible broad foreign placement, stable ordinary return anchor, reflow, no-surface wait/late discovery, no zero-dock teleport and hidden shared-roof exclusion.');

