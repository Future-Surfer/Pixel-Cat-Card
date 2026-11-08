import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
let now=0;const box={window:{},HTMLElement:class{},customElements:{get(){return true;}},performance:{now:()=>now}};
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming-art.js','utf8')+fs.readFileSync('pixel-cat-roaming-extras.js','utf8')+fs.readFileSync('pixel-cat-affordances.js','utf8')+fs.readFileSync('pixel-cat-behaviours.js','utf8')+fs.readFileSync('pixel-cat-roaming.js','utf8')+'\nglobalThis.api={gallopTimeline,walkSample,walkAppearance,gallopRate,Home:PixelCatHome};',box);
const art={...box.window.pixelCatRoamingArtV2,...box.window.pixelCatRoamingExtrasV1},api=box.api;
assert.equal(api.gallopRate(art.gallop),25);assert.equal(api.gallopRate(art.gallop,{gallop_fps:20}),20);assert.equal(api.gallopRate(art.gallop,{gallop_fps:1}),15);assert.equal(api.gallopRate(art.gallop,{gallop_fps:99}),30);
const saved=JSON.parse(fs.readFileSync('frame-studio/user-sequences/gallop-descent-2026-10-16/saved-projects.json')),fixed=saved.find(r=>r.projectId==='0d6931c8-a2ff-404e-ad47-aef258c0d898').project,backup=JSON.parse(fs.readFileSync('frame-studio/user-sequences/gallop-refined-2026-10-15/saved-projects.json')).find(r=>r.projectId==='proposal-gallop-24').project;
assert.equal(JSON.stringify(art.gallop.frames),JSON.stringify(fixed.frames.map(f=>f.rows)));assert.notEqual(JSON.stringify(art.gallop.frames),JSON.stringify(backup.frames.map(f=>f.rows)));assert.equal(art.gallop.fps,25);
assert.equal(JSON.stringify(art.gallop.origins),JSON.stringify(fixed.frames.map(f=>f.origin)));
for(const s of [1,2,3])for(const d of [-1,1])for(const cells of [18,36,54,55,71,108]){
 const timeline=api.gallopTimeline(cells,art),m={fromX:300,direction:d,gallopTimeline:timeline};let last=0;
 for(let i=0;i<timeline.length;i++){const beat=timeline[i],start=i?timeline[i-1].until:0,p=api.walkSample(m,start,s,art.walk),held=api.walkSample(m,beat.until-.001,s,art.walk),look=api.walkAppearance(art,m,p);assert.equal(p.x,held.x,'Held paw pose must not slide');assert.ok(beat.offset>=last);last=beat.offset;assert.equal(look.rows,beat.rows);if(beat.sequenceId===fixed.projectId){assert.equal(beat.until-start,40);assert.equal(look.origin,fixed.frames[beat.frame].origin);}}
 assert.equal(timeline.at(-1).offset,cells);assert.equal(api.walkSample(m,timeline.at(-1).until,s,art.walk).x,300+d*cells*s);
 for(let base=0;base+7<timeline.length;base+=8){if(timeline[base].sequenceId!==fixed.projectId)break;for(const [a,b,footA,footB]of [[0,1,18,16],[2,3,12,7],[6,7,18,18]]){assert.equal(fixed.frames[a].rows[23][footA],'R');assert.equal(fixed.frames[b].rows[23][footB],'R');const xA=300+d*timeline[base+a].offset*s+(d<0?23-footA:footA)*s,xB=300+d*timeline[base+b].offset*s+(d<0?23-footB:footB)*s;assert.equal(xA,xB,'Same stance paw must remain planted');}if(base+8<timeline.length&&timeline[base+8].sequenceId===fixed.projectId){const a=timeline[base+7],b=timeline[base+8];assert.equal(a.offset,b.offset,'Fore support remains fixed across cycle boundary');}}
}
const target={id:'floor',min:0,max:900,top:400};
const make=(urgency='prompted',config={})=>{const h=Object.create(api.Home.prototype);Object.assign(h,{scale:2,size:48,config,urgency,x:200,y:400,facing:1,walkSteps:0,support:target,idle:null,setAttribute(){},removeAttribute(){},route:[],cancelPlay(){},shadowRoot:{querySelector(){return {textContent:''};}}});return h;};
vm.runInNewContext('Math.random=()=>0;',box);
const h=make();h.moveTo(400,400,0,'walk',target,0);assert.ok(h.motion.gallopTimeline);now=225;h.requestVisit('home');assert.ok(h.motion.gallopTimeline.at(-1).grounded);assert.ok(h.motion.duration>=225);assert.ok(h.motion.duration<1000);
for(const h of [make('relaxed'),make('interested'),make('prompted',{gallop:false})]){h.moveTo(400,400,0,'walk',target,0);assert.ok(!h.motion.gallopTimeline);}
const short=make();short.moveTo(250,400,0,'walk',target,0);assert.ok(!short.motion.gallopTimeline);assert.ok(short.motion.fastClip);
// Ordinary chase chunks are 24–36 cells: one whole stride is now eligible.
for(const scale of [1,2,3,4,5,6])for(const direction of [-1,1])for(const cells of [18,24,36]){
 const a=make('interested');a.scale=scale;a.size=24*scale;a.x=300*scale;a.y=400;a.facing=direction;a.social={episode:{kind:'chase'}};
 a.moveTo(a.x+direction*cells*scale,400,0,'walk',target,0);assert.ok(a.motion.gallopTimeline,'A chase needs only one full stride');
 assert.equal(a.motion.gallopTimeline.at(-1).offset,cells);assert.equal(a.motion.duration,a.motion.gallopTimeline.at(-1).until);
 const end=api.walkSample(a.motion,a.motion.duration,scale,art.walk);assert.equal(end.x,a.motion.x,'Chase gallop finishes at its fixed endpoint');
}
{const a=make('interested');a.social={episode:{kind:'chase'}};a.moveTo(a.x+17*a.scale,400,0,'walk',target,0);assert.ok(!a.motion.gallopTimeline,'Less than one full stride retains trot');}
{const a=make();a.moveTo(a.x+36*a.scale,400,0,'walk',target,0);assert.ok(a.motion.gallopTimeline,'Prompted travel needs two complete strides');}
{const a=make('interested');a.social={episode:{kind:'chase'}};a.support={...target,narrow:true};a.moveTo(a.x+36*a.scale,400,0,'walk',target,0);assert.ok(!a.motion.gallopTimeline,'Shorter eligibility must not bypass support safety');}
for(const facing of [-1,1])for(const scale of [1,2,3,4,5,6]){
 const a=make('interested');a.scale=scale;a.facing=facing;a.x=300*scale;a.social={episode:{kind:'chase'}};
 const rows=box.window.pixelCatRoamingArtV2.idleSequences.lookdown.frames[0];
 a.idle={pose:'lookdown',rows,facing,anchor:[14,17],placement:{x:a.x,top:350},contactX:a.x+(facing<0?9:14)*scale};
 a.moveTo(a.x+facing*18*scale,400,0,'walk',target,0);
 if(a.motion.gallopTimeline)assert.ok(a.motion.cells>=art.gallop.strideCells,'Eligibility uses rebased departure, not stale sprite origin');
}
console.log('PASS: exact corrected gallop/backup separation, 25FPS stance-aware travel, both facings/three scales, full strides/tail walk/exact endpoints, planted support, safe recall and relaxed/trot fallback.');
