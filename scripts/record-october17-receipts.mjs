// Exact-version receipts only, run after deployment/readback and validation.
import fs from 'node:fs';import crypto from 'node:crypto';
const base='http://127.0.0.1:8767',root='frame-studio/user-sequences/review-2026-10-17/',hash=p=>crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');
const records=JSON.parse(fs.readFileSync(root+'approved-sequences.json')),archives=JSON.parse(fs.readFileSync(root+'archived-sequences.json')),post=JSON.parse(fs.readFileSync(root+'approved-scratching-post.json'));
const integrated=new Map(records.map(r=>[r.contentHash,r.projectId]));integrated.set(hash(post),post.id);const archived=new Set(archives.map(r=>hash(r.project)));let cursor,completed=0,deferred=0;
do{const response=await fetch(base+'/api/changes'+(cursor?'?cursor='+encodeURIComponent(cursor):'')),page=await response.json();for(const e of page.changes){let status,notes;
 if(integrated.has(e.versionHash)){status='completed';notes='Exact saved version integrated: approved lift, optional pre-pounce wiggle, or authored scratching-post action/prop. Artwork provenance retained; validated runtime build and HA readback.';}
 else if(archived.has(e.versionHash)){status='completed';notes='Title contains delete: reversibly archived as requested. Stable ID, frames, prior receipts and deletion tombstone retained. Not installed as a new runtime action.';}
 else if(e.kind==='prop'){const entry=await(await fetch(base+'/api/changes/'+e.id)).json();if(entry.snapshot.colourVariants){status='deferred';notes='AI palette-theme review proposals saved in Studio. Original artwork retained; colours are not enabled in runtime. Awaiting material/channel and human palette review (PROP-06).';}}
 if(!status)continue;const r=await fetch(base+'/api/changes/'+e.id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({versionHash:e.versionHash,status,notes,reference:'review-2026-10-17 / scripts/test-cat-behaviour-refinements.mjs / ROADMAP VERT-01 PROP-06'})});if(!r.ok)throw Error(await r.text());status==='completed'?completed++:deferred++;
 }cursor=page.cursor;}while(cursor);
console.log({completed,deferred});
