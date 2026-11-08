import assert from 'node:assert/strict';
import {readmeAssets} from './readme-assets.mjs';
import {queue,duration,frameMs,sample,commands,sequenceFrame,size} from '../prototype/readme-routine.mjs';
const assets=readmeAssets(),before=JSON.stringify(assets);
assert.ok(queue.some(s=>s.clip==='postScratch'));assert.ok(queue.some(s=>s.clip==='eat'));assert.ok(queue.some(s=>s.clip==='scratch'));
let boundary=0;
for(const step of queue){assert.equal(sample(boundary).id,step.id);boundary+=step.ms;assert.equal(step.ms%frameMs,0);}
assert.equal(sample(duration).id,queue[0].id);
for(let time=0;time<duration;time+=frameMs){
 const frame=commands(assets,time);assert.deepEqual(commands(assets,time),frame);
 for(const r of frame.ops){assert.ok([r.x,r.y,r.w,r.h].every(Number.isInteger));assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=size.width&&r.y+r.h<=size.height);}
}
const post=assets.clips.postScratch;
assert.equal(sequenceFrame(post,0,3520),post.frames[0]);
assert.equal(sequenceFrame(post,3519,3520),post.frames.at(-1));
assert.equal(JSON.stringify(assets),before,'Media playback must not mutate saved artwork or provenance');
assert.deepEqual(commands(assets,0).ops,commands(assets,duration-1).ops,'Loop starts and ends on the same resting scene');
console.log('PASS: ordered media queue, exact authored enter/exit, bounded integer pixels, repeatable frames, unchanged source art and closed-loop scene.');
