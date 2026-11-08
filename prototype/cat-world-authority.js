// Explicit configuration authority. Membership events do the work; actor frames do not.
const catWorldViews=new WeakMap(),catWorldMembers=new WeakMap();
const catWorldCopy=value=>JSON.parse(JSON.stringify(value));
const catWorldId=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/.test(value);
const catWorldResidentId=value=>typeof value==='string'&&value.trim()===value&&value.length>0&&value.length<=128;
const catWorldSettings=value=>value&&value.version===1&&value.scale_mode==='legacy'&&Object.keys(value).every(k=>['version','scale_mode'].includes(k));
const catWorldLinked=config=>['world_id','world_owner','world_settings'].some(k=>config[k]!==undefined);
window.pixelCatWorldV1={
 attach(a){
  if(!catWorldLinked(a.config)){a.worldState=null;a.removeAttribute?.('data-world-state');this.paint(a);return true;}
  let record=catWorldMembers.get(a);
  if(!record){let worlds=catWorldViews.get(a.root);if(!worlds){worlds=new Map();catWorldViews.set(a.root,worlds);}const key=String(a.config.world_id||'');record=worlds.get(key);if(!record){record={members:new Set(),root:a.root,key,worlds,last:null};worlds.set(key,record);}record.members.add(a);catWorldMembers.set(a,record);}
  for(const entry of record.worlds.values())this.reconcile(entry);return a.worldState.ready;
 },
 leave(a){const record=catWorldMembers.get(a);if(!record)return;catWorldMembers.delete(a);record.members.delete(a);a.worldState=null;if(!record.members.size){record.worlds.delete(record.key);if(!record.worlds.size)catWorldViews.delete(record.root);}for(const entry of record.worlds.values())this.reconcile(entry);},
 reconcile(record){
  const members=[...record.members],owners=new Set(members.map(a=>a.config.world_owner));let phase='ready',message='',owner;
  if(record.worlds.size>1){phase='conflict';message='This view references different world IDs. Choose one world per view.';}
  else if(!catWorldId(record.key)||members.some(a=>!catWorldResidentId(a.config.cat_id)||!catWorldResidentId(a.config.world_owner))){phase='invalid';message='World needs a valid world ID, owner ID and stable cat IDs.';}
  else if(owners.size!==1){phase='conflict';message='World members reference different owners.';}
  else{const id=[...owners][0],candidates=members.filter(a=>a.config.cat_id===id);owner=candidates[0];
   if(candidates.length>1){phase='conflict';message='More than one home claims the world owner ID.';}
   else if(members.some(a=>a!==owner&&a.config.world_settings!==undefined)){phase='conflict';message='Only the referenced owner may save world settings.';}
   else if(!owner){phase='waiting';message='Waiting for world owner '+id+'.';}
   else if(!catWorldSettings(owner.config.world_settings)){phase='invalid';message='World owner needs version 1 settings with legacy scaling. Other scale modes are not enabled yet.';}
  }
  if(phase==='ready')record.last=Object.freeze({ownerId:owner.config.cat_id,settings:Object.freeze(catWorldCopy(owner.config.world_settings))});
  for(const a of members){const wasReady=!!a.worldState?.ready,usingLastKnown=phase!=='ready'&&!!record.last&&!!a.active;
   a.worldState={worldId:record.key,ownerId:a.config.world_owner,phase,ready:phase==='ready',issue:phase!=='ready',usingLastKnown,settings:phase==='ready'||usingLastKnown?record.last.settings:null,message};
   a.setAttribute?.('data-world-state',phase);this.paint(a);
   if(phase==='ready'&&!wasReady&&!a.active&&a.isConnected!==false)queueMicrotask(()=>{if(catWorldMembers.get(a)===record&&a.worldState?.ready&&!a.active&&a.isConnected!==false)a.connectedCallback();});
  }
 },
 paint(a){
  const issue=a.worldState?.issue;if(!issue){a.worldNotice?.remove();a.worldNotice=null;return;}
  const card=a.shadowRoot?.querySelector?.('ha-card');if(!card||typeof document==='undefined')return;
  if(!a.worldNotice?.isConnected){const node=document.createElement('span');node.dataset.catWorldStatus='';node.setAttribute('role','status');node.style.cssText='position:absolute;inset:4px 6px auto;z-index:3;padding:3px 5px;background:var(--card-background-color,#fff);color:var(--error-color,#a33);font:11px/1.3 system-ui;overflow-wrap:anywhere';card.append(node);a.worldNotice=node;}
  a.worldNotice.textContent=a.worldState.message+(a.worldState.usingLastKnown?' Existing cats retain the last valid settings.':' No new cat will spawn.');if(a.style)a.style.display='';
 },
 // Pure configuration transform. Nothing reads mounted cards or writes HA here.
 homes(view){const out=[];const visit=(value,path)=>{if(!value||typeof value!=='object')return;if(!Array.isArray(value)&&value.type==='custom:pixel-cat-home'){if(value.mode!=='monitor')out.push({path,config:value});return;}for(const [key,child]of Object.entries(value))if(Array.isArray(value)||['card','cards','sections','views'].includes(key))visit(child,path+'/'+key.replaceAll('~','~0').replaceAll('/','~1'));};visit(view,'');return out;},
 migration(view,{worldId,ownerIndex=0,createId=()=>crypto.randomUUID(),name=()=>window.pixelCatPolishV1.name(),colour=()=>window.pixelCatPolishV1.colour()}={}){
  if(!catWorldId(worldId))throw Error('Choose a world ID using 1–64 letters, digits, dots, colons, underscores or hyphens.');
  const before=catWorldCopy(view),after=catWorldCopy(view),homes=this.homes(after),originals=this.homes(before);if(!homes.length||!homes[ownerIndex])throw Error('Choose one companion home as authority.');
  if(homes.some(h=>catWorldLinked(h.config)))throw Error('Migration accepts unlinked legacy cards only. Use the saved rollback before planning a different migration.');
  const ids=new Set();for(const {config:c}of homes){if(c.cat_id!==undefined&&!catWorldResidentId(c.cat_id))throw Error('Invalid existing cat ID; correct it explicitly first.');c.cat_id??=createId();if(!catWorldResidentId(c.cat_id)||ids.has(c.cat_id))throw Error('Duplicate or invalid cat ID; resolve identities before migration.');ids.add(c.cat_id);}
  const ownerId=homes[ownerIndex].config.cat_id,changes=[];
  for(const [i,{path,config:c}]of homes.entries()){
   if(!c.name)c.name=name();if(!c.color)c.color=colour();c.world_id=worldId;c.world_owner=ownerId;if(i===ownerIndex)c.world_settings={version:1,scale_mode:'legacy'};
   changes.push({path,catId:c.cat_id,name:c.name,owner:i===ownerIndex,cellSize:c.cell_size??2,scaleChange:false,before:catWorldCopy(originals[i].config),after:catWorldCopy(c)});
  }
  return {version:1,worldId,ownerId,scaleMode:'legacy',before,after,changes};
 },
 apply(plan,current,reverse=false){if(plan?.version!==1)throw Error('Unsupported migration plan.');const expected=reverse?plan.after:plan.before;if(JSON.stringify(current)!==JSON.stringify(expected))throw Error('Configuration changed after preview. Create a fresh migration or rollback preview.');return catWorldCopy(reverse?plan.before:plan.after);},
 editor(editor,expanded=new Map()){
  const section=document.createElement('details'),title=document.createElement('summary'),note=document.createElement('p');title.textContent='World authority · opt-in';section.dataset.group=title.textContent;section.open=expanded.get(title.textContent)??false;note.textContent='One saved owner per world/view. Primary home is separate. Current linkage preserves every legacy pixel scale; it does not enable rosters or shared prop sizing.';section.append(title,note);
  const field=(label,value)=>{const row=document.createElement('label'),input=document.createElement('input');row.className='field';row.textContent=label;input.value=value||'';input.setAttribute('aria-label',label);row.append(input);section.append(row);return input;};
  const id=field('World ID',editor.config.world_id),owner=field('World owner cat ID',editor.config.world_owner),status=document.createElement('p');status.setAttribute('role','status');
  const stage=kind=>{try{const c={...editor.config};if(kind==='unlink'){delete c.world_id;delete c.world_owner;delete c.world_settings;}else{if(!catWorldId(id.value))throw Error('Enter a valid world ID first.');c.world_id=id.value;c.cat_id??=crypto.randomUUID();if(!c.name)c.name=window.pixelCatPolishV1.name();if(!c.color)c.color=window.pixelCatPolishV1.colour();if(kind==='owner'){c.world_owner=c.cat_id;c.world_settings={version:1,scale_mode:'legacy'};}else{if(!catWorldResidentId(owner.value))throw Error('Enter the saved owner cat ID.');if(owner.value===c.cat_id)throw Error('Use “Stage as owner” for this cat’s ID.');c.world_owner=owner.value;delete c.world_settings;}}editor.config=c;editor.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...c}},bubbles:true,composed:true}));editor.render();}catch(error){status.textContent=error.message;}};
  for(const [text,kind]of [['Stage as owner','owner'],['Stage as follower','follower'],['Remove world linkage','unlink']]){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>stage(kind);section.append(b);}section.append(status);editor.shadowRoot.append(section);
 }
};
if(typeof Event==='function')window.dispatchEvent?.(new Event('pixel-cat-world-ready'));
