import {installFrameCanvas,frameCell,strokeRows,onionLayers,drawOnionSkin} from './frame-canvas.js';
import {STUDIO_LIFE_STAGES,validateBehaviourPolicy} from './behaviour-policy.js';
import {installAnimationTracks} from './animation-tracks-ui.js';
import {applyFrameTiming} from './frame-timing.js';
import {gazeHandles,dragGaze,placeGaze,applyGazeToAll,setGazeVision,gazeCoverage,placePoi,applyPoiToAll} from './gaze.js';
import {installPropReference} from './prop-reference-ui.js';
import {installBehaviourMap} from './behaviour-map.js';
import {selectionBox,containsCell,shiftedRows,moveSelection} from './selection.js';
import {installChangePage} from './changes-ui.js';
import {installPropsLab} from './props-ui.js';
import {FRAME_CLIPBOARD_KEY,copyFrame,pasteFrame} from './frame-clipboard.js';
import {frameHold,frameAt,sequenceCategory,categoryLabel,phaseFrames,playbackSelection,buildPlaybackPlan,browserCategory,idlePosture} from './playback.js';
import {BOOK_KEY,rememberSequence,starterSequences,migrateTasks,reconcileCatalogue,duplicateSequence} from './sequences.js';
import {exportSequenceProject,SIZE,TOKENS,pixelVolume,frameRole,clone,id,newFrame,validateRows,validateProject,projectFromGroup,getFrame,editable,applyPixels,transform,duplicateFrame,insertCandidate,fillCells,diffCells} from './model.js';
import {installWorkflow} from './workflow-ui.js';
import {ensureQueue,validateQueue} from './queue.js';
import {installPoseQueue} from './queue-ui.js';
const $=s=>document.querySelector(s), STORAGE='cat-frame-studio.v1';
let library,project,index=0,tool='pencil',token='#',author='human',stroke=null,undo=[],redo=[],playing=false,playbackWanted=true,playIndex=0,playAt=0,raf,cell=16;
let timingRange=null;
let playbackFrames=[],book={},selection=null,selectionDrag=null,gazeDrag=null,poiDrag=null;
const editor=$('#editor'),ctx=editor.getContext('2d');
const animationTracks=installAnimationTracks({getProject:()=>project,getSelection:()=>selection,mutate:humanAction,redraw:()=>{if(project){drawEditor();previews();}},actor:()=>author,editor});$('.canvas-wrap').after(animationTracks.panel);
const propReference=installPropReference({getProject:()=>project,library:()=>library,mutate:humanAction,redraw:()=>{if(project){drawEditor();previews();}}});
const workflow=installWorkflow({getProject:()=>project,selected,actor:()=>author,mutate,download,toast});
const poseQueue=installPoseQueue({getProject:()=>project,selected,actor:()=>author,mutate,download,toast,selectFrame:fid=>{stop();index=project.frames.findIndex(f=>f.id===fid);persist();render();},loadProject});
for(const [selector,title] of [['.workflow-panel','Advanced labels & review'],['.pose-queue','Legacy task outputs']]){const panel=$(selector),details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=title;panel.before(details);details.append(summary,panel);}
const saves=document.createElement('details');saves.id='saved-sequences';const summary=document.createElement('summary');summary.textContent='Saved sequences on this workspace / online';saves.append(summary);$('.sequence-save').append(saves);for(const selector of ['.saved-projects','.cloud-status'])saves.append($(selector));
const saveBar=document.createElement('div');saveBar.className='save-bar';$('#save-sequence').style.display='none';const autoBadge=document.createElement('span');autoBadge.id='autosave-summary';autoBadge.textContent='Autosave on';autoBadge.hidden=true;saveBar.append(autoBadge);
$('.inspector').prepend(saveBar);
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function selected(){return project.frames[index];}
function persist(){ensureQueue(project);try{rememberSequence(book,project,index);localStorage.setItem(STORAGE,JSON.stringify({project,index}));localStorage.setItem(BOOK_KEY,JSON.stringify(book));$('#save-status').textContent='Saved on this browser';}catch{$('#save-status').textContent='Download to keep a copy';}}
function stop(manual=false){if(manual)playbackWanted=false;playing=false;cancelAnimationFrame(raf);$('#play').textContent='▶ Play';}
function mutate(fn){stop();const before=clone(project),oldIndex=index;try{fn();validateProject(project);validateQueue(project);undo.push({project:before,index:oldIndex});if(undo.length>50)undo.shift();redo=[];index=Math.max(0,Math.min(index,project.frames.length-1));persist();poseQueue.autosave(project);render();if(playbackWanted)startPlayback();return selected();}catch(error){project=before;index=oldIndex;render();toast(error.message);throw error;}}
function humanAction(fn){try{return mutate(fn);}catch{return null;}}
function loadProject(p){selection=null;selectionDrag=null;timingRange=null;poseQueue.flush();validateProject(p);validateQueue(p);if(project)persist();const prior=book[p.projectId]?.project;if(prior&&JSON.stringify(prior)!==JSON.stringify(p)){const backup=clone(prior);backup.projectId='previous-'+id();backup.archived=true;backup.archivedFrom=p.projectId;backup.name=(backup.name+' · before opening saved version').slice(0,120);rememberSequence(book,backup,0);}stop();project=clone(p);ensureQueue(project);index=book[project.projectId]?.index||0;index=Math.max(0,Math.min(index,project.frames.length-1));undo=[];redo=[];persist();render();startPlayback();return true;}
let sequencePreviews=[];
function renderSequences(){
 const list=$('#sequence-list'),query=$('#sequence-search').value.toLowerCase(),filter=$('#category-filter').value;list.replaceChildren();sequencePreviews=[];
 for(const category of ['Standing','Sitting','Loafing','Walking','Leaping','Interacting','Other']){
  const entries=Object.values(book).filter(v=>(!v.project.deletedAt||$('#show-deleted').checked)&&(!v.project.archived||$('#show-archived').checked)&&browserCategory(v.project,book)===category&&(filter==='all'||filter===category)&&(v.project.name+' '+(v.project.description||'')).toLowerCase().includes(query));
  if(!entries.length)continue;
  const group=document.createElement('section'),h=document.createElement('h3');h.textContent=category;group.className='sequence-category-group';group.append(h);
  for(const {project:p} of entries){
   const b=document.createElement('button');b.className='sequence-item'+(p.projectId===project.projectId?' active':'');b.setAttribute('aria-pressed',String(p.projectId===project.projectId));b.setAttribute('aria-label',p.name);
   const c=document.createElement('canvas');c.width=c.height=24;c.setAttribute('aria-label',p.name+' animated preview');drawRows(c,p.frames[0].rows);sequencePreviews.push({canvas:c,frames:!p.oneShot&&phaseFrames(p,'cycle').length?phaseFrames(p,'cycle'):p.frames});
   const label=document.createElement('span'),name=document.createElement('strong'),meta=document.createElement('small');name.textContent=p.name;
   meta.textContent=`${p.archived?'Archived · ':''}${(['pose-vertical-up','pose-vertical-down'].includes(p.projectId)||p.wip)?'WIP · ':''}${p.variantOf?'Variant · ':''}${p.frames.length} ${p.frames.length===1?'frame':'frames'} · ${p.frames.every(f=>f.rows.every(r=>/^\.+$/.test(r)))?'To draw':[...new Set(p.frames.map(f=>f.origin))].join(' / ')}`;
   const coverage=gazeCoverage(p.frames),badge=document.createElement('span'),titleRow=document.createElement('span');titleRow.className='sequence-title-row';badge.className='gaze-coverage '+coverage.status;badge.setAttribute('role','img');const coverageLabel=`Gaze ${coverage.status}: ${coverage.configured} of ${coverage.total} frames configured (includes enter, cycle, exit and blind frames)`;badge.title=coverageLabel;b.setAttribute('aria-description',coverageLabel);badge.setAttribute('aria-label',coverageLabel);badge.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span aria-hidden="true">'+({complete:'✓',partial:'?',missing:'×'}[coverage.status])+'</span>';titleRow.append(name,badge);if(coverage.misplaced){const warning=document.createElement('span');warning.className='gaze-coverage warning';warning.textContent='!';warning.title='One or more gaze markers placed in empty space ('+coverage.misplaced+' frames).';warning.setAttribute('role','img');warning.setAttribute('aria-label',warning.title);titleRow.append(warning);}label.append(titleRow,meta);const heading=document.createElement('div');heading.className='sequence-item-heading';heading.append(c,label);
   const strip=document.createElement('span');strip.className='sequence-strip';strip.setAttribute('aria-label',p.name+' all frames');
   p.frames.forEach((f,i)=>{const thumb=document.createElement('canvas');thumb.width=thumb.height=24;thumb.title=`${i+1}: ${f.name} · ${frameRole(f)} · ${pixelVolume(f.rows)} px`;const item=document.createElement('span');item.className='strip-frame '+frameRole(f);const phase=document.createElement('small');phase.textContent={enter:'IN',cycle:'↻',exit:'OUT'}[frameRole(f)];drawRows(thumb,f.rows);item.append(thumb,phase);strip.append(item);});
   b.append(heading,strip);b.onclick=()=>loadProject(book[p.projectId].project);group.append(b);
  }
  list.append(group);
 }
 for(const stage of STUDIO_LIFE_STAGES)$('#age-'+stage).checked=(project.behaviourPolicy?.lifeStages||STUDIO_LIFE_STAGES).includes(stage);
 if(document.activeElement!==$('#behaviour-tags'))$('#behaviour-tags').value=(project.behaviourPolicy?.tags||[]).join(', ');
 if(document.activeElement!==$('#sequence-description'))$('#sequence-description').value=project.description||'';
 renderNeighbours();
 $('#sequence-category').value=['idle','transition'].includes(sequenceCategory(project))?idlePosture(project,book):['care','interaction'].includes(sequenceCategory(project))?'interaction':sequenceCategory(project)==='transition'?'idle':sequenceCategory(project);
}
let sequencePreviewAt=0;
function animateSequencePreviews(t){if(!document.hidden&&!$('#sequences-page').hidden&&t-sequencePreviewAt>50){sequencePreviewAt=t;for(const p of sequencePreviews)drawRows(p.canvas,p.frames[frameAt(p.frames,t)].rows);}requestAnimationFrame(animateSequencePreviews);}
requestAnimationFrame(animateSequencePreviews);
$('.sequence-actions').addEventListener('click',event=>{if(event.target.closest('button'))$('.sequence-actions').open=false;});
document.addEventListener('click',event=>{if(!event.target.closest('.sequence-actions'))$('.sequence-actions').open=false;});
$('#category-filter').onchange=renderSequences;$('#show-archived').onchange=renderSequences;
function renderNeighbours(){
 const preferences=project.preferredNeighbours||{before:[],after:[]};let missing=[];
 for(const side of ['before','after']){
  const select=$('#neighbours-'+side);select.replaceChildren();
  const entries=Object.values(book).map(e=>e.project).filter(p=>p.projectId!==project.projectId&&!p.archived&&!p.deletedAt).sort((a,b)=>a.name.localeCompare(b.name));
  for(const key of preferences[side])if(!entries.some(p=>p.projectId===key)){entries.push(book[key]?.project||{projectId:key,name:'Unavailable · '+key});if(!book[key])missing.push(key);}
  for(const p of entries){const option=new Option(p.name,p.projectId);option.selected=preferences[side].includes(p.projectId);select.add(option);}
  const preview=$('#context-'+side),previous=preview.value;preview.replaceChildren(new Option('None',''));
  for(const p of Object.values(book).map(e=>e.project).filter(p=>p.projectId!==project.projectId&&!p.archived&&!p.deletedAt).sort((a,b)=>Number(preferences[side].includes(b.projectId))-Number(preferences[side].includes(a.projectId))||a.name.localeCompare(b.name)))preview.add(new Option((preferences[side].includes(p.projectId)?'☆ Preferred · ':'')+p.name,p.projectId));
  preview.value=preview.dataset.projectId===project.projectId&&[...preview.options].some(o=>o.value===previous)?previous:preferences[side].find(key=>book[key])||'';preview.dataset.projectId=project.projectId;
 }
 updatePlaybackSelection();
 $('#neighbour-warning').textContent=missing.length?'Some linked sequences are unavailable here. Their IDs are retained in the export.':'';
}
for(const side of ['before','after'])$('#neighbours-'+side).onchange=()=>{const values=[...$('#neighbours-'+side).selectedOptions].map(o=>o.value);humanAction(()=>{project.preferredNeighbours ||= {before:[],after:[]};project.preferredNeighbours[side]=values;});};
$('#clear-neighbours').onclick=()=>humanAction(()=>project.preferredNeighbours={before:[],after:[]});
$('#sequence-category').onchange=()=>humanAction(()=>{const value=$('#sequence-category').value;if(['standing','sitting','loafing'].includes(value)){project.category='idle';project.idlePosture=value;}else{project.category=value;delete project.idlePosture;}});
for(const stage of STUDIO_LIFE_STAGES)$('#age-'+stage).onchange=()=>humanAction(()=>{project.behaviourPolicy ||= {};project.behaviourPolicy.lifeStages=STUDIO_LIFE_STAGES.filter(s=>$('#age-'+s).checked);});
$('#behaviour-tags').oninput=()=>{const input=$('#behaviour-tags'),tags=[...new Set(input.value.split(',').map(s=>s.trim()).filter(Boolean))];try{validateBehaviourPolicy({behaviourPolicy:{tags}});input.setCustomValidity('');humanAction(()=>{project.behaviourPolicy ||= {};project.behaviourPolicy.tags=tags;});}catch(e){input.setCustomValidity(e.message);}};
$('#sequence-search').oninput=renderSequences;
$('#sequence-description').oninput=()=>humanAction(()=>project.description=$('#sequence-description').value.slice(0,2000));
const deletedLabel=document.createElement('label');deletedLabel.innerHTML='<input id="show-deleted" type="checkbox"> Deleted sequences';$('#show-archived').parentElement.after(deletedLabel);$('#show-deleted').onchange=renderSequences;
const deleteSequenceButton=document.createElement('button');deleteSequenceButton.id='delete-sequence';deleteSequenceButton.textContent='Delete sequence';$('.sequence-save').append(deleteSequenceButton);
deleteSequenceButton.onclick=()=>{if(project.deletedAt){humanAction(()=>{delete project.deletedAt;project.archived=false;project.archiveOverride=false;});return;}humanAction(()=>{project.deletedAt=new Date().toISOString();});const next=Object.values(book).find(e=>!e.project.deletedAt&&!e.project.archived&&e.project.projectId!==project.projectId);if(next)loadProject(next.project);toast('Sequence moved to Deleted. Enable Show deleted sequences to restore it.');};
const selectButton=document.createElement('button');selectButton.dataset.tool='select';selectButton.textContent='Select / move';document.querySelector('[aria-label="Pixel tools"]').append(selectButton);
const scopeLabel=document.createElement('label');scopeLabel.innerHTML='<input id="selection-all" type="checkbox"> Move selection across all frames';const selectionOptions=document.createElement('div');selectionOptions.className='selection-options';selectionOptions.hidden=true;$('.canvas-wrap').before(selectionOptions);selectionOptions.append(scopeLabel);
const gazePanel=document.createElement('div');gazePanel.className='gaze-controls';gazePanel.hidden=true;gazePanel.innerHTML='<label><input id="gaze-can-see" type="checkbox" checked> Can see</label><label>Location<input id="gaze-location" readonly placeholder="Click the eye area" aria-label="Gaze location"></label><label>Type<select id="gaze-type"><option value="directional">Directional field</option><option value="all-around">All around / camera-facing</option></select></label><label>Degrees<input id="gaze-fov" type="number" min="10" max="360" value="100"></label><label>Direction<input id="gaze-angle" type="number" min="-180" max="180" value="0"></label><label><input id="show-gaze" type="checkbox" checked> Overlay</label><button id="apply-gaze-all" title="Copy this frame’s gaze location, direction and field of view to every unlocked frame">Apply to all frames</button><button id="clear-gaze">Remove marker</button><p id="gaze-status" role="status">Select Gaze and click the eye area. This is metadata; it does not paint pixels.</p>';$('.stage').before($('.palette'),gazePanel);
const poiButton=document.createElement('button');poiButton.textContent='● POI';poiButton.dataset.tool='poi';$('.palette').append(poiButton);
const poiPanel=document.createElement('div');poiPanel.className='gaze-controls';poiPanel.hidden=true;poiPanel.innerHTML='<label>POI location<input id="poi-location" readonly></label><button id="apply-poi-all">Apply to all frames</button><button id="clear-poi">Remove POI</button><p class="hint">One red point per frame. Place or drag it, then explain its meaning in Sequence notes. First placement seeds all unlocked frames; refine each frame or apply to all.</p>';gazePanel.after(poiPanel);
$('#apply-poi-all').onclick=()=>humanAction(()=>applyPoiToAll(project,selected(),author));
$('#clear-poi').onclick=()=>humanAction(()=>{editable(selected());delete selected().poi;selected().operations.push({actor:author,kind:'clear-poi',at:new Date().toISOString()});});
$('#gaze-can-see').onchange=()=>humanAction(()=>setGazeVision(selected(),$('#gaze-can-see').checked,author));
$('#gaze-type').onchange=()=>{const full=$('#gaze-type').value==='all-around';$('#gaze-fov').value=full?360:100;$('#gaze-angle').disabled=full;if(selected().gaze)humanAction(()=>{editable(selected());selected().gaze.fov=full?360:100;selected().operations.push({actor:author,kind:'gaze',at:new Date().toISOString()});});};
for(const key of ['angle','fov'])$('#gaze-'+key).oninput=()=>{const input=$('#gaze-'+key),value=Number(input.value);if(!input.value||!input.validity.valid)return;if(key==='fov'){$('#gaze-type').value=value===360?'all-around':'directional';$('#gaze-angle').disabled=value===360;}if(!selected().gaze)return;humanAction(()=>{editable(selected());selected().gaze[key]=value;selected().operations.push({actor:author,kind:'gaze',at:new Date().toISOString()});});};
$('#apply-gaze-all').onclick=()=>{
 if(!selected().gaze)return;
 if(!project.frames.some(f=>!f.locked&&JSON.stringify(f.gaze)!==JSON.stringify(selected().gaze))){toast('All unlocked frames already have this gaze.');return;}
 let count=0;if(humanAction(()=>{count=applyGazeToAll(project,selected(),author);})){const locked=project.frames.filter(f=>f.locked).length;toast(`Gaze applied to ${count} other frame${count===1?'':'s'}${locked?`; ${locked} locked frame${locked===1?'':'s'} skipped`:''}. Undo restores their previous settings.`);}
};
$('#clear-gaze').onclick=()=>humanAction(()=>{editable(selected());delete selected().gaze;selected().operations.push({actor:author,kind:'clear-gaze',at:new Date().toISOString()});});$('#show-gaze').onchange=()=>{drawEditor();previews();};
const clearSelection=document.createElement('button');clearSelection.textContent='Clear selection';clearSelection.id='clear-selection';scopeLabel.after(clearSelection);clearSelection.onclick=()=>{selection=null;selectionDrag=null;drawEditor();};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selection){selection=null;selectionDrag=null;drawEditor();}});
const selectionHint=document.createElement('p');selectionHint.className='hint';selectionHint.textContent='Select / move: drag a box, then drag inside it. Clear selection or Esc starts a new box. Transparent cells replace the destination. Undo restores the entire move.';clearSelection.after(selectionHint);
const archiveButton=document.createElement('button');archiveButton.id='archive-sequence';archiveButton.textContent='Archive sequence';$('.sequence-save').append(archiveButton);archiveButton.onclick=()=>humanAction(()=>{project.archived=!project.archived;project.archiveOverride=project.archived;});
$('#duplicate-sequence').onclick=()=>{const variant=duplicateSequence(project,author);rememberSequence(book,variant,index);loadProject(variant);poseQueue.autosave(project);toast('Editable variant created. Origin and source lineage retained.');};
$('#frame-role').onchange=()=>humanAction(()=>{editable(selected());selected().role=$('#frame-role').value;});
$('#new-sequence').onclick=()=>{loadProject({schemaVersion:1,width:24,height:24,projectId:id(),name:'Untitled sequence',frames:[newFrame()]});poseQueue.autosave(project);};
$('#save-sequence').onclick=()=>document.querySelector('[data-q="save"]').click();
$('#open-saved').onclick=()=>{location.hash='sequences';requestAnimationFrame(()=>$('#saved-sequences').scrollIntoView({block:'nearest'}));document.querySelector('#saved-sequences').open=true;document.querySelector('[data-q="list"]').click();};
function readFrameClipboard(){try{return JSON.parse(localStorage.getItem(FRAME_CLIPBOARD_KEY)||'null');}catch{return null;}}
function renderClipboard(){const clip=readFrameClipboard();$('#paste-frame').disabled=!clip;$('#clipboard-status').textContent=clip?`Copied: ${clip.frame.name} · from ${clip.source.sequenceName}. Paste inserts an independent frame after the selected frame.`:'Copy a frame, select another sequence, then Paste frame. Ctrl+C / Ctrl+V work outside text fields.';}
async function copyCurrentFrame(){const clip=copyFrame(project,selected());localStorage.setItem(FRAME_CLIPBOARD_KEY,JSON.stringify(clip));renderClipboard();try{await navigator.clipboard.writeText(JSON.stringify(clip));}catch{}toast('Frame copied. Choose any sequence and paste.');}
function pasteCopiedFrame(clip=readFrameClipboard()){humanAction(()=>{const f=pasteFrame(project,clip,selected().id,author);index=project.frames.indexOf(f);});}
$('#copy-frame').onclick=copyCurrentFrame;$('#paste-frame').onclick=()=>pasteCopiedFrame();
$('#copy-sequence-id').onclick=async()=>{try{await navigator.clipboard.writeText(project.projectId);toast('Stable sequence ID copied.');}catch{toast('Select the sequence ID to copy it.');}};
window.addEventListener('storage',e=>{if(e.key===FRAME_CLIPBOARD_KEY)renderClipboard();});
document.addEventListener('paste',event=>{if(['props','changes','map'].includes(location.hash.slice(1)))return;if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)||event.target.isContentEditable)return;let clip;try{clip=JSON.parse(event.clipboardData?.getData('text/plain')||'null');}catch{}if(clip?.format==='cat-studio-frame'){event.preventDefault();localStorage.setItem(FRAME_CLIPBOARD_KEY,JSON.stringify(clip));pasteCopiedFrame(clip);}});
function setValue(selector,value){const el=$(selector);if(document.activeElement!==el)el.value=value;}
function color(v,contacts=true){return contacts?({R:'#e86458',F:'#579fc9',B:'#cc9b36'}[v] || '#19222b'):'#19222b';}
function drawRows(canvas,rows,contacts=false){const c=canvas.getContext('2d');c.clearRect(0,0,24,24);rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.'){c.fillStyle=color(v,contacts);c.fillRect(x,y,1,1);}}));}
function effectiveRows(){if(selectionDrag?.mode==='move'){try{return shiftedRows(selected().rows,selection,selectionDrag.dx,selectionDrag.dy);}catch{return selected().rows;}}return strokeRows(selected().rows,stroke,selected());}
function drawEditor(){
  if(!project)return;const dpr=devicePixelRatio||1;if(!stroke)cell=Math.max(6,Math.min(20,Math.floor(($('.canvas-wrap').clientWidth-18)/24),Math.floor(Math.max(240,document.documentElement.clientHeight-$('.canvas-wrap').getBoundingClientRect().top-50)/24)));
  const size=cell*24;editor.style.width=size+'px';editor.style.height=size+'px';editor.width=Math.round(size*dpr);editor.height=Math.round(size*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){ctx.fillStyle=(x+y)%2?'#d4dbe4':'#e9edf2';ctx.fillRect(x*cell,y*cell,cell,cell);}
  propReference.draw(ctx,cell,0,0,false);
  const opacity=Number($('#opacity').value)/100;
  for(const skin of onionLayers(project.frames,index,{previous:$('#onion-prev').checked,next:$('#onion-next').checked}))drawOnionSkin(ctx,skin,{cell,opacity});
  const rows=effectiveRows(),volume=pixelVolume(rows),baseline=pixelVolume((project.frames.find(f=>frameRole(f)==='cycle')||project.frames[0]).rows);$('#volume-stat').textContent=`Cat volume · ${volume} px (${volume-baseline>=0?'+':''}${volume-baseline} vs first cycle)`;rows.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!=='.'){ctx.fillStyle=color(v,$('#guides').checked);ctx.fillRect(x*cell,y*cell,cell,cell);}}));
  propReference.draw(ctx,cell,0,0,true);
  if($('#diff').checked&&index>0){ctx.strokeStyle='#d58c1b';ctx.lineWidth=2;for(const p of diffCells(project.frames[index-1].rows,rows))ctx.strokeRect(p.x*cell+2,p.y*cell+2,cell-4,cell-4);}
  if($('#grid').checked){ctx.strokeStyle='#30425540';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=24;i++){ctx.moveTo(i*cell+.5,0);ctx.lineTo(i*cell+.5,size);ctx.moveTo(0,i*cell+.5);ctx.lineTo(size,i*cell+.5);}ctx.stroke();}
  const box=selectionDrag?.mode==='box'?selectionBox(selectionDrag.start,selectionDrag.last):selectionDrag?.mode==='move'?{...selection,x:selection.x+selectionDrag.dx,y:selection.y+selectionDrag.dy}:selection;if(box){ctx.strokeStyle='#0da7cf';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(box.x*cell+1,box.y*cell+1,box.width*cell-2,box.height*cell-2);ctx.setLineDash([]);}
  const poi=poiDrag?.value||selected().poi;if(poi){const x=(poi.x+.5)*cell,y=(poi.y+.5)*cell;ctx.strokeStyle='#ff6262';ctx.fillStyle='#8b101077';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-11,y);ctx.lineTo(x+11,y);ctx.moveTo(x,y-11);ctx.lineTo(x,y+11);ctx.stroke();}
  const gaze=gazeDrag?.value||selected().gaze;if(gaze?.canSee===false&&$('#show-gaze').checked){const x=(gaze.x+.5)*cell,y=(gaze.y+.5)*cell;ctx.strokeStyle='#9b59d0';ctx.lineWidth=3;ctx.fillStyle='#9b59d044';ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-7,y-7);ctx.lineTo(x+7,y+7);ctx.moveTo(x+7,y-7);ctx.lineTo(x-7,y+7);ctx.stroke();}else if(gaze&&$('#show-gaze').checked){const x=(gaze.x+.5)*cell,y=(gaze.y+.5)*cell,a=gaze.angle*Math.PI/180,half=gaze.fov*Math.PI/360,r=8*cell;ctx.fillStyle='#f0ba3b33';ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,r,a-half,a+half);ctx.closePath();ctx.fill();ctx.strokeStyle='#b47700';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);if(gaze.fov<360)ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle='#f3be34';ctx.fill();
   if(tool==='gaze')for(const h of gazeHandles(gaze)){const hx=h.x*cell,hy=h.y*cell;ctx.strokeStyle='#5b3c00';ctx.fillStyle=h.kind==='direction'?'#fff4b5':'#f3be34';ctx.lineWidth=2;ctx.beginPath();if(h.kind==='direction'){const angle=h.angle*Math.PI/180;ctx.moveTo(hx+Math.cos(angle)*8,hy+Math.sin(angle)*8);ctx.lineTo(hx+Math.cos(angle+2.5)*7,hy+Math.sin(angle+2.5)*7);ctx.lineTo(hx+Math.cos(angle-2.5)*7,hy+Math.sin(angle-2.5)*7);ctx.closePath();}else if(h.kind==='origin')ctx.arc(hx,hy,6,0,Math.PI*2);else{ctx.moveTo(hx,hy-7);ctx.lineTo(hx+7,hy);ctx.lineTo(hx,hy+7);ctx.lineTo(hx-7,hy);ctx.closePath();}ctx.fill();ctx.stroke();}
  }
  animationTracks.drawMask(ctx,cell);
  const a=selected().anchor;if(a&&$('#guides').checked){const x=(a.x+.5)*cell,y=(a.y+.5)*cell;ctx.strokeStyle='#18876c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,(a.y+1)*cell);ctx.lineTo(size,(a.y+1)*cell);ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();}
}
function previews(frame=selected(),frameIndex=index,entry=null){
  if(!entry||entry.projectId===project.projectId)frame=animationTracks.sample(frame,frameIndex);
  $('#scrub').max=project.frames.length-1;$('#scrub').value=entry&&entry.projectId!==project.projectId?index:frameIndex;$('#playback-status').textContent=`${entry?entry.sequenceName+' · '+entry.position+' · ':''}Frame ${frameIndex+1} / ${entry?book[entry.projectId]?.project.frames.length||project.frames.length:project.frames.length} · ${Math.round(frameHold(frame,playbackOptions()))} ms · ${(1000/frameHold(frame,playbackOptions())).toFixed(2)} fps`;

  drawRows($('#preview'),frame.rows);
  const canvas=$('#preview-large');canvas.width=48;canvas.height=56;const c=canvas.getContext('2d');
  const filled=frame.rows.flatMap((r,y)=>[...r].flatMap(v=>v==='.'?[]:[y]));
  const a=frame.anchor || {x:12,y:filled.length?Math.max(...filled):23};
  const left=24-a.x,top=34-a.y-1;
  propReference.draw(c,1,left,top,false);
  c.strokeStyle=frame.anchor?'#18876c':'#738091';c.beginPath();c.moveTo(4,34.5);c.lineTo(44,34.5);c.stroke();
  frame.rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.'){c.fillStyle=color(v,false);c.fillRect(left+x,top+y,1,1);}}));
  propReference.draw(c,1,left,top,true);
  const g=frame.gaze;if(g?.canSee===false&&$('#show-gaze').checked){const x=left+g.x+.5,y=top+g.y+.5;c.strokeStyle='#9b59d0';c.beginPath();c.moveTo(x-2,y-2);c.lineTo(x+2,y+2);c.moveTo(x+2,y-2);c.lineTo(x-2,y+2);c.stroke();}else if(g&&$('#show-gaze').checked){const a=g.angle*Math.PI/180;c.strokeStyle='#b47700';c.beginPath();c.moveTo(left+g.x+.5,top+g.y+.5);if(g.fov===360){c.moveTo(left+g.x+.5+7,top+g.y+.5);c.arc(left+g.x+.5,top+g.y+.5,7,0,Math.PI*2);}else c.lineTo(left+g.x+.5+Math.cos(a)*8,top+g.y+.5+Math.sin(a)*8);c.stroke();}
  if(frame.anchor){c.fillStyle='#20a17d';c.fillRect(24,33,1,1);}
}
function render(){
  animationTracks.render();propReference.render();
  if(!project)return;setValue('#poi-location',selected().poi?selected().poi.x+', '+selected().poi.y:'');$('#apply-poi-all').disabled=!selected().poi;$('#clear-poi').disabled=!selected().poi||selected().locked;const g=selected().gaze,blind=g?.canSee===false;$('#gaze-can-see').checked=!blind;$('#gaze-can-see').disabled=selected().locked;gazePanel.classList.toggle('vision-off',blind);$('#gaze-type').disabled=blind||selected().locked;$('#gaze-fov').disabled=blind||selected().locked;$('#apply-gaze-all').disabled=!g||!project.frames.some(f=>!f.locked&&f!==selected());$('#clear-gaze').disabled=!g||selected().locked;setValue('#gaze-location',g?`${g.x}, ${g.y}`:'');if(g)$('#gaze-type').value=g.fov===360?'all-around':'directional';$('#gaze-angle').disabled=blind||selected().locked||$('#gaze-type').value==='all-around';setValue('#gaze-angle',g?.angle??(Number($('#gaze-angle').value)||0));setValue('#gaze-fov',g?.fov??(Number($('#gaze-fov').value)||100));$('#gaze-status').textContent=blind?'Cannot see on this frame · purple crossed marker · gaze settings retained for when vision is restored':g?`Location ${g.x}, ${g.y}; ${g.fov===360?'all directions':g.fov+' degrees toward '+g.angle+' degrees'} · drag the origin, arrow or field edges`:'First placement seeds all unlocked frames; then fine-tune each frame.';$('#delete-sequence').textContent=project.deletedAt?'Restore deleted sequence':'Delete sequence';$('#sequence-id').textContent=project.projectId;renderClipboard();$('#archive-sequence').textContent=project.archived?'Restore sequence':'Archive sequence';const f=selected();$('#frame-role').value=frameRole(f);$('#frame-role').disabled=f.locked;$('#phase-summary').textContent=['enter','cycle','exit'].map(role=>`${role[0].toUpperCase()+role.slice(1)} · ${project.frames.filter(f=>frameRole(f)===role).length}`).join('  →  ')+(project.oneShot?' · One-shot action':'');setValue('#project-name',project.name);setValue('#frame-name',f.name);setValue('#duration',f.durationMs);$('#locked').checked=f.locked;setValue('#review',f.review);
  $('#origin').textContent=f.origin==='ai'?'AI authored':f.origin==='mixed'?'Mixed origin':f.origin==='unknown'?'Unverified import':'Human authored';$('#origin').className='badge '+f.origin;
  $('#source').textContent=f.source?.symbol || (f.parentId?'Derived frame':'New artwork');$('#anchor-label').textContent=f.anchor?`Contact cell (${f.anchor.x}, ${f.anchor.y}) · support after row ${f.anchor.y}`:'No contact anchor';
  $('#history').textContent=(f.operations||[]).slice(-12).map(o=>`${o.actor} · ${o.kind} · ${o.at}`).join('\n') || 'No edits. Reference grids retain their original authorship.';
  $('#frame-count').textContent=`${index+1} / ${project.frames.length}`;$('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;
  $('#frame-name').disabled=f.locked;$('#duration').disabled=f.locked;$('#clear-anchor').disabled=f.locked;$('#delete-frame').disabled=f.locked||project.frames.length===1;
  $('#timeline').replaceChildren();project.frames.forEach((frame,i)=>{const b=document.createElement('button');b.className='frame-thumb'+(i===index?' active':'');b.setAttribute('aria-label',`Frame ${i+1}: ${frame.name}`);b.setAttribute('aria-pressed',String(i===index));const c=document.createElement('canvas');c.width=c.height=24;drawRows(c,frame.rows);const small=document.createElement('small');small.textContent=`${i+1} · ${frame.durationMs} ms`;const phase=document.createElement('span');phase.className='phase-tag '+frameRole(frame);phase.textContent=`${frameRole(frame)} · ${pixelVolume(frame.rows)} px`;const tag=document.createElement('span');tag.className='tag';tag.textContent=`${frame.locked?'🔒 ':''}${frame.origin}`;b.append(c,small,phase,tag);b.onclick=event=>{stop();if(event.shiftKey){timingRange=[Math.min(index,i)+1,Math.max(index,i)+1];$('#bulk-timing').open=true;}else timingRange=null;index=i;persist();render();if(playbackWanted)startPlayback();};$('#timeline').append(b);});renderTimingRange();
  drawEditor();previews();updatePlaybackSelection();workflow.render();poseQueue.render();renderSequences();
}
function gazePoint(event){const r=editor.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width*24,y:(event.clientY-r.top)/r.height*24};}
function point(event){return frameCell(editor,event);}
function setTool(value){tool=value;gazePanel.hidden=tool!=='gaze';poiPanel.hidden=tool!=='poi';selectionOptions.hidden=tool!=='select';document.querySelectorAll('[data-token]').forEach(b=>b.setAttribute('aria-pressed',String(tool!=='gaze'&&tool!=='poi'&&b.dataset.token===token)));document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===tool)));drawEditor();}
function setToken(value){if(tool==='gaze'||tool==='poi'||tool==='anchor'||tool==='select')setTool('pencil');token=value;document.querySelectorAll('[data-token]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.token===token)));}
installFrameCanvas(editor,{getTool:()=>tool,getToken:()=>token,getIdentity:()=>selected(),canStart:()=>!selectionDrag&&!gazeDrag&&!poiDrag,shouldHandle:(event,selectedTool)=>!(event.button===2&&['poi','gaze'].includes(selectedTool)),onBegin:()=>{stop();try{editable(selected());}catch(e){toast(e.message);return false;}},onPoint:p=>$('#coords').textContent=`Cell ${p.x}, ${p.y}`,onPreview:value=>{stroke=value;drawEditor();},onCommit:edits=>humanAction(()=>applyPixels(project,selected().id,edits,author)),onCancel:()=>{render();if(playbackWanted)startPlayback();}});
// Context-specific gestures. Ordinary paint/erase/line/rectangle events are
// claimed by the shared controller above, including temporary right erasing.
editor.addEventListener('pointerdown',event=>{
  if(![0,2].includes(event.button)||stroke||selectionDrag||gazeDrag||poiDrag)return;event.preventDefault();const activeTool=event.button===2?'erase':tool;stop();const p=point(event);$('#coords').textContent=`Cell ${p.x}, ${p.y}`;if(tool==='poi'&&event.button===2){humanAction(()=>{editable(selected());delete selected().poi;selected().operations.push({actor:author,kind:'clear-poi',at:new Date().toISOString()});});return;}if(tool==='gaze'&&event.button===2){if(selected().gaze?.x===p.x&&selected().gaze?.y===p.y)humanAction(()=>{editable(selected());delete selected().gaze;selected().operations.push({actor:author,kind:'clear-gaze',at:new Date().toISOString()});});return;}
  if(activeTool==='select'){selectionDrag={mode:containsCell(selection,p)?'move':'box',start:p,last:p,pointer:event.pointerId,dx:0,dy:0};editor.setPointerCapture(event.pointerId);drawEditor();return;}
  if(activeTool==='pick'){setToken(selected().rows[p.y][p.x]);return;}
  try{editable(selected());}catch(e){toast(e.message);return;}
  if(activeTool==='poi'){poiDrag={pointer:event.pointerId,value:p};editor.setPointerCapture(event.pointerId);drawEditor();return;}
  if(activeTool==='gaze'){
   const g=selected().gaze,q=gazePoint(event),handle=g&&$('#show-gaze').checked?gazeHandles(g).find(h=>Math.hypot(h.x-q.x,h.y-q.y)*cell<=11):null;
   if(handle){gazeDrag={pointer:event.pointerId,kind:handle.kind,start:{...g},value:{...g}};editor.setPointerCapture(event.pointerId);drawEditor();return;}
   let count=0;humanAction(()=>{count=placeGaze(project,selected(),{...selected().gaze,...p,angle:Number($('#gaze-angle').value),fov:Number($('#gaze-fov').value),canSee:$('#gaze-can-see').checked},author);});
   if(count>1)toast(`Gaze placed on ${count} unlocked frames. Fine-tune each frame with the handles.`);return;
  }
  if(activeTool==='anchor'){humanAction(()=>{selected().anchor=p;selected().review='candidate';});return;}
  if(activeTool==='fill'){humanAction(()=>applyPixels(project,selected().id,fillCells(selected().rows,p,token),author));return;}
});
editor.addEventListener('pointermove',event=>{if(poiDrag&&event.pointerId===poiDrag.pointer){poiDrag.value=point(event);drawEditor();return;}if(gazeDrag&&event.pointerId===gazeDrag.pointer){gazeDrag.value=dragGaze(gazeDrag.start,gazeDrag.kind,gazePoint(event));$('#gaze-status').textContent=`${gazeDrag.value.fov} degrees toward ${gazeDrag.value.angle} degrees · release to save`;drawEditor();return;}const p=point(event);$('#coords').textContent=`Cell ${p.x}, ${p.y}`;if(selectionDrag&&selectionDrag.pointer===event.pointerId){selectionDrag.last=p;if(selectionDrag.mode==='move'){selectionDrag.dx=Math.max(-selection.x,Math.min(24-selection.x-selection.width,p.x-selectionDrag.start.x));selectionDrag.dy=Math.max(-selection.y,Math.min(24-selection.y-selection.height,p.y-selectionDrag.start.y));}drawEditor();return;}
});
editor.addEventListener('pointerup',event=>{if(poiDrag&&event.pointerId===poiDrag.pointer){const value=poiDrag.value;poiDrag=null;humanAction(()=>placePoi(project,selected(),value,author));return;}if(gazeDrag&&event.pointerId===gazeDrag.pointer){const drag=gazeDrag;gazeDrag=null;if(JSON.stringify(drag.start)!==JSON.stringify(drag.value))humanAction(()=>{editable(selected());selected().gaze=drag.value;selected().operations.push({actor:author,kind:'gaze-handle',at:new Date().toISOString()});});else{drawEditor();if(playbackWanted)startPlayback();}return;}if(selectionDrag&&event.pointerId===selectionDrag.pointer){const drag=selectionDrag;selectionDrag=null;if(drag.mode==='box'){selection=selectionBox(drag.start,drag.last);drawEditor();}else if(drag.dx||drag.dy){const ids=$('#selection-all').checked?project.frames.map(f=>f.id):[selected().id];if(humanAction(()=>moveSelection(project,ids,selection,drag.dx,drag.dy,author)))selection={...selection,x:selection.x+drag.dx,y:selection.y+drag.dy};drawEditor();}return;}});
editor.addEventListener('pointercancel',event=>{if(![poiDrag,gazeDrag,selectionDrag].some(d=>d?.pointer===event.pointerId))return;poiDrag=null;gazeDrag=null;selectionDrag=null;render();if(playbackWanted)startPlayback();});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));document.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>setToken(b.dataset.token));
document.querySelectorAll('[data-transform]').forEach(b=>b.onclick=()=>humanAction(()=>transform(project,selected().id,b.dataset.transform,author)));
$('#author').onchange=()=>{author=$('#author').value;workflow.render();poseQueue.render();toast(author==='ai'?'Edits in this session will be recorded as AI edits.':'Human editing session.');};
for(const key of ['grid','onion-prev','onion-next','guides','diff','opacity'])$('#'+key).oninput=drawEditor;
new ResizeObserver(drawEditor).observe($('.canvas-wrap'));window.addEventListener('resize',drawEditor);document.addEventListener('toggle',()=>{if(project&&!$('#sequences-page').hidden)drawEditor();},true);
function step(direction){stop(true);index=(index+direction+project.frames.length)%project.frames.length;persist();render();}
$('#previous').onclick=()=>step(-1);$('#next').onclick=()=>step(1);
$('#undo').onclick=()=>{if(!undo.length)return;stop();redo.push({project:clone(project),index});const s=undo.pop();project=s.project;index=s.index;persist();poseQueue.autosave(project);render();if(playbackWanted)startPlayback();};
$('#redo').onclick=()=>{if(!redo.length)return;stop();undo.push({project:clone(project),index});const s=redo.pop();project=s.project;index=s.index;persist();poseQueue.autosave(project);render();if(playbackWanted)startPlayback();};
$('#blank').onclick=()=>humanAction(()=>{if(project.frames.length>=96)throw Error('Maximum 96 frames.');project.frames.splice(index+1,0,newFrame('New frame'));index++;});
$('#duplicate').onclick=()=>humanAction(()=>{duplicateFrame(project,selected().id);index++;});
$('#delete-frame').onclick=()=>{if(selected().locked||project.frames.length===1)return;if(confirm('Delete the selected frame? Undo can restore it.'))humanAction(()=>project.frames.splice(index,1));};
function reorder(direction){humanAction(()=>{if(selected().locked)throw Error('Unlock this keyframe before reordering it.');const target=index+direction;if(target<0||target>=project.frames.length)return;const [f]=project.frames.splice(index,1);project.frames.splice(target,0,f);index=target;});}
$('#move-left').onclick=()=>reorder(-1);$('#move-right').onclick=()=>reorder(1);
$('#locked').onchange=()=>humanAction(()=>selected().locked=$('#locked').checked);
$('#project-name').oninput=()=>humanAction(()=>project.name=$('#project-name').value.trim()||'Untitled clip');
$('#frame-name').oninput=()=>humanAction(()=>{editable(selected());selected().name=$('#frame-name').value;});

