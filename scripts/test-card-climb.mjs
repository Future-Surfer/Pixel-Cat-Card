import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {runtimeFiles} from './build-release.mjs';
const b={window:{},HTMLElement:class{},customElements:{get:()=>true},performance};vm.runInNewContext(runtimeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,art:CAT_ART};',b);const {Home,art}=b.api,C=b.window.pixelCatClimbV1;
function actor(from=500,to=180){const base={id:'base',left:50,right:700,min:50,max:676,top:from,el:{isConnected:true}},target={id:'target',left:50,right:700,min:50,max:676,top:to,el:{isConnected:true}};return Object.assign(Object.create(Home.prototype),{active:true,config:{life_stage:'kitten',interaction_behaviour:true},scale:1,size:24,x:200,y:from,support:base,home:base,surfaces:[base,target],ownerKey:'test',social:{clear:()=>true,capture(){}},setAttribute(){},decisionLayer(){return{}},ensureMood(){return{random:()=>.3,values:{playfulness:.7,sleepiness:.2}}},pathTo(){return []},draw(rows){this.rows=rows},svg:{style:{}},status(){},renderMoodDebug(){}});}
const N=b.window.pixelCatCardClimbV1;
b.getComputedStyle=()=>({});b.window.pixelCatSurfaceWorldV1.route=()=>null;b.window.pixelCatHomePostsV1.entries=()=>[];
function native(){const a=actor();a.config.card_climbing=true;a.config.climb_slips=false;a.worldRect={left:0,top:0,right:800,bottom:800};a.surfaceId=el=>el===a.support.el?'base':'target';const records=[];a.verticalCardRects=records;
 const frame=b.window.pixelCatClimbAssetsV1.centred.front.frames[0];a.cardGeometry={records,surfaces:a.surfaces,scale:1,generation:1,cache:new Map(),panels:[],byOwner:new Map([['face',a.support.el]]),faces:[{id:'face:face:0',panelId:'face',label:'painted panel',rect:{left:90,right:650,top:80,bottom:490},grips:{left:110,right:630,top:105,bottom:470},generation:1}],tops:[]};return a;}
for(const to of [180,680]){const a=native();a.surfaces[1].top=to;if(to>500){a.cardGeometry.faces[0].rect.bottom=690;a.cardGeometry.faces[0].grips.bottom=670;}const path=N.route(a,a.surfaces[1],a.support);assert.ok(path,'finite face route '+to);assert.equal(N.route(a,a.surfaces[1],a.support),path,'cached snapshot');a.route=path;N.start(a,path[0],0);assert.ok(a.climb?.nativeTransfer,'live native plan');assert.ok(a.climb.plan.segments.some(s=>s.kind==='attach'));let t=0;while(a.climb&&t<60000){t+=16;C.tick(a,t,art);}assert.equal(a.climb,null);assert.equal(a.support.id,'target');assert.equal(a.y,to);}
{const a=native();a.config.card_climbing=false;assert.equal(N.route(a,a.surfaces[1],a.support),null);}
{const a=native(),path=N.route(a,a.surfaces[1],a.support);a.route=path;b.window.pixelCatSurfaceWorldV1.route=()=>[{kind:'ordinary'}];N.start(a,path[0],0);assert.equal(a.climb,undefined);assert.equal(a.route[0].kind,'ordinary');b.window.pixelCatSurfaceWorldV1.route=()=>null;}
for(const change of ['removed','moved','occupied','scroll']){const a=native(),path=N.route(a,a.surfaces[1],a.support);a.route=path;N.start(a,path[0],0);C.tick(a,16,art);assert.ok(N.audit(a));if(change==='removed')a.climb.nativeTransfer.node.isConnected=false;if(change==='moved')a.cardGeometry.faces[0].rect.right-=30;if(change==='occupied'){a.climb.elapsed=a.climb.nativeTransfer.releaseAt-10;a.social.clear=()=>false;}if(change==='scroll'){const dx=12,dy=-45;a.surfaces=a.surfaces.map(s=>({...s,left:s.left+dx,right:s.right+dx,min:s.min+dx,max:s.max+dx,top:s.top+dy}));a.cardGeometry.panels=[];N.shift(a,dx,dy);assert.equal(N.audit(a),true,'uniform translation stays valid');}else assert.equal(N.audit(a),false,change+' invalidates checked release');}
console.log('PASS: native finite-face transfers land up/down, preserve ordinary priority, cache geometry, reject lifecycle/occupied changes and follow scrolling.');

