import fs from 'node:fs';import crypto from 'node:crypto';import {validateProject} from '../frame-studio/dist/model.js';
const root=new URL('../frame-studio/user-sequences/refinements-2026-10-14-late/',import.meta.url);export const latestManifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root),'utf8'));
export const latestProjects=new Map(latestManifest.records.filter(r=>!r.archived&&!/^(QA|Drawing check|Across jump · horizontal flight)/.test(r.name)).map(r=>{const record=JSON.parse(JSON.parse(fs.readFileSync(new URL(r.snapshot,root),'utf8')).body);validateProject(record.project);return [r.projectId,{...r,project:record.project}];}));
export const latestProps=JSON.parse(fs.readFileSync(new URL('props-browser-export.json',root),'utf8'));
// Exact saved edits from the next review round overlay older snapshots. Keep
// deletion tombstones so a catalogue rebuild cannot resurrect removed clips.
const refinementRoot=new URL('../frame-studio/user-sequences/refinements-2026-10-15/',import.meta.url);
export const refinementManifest=JSON.parse(fs.readFileSync(new URL('manifest.json',refinementRoot),'utf8'));
for(const r of refinementManifest.records){const record=JSON.parse(JSON.parse(fs.readFileSync(new URL(r.snapshot,refinementRoot),'utf8')).body);validateProject(record.project);latestProjects.set(r.projectId,{...r,project:record.project});}

// User-approved corrected gallop and its separately saved backup; no pixel synthesis.
const gallopRecords=JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/gallop-refined-2026-10-15/saved-projects.json',import.meta.url),'utf8'));
for(const record of gallopRecords){validateProject(record.project);const p=record.project;latestProjects.set(p.projectId,{projectId:p.projectId,name:p.name,savedAt:record.savedAt,contentHash:crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),frames:p.frames.length,project:p});}

const october16=JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/gallop-descent-2026-10-16/saved-projects.json',import.meta.url),'utf8'));
for(const record of october16){validateProject(record.project);const p=record.project;latestProjects.set(p.projectId,{projectId:p.projectId,name:p.name,savedAt:record.savedAt,contentHash:crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),frames:p.frames.length,project:p});}

// Explicitly approved saved workshop outputs; exact pixels/provenance are retained.
for(const record of JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/review-2026-10-17/approved-sequences.json',import.meta.url),'utf8'))){
 validateProject(record.project);const p=record.project;latestProjects.set(p.projectId,{projectId:p.projectId,name:p.name,savedAt:record.savedAt,contentHash:record.contentHash,frames:p.frames.length,project:p});
}

for(const record of JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/review-2026-10-17/archived-sequences.json',import.meta.url),'utf8'))){
 const p=record.project;latestProjects.set(p.projectId,{projectId:p.projectId,name:p.name,savedAt:record.savedAt,contentHash:crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex'),frames:p.frames.length,project:p});
}

// Exact follow-up refinements; immutable earlier reviews remain available.
export const followupChanges=['proposal-lifted-scruff','proposal-scratching-post-action'].map(id=>JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/refinement-batch-2026-10-17/'+id+'.json',import.meta.url),'utf8')));
for(const c of followupChanges){validateProject(c.snapshot);if(crypto.createHash('sha256').update(JSON.stringify(c.snapshot)).digest('hex')!==c.versionHash)throw Error('Follow-up snapshot hash mismatch');latestProjects.set(c.entityId,{projectId:c.entityId,name:c.snapshot.name,savedAt:c.at,contentHash:c.versionHash,frames:c.snapshot.frames.length,project:c.snapshot});}

// Additive mechanical track assembly retains all original source grids.
const trackChange=JSON.parse(fs.readFileSync(new URL('../frame-studio/user-sequences/animation-tracks-2026-10-17/source-change.json',import.meta.url),'utf8'));
validateProject(trackChange.snapshot);if(crypto.createHash('sha256').update(JSON.stringify(trackChange.snapshot)).digest('hex')!==trackChange.versionHash)throw Error('Track snapshot hash mismatch');latestProjects.set(trackChange.entityId,{projectId:trackChange.entityId,name:trackChange.name,savedAt:trackChange.at,contentHash:trackChange.versionHash,frames:trackChange.snapshot.frames.length,project:trackChange.snapshot});
