import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>1000}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,CatMood,owners:CAT_OWNERS};',box);
const {Home,CatMood,owners}=box.api,setup=box.window.pixelCatSetupV1,art={...box.window.pixelCatRoamingArtV2,...box.window.pixelCatRoamingExtrasV1},root={},shared={id:'shared',el:{},left:0,right:1400,top:400,min:0,max:1352};
const Layer=box.window.pixelCatDecisionsV1;
function cat(id,left,style='igloo',scale=2){const dock={isConnected:true},a=Object.assign(Object.create(Home.prototype),{active:true,isConnected:true,root,ownerKey:id,scale,size:24*scale,x:left+200,y:400,facing:1,walkSteps:0,config:{name:id,bed_style:style,mood_behaviour:true,social_behaviour:true,interaction_behaviour:true},route:[],support:shared,idle:{pose:'sit',start:0,poseUntil:9000},setAttribute(){},getAttribute(){},status(){},pathTo(s){return s===this.support?[]:[s];},shadowRoot:{querySelector:()=>dock}});a.home={id:'home',el:a,home:true,left,right:left+300,top:400,min:left,max:left+300-24*scale,rectSnapshot:{}};a.mood=new CatMood(id);a.mood.values={sleepiness:.8,alertness:.1,playfulness:.5};a.social=new Layer(a,()=>owners,()=>art);owners.set(a,{root});box.window.pixelCatMouthV1.homes.add(a);return a;}
function measure(a){a.surfaces=[a.home,shared];setup.surfaces(a);for(const s of a.surfaces){s.min=s.left;s.max=s.right-a.size;if(s.bed){s.min=s.max=Math.round(((s.left+s.right-a.size)/2)/a.scale)*a.scale;s.narrow=false;}}}
let a=cat('owner',0,'simple'),b=cat('guest',500);measure(a);measure(b);
assert.ok(b.surfaces.some(s=>s.bed&&s.bedOwner===a),'Foreign simple bed is discoverable before optional card surfaces');
let options=b.social.bedTargets();assert.ok(options.some(o=>o.owner===b));const visit=options.find(o=>o.owner===a);assert.ok(visit);assert.ok(b.social.startBed(visit,1000));
const c=cat('third',900);measure(c);assert.ok(!c.social.bedTargets().some(o=>o.owner===a),'A reserved bed has one incoming sleeper');
b.route=[];b.support=visit.surface;b.x=visit.x;b.y=b.support.top;b.social.advance(1100);assert.equal(b.social.episode.stage,'rest');assert.equal(b.social.restPose(),'sleep');assert.ok(b.social.idleDuration('sleep',1000,1000)>=25000);
b.idle.contactX=b.x+34;const exit={id:'elsewhere',top:100,min:900,max:1000};b.route=[exit];assert.ok(setup.stepOff(b,exit,1200));assert.equal(b.motion.target.bedOwner,a,'Guest steps down onto that bed’s floor, not its own distant home');assert.equal(b.motion.kind,'walk');b.motion=null;b.route=[];b.x=visit.x;b.y=b.support.top;
const frame={rows:art.idleSequences.sleep.frames[0],placement:{x:b.x,top:b.y-48},facing:1,gaze:{x:15,y:8,angle:0,fov:360}};
b.social.frame=frame;a.social.memory.set(b.ownerKey,{id:b.ownerKey,x:b.x,y:b.y,scale:2,pose:'sleep',at:0,frame});a.social.visible=new Set([b.ownerKey]);
assert.ok(a.social.startBedClaim(b,2000));assert.equal(a.social.episode,b.social.episode);assert.equal(a.social.episode.kind,'bed-claim');a.social.finish('test interrupt');assert.equal(a.social.scene.size,0);assert.equal(b.social.episode,null);
// Physical contact, not simply reaching the bed, determines whether a pat can invite yielding.
function strike(random,hit=true){b.route=[];b.motion=null;b.support=visit.surface;b.idle={pose:'sleep'};b.social.frame=frame;b.mood.random=()=>random;
 const contact=art.interactionContacts.bat,rows=frame.rows;let target;for(let y=0;y<24&&!target;y++)for(let x=0;x<24;x++)if(rows[y][x]!=='.'){target={x:frame.placement.x+(x+.5)*2,y:frame.placement.top+(y+.5)*2};break;}
 const ep={kind:'bed-claim',interaction:true,registry:a.social.scene,initiator:a,target:b,participants:[a,b],stage:'stroke'};a.social.episode=b.social.episode=ep;a.social.scene.set(a,ep);a.social.scene.set(b,ep);a.idle={pose:'bat'};a.facing=1;
 a.social.contactFrame({frame:contact.frame},{x:target.x-(contact.point[0]+.5)*2+(hit?0:500),top:target.y-(contact.point[1]+.5)*2},false,3000);
 assert.equal(a.social.episode,null);return b.route.length;
}
assert.ok(strike(0)>0,'A guest can choose to yield after opaque-pixel contact');assert.equal(strike(.99),0,'A sleepy guest can stay');assert.equal(strike(0,false),0,'A missed paw never evicts a guest');
measure(b);b.config.social_behaviour=false;assert.ok(b.social.bedTargets().every(o=>o.owner===b),'Social opt-out keeps own bed, excludes visiting');
const own=b.social.bedTargets().find(o=>o.owner===b);assert.ok(own);assert.ok(b.social.startBed(own,4000));b.route=[];b.support=own.surface;b.x=own.x;b.y=own.surface.top;b.social.step(100,4100);assert.equal(b.social.episode.stage,'rest','Own bed naps work without social behaviour');b.social.finish('test cleanup');
a.config.show_home=false;measure(b);assert.ok(!b.surfaces.some(s=>s.bedOwner===a),'Hidden beds are not destinations');
a.root={};a.config.show_home=true;measure(b);assert.ok(!b.surfaces.some(s=>s.bedOwner===a),'No cross-view beds');
for(const [actor]of owners)actor.social.dispose();assert.equal(a.social.scene.size,0);
console.log('PASS: own/guest beds, simple-bed floor steps, one incoming sleeper, real sleep, optional physical-contact yielding/staying/misses, interruption cleanup, social opt-out and hidden/view isolation.');
