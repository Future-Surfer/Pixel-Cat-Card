import '../pixel-cat-roaming-art.js';import '../pixel-cat-roaming-extras.js';import '../pixel-cat-affordances.js';import '../pixel-cat-behaviours.js';import '../pixel-cat-roaming.js';import './playground-card.js';
import {worldGaze,Awareness,LabMetrics} from './gaze-perception.js';
const $=s=>document.querySelector(s),cat=$('#observer'),targetCanvas=$('#target'),overlay=$('#vision-overlay');
const art=window.pixelCatRoamingArtV2,extras=window.pixelCatRoamingExtrasV1;
let assets,projects=new Map(),rowsMetadata=new WeakMap(),ambiguous=new Set(),snapshot,eye={known:false,canSee:false,reason:'unknown'},currentFrame=0,sequenceStart=0;
let mode='inspect',paused=false,placing=false,pin=null,pinFraction=.45,sceneTime=0,lastAt=null,lastPerception=-Infinity,lastUI=-Infinity,lastTarget=null,positionReady=false;
let pendingWatch=null,watchUntil=0,lastReaction=-Infinity,resizePending=true;
const awareness=new Awareness(),metrics=new LabMetrics(),events=[],target={id:'target',label:'Ball',x:0,y:0,width:16,height:16,moving:false,vx:0,dragging:false};
let worldRect=null,targetSurface=null,targetPaint='',viewport={width:innerWidth,height:innerHeight},currentPerception={notices:[],states:[]},controllerMs=0;
function event(message){events.unshift({at:Math.round(sceneTime),message});if(events.length>60)events.pop();}
const sameRows=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function metadata(p,i){const f=p.frames[i];return {sequenceId:p.projectId,sequenceName:p.name,frameId:f.id,frame:i,gaze:f.gaze,hash:p.hash};}
function bind(rows,p,index){if(p?.frames[index]&&sameRows(rows,p.frames[index].rows))rowsMetadata.set(rows,metadata(p,index));}
function registerClip(clip){const p=projects.get(clip?.sequenceId);if(!p)return;clip.frames.forEach((rows,i)=>{const preferred=clip.sourceFrames?.[i]??i;if(p.frames[preferred]&&sameRows(rows,p.frames[preferred].rows)){bind(rows,p,preferred);return;}const matches=p.frames.map((f,n)=>({f,n})).filter(v=>sameRows(rows,v.f.rows));if(matches.length&&matches.every(v=>JSON.stringify(v.f.gaze)===JSON.stringify(matches[0].f.gaze)))bind(rows,p,matches[0].n);});}
function bindRuntime(){
 rowsMetadata=new WeakMap();ambiguous=new Set();
 if(extras.startle)extras.startle.frames.forEach((rows,frame)=>rowsMetadata.set(rows,{sequenceId:extras.startle.sequenceId,sequenceName:'Startle hop',frame,gaze:extras.startle.gazes[frame]}));
 for(const clip of Object.values({...art.idleSequences,...extras.idleSequences}))registerClip(clip);
 for(const clip of [...art.sneak,art.freefallSequence,art.acrossFlight,extras.fastWalk,extras.gallop,extras.gallopPreview])if(clip)registerClip(clip);
 for(const [key,id]of [['walk','sequence-walk'],['walkHigh','sequence-walk-high'],['walkLow','sequence-walk-low']]){const p=projects.get(id);if(p)art[key].forEach((rows,i)=>bind(rows,p,i));}
 for(const [key,id]of [['stand','sequence-stand'],['sit','sequence-sit'],['perch','sequence-sit-elevated'],['loaf','sequence-loaf'],['look','sequence-look-up'],['clean','sequence-clean'],['stretch','sequence-stretch']]){
  const p=projects.get(id);if(!p)continue;const rows=key==='stand'||key==='sit'?art.idle[key].flat():art.idle[key];rows.forEach((r,i)=>{const n=key==='stand'?i+1:i;bind(r,p,n);});
 }
 for(let i=0;i<art.walkHeadVariants.length;i++)for(let head=0;head<2;head++)bind(art.walkHeadVariants[i][head],projects.get(head?'sequence-walk-low':'sequence-walk-high'),i);
 const standing=projects.get('sequence-stand');if(standing){bind(art.stand,standing,0);bind(art.ascend[0],standing,0);}
 const across=projects.get('sequence-across');if(across){const indices=[0,1,across.frames.findIndex(f=>f.role==='cycle'),across.frames.length-1];art.across.forEach((rows,i)=>bind(rows,across,indices[i]));}
 for(const [key,id]of [['ascend','sequence-ascend'],['descend','sequence-descend']]){const p=projects.get(id);if(p)art[key].forEach((rows,i)=>bind(rows,p,i));}
 // Legacy/bridge copies may lack a stable frame reference. Accept an exact-row
 // fallback only if every saved match agrees on gaze; never silently guess.
 const signatures=new Map();for(const p of projects.values())for(let i=0;i<p.frames.length;i++){const f=p.frames[i],key=f.rows.join('');if(!signatures.has(key))signatures.set(key,[]);signatures.get(key).push(metadata(p,i));}
 const visit=value=>{if(!Array.isArray(value))return;if(value.length===24&&value.every(r=>typeof r==='string'&&r.length===24)){if(!rowsMetadata.has(value)){const matches=signatures.get(value.join(''))||[];if(matches.length&&matches.every(m=>JSON.stringify(m.gaze)===JSON.stringify(matches[0].gaze)))rowsMetadata.set(value,{...matches[0],fallback:true});else if(matches.length)ambiguous.add(value);}return;}value.forEach(visit);};
 for(const value of Object.values(art)){if(Array.isArray(value))visit(value);}visit(Object.values(art.bridges));
}
async function loadAssets(){const res=await fetch('/api/assets',{cache:'no-store'});if(!res.ok)throw Error('Could not read saved assets');assets=await res.json();projects=new Map(assets.projects.filter(p=>!p.wip).map(p=>[p.projectId,p]));bindRuntime();const select=$('#sequence'),previous=select.value;select.replaceChildren();for(const p of [...projects.values()].sort((a,b)=>a.name.localeCompare(b.name))){const option=new Option(`${p.name} (${p.frames.filter(f=>f.gaze).length}/${p.frames.length})`,p.projectId);select.add(option);}select.value=projects.has(previous)?previous:'sequence-stand';sequenceStart=sceneTime;currentFrame=0;
 const count=[...projects.values()].reduce((n,p)=>n+p.frames.filter(f=>f.gaze).length,0),missing=[...projects.values()].filter(p=>p.frames.some(f=>!f.gaze));$('#assets').textContent=`${projects.size} sequences · ${count} gaze markers · ${missing.length} with gaps. WIP excluded. Snapshot loaded ${new Date(assets.loadedAt).toLocaleTimeString()}. Reload to pick up later saves.`;event('Loaded exact saved gaze snapshots; HA unchanged.');}