// Explicit wall invitations are independent of autonomous climbing permission.
{const a=native();a.config.card_climbing=false;a.social=undefined;a.decisionLayer=()=>undefined;a.surfaces=[a.support];a.cardGeometry.surfaces=a.surfaces;
 const path=N.wallRoute(a);assert.ok(path,'Same-support checked bounce');assert.equal(path.at(-1).surface,a.support);assert.equal(path.at(-1).choice.result.route.distanceCells,0,'No climb loop between entry and release');assert.equal(a.config.card_climbing,false);
 const entries=b.window.pixelCatHomePostsV1.entries;b.window.pixelCatHomePostsV1.entries=()=>{throw Error('Virtual grip must not require social prop entries')};a.route=path;N.start(a,path.at(-1),0);b.window.pixelCatHomePostsV1.entries=entries;assert.ok(a.climb?.nativeTransfer);assert.equal(a.climb.nativeTransfer.kind,'wall-jump');let t=0;while(a.climb&&t<30000){t+=16;C.tick(a,t,art);}assert.equal(a.climb,null);assert.equal(a.support.id,'base');assert.equal(a.y,500);
}
{const a=native(),near={...a.cardGeometry.faces[0],id:'nearest',rect:{left:180,right:350,top:80,bottom:490},grips:{left:200,right:330,top:105,bottom:470}};a.cardGeometry.faces[0]={...a.cardGeometry.faces[0],rect:{left:500,right:650,top:80,bottom:490},grips:{left:520,right:630,top:105,bottom:470}};a.cardGeometry.faces.push(near);const path=N.wallRoute(a);assert.ok(path);assert.equal(path.at(-1).choice.face.id,'nearest','Nearest viable face wins independently of catalogue order');a.social.clear=()=>false;assert.equal(N.wallRoute(a),null,'Occupied landings are never forced');}
{const a=native(),path=N.wallRoute(a);assert.ok(path);a.cardGeometry.faces=[];a.route=path;N.start(a,path.at(-1),0);assert.equal(a.climb,undefined,'Face is rechecked after walking to it');assert.equal(a.route.length,0);}
console.log('PASS: manual wall jumps use nearest checked faces, support same-floor returns with autonomy off, and revalidate changing/occupied landings.');

// Browser DOMRects expose bounds through prototype getters, not enumerable keys.
{const a=native(),r={left:90,right:650,top:80,bottom:490},el={localName:'ha-card',isConnected:true,getAttribute:()=>null,querySelectorAll:()=>[],getRootNode:()=>({}),getBoundingClientRect:()=>r};a.worldRect=Object.create({left:0,top:0,right:800,bottom:800});a.verticalCardRects=[{el,r}];a.surfaceId=()=> 'panel';b.getComputedStyle=()=>({backgroundColor:'rgb(220,220,220)',backgroundImage:'none',visibility:'visible',display:'block',opacity:'1',transform:'none'});const g=N.reconcile(a);assert.ok(g.faces.length,'DOMRect world clipping retains real bounds');const drawn=[];a.debug={surfaces:true};N.debug(a,(tag,attrs)=>drawn.push({tag,attrs}));assert.equal(drawn[0].attrs.x,r.left);assert.equal(drawn[0].attrs.width,r.right-r.left);assert.equal(drawn.length,1,'horizontal debug adds real outline without grip clutter');}

