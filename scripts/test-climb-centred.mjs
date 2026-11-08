import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {freshDraft,clone,validateDraft,sceneFor,planClimb,runtimeProbe} from '../prototype/climb-model.mjs';
import {seedRotations} from '../prototype/climb-rotation.mjs';
import {seedCentredClimbs,deriveCentredBehind,bakedCentredFront,isBakedCentredFrame} from '../prototype/climb-centred.mjs';
import {createHash} from 'node:crypto';
import {climbContactEvents,sampleClimbParticles} from '../prototype/climb-contact-particles.mjs';
import {savedFrameEntries} from '../frame-studio/dist/change-diff.js';
const b={window:{},HTMLElement:class{},customElements:{get:()=>true},performance};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,art:CAT_ART};',b);
const {Home,art}=b.api,d=freshDraft();d.rotations=seedRotations(d.frames[1]);const original=JSON.stringify(d);
d.centred=seedCentredClimbs();assert.equal(JSON.stringify({...d,centred:undefined}),original);validateDraft(d);assert.equal(savedFrameEntries(d).length,37);
const run=(draft,state=null,action='hold')=>{const sc=sceneFor(draft.config);return planClimb(draft,runtimeProbe(Home,art,{},sc.scale),state?{state,action}:null);};
for(const age of ['kitten','adult','senior'])for(const path of ['front','back']){
 const draft=clone(d);Object.assign(draft.config,{age,entry:'grip',scenario:'rotate-exit'});const before=JSON.stringify(draft),initial=run(draft);assert.ok(initial.ok,initial.reason);let state=initial.grips[0];
 const mid=run(draft,state,'centre-'+path);assert.ok(mid.ok,mid.reason);state=mid.grips.at(-1);assert.equal(state.side,'centre-'+path);assert.equal(state.root.y,initial.grips[0].root.y);
 const held=run(draft,state);assert.equal(held.grips.at(-1).root.y,state.root.y);assert.equal(climbContactEvents(held).length,0);
 const up=run(draft,state,'up');assert.ok(up.ok,up.reason);assert.ok(up.grips.at(-1).root.y<state.root.y);assert.ok(up.segments.filter(s=>s.kind==='climb').every(s=>s.from.x===s.to.x&&(s.frame.contact==='free'||s.from.y===s.to.y)));
 const events=climbContactEvents(up);assert.equal(events.length,2);assert.ok(events.every(e=>e.colour==='#b29b69'&&e.depth===(path==='back'?'behind':'foreground')));assert.ok(sampleClimbParticles(events,events[0].at+100).length);assert.equal(sampleClimbParticles(events,-1).length,0);assert.equal(sampleClimbParticles(events,1e8).length,0);
 const down=run(draft,up.grips.at(-1),'down');assert.ok(down.ok);assert.equal(down.grips.at(-1).root.y,state.root.y);
 const opposite=run(draft,up.grips.at(-1),'to-right-'+path);assert.ok(opposite.ok);assert.equal(opposite.grips.at(-1).side,'right');assert.equal(opposite.grips.at(-1).root.y,up.grips.at(-1).root.y);
 const exit=run(draft,opposite.grips.at(-1),'floor');assert.ok(exit.ok,exit.reason);assert.ok(exit.goalReached);assert.ok(exit.checks<=96);
 // No direct arc switch through the prop. Reassess at either side first.
 assert.equal(state.options.find(o=>o.id==='to-right-'+(path==='front'?'back':'front')).enabled,false);
 assert.equal(JSON.stringify(draft),before,'Route opportunities do not rewrite saved artwork');
 Object.assign(draft.config,{entryPose:'centre-'+path,entry:'ledge-jump',attach:22,scenario:'plane',gap:60,entryLedgeRise:100});
 const direct=run(draft);assert.ok(direct.ok,direct.reason);assert.ok(direct.segments.some(s=>s.kind==='attach'));assert.equal(direct.grips[0].pose,'findGripCentred');assert.equal(direct.scene.face.passThrough,true);assert.equal(direct.scene.face.material,'wallpaper');
 assert.equal(direct.segments.filter(s=>s.kind==='rotation').length,0,'A flat-plane grip may leap directly without a post-side rotation');
 assert.ok(climbContactEvents(direct).every(e=>e.colour===direct.scene.face.surfaceColour));
 Object.assign(draft.config,{scenario:'centre-route',entryPose:'side',entry:'walk',rotationPath:path,rise:210,postHeight:370,leapRise:90});
 const chain=run(draft);assert.ok(chain.ok,chain.reason);assert.ok(chain.goalReached);assert.ok(chain.grips.some(g=>g.side==='centre-'+path));assert.ok(chain.segments.some(s=>s.kind==='climb'&&s.frame.id.startsWith('centred-')));assert.equal(chain.grips.at(-1).side,'right');
}
const many=Array.from({length:100},(_,i)=>({at:0,x:i,y:10,ground:100,scale:3,paw:0,colour:'#b29b69',depth:'foreground'}));assert.equal(sampleClimbParticles(many,100).length,32);
const bad=clone(d);bad.centred.front.frames[3].contact='front';assert.throws(()=>validateDraft(bad));assert.doesNotThrow(()=>validateDraft(bad,{playback:false}));
assert.equal(bakedCentredFront.sourceVersion,'38396990481a167e20c75b3f311b9ed750924d0c50345ef1bf01c59b35537881');
assert.equal(createHash('sha256').update(JSON.stringify(d.centred.front)).digest('hex'),bakedCentredFront.clipHash,'Reviewed art/timing/contact/depth must match the captured digest');
assert.ok(isBakedCentredFrame(d.centred.front.frames[0]));const edited=clone(d.centred.front.frames[0]);edited.ms++;assert.equal(isBakedCentredFrame(edited),false,'Later edits cannot inherit exact baseline approval');
const behind=deriveCentredBehind(d.centred.front);for(let i=0;i<behind.frames.length;i++){const f=d.centred.front.frames[i],b=behind.frames[i];for(const k of ['rows','anchor','paws','ms','gain','contact','rest','origin'])assert.deepEqual(b[k],f[k]);assert.equal(b.id,f.id.replace('front','back'));assert.ok(b.depth.every((r,y)=>[...r].every((v,x)=>f.rows[y][x]==='.'?v==='.':v===(f.depth[y][x]==='F'?'N':'F'))));}
console.log('PASS: centred front/back entries, partial turns, up/down/hold/exit opportunities across ages, planted constraints, immutable art, material/contact/depth particles and bounded scrub sampling.');
