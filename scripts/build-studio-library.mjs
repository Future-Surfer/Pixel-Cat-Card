import {writeGenerated} from './write-generated.mjs';
import {savedRefinements,groundVariantId} from './saved-user-refinements.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {refinedLeap,highWalk,lowWalk} from './user-refined-art.mjs';
import {draftPoses} from './draft-cat-poses.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sandbox={HTMLElement:class{},customElements:{get(){},define(){}},window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'pixel-pet-card.js'),'utf8')+';globalThis.cat=PixelPetCard',sandbox);
const cat=sandbox.cat,groups=[],excluded=[];
const copy=value=>JSON.parse(JSON.stringify(value));
function human(rows,symbol,index,name,role='cycle',durationMs=250){
 if(!Array.isArray(rows)||rows.length!==24||rows.some(r=>typeof r!=='string'||r.length!==24)){excluded.push({symbol,index,reason:'Invalid 24x24 source grid',widths:rows?.map?.(r=>r.length)});return null;}
 return {id:symbol+'-'+JSON.stringify(index),name,rows:copy(rows),durationMs,anchor:null,origin:'human',review:'accepted',locked:false,source:{file:'pixel-pet-card.js',symbol,index},operations:[],role};
}
const seq=(symbol,label,role='cycle',duration=250)=>Array.from(cat[symbol],(r,i)=>human(r,symbol,i,label+' '+(i+1),role,duration)).filter(Boolean);
const matrix=(symbol,label)=>Array.from(cat[symbol],(row,a)=>Array.from(row,(r,b)=>human(r,symbol,[a,b],label+' '+(a+1)+'.'+(b+1)))).flat().filter(Boolean);
function add(id,name,category,frames,description,extra={}){
 frames=frames.filter(Boolean).map((f,i)=>({...copy(f),id:id+'-'+i,role:f.role||'cycle',metadata:{...f.metadata,category,tags:f.metadata?.tags||[id],description:f.metadata?.description||description}}));
 groups.push({id,name,category,frames,description,...extra});
}
const stand=human(cat.POSES.stand,'POSES','stand','Standing entry reference','enter',150);
add('stand','Standing','idle',[stand,...matrix('STAND_PAUSE_FRAMES','Standing pause')],'Enter is the base standing pose; the four cycle frames are the authored body-height × tail-position matrix. The card drives those two clocks independently.');
add('walk','Walking','walk',seq('WALK_FRAMES','Original walk','cycle',150),'Original four-frame gait and head bob, untouched. Paw markers and movement share the same cell clock.');
add('walk-high','Walking · head high','walk',highWalk.map(f=>({...f,role:'cycle'})),'Odd frames 1/3/5/7 from the user export. A full four-step gait with head high.');
add('walk-low','Walking · head low','walk',lowWalk.map(f=>({...f,role:'cycle'})),'Even frames 2/4/6/8 from the user export. A full four-step gait with head low.');
add('sit','Sitting · ground','idle',matrix('SIT_IDLE_FRAMES','Ground sit'),'Four ground-level frames: breath/body × tail matrix. Elevated sitting is a separate sequence.');
add('sit-elevated','Sitting · elevated','idle',seq('ELEVATED_SIT_FRAMES','Elevated sit'),'Four elevated/perch sitting poses, with hanging-tail support. Separate from the ground sitting matrix.');
add('loaf','Loafing','idle',[human(cat.TRANSITIONS.sit_to_loaf[0],'TRANSITIONS.sit_to_loaf',0,'Lower into loaf','enter'),...seq('LOAF_IDLE_FRAMES','Loaf')],'Enter lowers from sitting into loaf. Cycle alternates catnap and a short alert lift; the card holds the low pose longer.');
add('clean','Grooming','idle',seq('CLEANING_FRAMES','Groom'),'Three authored sit-and-clean cycle poses. Source contact markers retained.');
add('stretch','Stretching · exit loaf','idle',cat.TRANSITIONS.loaf_to_walk.map((r,i)=>human(r,'TRANSITIONS.loaf_to_walk',i,'Stretch '+(i+1),'exit',cat.TRANSITION_HOLD_TICKS.loaf_to_walk[i]*250)),'A three-frame one-shot exit from loaf back toward walking. Authored holds 2/1/1 are retained.',{oneShot:true});
add('walk-sit','Walk → sit','idle',cat.TRANSITIONS.walk_to_sit.map((r,i)=>human(r,'TRANSITIONS.walk_to_sit',i,'Settle to sitting','enter',150)),'One-shot bridge into sitting, not a repeating idle.',{oneShot:true});
add('ascend','Jump up','jump',seq('ELEVATE_FRAMES','Ascent','cycle',150).map((f,i)=>({...f,role:i<2?'enter':i>2?'exit':'cycle'})),'Takeoff/coil enter frames, airborne middle frame, then pull-up and landing exit. The card positions these against ledge anchors.',{oneShot:true});
add('descend','Jump down','jump',[...seq('DESCENT_FRAMES','Descent','cycle',150).map((f,i)=>({...f,role:i<2?'enter':'cycle'})),human(cat.ELEVATE_FRAMES[1],'ELEVATE_FRAMES',1,'Landing crouch','exit',300)],'Edge departure enters, falling frame is the airborne phase, landing crouch exits. The tall-drop candidate is separate and opt-in.',{oneShot:true});
add('across','Jump across','jump',[0,1,2,4].map((n,i)=>({...copy(refinedLeap.frames[n]),role:i<2?'enter':i===3?'exit':'cycle'})),'Current user-refined leap: export frames 1,2,3,5. Flight uses the exact mixed-origin refinement in frame 3. Export frame 4 is reserved for the separate tall-drop experiment.',{oneShot:true});
add('freefall-candidate','Tall drop · pre-landing candidate','jump',[{...copy(refinedLeap.frames[3]),role:'cycle'}],'User export frame 4: a four-foot pre-landing candidate for high mostly vertical drops. Experimental, off by default in the roaming card.');
add('look-up','Looking up','idle',seq('LOOK_UP_FRAMES','Look up'),'Two authored look-up poses. Used both for inspection pauses and pre-jump attention.');
add('eat','Eating','interaction',matrix('EAT_IDLE_FRAMES','Eating'),'Existing eating body/head matrix from the full card. Paw markers remain source-exact.');
add('turn','Turning','interaction',seq('TURN_FRAMES','Turn','cycle',150).map((f,i,arr)=>({...f,role:i===0?'enter':i===arr.length-1?'exit':'cycle'})),'Five-frame turn around rear-paw pivot. One-shot turning action, not walking.',{oneShot:true});
add('robot-ride','Riding the robot','interaction',seq('ROBOT_RIDE_FRAMES','Robot rider'),'Eight authored rider poses from the full card; platform motion belongs to the robot prop.');
add('box-entry','Jump into box','interaction',seq('BOX_ENTRY_FRAMES','Box entry','enter',150),'One-shot box entry, with the box rim occluding the cat in the card.',{oneShot:true});
add('box-exit','Jump out of box','interaction',[...seq('BOX_EXIT_FRAMES','Box exit','exit',150),human(cat.ELEVATE_FRAMES[1],'ELEVATE_FRAMES',1,'Box exit landing','exit',300)],'One-shot exit. The malformed third source grid is excluded and reported; no silent pixel repair.',{oneShot:true});
const drafts=draftPoses();
add('pose-vertical-up','Straight-up jump · draft','jump',[human(cat.ELEVATE_FRAMES[1],'ELEVATE_FRAMES',1,'Takeoff reference','enter'),drafts.up,human(cat.ELEVATE_FRAMES[1],'ELEVATE_FRAMES',1,'Landing reference','exit')],'AI starting pose between exact human takeoff/landing references. Refine the compact airborne silhouette and check mass. Draft, not installed.',{draft:true,oneShot:true,preferredFrame:1});
add('pose-vertical-down','Straight-down drop · draft','jump',[human(cat.DESCENT_FRAMES[1],'DESCENT_FRAMES',1,'Departure reference','enter'),drafts.down,human(cat.ELEVATE_FRAMES[1],'ELEVATE_FRAMES',1,'Landing reference','exit')],'AI straight-down attempt between human departure/landing references. Maintain facing on vertical movement. Draft, not installed.',{draft:true,oneShot:true,preferredFrame:1});
add('pose-look-down','Look down from a perch · draft','idle',[human(cat.ELEVATED_SIT_FRAMES[0],'ELEVATED_SIT_FRAMES',0,'Perch reference','enter'),drafts.look],'AI lowered-head starting pose with planted bearing paws. Human perch reference is enter-only; cycle preview isolates the proposed look-down.',{draft:true,preferredFrame:1});
add('pose-sitting-glance','Sitting head glance · draft','idle',[human(cat.SIT_IDLE_FRAMES[0][0],'SIT_IDLE_FRAMES',[0,0],'Ground sit reference','enter'),drafts.glance],'AI head-glance starting pose. Keep the body and stance still while refining the head. Human seated reference is enter-only.',{draft:true,preferredFrame:1});
// Apply named saved snapshots by immutable sequence ID, never by display name.
for(const [projectId,saved] of savedRefinements){
 const p=copy(saved.project),groupId=projectId===groundVariantId?'saved-ground-variant':projectId.startsWith('sequence-')?projectId.slice(9):projectId;
 const current=groups.find(g=>g.id===groupId),entry={...(current||{}),id:groupId,projectId,name:p.name,category:p.category||p.frames[0].metadata?.category||'idle',description:p.description||'',frames:p.frames,savedProject:p,savedAt:saved.savedAt,wip:saved.status==='wip'};
 if(current)groups[groups.indexOf(current)]=entry;else groups.push(entry);
}
const props=Object.entries(cat.PROPS).map(([id,p])=>({id,name:cat.OBJECTS?.[id]?.label||id.replaceAll('_',' '),width:p.width,height:p.height,rows:copy(p.rows),palette:copy(p.palette),origin:'human',source:{file:'pixel-pet-card.js',symbol:'PROPS',key:id}}));
for(const p of props)if(p.rows.length!==p.height||p.rows.some(r=>r.length!==p.width||[...r].some(t=>t!=='.'&&!p.palette[t])))throw Error('Invalid prop '+p.id);
const audit={version:4,groups:groups.map(g=>({id:g.id,name:g.name,frames:g.frames.length,enter:g.frames.filter(f=>f.role==='enter').length,cycle:g.frames.filter(f=>f.role==='cycle').length,exit:g.frames.filter(f=>f.role==='exit').length,description:g.description})),excluded,notes:['Ground and elevated sit separated.','Only OG/high/low walking retained in current catalogue.','Jump across now uses exact user refinement.','BOX_IDLE_SEQUENCE is a compositing recipe (head, tail and hold), not 24x24 cat frames; retained with props for future scene preview.']};
writeGenerated(path.join(root,'frame-studio/dist/library.json'),JSON.stringify({schemaVersion:1,catalogueRevision:4,groups,props,boxIdleRecipe:copy(cat.BOX_IDLE_SEQUENCE),audit},null,2)+'\n');
writeGenerated(path.join(root,'frame-studio/SEQUENCE_AUDIT.md'),'# Sequence audit\n\n'+audit.notes.map(n=>'- '+n).join('\n')+'\n\n| Sequence | Enter | Cycle | Exit | Notes |\n| --- | ---: | ---: | ---: | --- |\n'+audit.groups.map(g=>`| ${g.name} | ${g.enter} | ${g.cycle} | ${g.exit} | ${g.description} |`).join('\n')+'\n\nExcluded: '+JSON.stringify(excluded)+'\n');
console.log(`Audited ${groups.length} sequences and ${props.length} native-size props; ${excluded.length} invalid source frame excluded.`);

// Overlay the frozen late refinements after rebuilding untouched original references.
await import('./build-latest-assets.mjs');
