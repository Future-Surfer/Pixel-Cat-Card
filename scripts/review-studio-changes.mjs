// Read-only preflight. Hosted and loopback workshops are different stores.
import {latestProjects} from './latest-studio-assets.mjs';import fs from 'node:fs';
const base=process.env.CAT_STUDIO_URL||'http://127.0.0.1:8767',all=[];let cursor;
try{do{const r=await fetch(base+'/api/changes'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('HTTP '+r.status);const p=await r.json();all.push(...p.changes);cursor=p.cursor;}while(cursor);
const latest=new Map();for(const e of all.sort((a,b)=>b.at.localeCompare(a.at)))if(!latest.has(e.entityId))latest.set(e.entityId,e);
const cap=JSON.parse(fs.readFileSync('frame-studio/user-sequences/pending-2026-10-17/scratching-post-change.json'));
const changes=[...latest.values()].filter(e=>e.receipt.status==='pending').map(e=>({id:e.id,kind:e.kind,asset:e.entityId,name:e.name,hash:e.versionHash,selection:(latestProjects.get(e.entityId)?.contentHash||(e.entityId===cap.entityId?cap.versionHash:null))===e.versionHash?'selected exact source; verify build/receipt':'review required; may be historical/variant/WIP'}));
console.log(JSON.stringify({storage:base,history:all.length,latestAssets:latest.size,pending:changes.length,changes},null,2));
}catch(e){console.error('Studio review incomplete: '+e.message);process.exitCode=1;}
