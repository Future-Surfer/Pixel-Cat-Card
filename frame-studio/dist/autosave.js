// Each sequence has its own immutable pending snapshot. Switching sequence does
// not retarget a queued save. Conflicts remain pending until explicitly loaded.
// Persist the browser outbox immediately, but group edits until two seconds idle.
export function createAutosaver({write,changed=()=>{},persist=()=>{},initial=[],delay=2000,setTimer=setTimeout,clearTimer=clearTimeout}){
 const pending=new Map(initial.map(p=>[p.projectId,structuredClone(p)])),blocked=new Set(),last=new Map();let timer,busy=false;
 const remember=()=>persist([...pending.values()]);
 async function flush(){
  clearTimer(timer);if(busy)return;busy=true;
  const attempted=new Set(),failed=new Set();
  try{for(const [id] of [...pending]){
   if(blocked.has(id))continue;
   attempted.add(id);const snapshot=pending.get(id),text=JSON.stringify(snapshot);changed(id,'saving');
   try{await write(snapshot);last.set(id,text);if(JSON.stringify(pending.get(id))===text)pending.delete(id);changed(id,pending.has(id)?'pending':'saved');}
   catch(error){failed.add(id);if(error.status===409||error.status===428)blocked.add(id);changed(id,blocked.has(id)?'conflict':'offline',error.message);}
   remember();
  }}finally{busy=false;}
  if([...pending.keys()].some(id=>!blocked.has(id)&&!failed.has(id)&&(!attempted.has(id)||JSON.stringify(pending.get(id))!==last.get(id))))timer=setTimer(flush,delay);
 }
 function queue(project){const p=structuredClone(project),text=JSON.stringify(p);if(last.get(p.projectId)===text&&!pending.has(p.projectId))return;pending.set(p.projectId,p);remember();changed(p.projectId,'pending');clearTimer(timer);timer=setTimer(flush,delay);}
 function acknowledge(project){last.set(project.projectId,JSON.stringify(project));}
 function loaded(project){blocked.delete(project.projectId);pending.delete(project.projectId);acknowledge(project);remember();changed(project.projectId,'saved');}
 return {queue,flush,acknowledge,loaded,hasPending:id=>pending.has(id),pending:()=>[...pending.values()].map(p=>structuredClone(p))};
}
