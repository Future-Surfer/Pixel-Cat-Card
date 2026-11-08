import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {validateProject} from '../frame-studio/dist/model.js';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>0},Math:Object.create(Math)};box.Math.random=()=>.4;
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming-art.js','utf8')+'\n'+['prototype/cat-polish.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={sneakTimeline,walkSample,walkAppearance,airborneSample,bodyCentre,Home:PixelCatHome};',box);
const art=box.window.pixelCatRoamingArtV2,api=box.api;
const paws=(rows,x,s,d)=>rows.flatMap((row,y)=>[...row].flatMap((v,i)=>v==='R'&&y===23?[x+(d<0?23-i:i)*s]:[]));
for(const s of [1,2,3])for(const d of [-1,1]){
 const timeline=api.sneakTimeline(15,art),m={fromX:200,direction:d,sneakTimeline:timeline};let previous;
 assert.deepEqual([...new Set(timeline.map(b=>b.variant))],[0,1,2]);
 for(let i=0;i<timeline.length;i++){const elapsed=i?timeline[i-1].until:0,p=api.walkSample(m,elapsed,s,art.walk),look=api.walkAppearance(art,m,p),held=api.walkSample(m,timeline[i].until-.001,s,art.walk),contacts=paws(look.rows,p.x,s,d);
  assert.equal(held.x,p.x,'A held sneak frame must not slide');
  if(previous)assert.ok(contacts.some(x=>previous.includes(x)),`No shared planted paw at sneak beat ${i}, scale ${s}, direction ${d}`);
  previous=contacts;
 }
 assert.equal(api.walkSample(m,timeline.at(-1).until,s,art.walk).x,200+d*15*s);
 assert.ok(timeline[16].until-timeline[15].until>timeline[8].until-timeline[7].until,'Low head moves slower than mid');
 const home=Object.create(api.Home.prototype);Object.assign(home,{scale:s,size:24*s,config:{},worldRect:{top:64}});
 const drop={fromX:200*s,fromY:300*s,x:(200+30*d)*s,y:380*s,direction:d,jumpKind:'descend'};drop.jumpProfile=home.planJump(drop);assert.ok(drop.jumpProfile);
 assert.equal(api.airborneSample(art,drop,.1,s).sequenceId,'descend','Do not enter freefall during takeoff');
 const sample=api.airborneSample(art,drop,.8,s);assert.equal(sample.sequenceId,'sequence-freefall-candidate');assert.equal(sample.origin,art.freefallSequence.origins[sample.assetFrame]);
 assert.equal(api.airborneSample(art,drop,.8,s,{freefall_enabled:false}).sequenceId,'descend');
 const pre=drop.jumpProfile.durations[0]+drop.jumpProfile.durations[1],t=pre+drop.jumpProfile.flight.flightMs*.8,p=t/drop.jumpProfile.duration;
 const falling=home.jumpSample(drop,p);home.config={freefall_enabled:false};const normal=home.jumpSample(drop,p);for(const axis of ['x','y']){const a=api.bodyCentre(falling.rows,d),b=api.bodyCentre(normal.rows,d),key=axis==='x'?'x':'top';assert.ok(Math.abs(falling[key]+a[axis]*s-normal[key]-b[axis]*s)<=s,'Freefall must not change trajectory');}
}
const h=Object.create(api.Home.prototype),surface={id:'wide',min:100,max:500,left:100,right:548,top:500};Object.assign(h,{scale:2,size:48,x:120,y:500,support:surface,config:{},route:[],walkSteps:0,setAttribute(){},removeAttribute(){},status(){}});
assert.equal(h.startPlay(0,true),true);const stages=['sit'];let t=0;
for(let n=0;n<10&&h.play;n++){t=Number.isFinite(h.play.waitUntil)?h.play.waitUntil:t+1000;h.advancePlay(t);if(h.play)stages.push(h.play.stage);if(h.motion){assert.ok(h.motion.x>=surface.min&&h.motion.x<=surface.max);assert.equal(h.motion.target,surface);h.x=h.motion.x;h.y=h.motion.y;h.motion=null;h.play.waitUntil=t;}}
assert.deepEqual(stages,['sit','notice','sneak','pounce','settle','groom']);assert.equal(h.play,null);
h.support={...surface,narrow:true};assert.equal(h.startPlay(0,true),false,'Never pounce from a small perch');
const draft=validateProject(JSON.parse(fs.readFileSync('frame-studio/user-sequences/gallop-draft.json')));assert.equal(draft.frames.length,8);assert.ok(draft.frames.every(f=>f.origin==='mixed'&&f.review==='candidate'));assert.equal(draft.gait.runtimeEnabled,false);
console.log('PASS: sneak contacts at three scales/both facings, speed-linked head height, bounded interruptible play stages, long lateral freefall, provenance and unchanged ballistic centre; original gallop draft preserved.');