function renderTimingRange(){
 const range=timingRange||[index+1,index+1],valid=range[0]>=1&&range[1]>=range[0]&&range[1]<=project.frames.length;
 setValue('#timing-from',range[0]);setValue('#timing-through',range[1]);
 $('#timing-from').max=$('#timing-through').max=project.frames.length;
 const frames=valid?project.frames.slice(range[0]-1,range[1]):[],locked=frames.filter(f=>f.locked).length;
 $('#timing-range-status').textContent=valid?`${frames.length} frames selected${locked?' · '+locked+' locked; unlock before applying timing':''}`:'Choose a valid frame range.';
 $('#apply-range-timing').disabled=!valid||!!locked;
 [...$('#timeline').children].forEach((button,i)=>button.classList.toggle('timing-selected',!!timingRange&&valid&&i+1>=range[0]&&i+1<=range[1]));
}
for(const selector of ['#timing-from','#timing-through'])$(selector).onchange=()=>{timingRange=[Number($('#timing-from').value),Number($('#timing-through').value)];renderTimingRange();};
$('#timing-all').onclick=()=>{timingRange=[1,project.frames.length];renderTimingRange();};
$('#timing-current').onclick=()=>{timingRange=null;renderTimingRange();};
$('#apply-range-timing').onclick=()=>humanAction(()=>{const range=timingRange||[index+1,index+1],ms=Number($('#timing-hold').value),count=applyFrameTiming(project,...range,ms);$('#timing-mode').value='authored';toast(`Saved ${ms} ms for ${count} frames.`);});

