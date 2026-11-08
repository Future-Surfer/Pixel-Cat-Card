import assert from 'node:assert/strict';
import {applyFrameTiming} from '../frame-studio/dist/frame-timing.js';
import {newFrame,clone} from '../frame-studio/dist/model.js';

const project={frames:['human','mixed','ai','human'].map(origin=>({...newFrame(),origin}))};
project.frames[3].locked=true;
const before=clone(project);
assert.equal(applyFrameTiming(project,1,3,65),3);
for(let i=0;i<3;i++)assert.deepEqual({...project.frames[i],durationMs:before.frames[i].durationMs},before.frames[i],'Timing must preserve pixels, metadata, IDs and provenance');
assert.deepEqual(project.frames[3],before.frames[3],'Unselected locked artwork is untouched');
const timed=clone(project);
for(const args of [[1,4,100],[0,2,100],[3,2,100],[1,5,100],[1.5,3,100],[1,2,49],[1,2,5001],[1,2,NaN]]){
 assert.throws(()=>applyFrameTiming(project,...args));
 assert.deepEqual(project,timed,'Invalid or partially locked selections must not change any holds');
}
console.log('PASS: frame-range timing preserves exact assets, rejects locks atomically, supports fractional-FPS holds and validates range/duration.');
