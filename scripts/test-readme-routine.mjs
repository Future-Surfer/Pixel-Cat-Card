import assert from 'node:assert/strict';
import {buildReadmePlayback} from './readme-playback.mjs';
import {commands,frameMs,size,scene} from '../prototype/readme-routine.mjs';
const playback=buildReadmePlayback(),{assets,api,duration,stages}=playback;
const original=JSON.stringify([api.art.homeBeds,api.art.idleSequences.scratch,api.art.idleSequences.eat,api.art.idleSequences.postScratch]);
let walkBeats=0,previous=null,scratchCycles=0,previousScratch=null,eatingFrames=0;
const scratch=api.art.idleSequences.scratch,firstCycle=scratch.roles.indexOf('cycle');
assert.ok(scratch.roles.flatMap((r,i)=>r==='cycle'?[api.window.pixelCatPolishV1.hold('scratch',scratch,i)]:[]).every(ms=>ms===75));
for(let time=0;time<duration;time+=frameMs){
 const state=playback.sample(time),frame=commands(assets,state);
 for(const r of frame.ops){assert.ok([r.x,r.y,r.w,r.h].every(Number.isInteger));assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=size.width&&r.y+r.h<=size.height);}
 if(state.walk&&previous?.walk&&state.id===previous.id){
  const beats=state.walk.step-previous.walk.step;
  assert.ok(beats===0||beats===1,'GIF captures each individual release gait beat');
  assert.equal(state.x-previous.x,beats*state.walk.direction*scene.scale||0,'Exactly one native cell per gait beat');
  if(beats===0){assert.equal(state.x,previous.x);assert.equal(state.top,previous.top);assert.deepEqual(state.rows,previous.rows,'A held gait frame cannot translate');}
  else {assert.notEqual(state.walk.frame,previous.walk.frame);walkBeats++;}
 }
 if(state.pose==='scratch'){if(state.frame===firstCycle&&previousScratch!==firstCycle)scratchCycles++;previousScratch=state.frame;}
 if(state.pose==='eat'){
  eatingFrames++;const m=state.mouthPoint;
  assert.ok(m.x>=scene.bowlX&&m.x<=scene.bowlX+assets.bowl.width*scene.scale,'Authored mouth lies over the bowl');
  assert.ok(m.y>=scene.ground-assets.bowl.height*scene.scale&&m.y<=scene.ground,'Authored mouth reaches the bowl height');
 }
 if(state.pose==='postScratch'){
  const p=api.frameContact(state.rows,state.facing,state.anchor||api.idleContact(state.rows));
  assert.equal(state.x+p[0]*scene.scale,playback.face.bearing,'Post action keeps the release contact bearing');
 }
 previous=state;
}
assert.ok(walkBeats>40);assert.ok(scratchCycles>=2,'Ear scratch repeats the fast cycle before its exit');assert.ok(eatingFrames>100);
for(const id of ['emerge','return']){
 const stage=stages.find(s=>s.id===id),heights=[];
 for(let t=stage.start;t<stage.start+stage.ms;t+=frameMs){
  const state=playback.sample(t);
  if(state.walk)heights.push(state.top+24*scene.scale);
 }
 assert.equal(Math.min(...heights),playback.bed.top);
 assert.equal(Math.max(...heights),scene.ground);
 assert.ok(new Set(heights).size>=3,'Bed transition has intermediate heights');
 for(let i=1;i<heights.length;i++){
  const rise=(heights[i]-heights[i-1])*(id==='return'?-1:1);
  assert.ok(rise>=0&&rise<=scene.scale,'Bed height changes at most one cell per step');
 }
}
assert.equal(playback.sample(0).pose,'sleep');
assert.equal(playback.sample(duration-1).pose,'sleep');
assert.equal(JSON.stringify([api.art.homeBeds,api.art.idleSequences.scratch,api.art.idleSequences.eat,api.art.idleSequences.postScratch]),original,'Source artwork and provenance stay unchanged');
assert.deepEqual(commands(assets,playback.sample(0)).ops,commands(assets,playback.sample(duration-1)).ops);
assert.ok(stages.every(s=>s.ms%frameMs===0));
console.log(`PASS: release gait clocks (${walkBeats} beats), 75ms ear-scratch loops (${scratchCycles} starts), ${eatingFrames} exact bowl contacts, tracked post bearing and unchanged source art.`);
