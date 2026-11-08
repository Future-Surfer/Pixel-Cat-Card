import {clone,id,validateProject,newFrame,validateRows} from './model.js';
export const CATEGORIES=['idle','walk','jump','interaction','care','transition','other'];
const check=(v,m)=>{if(!v)throw Error(m);};
export function metadata(value={}){
 const category=value.category||'other',description=value.description||'',tags=value.tags||[];
 check(CATEGORIES.includes(category),'Choose a supported category.');
 check(typeof description==='string'&&description.length<=2000,'Description is limited to 2000 characters.');
 check(Array.isArray(tags)&&tags.length<=20&&tags.every(t=>typeof t==='string'&&t.length>0&&t.length<=40),'Use up to 20 tags of 1–40 characters.');
 return {category,description,tags:[...new Set(tags.map(t=>t.trim().toLowerCase()).filter(Boolean))]};
}
export function setMetadata(project,frameIds,value,actor='human'){
 check(frameIds.length>0,'Select at least one frame.');
 const data=metadata(value),frames=frameIds.map(fid=>{const f=project.frames.find(f=>f.id===fid);check(f,'Frame not found.');return f;});
 for(const f of frames){f.metadata=clone(data);(f.operations ||= []).push({actor,kind:'metadata',at:new Date().toISOString()});}return frames;
}
export function createGroup(project,{name,frameIds,...value},actor='human'){
 check((project.groups||[]).length<96,'Maximum 96 animation groups.');
 check(typeof name==='string'&&name.trim().length>0&&name.length<=120,'Give the animation a name (up to 120 characters).');
 check(Array.isArray(frameIds)&&frameIds.length>0&&new Set(frameIds).size===frameIds.length,'Select frames for this animation.');
 for(const fid of frameIds)check(project.frames.some(f=>f.id===fid),'Group contains a missing frame.');
 const group={id:id(),name:name.trim(),frameIds:[...frameIds],...metadata(value),actor,createdAt:new Date().toISOString()};
 (project.groups ||= []).push(group);return group;
}
export function snapshot(project,group){return {group:clone(group),frames:group.frameIds.map(fid=>{const f=project.frames.find(f=>f.id===fid);check(f,'Animation references a deleted frame.');return clone(f);})};}
export function submitGroup(project,groupId,notes='',actor='human'){
 check((project.submissions||[]).length<96,'Maximum 96 saved submissions. Export and start a new project to continue.');
 check(actor==='human','Only a human session can submit or confirm artwork.');
 check(typeof notes==='string'&&notes.length<=2000,'Submission notes are limited to 2000 characters.');
 const group=project.groups?.find(g=>g.id===groupId);check(group,'Choose an animation group.');
 const submission={id:id(),groupId,status:'submitted',notes,submittedAt:new Date().toISOString(),snapshot:snapshot(project,group)};
 (project.submissions ||= []).push(submission);return submission;
}
export function submissionCurrent(project,s){try{const g=project.groups?.find(g=>g.id===s.groupId);return !!g&&JSON.stringify(snapshot(project,g))===JSON.stringify(s.snapshot);}catch{return false;}}
export function reviewSubmission(project,submissionId,status,notes,actor='human'){
 check(actor==='human','Only a human session can confirm a batch.');check(['confirmed','changes-requested','rejected'].includes(status),'Invalid review decision.');
 const s=project.submissions?.find(s=>s.id===submissionId);check(s,'Submission not found.');check(submissionCurrent(project,s),'Frames changed since submission. Submit a new version before confirming.');
 check(typeof notes==='string'&&notes.length<=2000,'Review notes are limited to 2000 characters.');s.status=status;s.reviewNotes=notes;s.reviewedAt=new Date().toISOString();return s;
}
export function proposeBatch(project,input){
 check(Array.isArray(input.frames)&&input.frames.length>0&&project.frames.length+input.frames.length<=96,'Supply a batch within the 96-frame limit.');
 const working=clone(project),frames=input.frames.map(item=>{validateRows(item.rows);const f=newFrame(item.name||'AI candidate',item.rows,'ai');f.durationMs=item.durationMs??150;f.metadata=metadata(item.metadata);f.parentId=item.parentId||null;f.operations=[{actor:'ai',kind:'batch-proposal',at:new Date().toISOString()}];return f;});
 working.frames.push(...frames);const group=createGroup(working,{...input,frameIds:frames.map(f=>f.id)},'ai');validateProject(working);
 Object.assign(project,working);return group;
}
export function handoff(project,groupId){
 const groups=groupId?project.groups.filter(g=>g.id===groupId):project.groups||[];
 return {format:'cat-studio-handoff',version:1,instruction:'Review labelled animations, timing and contact anchors. Confirmed means human-reviewed, not installed. Preserve artwork origin. Only integrate the exact confirmed snapshot.',project:clone(project),animations:groups.map(g=>snapshot(project,g)),submissions:(project.submissions||[]).map(s=>({...clone(s),current:submissionCurrent(project,s)}))};
}