// Recognition of home-card bounds is independent of the existing sharing gate.
{const a=native(),r={left:90,right:650,top:80,bottom:490,width:560,height:410},owner={localName:'pixel-cat-home',active:true,getRootNode:()=>({}),config:{name:'Neighbour',shared_home_surfaces:false}},el={localName:'ha-card',isConnected:true,getAttribute:k=>k==='data-cat-climb'?'on':null,querySelectorAll:()=>[],getRootNode:()=>({host:owner}),getBoundingClientRect:()=>r};owner.shadowRoot={querySelector:()=>el};const inner={...el,localName:'div'};a.cardPanelElements=[el,inner];a.verticalCardRects=[];a.surfaceId=n=>n===el?'home-panel':'other';const supports=a.surfaces,api=b.window.pixelCatSurfaceWorldV1,oldRect=api.rect;api.rect=()=>r;
 b.getComputedStyle=()=>({backgroundColor:'rgb(220,220,220)',backgroundImage:'none',visibility:'visible',display:'block',opacity:'1',transform:'none'});
 let g=N.reconcile(a);assert.equal(g.panels.length,1,'Only the outer home card is added, never nested furniture');assert.equal(g.faces.length,0,'Recognition cannot grant climbing');assert.equal(g.tops.length,0,'Recognition cannot grant a roof');assert.equal(a.surfaces,supports,'Walking catalogue stays untouched');assert.ok(g.rejected[0].reason.includes('Sharing off'));
 const drawn=[];a.debug={surfaces:true};N.debug(a,(tag,attrs,text)=>drawn.push({tag,attrs,text}));assert.equal(drawn.filter(n=>n.attrs['data-card-outline']).length,1);assert.ok(drawn.some(n=>n.text?.includes('both homes must opt in')),'Horizontal diagnostics explain the exclusion too');
 // Permission continues to come from existing discovery, not the outline or explicit grip attribute.
 for(const reason of ['inactive','hidden']){a.verticalCardRects=[];owner.active=reason!=='inactive';owner.config.show_home=reason!=='hidden';g=N.reconcile(a);assert.equal(g.faces.length,0);assert.ok(g.rejected[0].reason.includes(reason));}
 owner.active=true;owner.config.show_home=true;owner.config.shared_home_surfaces=true;a.config.shared_home_surfaces=true;a.verticalCardRects=[{el,r}];a.surfaces=[...supports,{id:'roof',el,left:90,right:650,min:90,max:626,top:80}];g=N.reconcile(a);assert.equal(g.panels.length,1);assert.ok(g.faces.length);assert.ok(g.tops.length);assert.equal(g.rejected.length,0);const before=g.panels[0].rect.top;N.shift(a,0,-120);assert.equal(g.panels[0].rect.top,before-120,'Outline follows the same uniform scroll translation');api.rect=oldRect;
}
console.log('PASS: excluded home cards retain outlines/reasons without enabling faces, roofs or nested furniture; allowed sharing and scroll remain intact.');

for(const [age,scale] of [['adult',2],['kitten',1]]){
 const a=actor(650);a.config.life_stage=age;a.scale=scale;a.size=24*scale;
 a.home.home=true;a.home.rectSnapshot={};a.worldRect={left:0,top:0,right:800,bottom:800};
 a.catTree={node:{isConnected:true},scale:2,clock:0,impulses:[]};
 const tree=b.window.pixelCatTreeV1;
 tree.surfaces(a);const [lower,upper]=a.surfaces.filter(s=>s.tree);
 for(const platform of [lower,upper]){
  platform.min=Math.ceil(platform.left/scale)*scale;
  platform.max=Math.floor((platform.right-24*scale)/scale)*scale;
 }
 let t=0;a.x=lower.min-20*scale;
 for(const platform of [lower,upper]){
  const from=a.support,clear=a.social.clear;a.social.clear=s=>s!==platform;
  assert.equal(N.treeRoute(a,platform,from),null,'Occupied tree destination is rejected');
  a.social.clear=clear;
  const path=tree.preferred(a,platform,from);assert.ok(path,age+' checked climb to level '+platform.tree);
  a.route=path;N.start(a,path[0],t);assert.ok(a.climb?.nativeTransfer?.tree);
  const end=t+25000;while(a.climb&&t<end){t+=16;C.tick(a,t,art);}
  assert.equal(a.support,platform,age+' lands on level '+platform.tree);
 }
 assert.ok(a.catTree.impulses.length,'Grip contact moves the hanging ball');
 assert.ok(a.routeJump(upper,lower,upper.max,lower.min),age+' can jump to lower platform');
 assert.ok(a.routeJump(lower,a.home,lower.min,a.home.max),age+' can jump to the home floor');
}