await loadAssets();
$('#left-shelf').setConfig({name:'Left shelf',height:125,cat_surfaces:[{id:'shelf',label:'Left shelf floor',x1:5,x2:95,y:70,poses:['sit','stand','clean','loaf','look','lookdown']}]});
$('#right-shelf').setConfig({name:'Right shelf',height:125,cat_surfaces:[{id:'shelf',label:'Right shelf floor',x1:5,x2:95,y:70,poses:['sit','stand','clean','loaf','look']}]});
$('#wide-floor').setConfig({name:'Shared floor',height:125,cat_surfaces:[{id:'floor',label:'Shared floor',x1:3,x2:97,y:78,poses:['sit','stand','clean','loaf','look','sleep']}]});
cat.setConfig({cat_id:'gaze-lab',cell_size:3,relaxed_speed:9,rest_ms:10000,home_rest_ms:10000,playful_pounces:false,toy_hunting:false,dashboard_props:false,standard_surfaces:false,walk_head_bob:'auto',color:'#253540',mood_enabled:true,debug_mood:true});cat.facing=1;
const homeStyle=document.createElement('style');homeStyle.textContent='button,details,.status{display:none!important}ha-card{padding-bottom:0}.dock{margin-bottom:0}';cat.shadowRoot.append(homeStyle);
const realDraw=cat.draw.bind(cat),realTick=cat.tick.bind(cat);
cat.draw=rows=>{cat.labRows=rows;realDraw(rows);};
function frameIndex(frames,elapsed){const total=frames.reduce((n,f)=>n+f.durationMs,0);let time=elapsed%total;for(let i=0;i<frames.length;i++){if(time<frames[i].durationMs)return i;time-=frames[i].durationMs;}return frames.length-1;}
function chooseSurface(x,y){return cat.surfaces.filter(s=>!s.home).sort((a,b)=>Math.abs(a.top-y)+Math.max(0,a.left-x,x-a.right)*2-Math.abs(b.top-y)-Math.max(0,b.left-x,x-b.right)*2)[0]||cat.home;}
function capture(){if(!cat.labRows)return;const transform=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(cat.svg.style.transform);if(!transform)return;
 const meta=mode==='inspect'?metadata(projects.get($('#sequence').value),currentFrame):rowsMetadata.get(cat.labRows);
 snapshot={...meta,rows:cat.labRows,placement:{x:Number(transform[1]),top:Number(transform[2])},scale:cat.scale,facing:cat.facing,unknownReason:ambiguous.has(cat.labRows)?'ambiguous exact-row match':'no saved marker for displayed frame'};
 eye=worldGaze(meta?.gaze,snapshot.placement,cat.scale,cat.facing,Number($('#range').value));
 if(mode==='explore'&&cat.idle?.pose==='sleep'&&!meta?.gaze)eye={...eye,canSee:false,reason:'sleeping without gaze'};
}
cat.tick=function(t){const start=performance.now();
 if(mode==='inspect'){
  if(!this.active)return;this.raf=requestAnimationFrame(next=>this.tick(next));if(this.needsMeasure)this.measure();
  if(pin&&!this.surfaces.some(s=>s.id===pin.id))pin=null;
  pin=this.surfaces.find(s=>s.id===pin?.id)||this.surfaces.find(s=>s.label.includes('Shared floor')&&s.internal)||this.home;
  const p=projects.get($('#sequence').value);if(!p)return;if($('#animate').checked&&!paused)currentFrame=frameIndex(p.frames,sceneTime-sequenceStart);
  const f=p.frames[currentFrame],supportRows=f.rows.flatMap((r,y)=>r.includes('R')?[y]:[]),anchor=f.anchor||{x:12,y:supportRows.length?Math.max(...supportRows):23};
  const contact=pin.left+(pin.right-pin.left)*pinFraction,ax=this.facing<0?23-anchor.x:anchor.x;
  this.x=Math.round((contact-ax*this.scale)/this.scale)*this.scale;this.y=pin.top;this.support=pin;this.motion=null;this.route=[];this.idle=null;
  this.draw(f.rows);this.svg.style.transform=`translate(${this.x}px,${Math.round((pin.top-(anchor.y+1)*this.scale)/this.scale)*this.scale}px)`;
 }else {this.paused=paused;realTick(t);}
 controllerMs=performance.now()-start;capture();
};
function drawTarget(){const kind=$('#target-kind').value,signature=kind+':'+(kind==='cat'?Math.floor(sceneTime/200)%4:target.vx<0?'left':'right');if(signature===targetPaint)return;targetPaint=signature;const ctx=targetCanvas.getContext('2d');ctx.clearRect(0,0,96,96);
 if(kind==='cat'){const p=projects.get('sequence-walk-high'),frame=p.frames[Math.floor(sceneTime/200)%p.frames.length];ctx.fillStyle='#d4a179';frame.rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')ctx.fillRect((target.vx<0?23-x:x)*4,y*4,4,4);}));target.width=target.height=72;}
 else{const p=extras.dashboardProps.find(p=>p.id===(kind==='ball'?'ball':'toy_mouse'));const scale=kind==='ball'?4:3;target.width=p.width*scale;target.height=p.height*scale;targetCanvas.width=p.width;targetCanvas.height=p.height;p.pixels.forEach((row,y)=>row.forEach((color,x)=>{if(color){ctx.fillStyle=color;ctx.fillRect(kind==='mouse'&&target.vx>0?p.width-1-x:x,y,1,1);}}));}
 targetCanvas.style.width=target.width+'px';targetCanvas.style.height=target.height+'px';
}
function placeTarget(front){if(!snapshot)return;target.vx=0;$('#target-motion').checked=false;targetSurface=cat.support;
 const x=eye.known?eye.x:snapshot.placement.x+36,y=eye.known?eye.y:snapshot.placement.top+36;target.x=x+(front?1:-1)*(snapshot.facing||1)*110;target.y=y;target.freeY=true;positionReady=true;awareness.reset();event(`Target placed ${front?'in front':'behind'} the body; authored gaze decides visibility.`);}
function resetAwareness(){$('#response').textContent='No reaction yet.';awareness.reset();currentPerception={notices:[],states:[]};pendingWatch=null;watchUntil=0;lastReaction=-Infinity;}
function react(notice){event(`Noticed ${notice.label}${notice.moving?' moving':''}.`);const reaction=$('#reaction').value;
 if(reaction==='none')return;
 if(mode==='inspect'){$('#response').textContent='Would '+(reaction==='investigate'?'investigate':'watch')+' '+notice.label+' · pose held for controlled testing.';event('Reaction recorded; controlled pose stays unchanged.');return;}
 if(cat.motion||cat.route?.length||cat.play){event('Busy travelling; noticed target retained without interrupting the gait.');return;}
 if(sceneTime-lastReaction<5000)return;lastReaction=sceneTime;
 cat.facing=notice.x>snapshot.placement.x+12*cat.scale?1:-1;
 const requested=cat.requestAction('glance')||cat.requestAction('look');if(!requested)return;
 watchUntil=sceneTime+1200;pendingWatch=reaction==='investigate'?{...notice,surfaceId:targetSurface?.id}:null;
 $('#response').textContent='Watching '+notice.label+' · authored glance / look.';event('Watch reaction: orient and glance.');
}
function drawOverlay(){if(!$('#overlay').checked){overlay.replaceChildren();return;}
 const NS='http://www.w3.org/2000/svg',fragment=document.createDocumentFragment();const add=(tag,attrs)=>{const el=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);fragment.append(el);return el;};
 if(snapshot){const x=eye.known?eye.x:snapshot.placement.x+36,y=eye.known?eye.y:snapshot.placement.top+36;
  if(eye.canSee){const a=Math.atan2(eye.dy,eye.dx),h=eye.fov*Math.PI/360,r=eye.range;
   if(eye.fov===360)add('circle',{cx:x,cy:y,r,fill:'#e8c35812',stroke:'#d2af4a','stroke-dasharray':'4 4'});
   else{const x1=x+Math.cos(a-h)*r,y1=y+Math.sin(a-h)*r,x2=x+Math.cos(a+h)*r,y2=y+Math.sin(a+h)*r;add('path',{d:`M${x},${y} L${x1},${y1} A${r},${r} 0 ${eye.fov>180?1:0} 1 ${x2},${y2} Z`,fill:'#e8c35818',stroke:'#d2af4a'});}
  }else{add('circle',{cx:x,cy:y,r:10,fill:'none',stroke:eye.known?'#c384ee':'#99a6af','stroke-width':2});if(eye.known)add('path',{d:`M${x-7},${y-7}l14,14m0,-14l-14,14`,stroke:'#c384ee','stroke-width':2});}
  add('circle',{cx:x,cy:y,r:3,fill:eye.canSee?'#f9d46d':eye.known?'#c384ee':'#99a6af'});
 }
 const state=currentPerception.states[0];add('rect',{x:target.x-target.width/2-5,y:target.y-target.height/2-5,width:target.width+10,height:target.height+10,rx:6,fill:'none',stroke:state?.aware?'#8bd9aa':state?.visible?'#e8c358':'#768c9c','stroke-dasharray':state?.aware?'':'3 3'});overlay.replaceChildren(fragment);
}
function updateUI(){const state=currentPerception.states[0];$('#observer-state').textContent=snapshot?`${snapshot.sequenceName||snapshot.sequenceId||'Unmapped frame'} / ${cat.support?.label||'no support'} / frame ${(snapshot.frame??0)+1} / ${eye.known?(eye.canSee?eye.fov+' degrees / '+(snapshot.facing<0?'mirrored':'right-facing'):'Cannot see'):snapshot.unknownReason}`:'Waiting for observer';
 $('#target-state').textContent=$('#perception').checked?`${target.label}: ${state?.status||'waiting'}${state?.moving?' · moving':''}`:'Perception disabled · baseline';
 const m=metrics.summary(),card=(label,value,unit)=>`<div><strong>${value}${unit}</strong><small>${label}</small></div>`;$('#metrics').innerHTML=card('Browser FPS / '+(document.hasFocus()?'focused':'window unfocused'),m.fps.toFixed(1),'')+card('Frame interval · p95',m.frame.p95.toFixed(1),' ms')+card('Controller · mean / p95',m.controller.mean.toFixed(2)+' / '+m.controller.p95.toFixed(2),' ms')+card('Perception check · mean / p95',m.perception.mean.toFixed(3)+' / '+m.perception.p95.toFixed(3),' ms')+card('Overlay / target · mean',m.overlay.mean.toFixed(2),' ms')+card(m.samples+' foreground samples · >33 ms',m.over33,'');
 $('#events').replaceChildren(...events.slice(0,25).map(e=>{const li=document.createElement('li');li.textContent=(e.at/1000).toFixed(1)+'s · '+e.message;return li;}));
}
function frame(t){requestAnimationFrame(frame);const dt=lastAt===null?0:t-lastAt;lastAt=t;
 if(document.hidden)return;
 const advance=Math.min(100,dt); // No catch-up jumps after scheduler stalls.
 if(!paused)sceneTime+=advance;
 if(resizePending){resizePending=false;viewport={width:innerWidth,height:innerHeight};const r=$('#world').getBoundingClientRect();if(worldRect&&positionReady&&!target.dragging){target.x+=r.left-worldRect.left;target.y+=r.top-worldRect.top;if(pendingWatch){pendingWatch.x+=r.left-worldRect.left;pendingWatch.y+=r.top-worldRect.top;}}worldRect={left:r.left,top:r.top};cat.invalidate();cat.measure();targetSurface=cat.surfaces?.find(s=>s.id===targetSurface?.id)||cat.support;}
 if(!snapshot)return;
 if(!positionReady){placeTarget(true);drawTarget();}
 if(!paused&&!target.dragging){const repeat=$('#target-motion').checked;if(repeat&&!target.vx)target.vx=65;if(target.vx){target.x+=target.vx*advance/1000;const left=targetSurface?.left??20,right=targetSurface?.right??viewport.width-20;
   if(target.x<left||target.x>right){target.x=Math.max(left,Math.min(right,target.x));target.vx=repeat?-target.vx:0;}if(!target.freeY&&targetSurface)target.y=targetSurface.top-target.height/2;}}
 target.moving=!paused&&(!!target.vx||!!lastTarget&&Math.hypot(target.x-lastTarget.x,target.y-lastTarget.y)>1);lastTarget={x:target.x,y:target.y};
 let perceptionMs;
 if(!paused&&$('#perception').checked&&sceneTime-lastPerception>=100){lastPerception=sceneTime;const start=performance.now();currentPerception=awareness.update(eye,[target],sceneTime);perceptionMs=performance.now()-start;for(const notice of currentPerception.notices)react(notice);}
 if(pendingWatch&&sceneTime>=watchUntil&&!paused){const watched=pendingWatch;pendingWatch=null;const state=currentPerception.states.find(s=>s.id===watched.id);if(mode==='explore'&&state?.aware&&!cat.motion&&!cat.route?.length&&watched.surfaceId===cat.support?.id){cat.requestVisit(cat.support.id+'::click','interested',{id:'lab-target',x:Math.max(cat.support.min,Math.min(cat.support.max,watched.x-12*cat.scale)),weight:1});$('#response').textContent='Investigating the last noticed position on this surface.';event('Investigate: normal path and paw-placement gait; no teleport.');}else event('Investigation skipped: busy, forgotten or on another surface.');}
 const visualAt=performance.now();if(mode==='inspect'){if(!paused)cat.updateMoodState(advance,['sequence-loaf','proposal-behaviour-curl-sleep'].includes($('#sequence').value));cat.renderMoodDebug(t);}drawTarget();targetCanvas.style.left=(target.x-target.width/2)+'px';targetCanvas.style.top=(target.y-target.height/2)+'px';drawOverlay();const overlayMs=performance.now()-visualAt;
 if(t-lastUI>=250){const m=cat.ensureMood().view();$('#mood-values').textContent=`${m.label} · P ${m.values.playfulness.toFixed(2)} S ${m.values.sleepiness.toFixed(2)} A ${m.values.alertness.toFixed(2)} · ${m.held?'held':'drifting'} · seed ${m.seed} · ${m.lastEvent}`;for(const key of ['playfulness','sleepiness','alertness'])$('#mood-'+key).value=m.values[key];}
 if(!paused&&dt>0)metrics.add({frame:dt,controller:controllerMs,perception:perceptionMs,overlay:overlayMs});
 if(t-lastUI>=250){lastUI=t;updateUI();}
}
$('#mode').onchange=()=>{mode=$('#mode').value;resetAwareness();cat.cancelPlay();cat.motion=null;cat.route=[];cat.idle=null;cat.goal=null;cat.command=null;cat.paused=paused;cat.deadline=0;sequenceStart=sceneTime;$('#sequence').disabled=mode==='explore';$('#animate').disabled=mode==='explore';event('Mode: '+mode);};
$('#sequence').onchange=()=>{currentFrame=0;sequenceStart=sceneTime;resetAwareness();};
for(const [id,delta]of [['previous',-1],['next',1]])$('#'+id).onclick=()=>{$('#animate').checked=false;const p=projects.get($('#sequence').value);currentFrame=(currentFrame+delta+p.frames.length)%p.frames.length;resetAwareness();};
$('#animate').onchange=()=>{sequenceStart=sceneTime;};$('#facing').onchange=()=>{cat.facing=Number($('#facing').value);resetAwareness();};
$('#ahead').onclick=()=>placeTarget(true);$('#behind').onclick=()=>placeTarget(false);
$('#mood-glow').onchange=()=>{cat.config.debug_mood=$('#mood-glow').checked;cat.moodDebugAt=0;cat.renderMoodDebug(performance.now());};
for(const key of ['playfulness','sleepiness','alertness'])$('#mood-'+key).oninput=()=>{cat.ensureMood().set(key,Number($('#mood-'+key).value));cat.moodDebugAt=0;};
$('#mood-drift').onclick=()=>{cat.ensureMood().held=false;};$('#mood-reset').onclick=()=>cat.ensureMood().reset();
$('#landing-cue').onclick=()=>{if(paused){event('Resume before injecting a landing cue.');return;}if(mode==='inspect'){$('#mode').value='explore';$('#mode').onchange();cat.deadline=performance.now()+10000;}const x=cat.x+(12+cat.facing*18)*cat.scale;cat.receiveLanding({id:'lab-landing-'+sceneTime,kind:'Nearby high landing',x,y:cat.support.top,intensity:.8},performance.now(),true);$('#response').textContent='Landing cue: '+cat.getAttribute('data-landing-response');event($('#response').textContent);};
$('#startle-target').onclick=()=>{if(paused){event('Resume the scene before testing a startle.');return;}if(mode==='inspect'){$('#mode').value='explore';$('#mode').onchange();cat.deadline=performance.now()+10000;}pendingWatch=null;const accepted=cat.requestStartle({x:target.x,y:target.y});$('#response').textContent=accepted?'Startled '+cat.getAttribute('data-startle-direction')+' away from target.':'Startle skipped: busy, cooling down or no safe landing away.';event($('#response').textContent);};
$('#target-kind').onchange=()=>{target.label={ball:'Ball',mouse:'Mouse toy',cat:'Second cat'}[$('#target-kind').value];targetCanvas.width=targetCanvas.height=96;targetPaint='';resetAwareness();};
$('#roll').onclick=()=>{if(!snapshot)return;targetSurface=cat.support;target.x=targetSurface.left+target.width;target.y=targetSurface.top-target.height/2;target.freeY=false;target.vx=95;positionReady=true;resetAwareness();event('Target rolls independently across the current surface.');};
$('#target-motion').onchange=()=>{target.vx=$('#target-motion').checked?65:0;};
$('#range').oninput=()=>{$('#range-value').textContent=$('#range').value+' px';capture();};
$('#clear-memory').onclick=()=>{resetAwareness();event('Awareness cleared.');};$('#perception').onchange=()=>{resetAwareness();event('Perception '+($('#perception').checked?'enabled':'disabled'));};
$('#reload-assets').onclick=()=>loadAssets().then(resetAwareness).catch(e=>$('#assets').textContent=e.message);
$('#reset-metrics').onclick=()=>metrics.reset();$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'Resume scene':'Pause scene';};
$('#place').onclick=()=>{placing=!placing;$('#instruction').textContent=placing?'Click a shelf / floor to place the observer.':'Drag the target, or choose In front / Behind.';$('#instruction').classList.toggle('place',placing);};
$('#world').addEventListener('click',e=>{if(!placing||e.target===targetCanvas)return;placing=false;pin=chooseSurface(e.clientX,e.clientY);pinFraction=Math.max(.1,Math.min(.9,(e.clientX-pin.left)/(pin.right-pin.left)));cat.cancelPlay();cat.motion=null;cat.route=[];cat.idle=null;cat.support=pin;cat.x=Math.max(pin.min,Math.min(pin.max,e.clientX-12*cat.scale));cat.y=pin.top;cat.deadline=performance.now()+10000;cat.goal=null;cat.command=null;resetAwareness();$('#instruction').textContent='Observer placed · drag the target to test awareness.';event('Observer placed explicitly on '+pin.label);},true);
targetCanvas.onpointerdown=e=>{e.preventDefault();target.dragging=true;target.vx=0;$('#target-motion').checked=false;targetCanvas.setPointerCapture(e.pointerId);};
targetCanvas.onpointermove=e=>{if(!target.dragging)return;target.x=Math.max(10,Math.min(innerWidth-10,e.clientX));target.y=Math.max(80,Math.min(innerHeight-10,e.clientY));target.freeY=true;targetSurface=chooseSurface(target.x,target.y);};
targetCanvas.onpointerup=targetCanvas.onpointercancel=()=>target.dragging=false;
targetCanvas.onkeydown=e=>{const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(d){e.preventDefault();target.x+=d[0];target.y+=d[1];target.vx=0;target.freeY=true;}};
for(const name of ['resize','scroll'])window.addEventListener(name,()=>{resizePending=true;},true);
document.addEventListener('visibilitychange',()=>{lastAt=null;event(document.hidden?'Hidden: scene clock suspended.':'Visible: scene resumed.');});
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({at:new Date().toISOString(),mode,perceptionEnabled:$('#perception').checked,overlayEnabled:$('#overlay').checked,range:Number($('#range').value),metrics:metrics.summary(),frame:snapshot&&{...snapshot,rows:undefined},targets:currentPerception.states,events,assets:assets.projects.map(p=>({projectId:p.projectId,savedAt:p.savedAt,hash:p.hash}))},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cat-gaze-lab-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
requestAnimationFrame(frame);
