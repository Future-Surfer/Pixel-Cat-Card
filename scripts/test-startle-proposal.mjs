import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildStartleHop,STARTLE_ID} from './propose-startle-hop.mjs';
import {validateProject} from '../frame-studio/dist/model.js';
const root='frame-studio/user-sequences/startle-hop-2026-10-15/',sources=JSON.parse(fs.readFileSync(root+'sources.json')),before=JSON.stringify(sources),p=buildStartleHop(sources,'2026-10-15T00:00:00.000Z');
assert.equal(p.projectId,STARTLE_ID);assert.equal(p.frames.length,7);assert.equal(p.frames.reduce((n,f)=>n+f.durationMs,0),500);assert.equal(p.wip,true);assert.equal(p.oneShot,true);assert.equal(p.assembly.actor,'ai');
for(let i=0;i<p.frames.length;i++){const f=p.frames[i],ref=p.assembly.sourceFrames[i],record=sources.find(r=>r.project.projectId===ref.projectId),source=record.project.frames[ref.sourceFrameIndex];assert.deepEqual(f.rows,source.rows);assert.deepEqual(f.gaze,source.gaze);assert.equal(f.origin,source.origin);assert.equal(f.parentId,source.id);assert.equal(f.source.savedFrameId,source.id);assert.equal(f.source.savedAt,record.savedAt);assert.equal(f.review,'candidate');if(f.role==='cycle')assert.equal(f.anchor,null);else assert.equal(f.rows[f.anchor.y][f.anchor.x],'R');}
assert.equal(JSON.stringify(sources),before);validateProject(p);
const saved=JSON.parse(fs.readFileSync(root+'project.json')).project;assert.deepEqual(saved.frames.map(f=>f.rows),p.frames.map(f=>f.rows));
console.log('PASS: seven-frame/500ms borrowed startle proposal, exact pixels/gaze/origin, immutable sources, stable IDs, role/contact metadata and review-only status.');
