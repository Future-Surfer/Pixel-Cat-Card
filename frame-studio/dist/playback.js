export const frameHold=(frame,{mode='authored',fps=8,speed=1}={})=>(mode==='fixed'?1000/Math.max(1,Math.min(60,Number(fps)||8)):frame.durationMs)/Math.max(.05,Math.min(4,Number(speed)||1));
export function frameAt(frames,elapsed,options={}){
 const holds=frames.map(f=>frameHold(f,options)),total=holds.reduce((a,b)=>a+b,0);
 let remaining=Math.max(0,elapsed)%total;
 for(let i=0;i<holds.length;i++){if(remaining<holds[i])return i;remaining-=holds[i];}
 return frames.length-1;
}
export const sequenceCategory=p=>p.category||p.frames.find(f=>f.metadata?.category)?.metadata.category||'other';
export const categoryLabel=category=>({idle:'Idle',walk:'Walking',jump:'Leaping',interaction:'Interacting',care:'Interacting',transition:'Idle',other:'Other'}[category]||'Other');
export function phaseFrames(project,phase='all'){
 const frames=phase==='all'?project.frames:project.frames.filter(f=>(f.role||'cycle')===phase);
 return frames;
}
export function playbackSelection(project,{includeEnter=true,includeExit=true}={}){
 return project.frames.filter(frame=>frame.role==='enter'?includeEnter:frame.role==='exit'?includeExit:true);
}

// Context is deliberately one level deep: preferences are authoring hints, not a behaviour graph.
export function buildPlaybackPlan(project,book,{context=false,before='',after='',...filters}={}){
 const segment=(p,position)=>playbackSelection(p,filters).map(frame=>({frame,projectId:p.projectId,sequenceName:p.name,frameIndex:p.frames.indexOf(frame),position}));
 const resolve=key=>key&&key!==project.projectId?book[key]?.project:null;
 const left=context?resolve(before,'before'):null,right=context?resolve(after,'after'):null;
 return [...(left?segment(left,'before'):[]),...segment(project,'selected'),...(right?segment(right,'after'):[])];
}

export function idlePosture(project,book={},seen=new Set()){
 if(project.idlePosture)return project.idlePosture;
 if(seen.has(project.projectId))return 'standing';seen.add(project.projectId);
 const key=project.projectId||'',parent=book[project.variantOf?.projectId]?.project;
 if(parent)return idlePosture(parent,book,seen);
 if(['sequence-loaf','sequence-stretch'].includes(key))return 'loafing';
 if(['sequence-sit','sequence-sit-elevated','sequence-walk-sit','sequence-clean','pose-look-down','pose-sitting-glance','46edfa22-baf5-45b3-a8a6-26fc004059de'].includes(key))return 'sitting';
 return /loaf|stretch/i.test(project.name)?'loafing':/sit|groom|look.*down/i.test(project.name)?'sitting':'standing';
}
export const browserCategory=(project,book={})=>['idle','transition'].includes(sequenceCategory(project))?{standing:'Standing',sitting:'Sitting',loafing:'Loafing'}[idlePosture(project,book)]:categoryLabel(sequenceCategory(project));
