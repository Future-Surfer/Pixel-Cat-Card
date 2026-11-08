import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>1000},requestAnimationFrame:()=>1};
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming-art.js','utf8')+'\n'+['prototype/cat-polish.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,visitWeight,weightedPick,restingPoints,loafBridge,idlePoseWeight,surfaceFromDefinition};',box);
const {Home,visitWeight,weightedPick,restingPoints,loafBridge,idlePoseWeight,surfaceFromDefinition}=box.api,art=box.window.pixelCatRoamingArtV2;
const visits=new Map([['recent',{at:1000,count:1}]]);assert.ok(visitWeight(visits,'recent',1001)<.03);assert.equal(visitWeight(visits,'new',1001),1);assert.ok(visitWeight(visits,'recent',121000)>.7);
const points=restingPoints({min:100,max:300});assert.equal(points.length,3);let edges=0;for(let i=0;i<100;i++)if(weightedPick(points,p=>p.weight,()=>i/100).id!=='middle')edges++;assert.equal(edges,80);
assert.equal(JSON.stringify(loafBridge(art,'walk','loaf')),JSON.stringify([...art.bridges.walkToSit,art.sit,...art.bridges.sitToLoaf]));assert.equal(loafBridge(art,'loaf','loaf').length,0);
for(const seated of ['sit','sithead','clean','scratch','yawn','meow','chatter'])assert.equal(JSON.stringify(loafBridge(art,seated,'loaf')),JSON.stringify(art.bridges.sitToLoaf),'Seated cats should not insert walking-to-sit artwork before loafing');
assert.ok(idlePoseWeight('sit',[{pose:'sit'},{pose:'clean'}],null)<idlePoseWeight('stand',[{pose:'sit'},{pose:'clean'}],null),'Recently visited idle is less attractive than a fresh alternative');
assert.ok(idlePoseWeight('sit',[{pose:'sit'},{pose:'clean'}],null)>0,'Recency is a preference, never a ban');
assert.equal(idlePoseWeight('lookdown',[],null),0,'Recency must not bypass ledge eligibility');

const small=surfaceFromDefinition({id:'small',units:'pixels',x1:20,x2:48,y:100},{left:0,top:0,right:200,bottom:200,width:200,height:200},48);assert.ok(small,'A 28px perch supports a 48px canvas with overhang');
const support={id:'a',min:100,max:300,left:100,right:348,top:300,home:false,poses:['loaf']},h=Object.create(Home.prototype),attrs={};let measured=0,drawn;
Object.assign(h,{active:true,scale:2,size:48,config:{},support,surfaces:[support],route:[],x:160,y:300,facing:1,deadline:99999,lastTick:1000,checkAt:Infinity,debugAt:Infinity,layer:{style:{visibility:'visible'}},svg:{style:{}},setAttribute:(key,value)=>attrs[key]=value,status(){},draw(rows){drawn=rows;},measure(){measured++;this.needsMeasure=false;}});
h.invalidate();assert.equal(h.layer.style.visibility,'visible');h.tick(1016);assert.equal(measured,1);assert.equal(h.layer.style.visibility,'visible');assert.equal(JSON.stringify(drawn),JSON.stringify(art.bridges.walkToSit[0]));assert.match(attrs['data-frame'],/transition-loaf/);
h.tick(1266);assert.equal(JSON.stringify(drawn),JSON.stringify(art.sit));h.tick(1516);assert.equal(JSON.stringify(drawn),JSON.stringify(art.bridges.sitToLoaf[0]));h.tick(1766);assert.equal(JSON.stringify(drawn),JSON.stringify(art.idleSequences.loaf.frames[0]));
// Native dashboard edit mode must not rebuild geometry on every suspended frame.
const quiet=Object.create(Home.prototype);let quietMeasures=0;
Object.assign(quiet,{active:true,config:{},homeArtReady:true,lastTick:1000,checkAt:0,surfaces:[],layer:{style:{}},blocked:()=>true,status(){},measure(){quietMeasures++;this.needsMeasure=false;}});
for(let t=1016;t<4000;t+=16)quiet.tick(t);
assert.equal(quiet.suspended,true);assert.equal(quietMeasures,0,'An unchanged edit overlay needs no repeated discovery');
quiet.blocked=()=>false;quiet.checkAt=0;quiet.tick(4016);
assert.equal(quiet.needsMeasure,true,'Leaving edit mode requests fresh geometry once');
quiet.waitingForSurface=true;quiet.surfaceRetryAt=Infinity;quiet.tick(4032);quiet.tick(4048);
assert.equal(quietMeasures,1,'Resume reconciliation runs once, not every frame');
h.destinationPoint='left';h.recordVisit(2000);assert.ok(h.visits.has('a/left'));assert.equal(h.visits.get('a').count,1);
const old={...support},shifted={...support,left:100,right:348,top:200};h.surfaces=[shifted];h.route=[];h.reconcileLayout(old,[old],2100);assert.equal(h.idle.placement.top,200-24*2,'Cached resting placement tracks scrolling immediately');assert.equal(h.idle.pose,'loaf');
// A uniform viewport translation must preserve flight duration and progress, even above the header.
const dest={id:'b',left:400,top:300,min:400,max:600},start={x:180,y:260},end={x:430,y:260};h.support=old;h.surfaces=[shifted,{...dest,top:200}];h.motion={fromX:160,fromY:300,x:410,y:300,target:dest,start:1000,duration:900,jumpProfile:{start,end,departure:{x:160,top:250},arrival:{x:410,top:250},flight:{start,end,apexY:220}}};h.reconcileLayout(old,[old,dest],2200);assert.equal(h.motion.start,1000);assert.equal(h.motion.duration,900);assert.equal(start.y,160);assert.equal(h.motion.jumpProfile.flight.apexY,120);assert.equal(h.stranded,false);
for(const scale of [1,2,3])for(const facing of [-1,1]){const ledge={id:'tiny',left:300.35*scale,right:312.35*scale,top:300*scale,narrow:true},cat=Object.create(Home.prototype);Object.assign(cat,{config:{},scale,size:24*scale,x:(300-facing*30)*scale,y:300*scale,facing,walkSteps:0});cat.moveTo(294*scale,300*scale,100,'jump',ledge,0);assert.ok(cat.motion);const landing=cat.jumpSample(cat.motion,1),bottom=landing.rows.findLastIndex(row=>row.includes('R'));for(let x=0;x<24;x++)if(landing.rows[bottom][x]==='R'){const world=landing.x+(facing<0?23-x:x)*scale;assert.ok(world>=ledge.left&&world+scale<=ledge.right,'Every final landing paw fits the narrow perch');}}
console.log('PASS: immediate scroll tracking, authored loaf bridges, visit decay, edge preference, small-perch landing feet and unchanged camera-relative flight clocks.');
