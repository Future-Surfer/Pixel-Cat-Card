import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {compileScene} from './media-scene.mjs';
import recipe from './media-recipes/mouse-chase.mjs';
import {sceneCommands} from '../prototype/media-scene.mjs';
const p=compileScene(recipe),q=compileScene(recipe);
const sourceArt=JSON.stringify(p.api.art);
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
assert.equal(digest(p.payload),digest(q.payload),'Fresh compilation is deterministic across VM realms');
for(let i=p.payload.frames.length-1;i>=0;i-=7){assert.deepEqual(p.sample(i*p.frameMs),p.payload.frames[i],'Scrubbing is independent of sampling order');}
assert.deepEqual(sceneCommands(p.payload,p.sample(0)),sceneCommands(p.payload,p.sample(p.duration-p.frameMs)),'Loop boundary is pixel-identical');
const strike=p.stages.find(s=>s.id==='bat');
const before=p.sample(strike.start+strike.strikeAt-p.frameMs),hit=p.sample(strike.start+strike.strikeAt),after=p.sample(strike.start+strike.strikeAt+p.frameMs);
assert.equal(hit.actors[0].frame,p.api.art.interactionContacts.bat.frame);
assert.equal(before.props[0].x,hit.props[0].x);assert.ok((after.props[0].x-hit.props[0].x)*Math.sign(strike.mouse.speed)>0,'Mouse moves only after paw contact');
const cat=hit.actors[0],point=p.api.art.interactionContacts.bat.point,s=recipe.scale,mouse=hit.props[0],asset=p.payload.assets.toy_mouse;
const paw={x:cat.x+(cat.facing<0?23-point[0]+.5:point[0]+.5)*s,y:cat.top+(point[1]+.5)*s};
assert.ok(paw.x>=mouse.x-s&&paw.x<=mouse.x+asset.width*s+s&&paw.y>=mouse.top-s&&paw.y<=mouse.top+asset.height*s+s,'Authored paw reaches toy');
for(const state of p.payload.frames){
 for(const r of sceneCommands(p.payload,state))assert.ok([r.x,r.y,r.w,r.h].every(Number.isInteger),'Integer pixel drawing');
 const stage=p.stages.find(s=>s.id===state.id);
 if(stage.mouse.kind==='held'){
  const toy=state.props[0];assert.ok(Math.abs(toy.x+asset.width*s/2-state.mouth.x)<=.5);assert.ok(Math.abs(toy.top+asset.height*s/2-state.mouth.y)<=.5);
  const cat=state.actors[0];
  if(cat.pose==='sit'){
   const clip=p.api.art.idleSequences.sit,gaze=p.api.art.gazeIndex.frames[clip.sequenceId][cat.frame].gaze;
   assert.equal(state.mouth.x,cat.x+(cat.facing<0?24-gaze.x-.5:gaze.x+.5)*s,'Seated turn uses the authored mouth, not a body-based fallback');
   assert.equal(state.mouth.y,cat.top+(gaze.y+2.5)*s,'Turn retains the seated frame metadata');
  }
  assert.equal(toy.facing,cat.facing,'Held mouse mirrors on the same sample as the cat');
 }
}
for(const stage of p.stages.filter(s=>s.cat.kind==='walk')){
 assert.ok(stage.cat.beatMs>=100,'Happy carry has a purposeful walk beat');
 let previous;
 for(let t=0;t<stage.ms;t+=p.frameMs){
  const cat=p.sample(stage.start+t).actors[0];
  if(previous){
   const beats=cat.walk.step-previous.walk.step;
   assert.ok(beats===0||beats===1);
   assert.equal(cat.x-previous.x,beats*cat.facing*recipe.scale||0,'Displacement follows each native step');
   if(!beats)assert.deepEqual(cat.rows,previous.rows,'No cycling feet while held in place');
  }
  previous=cat;
 }
 assert.equal(previous.x,stage.cat.to,'Destination is shown before the next action');
}
const jump=p.stages.find(s=>s.cat.kind==='pounce');
assert.equal(p.stages[0].cat.pose,'clean','Cat starts grooming');
assert.equal(p.stages.find(s=>s.id==='arrival').cat.pose,'clean','Cat keeps grooming while the mouse passes');
const run=p.stages.find(s=>s.cat.kind==='run');
assert.ok(run.motion.fastClip&&run.ms<3000,'Short run uses the authored fast gait');
assert.ok(run.start>9000,'Chase waits until the mouse has passed');
assert.ok(p.stages.find(s=>s.id==='carry').cat.beatMs<140,'Happy carry is quicker than draft 2');
assert.ok(p.payload.frames.every(f=>f.actors[0].colour==='#ffffff'&&f.actors[0].outlinePath),'White cat uses the release exposed-edge outline');
assert.ok(p.payload.frames.some(f=>f.id===jump.id&&f.actors[0].airborne&&f.actors[0].top<recipe.ground-24*recipe.scale),'Pounce has an actual airborne arc');
assert.ok(p.stages.find(s=>s.id==='carry').cat.to<p.stages.find(s=>s.id==='carry').cat.x,'Carry returns towards the original spot');
assert.ok(p.stages.find(s=>s.id==='catch').cat.x>=recipe.width*2/3,'Catch is near the far end');
assert.equal(JSON.stringify(p.api.art),sourceArt,'Sampling leaves source artwork intact');
assert.throws(()=>compileScene({...recipe,schema:99}),/Unsupported/);
assert.throws(()=>compileScene({...recipe,stages:[recipe.stages[0],recipe.stages[0]]}),/Duplicate/);
console.log('PASS: deterministic media, seamless loop, gentle native gait clocks, sneak, physical pounce, return carry and mirrored bat contact.');
