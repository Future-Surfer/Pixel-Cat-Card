import {clone,id,newFrame,projectFromGroup,validateProject} from './model.js';
import {POSE_BRIEFS} from './queue.js';
export const BOOK_KEY='cat-frame-studio.sequences.v2';
// One project per sequence keeps frame IDs, provenance and old saved outputs intact.
export function rememberSequence(book,project,index=0){
 validateProject(project);
 book[project.projectId]={project:clone(project),index};
}
export function starterSequences(library,refinements=[]){
 const projects=library.groups.map(g=>({...(g.savedProject?clone(g.savedProject):projectFromGroup(g)),projectId:g.projectId||(g.id.startsWith('pose-')?g.id:'sequence-'+g.id),description:g.description||'',category:g.category||g.frames[0]?.metadata?.category||'other',catalogueRevision:library.catalogueRevision,oneShot:!!(g.oneShot??g.savedProject?.oneShot),preferredFrame:g.preferredFrame||0,importedSavedAt:g.savedAt,wip:!!g.wip}));
 if(library.catalogueRevision>=4)return projects;
 for(const t of POSE_BRIEFS){
  if(['horizontal-refine','walk-head'].includes(t.id))continue;
  const f=newFrame(t.title+' · draw here');
  f.metadata={category:t.category,tags:clone(t.tags),description:t.instructions.slice(0,2000)};
  projects.push({schemaVersion:1,width:24,height:24,projectId:'pose-'+t.id,name:t.title,description:t.instructions,frames:[f]});
 }
 return [...projects,...clone(refinements).map(p=>({...p,description:p.description||[...new Set((p.workQueue?.tasks||[]).map(t=>t.notes).filter(Boolean))].join('\n\n').slice(0,2000)}))];
}
export function duplicateSequence(project,actor='human'){
 const copy=clone(project),mapping=new Map(copy.frames.map(f=>[f.id,id()]));
 const result={schemaVersion:1,width:24,height:24,projectId:id(),name:(project.name+' · variant').slice(0,120),category:project.category,description:project.description||'',preferredNeighbours:copy.preferredNeighbours,propReference:copy.propReference,idlePosture:copy.idlePosture,oneShot:project.oneShot,variantOf:{projectId:project.projectId,name:project.name},frames:copy.frames.map(f=>({...f,id:mapping.get(f.id),parentId:f.id,locked:false,review:'candidate',operations:[...(f.operations||[]),{actor,kind:'sequence-copy',at:new Date().toISOString()}]}))};
 if(copy.animationTracks){result.animationTracks=copy.animationTracks;for(const track of result.animationTracks.tracks){if(track.frameIds)track.frameIds=track.frameIds.map(id=>mapping.get(id));if(track.events)for(const e of track.events)e.frameId=mapping.get(e.frameId);}}
 return validateProject(result);
}
export function reconcileCatalogue(book,library){
 const revision=library.catalogueRevision||1;
 const obsoleteIds=new Set(['sequence-walk-head-development','refinement-walk-head-user','refinement-horizontal-user','sequence-leap-refined']);
 const obsoleteNames=new Set(['Walk head variants · development','Walk slow head bob','Horizontal leap refinement','Across jump · horizontal flight','QA · saved-output check','Drawing check · temporary']);
 for(const entry of Object.values(book))if(entry.project.archiveOverride===undefined&&(obsoleteIds.has(entry.project.projectId)||obsoleteNames.has(entry.project.name)))entry.project.archived=true;
 for(const p of starterSequences(library)){
  const old=book[p.projectId];if(old?.project.deletedAt||old?.project.catalogueRevision===revision)continue;
  if(old){const preserved=clone(old.project);preserved.projectId='archive-'+id();preserved.archived=true;preserved.name=(preserved.name+' · before catalogue audit').slice(0,120);preserved.archivedFrom=p.projectId;if(p.projectId.startsWith('pose-')&&old.project.frames.some(f=>f.rows.some(row=>/[^.]/.test(row)))){preserved.archived=false;preserved.variantOf={projectId:p.projectId,name:p.name};preserved.name=(old.project.name+' · saved draft').slice(0,120);}rememberSequence(book,preserved,old.index);}
  rememberSequence(book,p,p.preferredFrame||0);
 }
 return book;
}
export function migrateTasks(project){
 return (project.workQueue?.tasks||[]).filter(t=>t.frameIds.length||t.outputs.length).map(t=>{
  const frames=t.frameIds.map(fid=>project.frames.find(f=>f.id===fid)).filter(Boolean);
  return {schemaVersion:1,width:24,height:24,projectId:(project.projectId+'-task-'+t.id).slice(0,100),name:t.title,description:t.instructions,frames:clone(frames.length?frames:t.outputs.at(-1).frames)};
 });
}
