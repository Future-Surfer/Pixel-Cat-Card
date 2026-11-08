import {latestProjects} from './latest-studio-assets.mjs';
import {savedProject} from './saved-user-refinements.mjs';
import {draftPoses} from './draft-cat-poses.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {pixelVolume,frameRole,validateProject,projectFromGroup} from '../frame-studio/dist/model.js';
import {reconcileCatalogue,starterSequences,duplicateSequence,rememberSequence} from '../frame-studio/dist/sequences.js';
import {phaseFrames} from '../frame-studio/dist/playback.js';
import {refinedLeap,highWalk,lowWalk} from './user-refined-art.mjs';
const library=JSON.parse(fs.readFileSync('frame-studio/dist/library.json')),groups=new Map(library.groups.map(g=>[g.id,g]));
const equal=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
assert.equal(groups.get('sit').frames.length,4);assert.equal(groups.get('sit-elevated').frames.length,4);
assert.deepEqual(library.groups.filter(g=>g.category==='walk'&&!g.savedProject?.variantOf).map(g=>g.id),['walk','walk-high','walk-low']);
equal(groups.get('across').frames[2].rows,latestProjects.get('sequence-across').project.frames[2].rows);equal(groups.get('walk-high').frames.map(f=>f.rows),savedProject('sequence-walk-high').frames.map(f=>f.rows));equal(groups.get('walk-low').frames.map(f=>f.rows),savedProject('sequence-walk-low').frames.map(f=>f.rows));
assert.equal(groups.get('stand').frames[0].role,'enter');assert.equal(phaseFrames(groups.get('stand'),'cycle').length,4);
assert.equal(pixelVolume(['.#RFB.','...#..']),5,'Count every nontransparent coloured cell, guides included');
for(const g of library.groups){validateProject(projectFromGroup(g));assert.ok(g.frames.every(f=>['enter','cycle','exit'].includes(frameRole(f))));}
for(const f of Object.values(draftPoses())){assert.equal(f.origin,'ai');assert.equal(f.review,'candidate');assert.ok(pixelVolume(f.rows)>60&&pixelVolume(f.rows)<300);assert.equal(f.operations[0].actor,'ai');}
const book={},old={...projectFromGroup(groups.get('across')),projectId:'sequence-across',name:'Old jump copy'};old.frames[2].rows=old.frames[0].rows;
rememberSequence(book,old);reconcileCatalogue(book,library);equal(book['sequence-across'].project.frames[2].rows,latestProjects.get('sequence-across').project.frames[2].rows);
const archived=Object.values(book).find(e=>e.project.archivedFrom==='sequence-across');equal(archived.project.frames[2].rows,old.frames[0].rows);
book['sequence-across'].project.frames[2].name='My subsequent edit';reconcileCatalogue(book,library);assert.equal(book['sequence-across'].project.frames[2].name,'My subsequent edit');
const original=book['sequence-walk-high'].project,copy=duplicateSequence(original);equal(copy.frames.map(f=>f.rows),original.frames.map(f=>f.rows));equal(copy.frames.map(f=>f.origin),original.frames.map(f=>f.origin));assert.notEqual(copy.projectId,original.projectId);assert.equal(copy.variantOf.projectId,original.projectId);assert.ok(copy.frames.every((f,i)=>f.id!==original.frames[i].id&&f.parentId===original.frames[i].id&&!f.locked&&f.review==='candidate'));
copy.frames[0].rows[0]='#'+copy.frames[0].rows[0].slice(1);assert.notEqual(copy.frames[0].rows[0],original.frames[0].rows[0]);
const sandbox={HTMLElement:class{},customElements:{get(){},define(){}},window:{}};vm.runInNewContext(fs.readFileSync('pixel-pet-card.js','utf8')+';globalThis.cat=PixelPetCard',sandbox);
for(const p of library.props){equal(p.rows,sandbox.cat.PROPS[p.id].rows);equal(p.palette,sandbox.cat.PROPS[p.id].palette);assert.equal(p.width,sandbox.cat.PROPS[p.id].width);assert.equal(p.height,sandbox.cat.PROPS[p.id].height);}
assert.equal(library.props.length,Object.keys(sandbox.cat.PROPS).length);assert.equal(library.audit.excluded.length,1);
const humanDraft={...projectFromGroup(groups.get('sit')),projectId:'pose-look-down',name:'My look-down draft'};const migrationBook={};rememberSequence(migrationBook,humanDraft);reconcileCatalogue(migrationBook,library);assert.ok(Object.values(migrationBook).some(e=>e.project.variantOf?.projectId==='pose-look-down'&&!e.project.archived));
const restored={...projectFromGroup(groups.get('walk')),projectId:'sequence-walk-head-development',name:'Walk head variants · development',archiveOverride:false,archived:false};rememberSequence(migrationBook,restored);reconcileCatalogue(migrationBook,library);assert.equal(migrationBook[restored.projectId].project.archived,false);
console.log('PASS: audited catalogue, exact refinements/props, AI provenance, phase roles, pixel mass, non-destructive refresh and independent variants.');
