import fs from 'node:fs';
import {validateProject} from '../frame-studio/dist/model.js';
const read=name=>validateProject(JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/cat-codex-handoff ('+name+').json',import.meta.url),'utf8')).project);
export const refinedWalk=read('walk slow head bob'),refinedLeap=read('horizontal leap refinement');
if(refinedWalk.frames.length!==8||refinedLeap.frames.length!==5)throw Error('Unexpected user sequence layout');
export const highWalk=refinedWalk.frames.filter((_,i)=>i%2===0),lowWalk=refinedWalk.frames.filter((_,i)=>i%2===1);
export const provenance=f=>({origin:f.origin,review:f.review,frameId:f.id,source:f.source,operations:f.operations||[]});
// The user's chat authorizes runtime integration; the original review records stay intact.
export const integration={by:'user',via:'chat',date:'2026-10-14',note:'Use the odd/even head cycles and refined horizontal leap; keep frame 4 an opt-in tall-drop experiment.'};
