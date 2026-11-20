import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {compileScene} from './media-scene.mjs';
import recipe from './media-recipes/box-and-tree.mjs';
import {sceneCommands} from '../prototype/media-scene.mjs';
import {mediaRuntimeHash} from './media-runtime.mjs';
const p=compileScene(recipe),q=compileScene(recipe);
const hash=v=>createHash('sha256').update(v).digest('hex');
assert.equal(hash(JSON.stringify(p.payload)),hash(JSON.stringify(q.payload)),'Independent tracks compile reproducibly');
assert.deepEqual(sceneCommands(p.payload,p.sample(0)),sceneCommands(p.payload,p.sample(p.duration-p.frameMs)),'Two-cat loop meets at identical pixels');
const tree=recipe.furniture.find(f=>f.asset==='tree'),platform=p.payload.assets.tree.platforms[0];
const treeScale=tree.scale??recipe.scale;
const left=tree.x+platform.left*treeScale,right=tree.x+platform.right*treeScale,top=tree.top+platform.top*treeScale;
const original=JSON.stringify([p.api.art.idleSequences.backRoll,p.api.window.pixelCatBoxArtV1]);
for(let time=0;time<p.duration;time+=p.frameMs){
 const frame=p.sample(time);assert.equal(frame.actors.length,2);assert.deepEqual(frame.actors.map(a=>a.id),['Box cat','Tree cat']);
 const cat=frame.actors[1];assert.equal(cat.ground,top);
 const ink=cat.rows.flatMap(row=>[...row].flatMap((c,x)=>c==='.'?[]:[cat.x+(cat.facing<0?23-x:x)*recipe.scale]));
 assert.ok(Math.min(...ink)>=left&&Math.max(...ink)+recipe.scale<=right,'Complete visible rest footprint fits the released platform, including head/tail changes');
 const commands=sceneCommands(p.payload,frame);
 for(const r of commands){assert.ok([r.x,r.y,r.w,r.h].every(Number.isInteger));assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=recipe.width&&r.y+r.h<=recipe.height,'Scene pixels stay in bounds');}
 const box=frame.actors[0];
 if(box.mask)for(const r of commands.filter(r=>r.c===box.colour))assert.ok(r.y+r.h<=box.mask.rim||r.x+r.w<=box.mask.left||r.x>=box.mask.right,'Box front hides the cat using runtime aperture bounds');
}
assert.ok(p.payload.frames.some(f=>f.actors[0].pose==='box-exit'&&f.actors[1].pose==='sleep'),'Neighbour sleeps through the initial box outing');
assert.ok(p.payload.frames.some(f=>f.actors[0].pose==='box-peek'&&f.actors[1].pose==='backRoll'),'Resting cat has its own paws-up clock');
const boxTrack=p.tracks[0].playback,treeTrack=p.tracks[1].playback;
const scratching=boxTrack.stages.find(s=>s.id==='scratch'),stir=treeTrack.stages.find(s=>s.id==='stir');
assert.equal(stir.start,scratching.start+1100,'Neighbour stirs after scratching starts, with a short delay');
assert.ok(treeTrack.stages.find(s=>s.id==='paws-up').start>stir.start);
assert.ok(p.sample(p.duration-20).actors[1].pose==='sleep','Neighbour returns to sleep');
let contacts=0;
const rope=p.payload.assets.tree.ropes[0],face={x:tree.x+rope.left*treeScale,top:tree.top+rope.top*treeScale,bottom:tree.top+rope.bottom*treeScale};
for(let t=scratching.start;t<scratching.start+scratching.ms;t+=p.frameMs){
 const cat=p.sample(t).actors[0],anchor=p.api.art.idleSequences.postScratch.anchors[cat.frame];
 assert.equal(cat.x+anchor[0]*recipe.scale,scratching.cat.contactX,'Scratch retains the runtime contact bearing');
 if(cat.rows.some((row,y)=>[...row].some((c,x)=>c==='F'&&Math.abs(cat.x+x*recipe.scale-face.x)<=2*recipe.scale&&cat.top+y*recipe.scale>=face.top&&cat.top+y*recipe.scale<=face.bottom)))contacts++;
}
assert.ok(contacts>10,'Visible forepaws reach the lower rope post');
const sleep=treeTrack.stages.find(s=>s.id==='sleep-again'),lastSleep=p.sample(sleep.start+sleep.ms-20).actors[1];
assert.equal(p.api.art.idleSequences.sleep.roles[lastSleep.frame],'cycle','Final sleep remains settled instead of replaying a wake-up exit');
const slower={...recipe,tracks:recipe.tracks.map((track,i)=>i?track:{...track,stages:track.stages.map(s=>s.id==='approach'?{...s,cat:{...s.cat,beatMs:120}}:s)})};
const shifted=compileScene(slower);
assert.equal(shifted.tracks[1].playback.stages.find(s=>s.id==='stir').start,shifted.tracks[0].playback.stages.find(s=>s.id==='scratch').start+1100,'Reaction follows a retimed approach without editing the other track');
for(let i=p.payload.frames.length-1;i>=0;i-=11)assert.deepEqual(p.sample(i*p.frameMs),p.payload.frames[i],'Seeking cannot advance either actor clock');
assert.equal(JSON.stringify([p.api.art.idleSequences.backRoll,p.api.window.pixelCatBoxArtV1]),original,'Exact saved artwork remains unchanged');
const manifest=JSON.parse(fs.readFileSync('docs/images/pixel-cat-mouse-chase.json','utf8'));
assert.notEqual(manifest.runtimeSha256,hash('{}'),'Runtime provenance must hash the source modules rather than their non-enumerable art proxy');
assert.equal(manifest.runtimeSha256,mediaRuntimeHash(),'Approved media records the exact ordered runtime sources');
assert.equal(hash(fs.readFileSync('docs/images/pixel-cat-mouse-chase.gif')),manifest.outputSha256,'README uses the exact approved mouse GIF');
const readme=fs.readFileSync('README.md','utf8');
assert.ok(readme.indexOf('## Install')<readme.indexOf('docs/images/pixel-cat-mouse-chase.gif')&&readme.indexOf('docs/images/pixel-cat-mouse-chase.gif')<readme.indexOf('## Add a cat'));
assert.throws(()=>compileScene({...recipe,durationMs:40001}),/loop exactly/);
assert.throws(()=>compileScene({...recipe,tracks:[recipe.tracks[0],recipe.tracks[0]]}),/Duplicate actor/);
console.log('PASS: independent two-cat tracks, exact box occlusion, released platform fit, deterministic seeking/loop and approved README GIF hash.');
