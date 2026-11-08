// Explicit ingestion of saved gaze metadata only; no pixels or notes are adopted.
import fs from 'node:fs';import crypto from 'node:crypto';import {validateProject} from '../frame-studio/dist/model.js';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex'),records=[];
const rowKey=rows=>{let h=2166136261;for(const row of rows)for(const v of row)h=Math.imul(h^v.charCodeAt(0),16777619)>>>0;return h.toString(36);};
for(const file of fs.readdirSync('.studio-data/projects').filter(f=>f.endsWith('.json'))){const record=JSON.parse(JSON.parse(fs.readFileSync('.studio-data/projects/'+file,'utf8')).body),p=record.project;if(!p||p.deletedAt||p.archived)continue;validateProject(p);records.push({sequenceId:p.projectId,savedAt:record.savedAt,sourceHash:hash(JSON.stringify(p)),frames:p.frames.map(f=>({id:f.id,key:rowKey(f.rows),rowsHash:hash(f.rows.join('')),gaze:f.gaze??null}))});}
const folder='frame-studio/user-sequences/gaze-runtime-2026-10-15';fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(folder+'/metadata.json',JSON.stringify({records},null,2)+'\n');console.log('Snapshotted saved gaze only:',records.length,'sequences');