$('#duration').onchange=()=>humanAction(()=>{editable(selected());selected().durationMs=Number($('#duration').value);});
$('#review').onchange=()=>humanAction(()=>selected().review=$('#review').value);
$('#clear-anchor').onclick=()=>humanAction(()=>{editable(selected());selected().anchor=null;});
function playbackOptions(){return {mode:$('#timing-mode').value,fps:Number($('#fps').value),speed:Number($('#speed').value)};}
function tick(t){if(!playing)return;if(!playAt)playAt=t;let elapsed=t-playAt;
 while(elapsed>=frameHold(playbackFrames[playIndex].frame,playbackOptions())){const duration=frameHold(playbackFrames[playIndex].frame,playbackOptions());elapsed-=duration;playAt+=duration;if(playIndex===playbackFrames.length-1&&!$('#loop').checked){stop();previews();return;}playIndex=(playIndex+1)%playbackFrames.length;}
 const entry=playbackFrames[playIndex];previews(entry.frame,entry.frameIndex,entry);$('#play').textContent=`Ⅱ Pause · ${playIndex+1}/${playbackFrames.length}`;raf=requestAnimationFrame(tick);
}
function selectedPlaybackFrames(){return buildPlaybackPlan(project,book,{context:$('#preview-context').checked,before:$('#context-before').value,after:$('#context-after').value,includeEnter:$('#include-enter').checked,includeExit:$('#include-exit').checked});}
function updatePlaybackSelection(){const frames=selectedPlaybackFrames();$('#play').disabled=!frames.length;$('#playback-selection').textContent=frames.length?`${frames.length} frames included${$('#preview-context').checked?' · with neighbours':' · cycle frames always included'}`:'No frames included. Enable an enter or exit transition to preview this sequence.';}
function startPlayback(){if(!project||$('#sequences-page').hidden)return;playbackWanted=true;stop();playbackFrames=selectedPlaybackFrames();if(!playbackFrames.length)return;playing=true;playIndex=$('#preview-context').checked?0:Math.max(0,playbackFrames.findIndex(e=>e.frame===selected()));playAt=0;raf=requestAnimationFrame(tick);$('#play').textContent='Ⅱ Pause';}
$('#play').onclick=()=>{if(playing){stop(true);previews();}else startPlayback();};
function changePlaybackSelection(){const wasPlaying=playing,current=wasPlaying?playbackFrames[playIndex]?.frame:selected();stop();playbackFrames=selectedPlaybackFrames();updatePlaybackSelection();if(!playbackFrames.length)return;playIndex=Math.max(0,playbackFrames.findIndex(e=>e.frame===current));const entry=playbackFrames[playIndex];previews(entry.frame,entry.frameIndex,entry);if(wasPlaying){playing=true;playAt=0;raf=requestAnimationFrame(tick);}}
for(const selector of ['include-enter','include-exit','preview-context','context-before','context-after'])$('#'+selector).onchange=changePlaybackSelection;
for(const selector of ['speed','fps','timing-mode'])$('#'+selector).oninput=()=>{if(selector==='fps'){$('#timing-mode').value='fixed';$('#fps-slider').value=$('#fps').value;}playAt=0;previews();};
$('#fps-slider').oninput=()=>{$('#fps').value=$('#fps-slider').value;$('#timing-mode').value='fixed';playAt=0;previews();};
$('#scrub').oninput=()=>{stop(true);index=Number($('#scrub').value);persist();render();};
$('#preview-previous').onclick=()=>step(-1);$('#preview-next').onclick=()=>step(1);
$('#apply-fps').onclick=()=>humanAction(()=>{const fps=Math.max(1,Number($('#fps').value)||8);if(fps>20)throw Error('Saved frame holds support up to 20 fps. Higher rates are available for preview.');const ms=Math.max(50,Math.round(1000/fps));if(project.frames.some(f=>f.locked))throw Error('Unlock the keyframes before applying timing to the whole sequence.');for(const f of project.frames)f.durationMs=ms;$('#timing-mode').value='authored';toast(`Saved ${ms} ms per frame.`);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
document.addEventListener('keydown',event=>{if(event.defaultPrevented||['props','changes','map'].includes(location.hash.slice(1)))return;if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)||document.querySelector('dialog[open]'))return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='c'){event.preventDefault();copyCurrentFrame();return;}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.code==='Space'){event.preventDefault();$('#play').click();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();$(event.shiftKey?'#redo':'#undo').click();}});
function download(name,data,type='application/json'){const blob=data instanceof Blob?data:new Blob([data],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const filename=()=>project.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'cat-clip';
$('#download').onclick=()=>{download(filename()+'.json',JSON.stringify(exportSequenceProject(project),null,2));toast('Sequence exported. Frames, tracks, metadata and authorship included.');};
$('#export-rows').onclick=async()=>{const rows=JSON.stringify(selected().rows,null,2);try{await navigator.clipboard.writeText(rows);toast('24 × 24 grid copied.');}catch{download(filename()+'-frame.json',rows);}};
$('#export-png').onclick=()=>{const c=document.createElement('canvas');c.width=c.height=24;drawRows(c,selected().rows,$('#guides').checked);c.toBlob(b=>download(filename()+'-frame.png',b,'image/png'));};
$('#export-sheet').onclick=()=>{const c=document.createElement('canvas');c.width=project.frames.length*24;c.height=24;const t=c.getContext('2d');project.frames.forEach((f,i)=>{const sub=document.createElement('canvas');sub.width=sub.height=24;drawRows(sub,f.rows);t.drawImage(sub,i*24,0);});c.toBlob(b=>download(filename()+'-sheet.png',b,'image/png'));};
function openLibrary(){$('#library-list').replaceChildren();library.groups.forEach(group=>{const section=document.createElement('section');section.className='library-group';const h=document.createElement('h3');h.textContent=group.name;const open=document.createElement('button');open.textContent='Open sequence';open.onclick=()=>{loadProject(projectFromGroup(group));$('#library-dialog').close();};h.append(open);const frames=document.createElement('div');frames.className='library-frames';group.frames.forEach(ref=>{const b=document.createElement('button'),c=document.createElement('canvas'),label=document.createElement('small');c.width=c.height=24;drawRows(c,ref.rows);label.textContent=ref.name;b.append(c,label);b.title='Insert reference; preserve its displayed origin and review status';b.onclick=()=>{humanAction(()=>{if(project.frames.length>=96)throw Error('Maximum 96 frames.');project.frames.splice(index+1,0,{...clone(ref),id:id(),locked:false,review:'candidate',operations:[]});index++;});$('#library-dialog').close();};frames.append(b);});section.append(h,frames);$('#library-list').append(section);});$('#library-dialog').showModal();}
$('#library').onclick=openLibrary;$('#close-library').onclick=()=>$('#library-dialog').close();
$('#import').onclick=()=>{$('#import-error').textContent='';$('#import-dialog').showModal();};$('#close-import').onclick=()=>$('#import-dialog').close();
function parseImport(text){const p=JSON.parse(text);if(Array.isArray(p)){validateRows(p);return {schemaVersion:1,width:24,height:24,name:'Imported frame',frames:[newFrame('Imported frame',p,'unknown')]};}return validateProject(p.format==='cat-studio-handoff'?p.project:p);}
$('#load-json').onclick=()=>{try{loadProject(parseImport($('#json-input').value));poseQueue.autosave(project);$('#import-dialog').close();}catch(e){$('#import-error').textContent=e.message;}};
$('#project-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>2e6){$('#import-error').textContent='Project exceeds 2 MB.';return;}$('#json-input').value=await f.text();};
$('#import-png').onclick=()=>$('#png-file').click();
$('#png-file').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;const image=await createImageBitmap(file);if(image.width!==24||image.height!==24)throw Error('PNG must be exactly 24 × 24. No resampling is performed.');const c=document.createElement('canvas');c.width=c.height=24;c.getContext('2d').drawImage(image,0,0);const data=c.getContext('2d').getImageData(0,0,24,24).data;const rows=[];for(let y=0;y<24;y++){let row='';for(let x=0;x<24;x++){const i=(y*24+x)*4,[r,g,b,a]=data.slice(i,i+4);if(a===0)row+='.';else if(a!==255)throw Error('Semi-transparent pixels are outside the sprite palette.');else if(Math.max(r,g,b)<65)row+='#';else if(r>150&&g<140&&b<140)row+='R';else if(b>150&&r<150)row+='F';else if(r>150&&g>110&&b<150)row+='B';else throw Error('PNG contains a colour outside the cat palette.');}rows.push(row);}humanAction(()=>{if(project.frames.length>=96)throw Error('Maximum 96 frames.');project.frames.splice(index+1,0,newFrame(file.name,rows,'unknown'));index++;});toast('Imported as unverified artwork; provenance retained.');}catch(e){toast(e.message);}finally{event.target.value='';}};
const contract={version:1,grid:{width:24,height:24,tokens:TOKENS},rules:['AI operations always record actor ai.','Locked frames cannot be edited.','New candidates are never accepted automatically.','Approval never changes origin.'],tools:[{name:'get_project',readOnly:true},{name:'insert_ai_candidate',input:{afterId:'optional frame id',name:'candidate name',rows:'24 strings, 24 tokens each',durationMs:'50..5000',parentId:'optional reference id'}},{name:'patch_ai_pixels',input:{frameId:'unlocked frame id',pixels:'array of {x,y,token}'}},{name:'set_ai_contact',input:{frameId:'unlocked frame id',x:'0..23',y:'0..23'}}]};
contract.tools.push(...[...workflow.tools,...poseQueue.tools].map(({name,inputSchema})=>({name,inputSchema})));
const backup=document.createElement('button');backup.textContent='Download full project backup';backup.onclick=()=>download(filename()+'-backup.json',JSON.stringify(project,null,2));$('#export-agent').after(backup);
$('#export-agent').onclick=()=>download('cat-studio-agent-contract.json',JSON.stringify(contract,null,2));
function registerAgentTools(){const registry=document.modelContext;if(!registry?.registerTool)return;const result=value=>({content:[{type:'text',text:JSON.stringify(value)}]});
  const tools=[...workflow.tools,...poseQueue.tools,
    {name:'get_project',description:'Read the 24×24 cat animation project, per-frame origin, locks, holds and source references.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>result(clone(project))},
    {name:'insert_ai_candidate',description:'Insert an AI-authored 24×24 candidate without changing existing frames. Candidate needs human review.',inputSchema:{type:'object',properties:{afterId:{type:'string'},name:{type:'string'},rows:{type:'array',items:{type:'string'},minItems:24,maxItems:24},durationMs:{type:'number'},parentId:{type:'string'}},required:['rows'],additionalProperties:false},execute:input=>{let f;mutate(()=>{f=insertCandidate(project,input);index=project.frames.indexOf(f);});return result({frameId:f.id,origin:f.origin,review:f.review});}},
    {name:'patch_ai_pixels',description:'Apply a validated batch of AI pixel edits to an unlocked frame; retain human/AI lineage and candidate status.',inputSchema:{type:'object',properties:{frameId:{type:'string'},pixels:{type:'array',items:{type:'object',properties:{x:{type:'integer'},y:{type:'integer'},token:{type:'string',enum:TOKENS}},required:['x','y','token'],additionalProperties:false}}},required:['frameId','pixels'],additionalProperties:false},execute:input=>{const f=mutate(()=>{applyPixels(project,input.frameId,input.pixels,'ai');index=project.frames.findIndex(f=>f.id===input.frameId);});return result({frameId:f.id,origin:f.origin,review:f.review});}},
    {name:'set_ai_contact',description:'Set the contact anchor on an unlocked candidate frame. This records an AI metadata edit, without relabelling artwork origin.',inputSchema:{type:'object',properties:{frameId:{type:'string'},x:{type:'integer'},y:{type:'integer'}},required:['frameId','x','y'],additionalProperties:false},execute:input=>{mutate(()=>{const f=getFrame(project,input.frameId);editable(f);f.anchor={x:input.x,y:input.y};f.review='candidate';(f.operations ||= []).push({actor:'ai',kind:'anchor',at:new Date().toISOString()});index=project.frames.indexOf(f);});return result({frameId:input.frameId,anchor:selected().anchor});}}
  ];
  for(const t of tools)try{Promise.resolve(registry.registerTool(t)).catch(()=>{});}catch{}
}
try{
 library=await (await fetch('library.json')).json();
 try{book=JSON.parse(localStorage.getItem(BOOK_KEY)||'{}');for(const entry of Object.values(book))validateProject(entry.project);}catch{book={};}
 try{const saved=JSON.parse(localStorage.getItem(STORAGE));project=saved?.project?validateProject(saved.project):null;index=Number.isInteger(saved?.index)?saved.index:0;}catch{project=null;}
 if(project){ensureQueue(project);rememberSequence(book,project,index);}
 const adopted=await poseQueue.hydrate(book);if(project&&adopted.has(project.projectId)){project=clone(book[project.projectId].project);index=book[project.projectId].index||0;}
 // Refresh managed references once per catalogue revision, preserving replaced
 // records in the hidden archive. Never overwrite an edited v4 working copy.
 reconcileCatalogue(book,library);
 if(!project||book[project.projectId]?.project.deletedAt||book[project.projectId]?.project.archived||book[project.projectId]?.project.catalogueRevision!==project.catalogueRevision){
  const entry=project&&!book[project.projectId]?.project.deletedAt&&!book[project.projectId]?.project.archived?book[project.projectId]:book['sequence-across'];project=clone(entry.project);index=entry.index||0;
 }
 for(const entry of Object.values(book)){if(!entry.project.description){const notes=[...new Set((entry.project.workQueue?.tasks||[]).map(t=>t.notes).filter(Boolean))].join('\n\n');if(notes)entry.project.description=notes.slice(0,2000);}}
 if(!project.description&&book[project.projectId]?.project.description)project.description=book[project.projectId].project.description;
 ensureQueue(project);index=Math.max(0,Math.min(index,project.frames.length-1));persist();render();registerAgentTools();poseQueue.resume();
}catch(error){toast('Could not load the frame library: '+error.message);$('#save-status').textContent='Library unavailable';}
let propsLab;
function openProps(){stop();propsLab ||= installPropsLab({dialog:$('#props-page'),library,getSequences:()=>Object.values(book).map(e=>e.project),actor:()=>author,download,toast});propsLab.open();}

const changePage=installChangePage({root:$('#changes-page'),toast,openSequence:key=>{if(!book[key]){toast('Sequence unavailable in this browser. Import its exact snapshot to edit it.');return;}loadProject(book[key].project);location.hash='sequences';},openProp:(key,name)=>{location.hash='props';openProps();propsLab.find(name);}});
const behaviourMap=installBehaviourMap({root:$('#map-page'),getSequences:()=>Object.values(book).map(e=>e.project),openSequence:key=>{if(book[key]){loadProject(book[key].project);location.hash='sequences';}}});
function showPage(){const page=['props','changes','map'].includes(location.hash.slice(1))?location.hash.slice(1):'sequences';stop();$('#sequences-page').hidden=page!=='sequences';$('#map-page').hidden=page!=='map';$('#changes-page').hidden=page!=='changes';$('#props-page').hidden=page!=='props';for(const a of document.querySelectorAll('.app-nav a'))a.setAttribute('aria-current',a.hash==='#'+page?'page':'false');if(page==='props')openProps();else propsLab?.close();if(page==='changes')changePage.open();if(page==='map')behaviourMap.open();if(page==='sequences')startPlayback();}
document.addEventListener('visibilitychange',()=>{playAt=0;});
window.addEventListener('hashchange',showPage);
showPage();document.body.inert=false;
