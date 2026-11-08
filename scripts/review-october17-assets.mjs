// Explicit review export. Run against the local Studio; conditional writes retain newer work.
import fs from 'node:fs';import crypto from 'node:crypto';
import {validateProject} from '../frame-studio/dist/model.js';
import {colourProposals} from '../frame-studio/dist/prop-colour-themes.js';
const base='http://127.0.0.1:8767',root='frame-studio/user-sequences/review-2026-10-17';fs.mkdirSync(root,{recursive:true});
const listed=await(await fetch(base+'/api/projects')).json(),approved=['proposal-lifted-scruff','proposal-scratching-post-action','1e7741cb-f178-4c6e-916c-ef23f2ebd934'],records=[],archives=[];
for(const item of listed.projects){const url=base+'/api/projects/'+item.projectId,r=await fetch(url),record=await r.json(),p=record.project;validateProject(p);
 if(approved.includes(p.projectId))records.push({...record,contentHash:crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex')});
 if(/\bdelete\b/i.test(p.name)&&!p.archived){fs.writeFileSync('.studio-data/pre-archive-'+p.projectId+'.json',JSON.stringify(record));p.archived=true;p.archiveOverride=true;const saved=await fetch(url,{method:'PUT',headers:{'content-type':'application/json','if-match':r.headers.get('etag')},body:JSON.stringify(p)});if(!saved.ok)throw Error('Archive conflict '+p.projectId);console.log('Archived:',p.name);}
 if(/\bdelete\b/i.test(p.name))archives.push({...record,project:p});
}
fs.writeFileSync(root+'/archived-sequences.json',JSON.stringify(archives,null,2));
fs.writeFileSync(root+'/approved-sequences.json',JSON.stringify(records,null,2));
const response=await fetch(base+'/api/props-workspace'),props=await response.json();fs.writeFileSync('.studio-data/pre-colour-proposals-workspace.json',JSON.stringify(props));
const post=props.workspace.assets.find(a=>a.id==='proposal-scratching-post-rope');if(!post)throw Error('Approved scratching post missing');fs.writeFileSync(root+'/approved-scratching-post.json',JSON.stringify(post,null,2));
for(const a of props.workspace.assets){a.colourVariants=colourProposals(a);}
const saved=await fetch(base+'/api/props-workspace',{method:'PUT',headers:{'content-type':'application/json','if-match':response.headers.get('etag')},body:JSON.stringify(props.workspace)});if(!saved.ok)throw Error('Props conflict: '+await saved.text());
fs.writeFileSync(root+'/colour-proposals.json',JSON.stringify(props.workspace.assets.map(a=>({assetId:a.id,name:a.name,sourceRevision:a.revision,colourVariants:a.colourVariants})),null,2));
console.log('Saved exact approved snapshots and six draft theme pairs for',props.workspace.assets.length,'props.');
