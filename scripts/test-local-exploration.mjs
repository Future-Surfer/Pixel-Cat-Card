import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
let now=1000;
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>now}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,restingPoints,visitWeight,weightedPick,CatMood};',box);
const {Home,restingPoints,visitWeight,weightedPick,CatMood}=box.api,h=box.window.pixelCatExplorationV1,tools={points:restingPoints,weight:visitWeight,pick:weightedPick};
const surface=(id='s',el={})=>({id,el,left:0,right:600,min:0,max:552,top:400,rectSnapshot:{left:0,top:300},roamPoints:[{id:'new',x:150,weight:1}]});
function cat(s=surface(),random=.4){
 const a=Object.assign(Object.create(Home.prototype),{support:s,home:s,surfaces:[s],scale:2,size:48,x:200,y:s.top,facing:1,walkSteps:0,config:{},route:[],visits:new Map(),renderDebug(){},attrs:{},setAttribute(k,v){this.attrs[k]=v;}});
 a.mood={random:()=>random,values:{playfulness:.4,sleepiness:.35,alertness:.25}};return a;
}
// A local destination is a real settle/walk route, not a fake wait or inserted jump.
{const a=cat();a.pathTo=()=>{throw Error('Local choices must not search paths');};assert.equal(h.plan(a,now,tools),true);assert.equal(a.route.length,1);assert.equal(a.route[0].surface,a.support);assert.equal(a.route[0].settle,true);assert.ok(Math.abs(a.route[0].x-a.x)>=12);a.advance(now);assert.equal(a.motion.kind,'walk');assert.equal(a.motion.target,a.support);}
// A genuine single-surface runtime uses local activity rather than 30-second no-route failure.
{const a=cat();a.mood.random=()=>.99;a.plan();assert.ok(a.route.length||a.deadline>now);assert.notEqual(a.noPathMessage,'Chilling · no reachable destination');assert.notEqual(JSON.parse(a.attrs['data-exploration']).intent,'leave');}
// Staying is short, optional, and does not replace a continuing idle or its artwork.
{const a=cat(surface(),0);a.idle={pose:'sleep',poseUntil:99999};const idle=a.idle;assert.ok(h.plan(a,now,tools));assert.equal(a.idle,idle);assert.equal(a.deadline,now+3000);assert.equal(a.route.length,0);}
// Selection probability depends on intention weights, not number of other shelves.
for(const r of [.05,.4,.9]){const a=cat(surface(),r),b=cat(surface(),r);b.surfaces.push(...Array.from({length:99},(_,i)=>surface('other'+i)));assert.equal(h.plan(a,now,tools),h.plan(b,now,tools));assert.equal(JSON.parse(a.attrs['data-exploration']).intent,JSON.parse(b.attrs['data-exploration']).intent);}
// Residence starts at a meaningful support change, not a local POI, scroll or alias ID.
{const a=cat();const q=h.observe(a,now);a.destinationPoint='new';a.recordVisit(1200);h.observe(a,1300);assert.equal(a.explorationResidence,q);
 a.support={...a.support,id:'alias',left:20,right:620,top:600,rectSnapshot:{left:20,top:500}};assert.equal(h.observe(a,1400),q,'Uniform scrolling preserves residence');
 a.support={...a.support,left:22,right:618};assert.equal(h.observe(a,1500),q,'Nearly co-located spans preserve residence');
 a.support=surface('different');assert.notEqual(h.observe(a,1600),q);assert.equal(a.explorationResidence.since,1600);
 const fresh=a.explorationResidence;a.freezeClocks(10000);assert.equal(fresh.since,11600,'Paused/hidden time does not age residence');}
// No ungrounded or commanded work is commandeered; opt-out retains old behaviour.
for(const change of [{command:'home'},{goal:'s::left'},{motion:{kind:'jump'}},{play:{}},{previewPose:'lookdown'},{toyHunt:{}},{social:{episode:{}}},{paused:true},{userHeld:true},{config:{local_exploration:false}}]){const a=Object.assign(cat(),change);assert.equal(h.plan(a,now,tools),false);assert.equal(a.attrs['data-exploration'],undefined);}
{const a=cat();a.social={corridor:()=>false};assert.ok(h.plan(a,now,tools,true));assert.equal(a.route.length,0,'Occupied local corridors produce a quiet alternative');}
{const a=cat();a.support.narrow=true;assert.ok(h.plan(a,now,tools,true));assert.equal(a.route.length,0,'Narrow perches cannot invent local walk room');}
// Commands and already-selected social responses precede the leisure layer in actual plan().
{const a=cat();a.config={mood_behaviour:true};a.decisionLayer=()=>({decide:()=>{a.deadline=9000;return true;}});a.plan();assert.equal(a.deadline,9000);assert.equal(a.attrs['data-exploration'],undefined);}
{const a=cat();a.command='home';a.plan();assert.equal(a.destinationId,a.home.id);assert.equal(a.command,null);assert.equal(a.attrs['data-exploration'],undefined);}
// Same seed yields identical intent counts with one or twenty surrounding supports,
// with both independent departure and local choices after the residence bias fades.
const results=[];
for(const count of [1,20]){let local=0,leave=0,earlyLeave=0,lateLeave=0;for(let i=0;i<400;i++){const a=cat();a.mood=new CatMood('trial-'+i);a.surfaces.push(...Array.from({length:count-1},(_,n)=>surface('s'+n)));h.observe(a,1000);h.plan(a,1000,tools);const first=JSON.parse(a.attrs['data-exploration']).intent;if(first==='leave')earlyLeave++;a.route=[];h.plan(a,61000,tools);const kind=JSON.parse(a.attrs['data-exploration']).intent;if(kind==='leave'){leave++;lateLeave++;}else local++;}assert.ok(local>100&&leave>50);assert.ok(earlyLeave<lateLeave,'New arrivals prefer residence more strongly');results.push({local,leave,earlyLeave,lateLeave});}
assert.deepEqual(results[0],results[1]);
console.log('PASS: local intent/walk/stay, actual single-surface fallback, destination-count independence, support/scroll/alias residence, inactive clocks, safe corridors, commands/social priority, and seeded independent departures.',results[0]);
