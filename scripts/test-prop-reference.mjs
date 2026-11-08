import fs from 'node:fs';import assert from 'node:assert/strict';
import {validatePropReference,referencePixels,drawPropReference} from '../frame-studio/dist/prop-reference-model.js';
import {validateProject,clone} from '../frame-studio/dist/model.js';
import {duplicateSequence} from '../frame-studio/dist/sequences.js';
const ref={assetId:'post',x:18,y:1,visible:true,flip:false,foreground:false,opacity:.65},asset={width:2,height:2,pixels:[['#112233',null],['#445566','#778899']]};
assert.deepEqual(referencePixels(asset,ref),[{x:18,y:1,colour:'#112233'},{x:18,y:2,colour:'#445566'},{x:19,y:2,colour:'#778899'}]);
assert.equal(referencePixels(asset,{...ref,flip:true})[0].x,19);assert.equal(referencePixels(asset,{...ref,visible:false}).length,0);assert.equal(referencePixels(null,ref).length,0);
for(const invalid of [{x:1.5},{y:97},{opacity:2},{assetId:'bad/path'},{flip:'yes'}])assert.throws(()=>validatePropReference({...ref,...invalid}));
const calls=[],ctx={save(){calls.push('save');},restore(){calls.push('restore');},fillRect(...args){calls.push(args);},set fillStyle(v){},set globalAlpha(v){assert.equal(v,.65);}};
drawPropReference(ctx,asset,ref,3,10,20);assert.deepEqual(calls,['save',[64,23,3,3],[64,26,3,3],[67,26,3,3],'restore']);
const proposal=JSON.parse(fs.readFileSync('frame-studio/user-sequences/scratching-post-draft-2026-10-16/proposal.json','utf8')),{project,prop}=proposal;
validateProject(project);assert.equal(prop.origin,'ai');assert.equal(prop.review,'candidate');assert.equal(project.frames.length,13);assert.equal(project.propReference.assetId,prop.id);assert.ok(project.wip);
const rows=JSON.stringify(project.frames.map(f=>f.rows)),copy=clone(project),variant=duplicateSequence(project,'human');assert.deepEqual(variant.propReference,project.propReference);assert.equal(JSON.stringify(copy.frames.map(f=>f.rows)),rows);
for(const f of project.frames){assert.equal(f.rows[23][7],'R');assert.deepEqual(f.anchor,{x:7,y:23});assert.equal(f.review,'candidate');if(f.role==='cycle'){assert.equal(f.origin,'mixed');const paws=f.rows.flatMap((r,y)=>[...r].flatMap((v,x)=>v==='F'?[{x,y}]:[]));assert.ok(paws.length>=1);for(const p of paws)assert.ok(prop.pixels[p.y-project.propReference.y]?.[p.x-project.propReference.x],'Draft paws actually meet opaque rope pixels');}}
assert.equal(project.frames[0].origin,'human');assert.equal(project.frames.at(-1).origin,'human');assert.equal(JSON.stringify(project.frames.map(f=>f.rows)),rows,'Reference/context work never changes the cat grids');
console.log('PASS: separate prop reference geometry, mirror/opacity/visibility, validation, portable metadata/duplication, exact cat pixels and proposed scratch contacts against the rope.');
