import assert from 'node:assert/strict';
import fs from 'node:fs';
import {behaviourDrafts,behaviourDraftManifest} from './behaviour-drafts.mjs';
import {latestProjects} from './latest-studio-assets.mjs';
import {validateProject} from '../frame-studio/dist/model.js';
import {reconcileCatalogue,rememberSequence} from '../frame-studio/dist/sequences.js';
import {buildPlaybackPlan} from '../frame-studio/dist/playback.js';
const ids=new Set(behaviourDrafts.map(p=>p.projectId));assert.equal(ids.size,8);assert.equal(behaviourDraftManifest.runtimeEnabled,false);
const allFrameIds=new Set(),library=JSON.parse(fs.readFileSync('frame-studio/dist/library.json'));
for(const p of behaviourDrafts){
 validateProject(p);assert.equal(p.behaviour.runtimeEnabled,false);assert.equal(p.wip,true);assert.ok(library.groups.some(g=>g.projectId===p.projectId));
 for(const role of ['enter','cycle','exit'])assert.ok(p.frames.some(f=>f.role===role),p.name+' lacks '+role);
 for(const f of p.frames){assert.ok(!allFrameIds.has(f.id));allFrameIds.add(f.id);assert.equal(f.review,'candidate');assert.ok(f.rows.join('').includes('#'));assert.equal(f.rows[f.anchor.y][f.anchor.x],'R','Proposed bearing must be an actual marker');
  const original=latestProjects.get(f.source.projectId).project.frames.find(o=>o.id===f.source.frameId);assert.ok(original);assert.equal(f.origin,JSON.stringify(f.rows)===JSON.stringify(original.rows)?original.origin:'mixed','AI edits must retain human lineage');}
 assert.ok(new Set(p.frames.filter(f=>f.role==='cycle').map(f=>f.rows.join(''))).size>=2,'Cycle needs distinguishable populated poses');
 for(const side of ['before','after'])for(const id of p.preferredNeighbours[side])assert.ok(ids.has(id)||latestProjects.has(id),'Resolve neighbour by stable ID');
 const plan=buildPlaybackPlan(p,{}, {includeEnter:false,includeExit:false});assert.ok(plan.every(s=>s.frame.role==='cycle'));
 // Catalogue refresh must leave a human's edited working copy under the same
 // stable ID alone, even though the base candidate is shipped in the library.
 const working=structuredClone(p);working.catalogueRevision=library.catalogueRevision;working.name='Human renamed this';working.frames[0].rows[0]='#'+'.'.repeat(23);working.frames[0].origin='mixed';const book={};rememberSequence(book,working);reconcileCatalogue(book,library);assert.equal(book[p.projectId].project.name,'Human renamed this');assert.equal(book[p.projectId].project.frames[0].rows[0][0],'#');
}
assert.equal(allFrameIds.size,62);console.log('PASS: eight populated behaviour drafts / 62 frames, provenance, distinct cycles, phase filters, supported anchors, resolvable soft neighbours and preservation of human refinements.');
