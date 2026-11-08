// Home surfaces and mouth affordances; optional hooks preserve legacy runtime loading.
(()=>{const rowKey=rows=>{let h=2166136261;for(const row of rows)for(const v of row)h=Math.imul(h^v.charCodeAt(0),16777619)>>>0;return h.toString(36);};
const trackCheck=(ok,message)=>{if(!ok)throw Error(message);};
function validateAnimationTracks(project){
 const a=project.animationTracks;if(a===undefined)return;trackCheck(a?.version===1&&Array.isArray(a.tracks)&&a.tracks.length>=1&&a.tracks.length<=6,'Animation tracks need version 1 and 1–6 tracks.');const ids=new Set(),frames=new Map(project.frames.map(f=>[f.id,f])),cells=new Set();
 trackCheck(typeof a.driver==='string'&&a.tracks.some(t=>t.id===a.driver),'Choose one animation/contact driver.');
 for(const t of a.tracks){trackCheck(typeof t.id==='string'&&t.id.length<=100&&!ids.has(t.id),'Track IDs must be unique.');ids.add(t.id);trackCheck(typeof t.name==='string'&&t.name.trim()&&t.name.length<=80,'Name each track (up to 80 characters).');
  if(t.id!==a.driver){trackCheck(Array.isArray(t.mask)&&t.mask.length>0&&t.mask.length<=576&&new Set(t.mask).size===t.mask.length&&t.mask.every(c=>Number.isInteger(c)&&c>=0&&c<576),'Track mask must contain unique cells inside the grid.');for(const c of t.mask){trackCheck(!cells.has(c),'Independent track masks cannot overlap.');cells.add(c);trackCheck(!project.frames.some(f=>['R','F'].includes(f.rows[Math.floor(c/24)][c%24])),'Support and paw markers belong to the contact driver.');}
   trackCheck(Array.isArray(t.frameIds)&&t.frameIds.length>0&&t.frameIds.length<=96&&new Set(t.frameIds).size===t.frameIds.length&&t.frameIds.every(id=>frames.has(id)),'Track references a missing/repeated frame; remove its membership before deleting that frame.');
   if(t.holds)trackCheck(Array.isArray(t.holds)&&t.holds.length===t.frameIds.length&&t.holds.every(v=>Number.isFinite(v)&&v>=50&&v<=5000),'Track holds must match its frames and be 50–5000 ms.');
   for(const k of ['rateMin','rateMax'])if(t[k]!==undefined)trackCheck(Number.isFinite(t[k])&&t[k]>=.5&&t[k]<=2,'Track rates must be 0.5–2.');trackCheck((t.rateMin??1)<=(t.rateMax??1),'Track rate range is reversed.');
  }
  if(t.events){trackCheck(Array.isArray(t.events)&&t.events.length<=32,'Keep at most 32 authored stroke events.');for(const e of t.events){const f=frames.get(e.frameId);trackCheck(t.id===a.driver&&f&&typeof e.name==='string'&&e.name.length<=80&&Number.isInteger(e.x)&&Number.isInteger(e.y)&&e.x>=0&&e.x<24&&e.y>=0&&e.y<24&&f.rows[e.y][e.x]==='F','Stroke events must identify an authored driver forepaw cell.');}}
 }
 const gazeOwner=a.gazeOwner||a.driver;trackCheck(ids.has(gazeOwner),'Gaze owner must be a track.');for(const t of a.tracks)if(t.id!==a.driver&&t.id!==gazeOwner)trackCheck(!project.frames.some(f=>f.gaze&&t.mask.includes(f.gaze.y*24+f.gaze.x)),'A track covering gaze origins must be declared the gaze owner.');
}
function createAnimationTrack(project,{name='Tail',mask,frameIds,actor='human',id='track-'+Date.now().toString(36),gazeOwner=false}){
 const selected=project.frames.filter(f=>frameIds.includes(f.id));trackCheck(selected.length===frameIds.length&&selected.length>0,'Select source frames for the track.');trackCheck(!selected.some(f=>f.locked),'Unlock the selected keyframes before adding a track.');
 const next=JSON.parse(JSON.stringify(project.animationTracks||{version:1,driver:'body',tracks:[{id:'body',name:'Body / contact driver'}]}));next.tracks.push({id,name,mask:[...mask],frameIds:[...frameIds],rateMin:.85,rateMax:1.15,source:{actor,kind:'selection-track'}});if(gazeOwner)next.gazeOwner=id;const copy={...project,animationTracks:next};validateAnimationTracks(copy);project.animationTracks=next;return next.tracks.at(-1);
}
function compileAnimationTracks(project){
 validateAnimationTracks(project);if(!project.animationTracks)return null;const byId=new Map(project.frames.map((f,i)=>[f.id,i]));return{frames:project.frames,definition:project.animationTracks,tracks:project.animationTracks.tracks.filter(t=>t.id!==project.animationTracks.driver).map(t=>({...t,indices:t.frameIds.map(id=>byId.get(id)),holds:t.holds||t.frameIds.map(id=>project.frames[byId.get(id)].durationMs)})),cache:new Map()};
}
const trackHash=value=>{let n=2166136261;for(const v of String(value))n=Math.imul(n^v.charCodeAt(0),16777619)>>>0;return n;};
function sampleAnimationTracks(compiled,frameIndex,elapsed,{seed=0,muted=[],solo=null}={}){
 const f=compiled.frames[frameIndex];if((f.role||'cycle')!=='cycle'||!compiled.tracks.length)return{rows:f.rows,origin:f.origin,sourceRows:f.rows,gaze:f.gaze,sourceIndex:frameIndex,trackFrames:{}};
 const phases=compiled.tracks.map(t=>{const hash=trackHash(seed+':'+t.id),rate=(t.rateMin??1)+((hash>>>8)%1000)/999*((t.rateMax??1)-(t.rateMin??1)),total=t.holds.reduce((a,b)=>a+b,0);let ms=((Math.max(0,elapsed)*rate+hash%total)%total),i=0;while(i<t.holds.length-1&&ms>=t.holds[i])ms-=t.holds[i++];return muted.includes(t.id)||solo&&solo!==t.id?-1:t.indices[i];}),key=frameIndex+':'+phases.join(',')+':'+(solo||'');let result=compiled.cache.get(key);if(result)return result;
 const rows=(solo&&solo!==compiled.definition.driver?Array(24).fill('.'.repeat(24)):f.rows).map(r=>[...r]),origins=new Set([f.origin]),trackFrames={};let gaze=f.gaze;compiled.tracks.forEach((t,i)=>{if(phases[i]<0)return;const source=compiled.frames[phases[i]];origins.add(source.origin);trackFrames[t.id]=phases[i];if(t.id===compiled.definition.gazeOwner)gaze=source.gaze;for(const cell of t.mask)rows[Math.floor(cell/24)][cell%24]=source.rows[Math.floor(cell/24)][cell%24];});
 result={rows:rows.map(r=>r.join('')),origin:origins.has('unknown')?'unknown':origins.size===1?[...origins][0]:'mixed',sourceRows:f.rows,gaze,sourceIndex:frameIndex,trackFrames};compiled.cache.set(key,result);if(compiled.cache.size>128)compiled.cache.delete(compiled.cache.keys().next().value);return result;
}

const catCompiledTracks=new WeakMap(),catTrackMetadata=new WeakMap();
window.pixelCatTrackRuntimeV1={
 definition(clip){const d=clip.animationTracks,t=d?.tracks.find(t=>t.id==='tail');if(clip.sequenceId!=='proposal-scratching-post-tracks'||t?.mask.length!==49||!t.mask.every(c=>c%24>=2&&c%24<=8&&Math.floor(c/24)>=7&&Math.floor(c/24)<=13))return d;
  return {...d,tracks:d.tracks.map(v=>v===t?{...v,mask:[...v.mask,...Array.from({length:7},(_,x)=>6*24+x+2)]}:v)};
 },
 sample(clip,frame,elapsed,config){if(clip.alertParts){const result=window.pixelCatAlertV1.sample(clip,frame,elapsed,config);catTrackMetadata.set(result.rows,result);return result;}if(!clip.animationTracks)return null;let compiled=catCompiledTracks.get(clip);if(!compiled){const frames=clip.frames.map((rows,i)=>({id:clip.frameIds[i],rows,origin:clip.origins[i],durationMs:clip.durations[i],role:clip.roles[i],gaze:clip.gazes?.[i]}));compiled=compileAnimationTracks({frames,animationTracks:this.definition(clip)});catCompiledTracks.set(clip,compiled);}
  const result=sampleAnimationTracks(compiled,frame,elapsed,{seed:config.track_seed??config.cat_id??config.name??0});if(result.rows!==clip.frames[frame])catTrackMetadata.set(result.rows,result);return{rows:result.rows,frame,anchor:clip.anchors[frame],origin:result.origin};
 },
 metadata(rows){return catTrackMetadata.get(rows);},
 report(clip){const c=catCompiledTracks.get(clip);return c?{cachedCombinations:c.cache.size,tracks:c.tracks.map(t=>t.id)}:null;}
};

window.pixelCatPolishV1={
 scratchCycleMs:75,
 colours:['#263b49','#bb783d','#7761a6','#447c77','#b76473','#527ca6','#797443','#99563c','#637985','#824c7e','#45856e','#b57840'],
 colour(random=Math.random){return this.colours[Math.min(this.colours.length-1,Math.floor(random()*this.colours.length))];},
 walkTimings(cells,config,urgency,speed,headDivisor){
  const name=urgency==='prompted'?'prompt':urgency==='interested'?'poi':'amble',override=config.motion_profiles?.[name]||{},prompt=urgency==='prompted';
  const numeric=(key,fallback)=>Number.isFinite(Number(override[key]))?Number(override[key]):fallback;
  const profile={start:Math.max(.2,numeric('start',prompt?.45:1)),cruise:Math.max(.2,numeric('cruise',1)),finish:Math.max(.2,numeric('finish',prompt?.45:1)),accelerate:Math.max(0,Math.min(.9,numeric('accelerate_until',prompt?.14:0))),brake:Math.max(0,Math.min(1,numeric('brake_from',prompt?.58:1)))};
  const bias=urgency==='interested'?Math.min(1.65,1+Math.max(0,cells/24-.75)*.22):1;let total=0;const cumulativeMs=[],headOffsets=[0];
  for(let step=0;step<cells;step++){const p=(step+.5)/cells;let multiplier=profile.cruise;if(p<profile.accelerate)multiplier=profile.start+(profile.cruise-profile.start)*p/profile.accelerate;else if(p>profile.brake)multiplier=profile.cruise+(profile.finish-profile.cruise)*(p-profile.brake)/Math.max(.01,1-profile.brake);const ms=Math.max(1000/60,1000/(speed*bias*multiplier));total+=ms;cumulativeMs.push(total);headOffsets.push(headOffsets.at(-1)+1/headDivisor(config,1000/ms));}return {cumulativeMs,headOffsets,duration:total,profile:name};
},
 sneakTimeline(cells,art,start={}){
 const result=[];let offset=0,time=0,frame=start.frame||0;
 while(offset<cells||!result.length){const variant=Math.min(2,(start.variant||0)+Math.floor(Math.floor(result.length/8)*5/Math.max(5,cells/3))),speed=[8,5,3][variant],advance=art.sneakAdvances[frame];offset=Math.min(cells,offset+advance);time+=1000*5/(8*speed);result.push({offset,frame,variant,until:time});frame=(frame+1)%8;if(result.length>2048)throw Error('Sneak distance exceeds limit.');}
 return result;
},
 names:["Alfie","Archie","Arthur","Atlas","Bagel","Bailey","Basil","Beans","Bear","Beau","Bella","Benny","Bertie","Biscuit","Blue","Bob","Bonnie","Boots","Bowie","Bruno","Buddy","Buster","Butter","Butters","Buttons","Callie","Casper","Cedar","Charlie","Chester","Chili","Chloe","Cleo","Clover","Coco","Comet","Cookie","Cooper","Cosmo","Cricket","Daisy","Darcy","Dash","Dexter","Domino","Dora","Dot","Dottie","Duke","Dusty","Echo","Eddie","Edith","Effie","Elvis","Ember","Ernie","Esme","Evie","Felix","Fern","Fig","Finn","Flora","Floyd","Frankie","Freya","Fudge","George","Gigi","Ginger","Gizmo","Goldie","Goose","Grace","Gus","Hazel","Hector","Henry","Hobbes","Holly","Honey","Hugo","Indie","Iris","Ivy","Izzy","Jack","Jasper","Jax","Jelly","Jess","Jet","Jinx","Joey","Josie","Jude","Juno","Kiki","Kit","Kiwi","Klaus","Kobe","Koda","Leo","Loki","Lola","Lottie","Louie","Luca","Lucky","Lucy","Luna","Mabel","Maisie","Mango","Maple","Marley","Marmalade","Matilda","Max","Merlin","Merry","Midge","Midnight","Mika","Milo","Mimi","Minnie","Minty","Miso","Misty","Mittens","Mochi","Molly","Monty","Moose","Mouse","Muffin","Murphy","Myrtle","Nacho","Nell","Nelly","Neo","Nico","Noodle","Nori","Nova","Olive","Ollie","Opal","Oreo","Orla","Oscar","Otis","Otto","Pablo","Pancake","Panda","Parsley","Patch","Peach","Peanut","Pebble","Penny","Pepper","Percy","Pickle","Pip","Pippa","Pixel","Plum","Poppy","Porridge","Pumpkin","Queenie","Quinn","Raisin","Ralph","Raven","Remy","Rex","Riley","River","Robin","Rocket","Rocky","Roo","Rory","Rosie","Rowan","Ruby","Rufus","Rusty","Sage","Salem","Sam","Sassy","Scout"],
 name(random=Math.random){const used=new Set((window.pixelCatPrimaryV1?.current?.()||[]).map(a=>a.config.name)),pool=this.names.filter(n=>!used.has(n)),choices=pool.length?pool:this.names;return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];},
 hold(pose,clip,i,rate=1){if(pose==='loaf'&&clip.roles?.[i]==='cycle')return (i===clip.roles.indexOf('cycle')?8000:1200)*rate;return clip.durations[i]*rate*(pose==='scratch'&&clip.roles?.[i]==='cycle'?this.scratchCycleMs/180:1);},
 departureAnchor(old,art){if(old.pose!=='backRoll'||!old.anchor)return null;const clip=art.idleSequences.backRoll,offset=clip.frames[0][23].lastIndexOf('R')-clip.anchors[0][0];return [old.anchor[0]+offset,old.anchor[1]];},
 alertExit(art,old,config={},now=0){
  const clip=art.idleSequences.alertLying,rate=Math.max(80,Number(config.idle_frame_ms)||250)/250,indices=clip.roles.flatMap((r,i)=>r==='exit'?[i]:[]),current=clip.frames.indexOf(old?.rows),frames=[],holds=[];
  let remaining=indices.reduce((n,i)=>n+clip.durations[i]*rate,0);
  for(const i of indices){const hold=clip.durations[i]*rate,end=Number(old?.poseUntil)-remaining+hold;remaining-=hold;if(indices.includes(current)&&(i<current||end<=now))continue;frames.push(clip.frames[i]);holds.push(indices.includes(current)&&i===current?Math.min(hold,Math.max(0,end-now)):hold);}
  frames.holds=holds;return frames;
 },
 bridgeDuration(frames,config={}){return frames.holds?.reduce((n,h)=>n+h,0)??frames.length*Math.max(80,Number(config.idle_frame_ms)||250);},
 bridgeSample(frames,elapsed,beat){let frame=0;while(frame<frames.length-1&&elapsed>=(frames.holds?.[frame]??beat)){elapsed-=frames.holds?.[frame]??beat;frame++;}return {rows:frames[frame],frame};},
 restBridge(art,from,to,old,config,now){
  if(to==='backRoll'&&from==='loaf')return [];
  if(from!=='alertLying'||to===from)return null;
  const frames=this.alertExit(art,old,config,now),extra=to==='backRoll'?[art.idleSequences.loaf.frames[1]]:['loaf','sleep'].includes(to)?[]:[...(['sit','sithead','clean','scratch','yawn','meow','chatter'].includes(to)?art.bridges.sitToLoaf:art.bridges.walkToSit)].reverse();
  frames.push(...extra);frames.holds.push(...extra.map(()=>Math.max(80,Number(config?.idle_frame_ms)||250)));return frames;
 },
 prelude(a,m,old,art,front){if(m.kind!=='walk'||!old||!['backRoll','alertLying','loaf','sleep','sit','sithead','clean','scratch','yawn','meow','chatter','look'].includes(old.pose)||a.previewPose||a.userHeld)return;const clip=art.idleSequences[old.pose],exit=old.pose==='alertLying'?this.alertExit(art,old,a.config,m.start):clip?.frames.filter((_,i)=>clip.roles?.[i]==='exit')||[],frames=(exit.length?exit:['loaf','sleep'].includes(old.pose)?[...art.bridges.sitToLoaf].reverse():[]).concat([...art.bridges.walkToSit].reverse());if(!frames.length)return;const anchors=old.pose==='backRoll'?exit.map((rows,i)=>this.departureAnchor({pose:old.pose,anchor:clip.anchors[clip.roles.flatMap((r,j)=>r==='exit'?[j]:[])[i]]},art)).concat(art.bridges.walkToSit.map(()=>null)):null,beat=Math.max(60,Math.min(120,Number(a.config.idle_frame_ms)||100));
  if(exit.holds)frames.holds=exit.holds.concat(art.bridges.walkToSit.map(()=>beat));
  const total=frames.holds?.reduce((n,h)=>n+h,0)??frames.length*beat;m.departure={frames,anchors,beat,total,bearing:m.fromX+front*a.scale};m.start+=total;
 },
 departure(a,t,contact,idleContact){const m=a.motion,d=m?.departure;if(!d)return false;if(t>=m.start){delete m.departure;return false;}const frame=this.bridgeSample(d.frames,Math.max(0,t-(m.start-d.total)),d.beat).frame,rows=d.frames[frame],p=contact(rows,a.facing,d.anchors?.[frame]||idleContact(rows));a.draw(rows);a.svg.style.transform=`translate(${d.bearing-p[0]*a.scale}px,${m.fromY-(p[1]+1)*a.scale}px)`;const drawn=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(a.svg.style.transform);window.pixelCatBedEntryV1?.mask?.(a,rows);if(a.carriedToy&&drawn)window.pixelCatMouthV1?.frame(a,rows,drawn,t,a.carryArt);a.setAttribute('data-pose','leaving-loaf');a.setAttribute('data-frame','loaf-departure-'+frame);a.status('Getting up');return true;},
 travelEnd(a,m){window.pixelCatExertionV1?.complete(a,m);if(m.kind==='jump'||m.shallow)a.shallowChoice=null;if(m.sneakTimeline&&a.idle){const last=m.sneakTimeline.at(-1);a.sneakState={frame:(last.frame+1)%8,variant:last.variant,direction:m.direction};a.idle.sneakExit=true;}else a.sneakState=null;},
 cancelDeparture(a){if(a.motion?.departure){a.motion=null;a.idle=null;} }
};

window.pixelCatBehaviourV1={
 profiles:{kitten:{cadence:{locomotion:1.35},bias:{energetic:1.8,play:1.7,startle:1.9,rest:.5,travel:1.35},playful:{energetic:.8,play:.4},restScale:.5,pace:{target:26,spread:.65}},adult:{},senior:{}},
 intentTags:{explore:['travel'],local:['travel'],leave:['travel'],stay:['rest'],settle:['rest'],chase:['play'],run:['play'],ambush:['play'],pat:['play'],catch:['play'],reverse:['play'],counter:['play'],hop:['startle']},
 choiceWeight(a,kind){return this.weight(a,{behaviourPolicy:{tags:this.intentTags[kind]||[]}});},
 stage(a={}){const s=a.lifeStage||a.config?.life_stage||a.life_stage;return ['kitten','adult','senior'].includes(s)?s:'adult';},
 allowed(a,clip){return !clip?.behaviourPolicy?.lifeStages||clip.behaviourPolicy.lifeStages.includes(this.stage(a));},
 weight(a,clip){if(!this.allowed(a,clip))return 0;const p=this.profiles[this.stage(a)],m=clip?.behaviourPolicy||{},tags=new Set([m.category,...m.tags||[]]);let w=1;for(const tag of tags)w*=(p.bias?.[tag]??1)+(p.playful?.[tag]||0)*Math.max(0,Math.min(1,a.mood?.values?.playfulness||0));return Math.max(.1,Math.min(4,w));},
 protected(a){return a.previewPose||a.play||a.toyHunt||a.command||a.goal||a.userHeld||a.social?.episode&&a.social.episode.kind!=='company';},
 restWindow(a,ms){const factor=this.profiles[this.stage(a)].restScale;if(!factor||this.protected(a))return ms;const sleepy=Math.max(0,Math.min(1,a.mood?.values?.sleepiness||0)),effort=window.pixelCatExertionV1?.strength(a)||0;return Math.max(Math.min(1200,ms),ms*Math.min(1,factor*(1+.6*sleepy+.6*effort)));},
 restBout(a,pose,clip,ms){if(!clip?.behaviourPolicy?.tags?.includes('rest'))return ms;const shortened=this.restWindow(a,ms);if(shortened===ms)return ms;const rate=Math.max(80,Number(a.config?.idle_frame_ms)||250)/250,minimum=clip.frames.reduce((n,_,i)=>n+(window.pixelCatPolishV1?.hold(pose,clip,i,rate)??clip.durations[i]*rate),0);return Math.min(ms,Math.max(shortened,minimum));},
 preferredPace(a){const p=this.profiles[this.stage(a)].pace;if(!p)return null;const v=a.mood?.values||{},effort=window.pixelCatExertionV1?.strength(a)||0;return {target:p.target*(.85+.5*(v.playfulness||0)-.35*(v.sleepiness||0))*(1-.35*effort),spread:p.spread};},
 paceWeight(speed,preference,prior=1){return prior*Math.max(.06,Math.exp(-Math.pow(Math.log(speed/preference.target)/preference.spread,2)));},
 movement(a,m,policy){if(m.cells===0){m.duration=1000/60;return;}const p=this.profiles[this.stage(a)],category=policy?.category;let factor=p.cadence?.[category]||1;if(factor===1)return;
  const beats=m.gallopTimeline||m.sneakTimeline;let min=Infinity,prior=0;for(const beat of beats||[]){min=Math.min(min,beat.until-prior);prior=beat.until;}if(!beats&&m.cumulativeMs){prior=0;for(const until of m.cumulativeMs){min=Math.min(min,until-prior);prior=until;}}else if(!beats)min=m.stepMs;
  factor=Math.max(1,Math.min(factor,min/(1000/(m.gallopTimeline?30:60))));m.cadenceFactor=factor;m.duration/=factor;if(Number.isFinite(m.stepMs))m.stepMs/=factor;if(m.cumulativeMs)m.cumulativeMs=m.cumulativeMs.map(t=>t/factor);if(beats)for(const beat of beats)beat.until/=factor;
 }
};

const catGeometryFrames=new WeakMap(),catRouteGraphs=new WeakMap();
window.pixelCatSurfaceWorldV1={
 frame(root){const settled=window.pixelCatLayoutV1?.geometry(root);if(settled)return settled;if(!root||typeof requestAnimationFrame!=='function')return null;let f=catGeometryFrames.get(root);if(!f){f={rects:new Map()};catGeometryFrames.set(root,f);requestAnimationFrame(()=>{if(catGeometryFrames.get(root)===f)catGeometryFrames.delete(root);});}return f;},
 cards(root,scan){const f=this.frame(root);if(!f)return scan();return f.cards??=scan();},
 rect(root,el){const f=this.frame(root);if(!f)return el.getBoundingClientRect();if(!f.rects.has(el))f.rects.set(el,el.getBoundingClientRect());return f.rects.get(el);},
 destinations(a,select,force=false){
  select.onfocus=()=>this.destinations(a,select,true);const selected=select.value,label=select.options?.[select.selectedIndex]?.textContent;
  if(!force&&a.surfaces.length>128&&a.shadowRoot?.activeElement!==select){select.replaceChildren();const option=document.createElement('option');option.value=selected;option.textContent=label||'Choose destination · '+a.surfaces.length+' supports';select.append(option);return;}
  select.replaceChildren();for(const surface of a.surfaces)for(const point of [null,...surface.roamPoints||[],...surface.propPoints||[],...surface.inspectionPoints||[]]){const option=document.createElement('option');option.value=surface.id+(point?'::'+point.id:'');option.textContent=surface.label+(point?' · '+(point.label||point.id):'');select.append(option);}if([...select.options].some(o=>o.value===selected))select.value=selected;
 },
 invalidate(a){const g=catRouteGraphs.get(a);if(g)g.checked=false;},
 links(a){if(a.support)this.route(a,a.support,a.support);const g=catRouteGraphs.get(a);return g?[...g.edges].flatMap(([id,edges])=>edges.map(e=>({a:g.byId.get(id),b:g.byId.get(e.id)}))):[];},
 route(a,target,origin){
  if(!target||!origin)return null;const surfaces=a.surfaces||[];let g=catRouteGraphs.get(a);const key=g?.checked&&g.surfaces===surfaces?g.key:surfaces.map(s=>[s.id,s.min,s.max,s.top].join(',')).join('|')+';'+a.scale+';'+(a.worldRect?.top||0)+';'+JSON.stringify(a.config||{});
  if(!g||g.key!==key){g={key,surfaces,byId:new Map(surfaces.map(s=>[s.id,s])),sorted:[...surfaces].sort((a,b)=>a.top-b.top),edges:new Map(),trees:new Map(),checks:0,queries:0};catRouteGraphs.set(a,g);}
  if(g.surfaces!==surfaces){g.surfaces=surfaces;g.byId=new Map(surfaces.map(s=>[s.id,s]));g.sorted=[...surfaces].sort((a,b)=>a.top-b.top);}
  if(!g.checked&&typeof requestAnimationFrame==='function'){g.checked=true;requestAnimationFrame(()=>{g.checked=false;});}
  const start=g.byId.get(origin.id);if(!start||!g.byId.has(target.id))return null;g.queries++;
  const treeKey=start.id+';'+!!target.home;let tree=g.trees.get(treeKey);
  if(!tree){
   const queue=[],costs=new Map([[start.id,0]]),parents=new Map(),done=new Set();let serial=0;
   const less=(a,b)=>a.cost<b.cost||a.cost===b.cost&&a.serial<b.serial;
   const push=item=>{item.serial=serial++;queue.push(item);let i=queue.length-1;while(i){const p=(i-1)>>1;if(!less(queue[i],queue[p]))break;[queue[i],queue[p]]=[queue[p],queue[i]];i=p;}};
   const pop=()=>{const first=queue[0],last=queue.pop();if(queue.length){queue[0]=last;let i=0;for(;;){let j=i,l=i*2+1,r=l+1;if(l<queue.length&&less(queue[l],queue[j]))j=l;if(r<queue.length&&less(queue[r],queue[j]))j=r;if(j===i)break;[queue[i],queue[j]]=[queue[j],queue[i]];i=j;}}return first;};
   push({id:start.id,cost:0});
   while(queue.length){const item=pop(),last=g.byId.get(item.id);if(done.has(last.id))continue;done.add(last.id);let edges=g.edges.get(last.id);
    if(!edges){edges=[];const lo=last.top-90*a.scale,hi=last.top+90*a.scale;let l=0,r=g.sorted.length;while(l<r){const mid=(l+r)>>1;if(g.sorted[mid].top<lo)l=mid+1;else r=mid;}
     for(let i=l;i<g.sorted.length&&g.sorted[i].top<=hi;i++){const next=g.sorted[i],gap=Math.max(0,last.min-next.max,next.min-last.max);if(next===last||gap>150*a.scale)continue;g.checks++;if(a.reachable(last,next))edges.push({id:next.id,cost:Math.hypot(gap,last.top-next.top)+8*a.scale});}g.edges.set(last.id,edges);}
    for(const edge of edges){const next=g.byId.get(edge.id),cost=item.cost+edge.cost+(next.home&&!target.home?24*a.scale:0);if(!done.has(next.id)&&cost<(costs.get(next.id)??Infinity)){costs.set(next.id,cost);parents.set(next.id,last.id);push({id:next.id,cost});}}
   }tree={costs,parents};g.trees.set(treeKey,tree);
  }
  a.surfaceRouteStats={supports:surfaces.length,edgeChecks:g.checks,queries:g.queries,trees:g.trees.size};
  if(!tree.costs.has(target.id))return null;const path=[];for(let id=target.id;id!==start.id;id=tree.parents.get(id)){if(!id)return null;path.push(g.byId.get(id));}return path.reverse();
 }
};

window.pixelCatCardAttentionV1=function(event,{cardOwnerFor,clickDestination,attentionWinner,CAT_OWNERS}) {
    if(this.userHeld||this.config.click_attention===false||!this.root||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||this.blocked())return;
    const path=event.composedPath();if(!path.includes(this.root)||path.includes(this)||path.some(el=>el.dataset?.pixelCatOverlay!==undefined||el.dataset?.catPost!==undefined||el.localName==='pixel-cat-home'||el.matches?.('input,textarea,select,[contenteditable="true"]')))return;
    const card=path.find(el=>el.localName==='ha-card'||el.hasAttribute?.('data-cat-surface'));if(!card)return;const owner=cardOwnerFor(card),surfaces=this.surfaces.filter(s=>!s.home&&cardOwnerFor(s.el)===owner);
    const destination=clickDestination(surfaces,event.clientX,event.clientY,this.scale,s=>!!this.pathTo(s)&&!!this.pathTo(this.home,s));if(!destination)return;
    const peers=[...CAT_OWNERS].filter(([cat,info])=>info.root===this.root&&cat.isConnected&&!cat.blocked()&&cat.surfaces.some(s=>!s.home&&cardOwnerFor(s.el)===owner&&cat.pathTo(s)&&cat.pathTo(cat.home,s))).map(([cat])=>cat);if(peers.length&&attentionWinner(peers,event.clientX,event.clientY)!==this)return;
    this.setAttribute('data-attention-source','card-click');this.setAttribute('data-attention-target',destination.id);this.requestVisit(destination.id,'interested',destination.point);
  };

window.pixelCatHomePostsV1={
 visible(a){return a.config.show_home!==false&&(a.config.show_scratching_post??a.config.scratching_posts??true)!==false;},
 offset(a,width){const available=width/(a.worldScale||a.scale);return available>=59?Math.min(49,available-14):null;},
 render(a,art){
  const dock=a.shadowRoot?.querySelector?.('.dock'),asset=art.dashboardProps?.find(p=>p.id==='scratching_post');if(!dock||!asset||!this.visible(a))return;
  if(a.homePost?.node?.isConnected)return;
  const node=document.createElement('canvas');node.width=asset.width;node.height=asset.height;node.dataset.catPost='';node.setAttribute('aria-label','Scratching post');
  node.style.cssText=`position:absolute;bottom:0;left:${49*(a.worldScale||a.scale)}px;image-rendering:pixelated;width:${asset.width*(a.worldScale||a.scale)}px;height:${asset.height*(a.worldScale||a.scale)}px;pointer-events:none`;
  const c=node.getContext('2d');asset.pixels.forEach((r,y)=>r.forEach((v,x)=>{if(v){c.fillStyle=v;c.fillRect(x,y,1,1);}}));dock.append(node);
  a.homePost={id:'home-post-'+a.ownerKey,asset,node,scale:(a.worldScale||a.scale),homeOwner:a,claimedBy:null,cooldownUntil:0};window.pixelCatVerticalScratchV1?.bind(a.homePost,()=>[...a.decisionLayer()?.owners()||[]].map(([owner])=>owner),a.root);this.sync(a,dock.clientWidth);
 },
 sync(a,width){const p=a.homePost;if(!p)return;if(a.ownerKey)p.id='home-post-'+a.ownerKey;const offset=this.offset(a,width??(a.home?.right-a.home?.left+8));p.offset=offset;p.node.style.display=this.visible(a)&&offset!==null?'':'none';if(offset!==null)p.node.style.left=offset*(a.worldScale||a.scale)+'px';window.pixelCatDepthV1?.home(a);},
 entries(layer){const a=layer.actor,out=[];if(typeof layer.owners!=='function')return out;for(const [owner,info]of layer.owners()){
  const p=owner.homePost;if(!p||!owner.active||!owner.isConnected||info.root!==a.root||!this.visible(owner)||!owner.home||p.offset===null||p.node.isConnected===false)continue;
  const s=owner===a?owner.home:a.surfaces?.find(s=>s.bedOwner===owner&&!s.bed&&!s.foodOwner);if(!s)continue;
  out.push({prop:p,surface:s,left:owner.home.left-4+p.offset*(owner.worldScale||owner.scale)});
 }return out.concat(window.pixelCatHomeLifeV1?.beds(layer)||[]);},
 publish(layer){window.pixelCatVerticalScratchV1?.publish(layer);for(const {prop:p,surface:s,left}of this.entries(layer))layer.world.props.set(p.id,{id:p.id,kind:'scratching_post',x:left+p.asset.width*p.scale/2,y:s.top,width:p.asset.width*p.scale,height:p.asset.height*p.scale,surface:s.el,top:s.top,moving:false,at:layer.world.clock});}
};

window.pixelCatSetupV1={
 bed(a,art){return art.homeBeds?.[a.config.bed_style==='simple'?'simple':'igloo']||art.propCatalogue?.find(p=>p.id==='dd2bda18-62a3-4f52-972e-e6abe3b7df83');},
 shade(colour,factor){const hex=/^#([a-f\d]{3}|[a-f\d]{6})$/i.exec(colour||'');if(!hex)return `color-mix(in srgb, ${colour} ${factor*100}%, black)`;const value=hex[1].length===3?[...hex[1]].map(v=>v+v).join(''):hex[1];return '#'+[0,2,4].map(i=>Math.round(parseInt(value.slice(i,i+2),16)*factor).toString(16).padStart(2,'0')).join('');},
 bedColour(a,colour){
  const simple=a.config.bed_style==='simple',primary=a.config.bed_primary_color||a.config.igloo_color,secondary=a.config.bed_secondary_color,c=colour.toLowerCase();
  if(primary&&c==='#aa6627')return primary;
  if(primary&&c===(simple?'#804b19':'#744316'))return this.shade(primary,simple?.75:.68);
  if(secondary&&c===(simple?'#964252':'#19222b'))return secondary;
  if(secondary&&c==='#762837')return this.shade(secondary,.7);
  return colour;
 },
 openingPath(owner,placement,scale,art,side){
  const home=owner.home||owner.support,bed=this.bed(owner,art),node=owner.shadowRoot?.querySelector?.('[data-cat-bed]');let g=owner.bedInkGeometry;
  if(!g||g.home!==home||g.node!==node){const r=node?.getBoundingClientRect?.();g=owner.bedInkGeometry={home,node,dx:r?.height>0?r.left-home.left-(parseFloat(node.style?.translate)||0):-4+22*(owner.worldScale||owner.scale),dy:r?.height>0?r.bottom-home.top:0};}
  const left=home.left+g.dx,bottom=home.top+g.dy,bs=(owner.worldScale||owner.scale),top=(bottom-bed.height*bs-placement.top)/scale,cell=bs/scale;let path='',low=bed.width,high=0;
  bed.pixels.forEach((row,y)=>row.forEach((c,x)=>{if(c?.toLowerCase()!=='#19222b')return;low=Math.min(low,x);high=Math.max(high,x+1);path+=`M${(left+x*bs-placement.x)/scale} ${top+y*cell}h${cell}v${cell}h-${cell}z`;}));
  if(side){
   const door=c=>c?.toLowerCase()==='#19222b',fallback=side==='left'?low:high,boundary=x=>(left+x*bs-placement.x)/scale,strip=(edge,y,h)=>side==='left'?`M-100 ${y}H${edge}v${h}H-100z`:`M${edge} ${y}H100v${h}H${edge}z`;
   path+=strip(boundary(fallback),-100,top+100)+strip(boundary(fallback),top+bed.height*cell,100-top-bed.height*cell);
   bed.pixels.forEach((row,y)=>{const edge=side==='left'?row.findIndex(door):row.findLastIndex(door),x=edge<0?fallback:edge+(side==='right'?1:0);path+=strip(boundary(x),top+y*cell,cell);});
  }return path;
 },
 clearRestMask(a){if(a.svg?.style)a.svg.style.clipPath='';a.svg?.firstElementChild?.removeAttribute?.('clip-path');},
 restPlacement(a,placement,rows,art,t){
  this.clearRestMask(a);if(window.pixelCatBedEntryV1?.rest(a,placement))return placement;
  const owner=a.support?.bedOwner||a,simple=owner.config.bed_style==='simple',eligible=simple?['sit','sithead','loaf','sleep','clean','scratch','yawn','meow','chatter']:['loaf','sleep'];
  if((!a.support?.home&&!a.support?.bedOwner)||owner.config.show_home===false||!eligible.includes(a.idle?.pose))return placement;
  const bed=this.bed(owner,art),s=a.scale,bs=(owner.worldScale||owner.scale);if(!bed)return placement;
  const raised=!!a.support.bed,left=raised?a.support.left:a.support.left-4+22*bs,bottom=a.support.top+(raised?3*bs:0),center=left+bed.width*bs/2;
  if(Math.abs(a.x+12*s-center)>24*s)return placement;
  const clip=art.idleSequences?.[a.idle.pose],cycle=clip?.roles?.indexOf('cycle'),reference=clip?.frames[Math.max(0,cycle??0)]||rows;
  const ink=[];reference.forEach(row=>[...row].forEach((v,x)=>{if(v!=='.')ink.push(a.facing<0?23-x:x);}));
  if(!ink.length)return placement;
  const offset=Math.round((bed.width*bs/2-(Math.min(...ink)+Math.max(...ink)+1)*s/2)/s)*s;
  const target=raised?0:simple?3:1,key=a.idle;
  if(key.bedStart===undefined||key.bedFacing!==a.facing){key.bedStart=t;key.bedFromOffset=placement.x-left;key.bedFacing=a.facing;}
  const progress=Math.max(0,Math.min(1,(t-key.bedStart)/160)),lift=Math.round(target*progress)*bs;
  const result={x:left+Math.round((key.bedFromOffset+(offset-key.bedFromOffset)*progress)/s)*s,top:placement.top-lift};
  if(Number.isFinite(key.contactX))key.contactX+=result.x-placement.x;
  if(!simple&&a.svg?.style){const path=this.openingPath(owner,result,s,art);if(a.bedMask?.svg!==a.svg&&document.createElementNS){const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),shape=document.createElementNS(ns,'path');clip.id='cat-bed-mask-'+(this.maskId=(this.maskId||0)+1);clip.setAttribute('clipPathUnits','userSpaceOnUse');clip.append(shape);defs.append(clip);a.svg.append(defs);a.bedMask={id:clip.id,shape,svg:a.svg};}if(a.bedMask){a.bedMask.shape.setAttribute('d',path);a.svg.firstElementChild.setAttribute('clip-path',`url(#${a.bedMask.id})`);}}
  return result;
 },
 renderHome(a,art){
  window.pixelCatHomePostsV1?.render(a,art);
  const dock=a.shadowRoot?.querySelector?.('.dock');if(!dock?.style||a.homeArtReady||!art.homeBeds)return;
  const s=a.worldScale||a.scale;dock.style.height=28*s+'px';
  const bowl=art.homeProps?.bowl,bed=this.bed(a,art);
  if(!bowl||!bed)return;
  for(const [asset,selector,left,tag]of [[bowl,'.bowl',7,'catBowl'],[bed,'.mat',22,'catBed']]){
   const placeholder=dock.querySelector(selector);if(!placeholder)return;
   const canvas=document.createElement('canvas');canvas.width=asset.width;canvas.height=asset.height;canvas.dataset[tag]='';canvas.setAttribute('aria-label',asset.name||'Food bowl');
   canvas.style.cssText=`position:absolute;bottom:${tag==='catBed'&&a.config.bed_style==='simple'?-s:0}px;left:${left*s}px;image-rendering:pixelated;width:${asset.width*s}px;height:${asset.height*s}px`;
   const c=canvas.getContext('2d');asset.pixels.forEach((row,y)=>row.forEach((colour,x)=>{if(!colour)return;c.fillStyle=tag==='catBed'?this.bedColour(a,colour):colour;c.fillRect(x,y,1,1);}));placeholder.replaceWith(canvas);if(tag==='catBowl')window.pixelCatMouthV1?.bowl?.(a,canvas);
  }
  a.homeArtReady=true;
 },
 connect(a){
  if(a.config.mode!=='monitor')return false;
  a.style.display='';a.shadowRoot.innerHTML='';
  const monitor=document.createElement('pixel-cat-monitor');monitor.setConfig(a.config);monitor.hass=a._hass;a.monitorCard=monitor;a.shadowRoot.append(monitor);
  return true;
 },
 disconnect(a){window.pixelCatAlertV1?.leave(a);window.pixelCatDepthV1?.remove(a);window.pixelCatMouthV1?.disconnect?.(a);a.monitorCard?.remove();a.monitorCard=null;if(a.svg)a.svg.style.clipPath='';a.arriving=null;a.bedInside=null;a.bedEntry=null;a.previewBedPose=null;},
 arrival(a,t,art,sample,appearance,idle,contact,bearing){
  if(a.config.bed_style==='simple'){a.arrived=true;return false;}
  if(a.config.arrival!=='igloo'||a.config.show_home===false||a.arrived)return false;
  if(!a.arriving){
   if(a.motion||a.idle||a.goal||a.command||a.previewPose||!a.support?.home){a.arrived=true;return false;}
   const bed=a.shadowRoot.querySelector('[data-cat-bed]');if(!bed)return true;
   const rect=bed.getBoundingClientRect(),s=a.scale,door=Math.round((rect.left+rect.width*12/21)/s)*s;
   const from=Math.round((door-24*s)/s)*s,to=Math.round((door+6*s)/s)*s;
   if(from<a.support.min||to>a.support.max){a.arrived=true;return false;}
   a.x=from;a.facing=1;
   a.moveTo(to,a.support.top,0,'walk',a.support,t,art.sneak?.every(Boolean)?'sneak':null);
   if(!a.motion){a.arrived=true;return false;}
   if(a.motion.sneakTimeline){let time=0;for(const beat of a.motion.sneakTimeline){beat.variant=2-beat.variant;time+=1000*5/(8*[8,5,3][beat.variant]);beat.until=time;}a.motion.duration=time;}
   a.arriving={motion:a.motion,doorOffset:door-a.support.left};
  }
  const arrival=a.arriving,m=a.motion;
  if(m!==arrival.motion||a.goal||a.command||a.previewPose||a.play){a.svg.style.clipPath='';a.arriving=null;a.arrived=true;return false;}
  const frame=sample(m,t-m.start,a.scale,art.walk),rows=appearance(art,m,frame,a.config).rows;
  a.x=frame.x;a.y=m.fromY;a.draw(rows);
  a.svg.style.transform=`translate(${a.x}px,${a.y-24*a.scale}px)`;
  a.svg.style.clipPath='';window.pixelCatBedEntryV1?.mask(a,rows,a,'right');
  window.pixelCatMouthV1?.frame(a,rows,[null,String(a.x),String(a.y-24*a.scale)],t,art);a.setAttribute('data-pose','emerging');a.status('Emerging from the igloo');
  if(t>=m.start+m.duration){
   a.support=m.target;a.motion=null;a.arriving=null;a.arrived=true;this.clearRestMask(a);a.deadline=t+1800;window.pixelCatExplorationV1?.observe(a,t);
   const stand=idle(art,'stand',0,a.config),point=contact(stand.rows,a.facing,stand.anchor||bearing(stand.rows)),contactX=m.x+contact(rows,a.facing,bearing(rows))[0]*a.scale;
   a.idle={pose:'stand',contactX,support:a.support.id,start:t,poseUntil:t+1800};a.x=contactX-point[0]*a.scale;a.y=m.y;
   a.draw(stand.rows);a.svg.style.transform=`translate(${a.x}px,${m.y-(point[1]+1)*a.scale}px)`;a.setAttribute('data-pose','stand');a.status('Standing outside the igloo');
  }
  return true;
 }
};
const catLegacyPickerTypes=new Set(['stick-pet-card','pixel-pet-card','pixel-cat-monitor','pixel-cat-playground']);
const catCleanPicker=()=>{const cards=window.customCards;if(!cards)return;for(let i=cards.length-1;i>=0;i--)if(catLegacyPickerTypes.has(cards[i].type))cards.splice(i,1);};
catCleanPicker();for(const type of catLegacyPickerTypes)customElements.whenDefined?.(type)?.then(catCleanPicker);

Object.assign(window.pixelCatSetupV1,{
 surfaces(a){
  window.pixelCatHomePostsV1?.sync(a);
  a.bedSurface=null;if(a.home&&a.config.show_home!==false)a.home.bedOwner=a;
  const owners=new Set([a,...window.pixelCatMouthV1?.homes||[]]);
  for(const owner of owners){if(owner!==a&&(!owner.active||owner.root!==a.root)||owner.config.show_home===false||!owner.home)continue;
   const own=owner===a,s=(owner.worldScale||owner.scale),h=owner.home,bed=this.bed(owner,window.pixelCatRoamingExtrasV1||{});if(!bed)continue;
   let floor=h;if(!own){const el=owner.shadowRoot?.querySelector?.('.dock');if(!el?.isConnected)continue;floor={...h,id:'bed-floor-'+owner.ownerKey,el,home:false,internal:true,bedOwner:owner,label:(owner.config.name||'Cat')+' · bed floor',source:'known home bed'};a.surfaces.push(floor);}
   if(owner.config.bed_style!=='simple'){window.pixelCatHomeLifeV1?.surfaces(a,owner,floor);continue;}
   const left=h.left-4+22*s,surface={...floor,id:own?'home:bed':'guest-bed-'+owner.ownerKey,bed:true,bedOwner:owner,label:(own?'Simple bed':owner.config.name||'Cat')+' · lining',left,right:left+bed.width*s,top:h.top-3*s,source:'authored bed lining'};
   a.surfaces.push(surface);if(own)a.bedSurface=surface;window.pixelCatHomeLifeV1?.surfaces(a,owner,floor);
  }
 },
 restSupport(a,t=0){
  if(a.bedEntryManaged)return;
  if(!a.bedSurface||a.support?.id!=='home'||a.motion||a.route?.length||a.goal||a.command||a.mouthAction)return;
  const b=a.bedSurface;if(Math.abs(a.x+12*a.scale-(b.left+b.right)/2)>10*a.scale)return;
  a.support=b;a.y=b.top;window.pixelCatExplorationV1?.observe(a,t);
 },
 stepOff(a,next,t){
  const from=a.support,to=next.settle?next.surface:next;if(!from||!to||from.id===to.id||!from.bed&&!to.bed)return false;
  const owner=(from.bed?from:to).bedOwner||a,floor=a.surfaces.find(s=>!s.bed&&s.bedOwner===owner)||a.surfaces.find(s=>s.id==='home');if(!floor)return false;
  if(from.bed){
   const direction=((next.settle?next.x:(to.min+to.max)/2)+12*a.scale)>a.x+12*a.scale?1:-1;
   const x=Math.max(floor.min,Math.min(floor.max,a.x+direction*12*a.scale));if(Math.abs(x-a.x)<a.scale)return false;
   a.moveTo(x,floor.top,0,'walk',floor,t);if(a.motion)a.motion.homeStep=true;return true;
  }
  if(to.bed&&from.id===floor.id){
   a.route.shift();a.moveTo(to.min,to.top,0,'walk',to,t);if(a.motion)a.motion.homeStep=true;return true;
  }
  return false;
 },
 walkHeight(a,m,sample){
  const shallow=window.pixelCatShallowV1?.height(a,m,sample);if(shallow!=null)return shallow;
  if(!m.homeStep)return m.fromY;
  const cells=Math.max(1,m.cells||1),step=Math.min(cells,Math.max(0,m.sneakTimeline?Math.abs(sample.x-m.fromX)/a.scale:sample.step||0)),u=m.target.bed?Math.max(0,(step-Math.max(0,cells-6))/Math.min(6,cells)):Math.min(1,step/Math.min(6,cells));
  return m.fromY+Math.round((m.y-m.fromY)/a.scale*u)*a.scale;
 }
});

window.pixelCatBedEntryV1={
 beforeIdle(a,pose,t,art,front){
  a.bedEntryManaged=true;if(a.motion||a.route?.length||a.previewPose||a.play||a.mouthAction||a.goal||a.command)return false;if(this.exit(a,pose,t,art))return true;if(!['loaf','sleep'].includes(pose))return false;
  const owner=a.support?.bedOwner||a;if(owner.config.show_home===false||!owner.home||!a.support||a.support!==a.home&&!a.support.bedOwner)return false;
  const bed=window.pixelCatSetupV1.bed(owner,art),left=owner.home.left-4+22*(owner.worldScale||owner.scale),center=left+bed.width*(owner.worldScale||owner.scale)/2;if(Math.abs(a.x+12*a.scale-center)>24*a.scale)return false;
  if(a.bedInside===owner)return false;
  const clip=art.idleSequences[pose],reference=clip.frames[Math.max(0,clip.roles?.indexOf('cycle')??0)],xs=reference.flatMap(r=>[...r].flatMap((v,x)=>v==='.'?[]:[a.facing<0?23-x:x])),desired=left+Math.round((bed.width*(owner.worldScale||owner.scale)/2-(Math.min(...xs)+Math.max(...xs)+1)*a.scale/2)/a.scale)*a.scale;
  const facing=desired>=a.x?1:-1,restBearing=desired+front(reference,facing)*a.scale,gait=art.sneak?.every(Boolean)&&(owner.config.bed_style!=='simple'||(a.ensureMood?.().random()??Math.random())<.12)?'sneak':null,first=gait?art.sneak[0].frames[0]:art.walk[(a.walkSteps+1)%art.walk.length],x=restBearing-front(first,facing)*a.scale;
  const target=owner.config.bed_style==='simple'?a.surfaces.find(s=>s.bed&&s.bedOwner===owner):a.support;
  if(!target)return false;if(Math.abs(x-a.x)<=a.scale){a.bedInside=owner;return false;}
  const oldIdle=a.idle,oldMotion=a.motion;if(!gait)a.urgency='casual';a.moveTo(x,target.top,0,'walk',target,t,gait);if(!a.motion||a.motion===oldMotion){a.idle=oldIdle;return false;}
  if(gait){const m=a.motion;let best=null;for(let delta=-8;delta<=8;delta++){const end=x+delta*a.scale,cells=Math.round(Math.abs(end-m.fromX)/a.scale);if(cells<2||Math.sign(end-m.fromX)!==m.direction)continue;const timeline=window.pixelCatPolishV1.sneakTimeline(cells,art),last=timeline.at(-1),error=Math.abs(end+front(art.sneak[last.variant].frames[last.frame],m.direction)*a.scale-restBearing);if(!best||error<best.error)best={error,end,cells,timeline};}if(best){m.x=best.end;m.cells=best.cells;m.sneakTimeline=best.timeline;m.duration=best.timeline.at(-1).until;}}
  if(!gait){const m=a.motion;let best=null;for(let delta=-8;delta<=8;delta++){const end=m.x+delta*a.scale,cells=Math.round(Math.abs(end-m.fromX)/a.scale);if(cells<2||Math.sign(end-m.fromX)!==m.direction)continue;const last=art.walk[(m.gaitStart+cells+1)%art.walk.length],error=Math.abs(end+front(last,m.direction)*a.scale-restBearing);if(!best||error<best.error)best={end,error};}if(best&&best.end!==m.x){a.moveTo(best.end,target.top,0,'walk',target,t);a.motion.departure=m.departure;a.motion.start=m.start;}}
  if(target.bed)a.motion.homeStep=true;a.bedEntry={owner,pose,motion:a.motion,side:facing>0?'left':'right'};a.setAttribute?.('data-bed-entry','approach');return true;
 },
 exit(a,pose,t,art){
  const owner=a.bedInside;if(!owner||owner.config.bed_style==='simple'||['loaf','sleep'].includes(pose))return false;
  const floor=a.support,bed=window.pixelCatSetupV1.bed(owner,art),left=owner.home.left-4+22*(owner.worldScale||owner.scale),right=left+bed.width*(owner.worldScale||owner.scale),options=[{side:'right',x:right+2*a.scale},{side:'left',x:left-24*a.scale}];if(a.facing<0)options.reverse();
  const option=options.map(o=>({...o,x:Math.round(Math.max(floor.min,Math.min(floor.max,o.x))/a.scale)*a.scale})).find(o=>Math.abs(o.x-a.x)>2*a.scale&&(o.side==='right'?o.x>=right:o.x+21*a.scale<=left)&&a.social?.clear?.(floor,o.x)!==false);
  if(!option){if(a.idle){a.idle.poseUntil=t+1000;if(a.idle.rows&&a.idle.placement)window.pixelCatSetupV1.restPlacement(a,a.idle.placement,a.idle.rows,art,t);}return true;}
  a.moveTo(option.x,floor.top,0,'walk',floor,t,art.sneak?.every(Boolean)?'sneak':null);a.bedEntry={owner,pose,motion:a.motion,side:option.side,exit:true};a.setAttribute?.('data-bed-entry','departure');return true;
 },
 moving(a){a.bedInside=null;a.bedEntry=null;window.pixelCatSetupV1?.clearRestMask(a);},
 travelEnd(a,m){const e=a.bedEntry;if(e?.motion!==m)return;a.bedInside=e.exit?null:e.owner;a.previewBedPose=e.pose;a.bedEntry=null;a.idle&&(a.idle.poseUntil=0);a.setAttribute?.('data-bed-entry','inside');},
 mask(a,rows,ownerOverride,sideOverride){const e=ownerOverride?{owner:ownerOverride,side:sideOverride}:a.bedEntry;if(!ownerOverride&&e&&e.motion!==a.motion){a.bedEntry=null;return;}if(!e||e.owner.config.bed_style==='simple'||!a.svg?.firstElementChild)return;
  const owner=e.owner,s=a.scale,xy=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(a.svg.style.transform||''),placement={x:xy?Number(xy[1]):a.x,top:xy?Number(xy[2]):a.y-24*s},path=window.pixelCatSetupV1.openingPath(owner,placement,s,window.pixelCatRoamingExtrasV1,e.side);
  if(!a.bedEntryMask){const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),shape=document.createElementNS(ns,'path');clip.id='cat-entry-'+a.ownerKey;clip.setAttribute('clipPathUnits','userSpaceOnUse');clip.append(shape);defs.append(clip);a.svg.append(defs);a.bedEntryMask={id:clip.id,shape};}
  a.bedEntryMask.shape.setAttribute('d',path);a.svg.firstElementChild.setAttribute('clip-path',`url(#${a.bedEntryMask.id})`);
 },
 rest(a,placement){if(!a.bedEntryManaged)return false;const owner=a.support?.bedOwner||a;return a.bedInside!==owner;}
};

window.pixelCatShallowV1={
 edge(a,from,to,x=a.x){
  const s=a.scale,dy=Math.abs(from.top-to.top);if(from===to||from.bed||to.bed||from.narrow||to.narrow||dy<s*.25||dy>4*s||Math.max(0,from.left-to.right,to.left-from.right)>2*s)return null;
  const run=Math.max(6*s,dy*3)+4*s,direction=Math.sign((to.min+to.max)-(from.min+from.max))||a.facing||1,clamp=(v,f)=>Math.max(f.min,Math.min(f.max,v));
  for(const launch of [clamp(x??from.min,from),(from.min+from.max)/2,from.min,from.max])for(const d of [direction,-direction]){const landing=clamp(launch+d*run,to),distance=Math.abs(landing-launch);if(distance>=run-.01&&distance<=48*s)return{launch,landing,run};}return null;
 },
 step(a,next,t){if(next.settle)return false;const from=a.support,to=next,edge=this.edge(a,from,to);if(!edge)return false;
  const key=from.id+'>'+to.id;if(a.shallowChoice?.key!==key)a.shallowChoice={key,walk:!!a.command||!!a.goal||(a.ensureMood?.().random()??Math.random())<.88};if(!a.shallowChoice.walk)return false;
  if(Math.abs(a.x-edge.launch)>a.scale){a.moveTo(edge.launch,from.top,0,'walk',from,t);return true;}
  a.route.shift();a.shallowChoice=null;a.moveTo(edge.landing,to.top,0,'walk',to,t);if(a.motion){a.motion.shallow=true;a.motion.shallowFrom=from.id;a.setAttribute?.('data-transition','shallow-walk');}return true;
 },
 height(a,m,sample){if(!m.shallow)return null;const u=Math.max(0,Math.min(1,Math.abs(sample.x-m.fromX)/Math.max(a.scale,Math.abs(m.x-m.fromX)))),ease=u*u*(3-2*u);return m.fromY+Math.round((m.y-m.fromY)/a.scale*ease)*a.scale;}
};

Object.assign(window.pixelCatMouthV1||={}, {
 homes:new Set(),anchors:new WeakMap(),
 random(a){return a.ensureMood?.().random?.()??Math.random();},
 state(a,t){const q=a.mouthState||={clock:0,last:t,next:12000};const dt=t-q.last;q.last=t;q.clock+=dt>1000?0:Math.max(0,Math.min(100,dt));return q;},
 point(p,s){const pad=p.asset.id==='ball'?p.asset.width*p.scale/2:Math.max(4*p.scale,p.asset.width*p.scale/2),left=s.left+pad,right=s.right-pad;return {x:left+(right-left)*p.u,y:s.top};},
 surface(a,p){return a.surfaces?.find(s=>!s.home&&s.el===p.surfaceEl&&s.id.slice(s.id.indexOf(':'))===p.surfaceSuffix);},
 mouth(a,rows,place,art){
  const sequence=a.getAttribute?.('data-sequence-id'),pose=a.idle?.pose,index=Number((a.getAttribute?.('data-frame')||'').split('-').at(-1))-1,cache=this.anchors.get(rows);let gaze=cache?.sequence===sequence&&cache?.pose===pose&&cache?.index===index?cache.gaze:undefined;if(gaze===undefined){
  const clip=art.idleSequences?.[pose],metadata=art.gazeIndex?.frames?.[clip?.sequenceId||sequence]?.[clip?.sourceFrames?.[index]??index],composite=window.pixelCatTrackRuntimeV1?.metadata(rows);
  gaze=composite?.gaze||(clip?.frames?.[index]===rows?clip.gazes?.[index]:null);if(!gaze&&metadata?.gaze&&metadata.key===rowKey(rows))gaze=metadata.gaze;
  gaze||=a.social?.frame?.rows===rows?a.social.frame.gaze:a.social?.gaze?.(rows,a.getAttribute?.('data-sequence-id'));
  if(!gaze){let key=2166136261;for(const row of rows)for(const v of row)key=Math.imul(key^v.charCodeAt(0),16777619)>>>0;gaze=art.gazeIndex?.rows?.[key.toString(36)];}
  if(!gaze){const head=[];rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.'&&x>=16)head.push(y);}));gaze={x:19,y:Math.min(19,(head.length?Math.min(...head):9)+3)};}
  this.anchors.set(rows,{sequence,pose,index,gaze});}
  const x=Math.max(0,Math.min(23,gaze.x+.5)),y=Math.max(0,Math.min(24,gaze.y+2.5));
  return {x:place.x+(a.facing<0?24-x:x)*a.scale,y:place.top+y*a.scale,source:'gaze-origin estimate'};
 },
 free(a){return a.active&&!a.userHeld&&!a.paused&&!a.suspended&&!a.stranded&&!a.motion&&!a.route?.length&&!a.goal&&!a.command&&!a.previewPose&&!a.play&&!a.toyHunt&&!a.social?.episode&&!a.mouthAction;},
 toyContact(a,p,s){const m=a.mouthPoint;if(!m)return false;const q=this.point(p,s);return Math.abs(m.x-q.x)<=p.asset.width*p.scale/2+a.scale&&m.y>=q.y-p.asset.height*p.scale-a.scale&&m.y<=q.y+a.scale;},
 attach(a,p,t,art,contact=false){
  if(p?.asset?.mouthCarryable===false||a.config.toy_carrying===false||a.carriedToy||!p||p.carrier||p.claimedBy!==a.ownerKey)return false;
  const s=this.surface(a,p);if(!s||(!contact&&!this.toyContact(a,p,s)))return false;
  a.carryArt=art;p.carrier=a.ownerKey;p.ballMotion=null;p.bodyContacts=new Set();p.carryFacing=null;p.claimedBy=a.ownerKey;a.carriedToy=p.id;
  const q=this.state(a,t);q.possessiveToy=p.id;q.possessiveUntil=q.clock+45000+this.random(a)*30000;q.dropAt=q.clock+15000+this.random(a)*30000;q.next=q.dropAt+15000;
  window.pixelCatDepthV1?.removeProp(p);p.node.style.zIndex='1';a.layer?.append(p.node);p.node.dataset.carriedBy=a.ownerKey;a.setAttribute?.('data-carried-toy',p.id);a.social?.log?.('picked up toy',{toy:p.id,via:contact?'successful pounce':'mouth contact'});return true;
 },
 paintCarry(a,p){
  if(!a.mouthPoint)return;const transform=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(a.svg?.style?.transform||'');if(transform&&a.mouthTransform){const xy=[Number(transform[1]),Number(transform[2])];a.mouthPoint.x+=xy[0]-a.mouthTransform[0];a.mouthPoint.y+=xy[1]-a.mouthTransform[1];a.mouthTransform=xy;}const m=a.mouthPoint,w=p.asset.width*p.scale,h=p.asset.height*p.scale;
  p.node.style.transform=`translate(${Math.round(m.x-w/2)}px,${Math.round(m.y-h/2)}px)`;p.node.style.visibility=a.suspended?'hidden':'visible';p.node.dataset.motion='carried';
  if(p.carryFacing!==a.facing){p.carryFacing=a.facing;const c=p.node.getContext('2d'),mirror=a.facing!==(p.asset.facing??1);c.clearRect(0,0,p.asset.width,p.asset.height);p.asset.pixels.forEach((r,y)=>r.forEach((v,x)=>{if(v){c.fillStyle=v;c.fillRect(mirror?p.asset.width-1-x:x,y,1,1);}}));p.paintKey=null;}
 },
 carried(scene,p,t,visible){
  if(p.releaseFall){const f=p.releaseFall,source=visible.find(a=>this.surface(a,p)),s=source&&this.surface(source,p);if(!s||p.surfaceEl?.isConnected===false){window.pixelCatDepthV1?.removeProp(p);p.node.remove();scene.props=scene.props.filter(v=>v!==p);p.releaseFall=null;return true;}const dt=Math.min(100,Math.max(0,t-f.last));f.last=t;if(visible.some(a=>!a.paused&&!a.layoutPaused))f.elapsed+=dt;f.from+=s.top-(f.top??s.top);f.to=s.top;f.x=this.point(p,s).x;f.top=s.top;const u=Math.min(1,f.elapsed/(f.duration||250)),y=f.from+(f.to-f.from)*u*u;window.pixelCatDepthV1?.prop(scene,p,{top:y},true,source);p.node.style.transform=`translate(${f.x-p.asset.width*p.scale/2}px,${y-p.asset.height*p.scale}px)`;if(u>=1)p.releaseFall=null;return true;}
  if(!p.carrier)return false;const a=[...scene.members].find(a=>a.ownerKey===p.carrier);
  if(!a?.active||!a.isConnected){this.release(a,p,scene,t,true);return true;}
  p.node.style.visibility=visible.includes(a)?'visible':'hidden';if(!visible.includes(a))return true;this.paintCarry(a,p);
  const s=a.support,m=a.mouthPoint;if(s&&m&&t>=(p.carryNoticeAt||0)){p.carryNoticeAt=t+100;const previous=p.carriedPrevious||m;window.pixelCatInteractionsV1?.propTick(scene,p,s,previous,{x:m.x,y:m.y+p.asset.height*p.scale/2},a.paused?0:100,t,visible.filter(a=>!a.paused));p.carriedPrevious={...m};}
  return true;
 },
 startled(a,t){if(!a.carriedToy)return;const p=a.propScene?.props?.find(p=>p.id===a.carriedToy);if(p){this.release(a,p,a.propScene,t,true);a.social?.log?.('startle dropped toy',{toy:p.id});}},
 release(a,p,scene,t,cleanup=false){
  if(!p)return false;const m=a?.mouthPoint||{x:a?.x||0,y:a?.y||0};
  const candidates=(a?.surfaces||[]).filter(s=>!s.home&&!s.narrow&&s.el?.isConnected!==false&&s.top>=m.y-8*(a?.scale||p.scale)&&m.x>=s.left+p.asset.width*p.scale/2&&m.x<=s.right-p.asset.width*p.scale/2);
  const s=candidates.sort((x,y)=>Math.abs(x.top-m.y)-Math.abs(y.top-m.y))[0]||cleanup&&[...scene.members].flatMap(b=>b.surfaces||[]).find(s=>!s.home&&s.el===p.surfaceEl&&s.el?.isConnected!==false);
  if(!s){if(!cleanup)return false;window.pixelCatDepthV1?.removeProp(p);p.node.remove();scene.props=scene.props.filter(v=>v!==p);}else{
   p.surfaceEl=s.el;p.surfaceSuffix=s.id.slice(s.id.indexOf(':'));const pad=p.asset.id==='ball'?p.asset.width*p.scale/2:Math.max(4*p.scale,p.asset.width*p.scale/2),lo=s.left+pad,hi=s.right-pad,x=Math.max(lo,Math.min(hi,m.x));p.u=(x-lo)/Math.max(1,hi-lo);p.low=Math.max(0,p.u-.18);p.high=Math.min(1,p.u+.18);p.ballMotion=null;p.contactGeometry=null;p.bodyContacts=new Set();p.paintKey=null;p.releaseFall={top:s.top,last:t,elapsed:0,x,duration:Math.max(80,1000*Math.sqrt(2*Math.max(0,s.top-m.y-p.asset.height*p.scale/2)/(400*p.scale))),from:Math.min(s.top,m.y+p.asset.height*p.scale/2),to:s.top};scene.layer.append(p.node);
  }
  p.lastInteractor=a?.ownerKey||p.carrier;p.carrier=null;p.claimedBy=null;p.cooldownUntil=scene.time+1200;p.availableToOthersAt=scene.time+400;p.node.dataset.carriedBy='';p.carriedPrevious=null;
  if(a){a.carriedToy=null;a.removeAttribute?.('data-carried-toy');const q=a.mouthState;if(q){q.next=q.clock+20000;q.justDropped=p.id;q.justDroppedUntil=q.clock+20000;}}return true;
 },

});

Object.assign(window.pixelCatMouthV1||={}, {
 bowl(a,node){
  this.homes.add(a);a.foodBowl=node;node.setAttribute('role','button');node.setAttribute('tabindex','0');node.setAttribute('aria-label','Offer food to nearby cats');node.style.cursor='pointer';
  const offer=e=>{e?.stopPropagation?.();this.offer(a,performance.now());};node.addEventListener?.('click',offer);node.addEventListener?.('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();offer(e);}});
 },
 appetite(a,t){const q=this.state(a,t);return Math.max(0,Math.min(1,(q.clock-(q.lastMeal??-180000)-90000)/180000));},
 surfaces(a){if(a.config.bowl_eating===false)return;for(const owner of this.homes||[]){const h=owner.home,el=owner.shadowRoot?.querySelector?.('.dock');if(!owner.active||owner.root!==a.root||owner.config.show_home===false||!h||!el?.isConnected)continue;a.surfaces.push({...h,id:'food-'+owner.ownerKey,el,home:false,internal:true,foodOwner:owner,label:(owner.config.name||'Cat')+' · bowl floor',source:'known home bowl'});}},
 bowlTarget(a,owner){
  if(!owner?.active||owner.root!==a.root||owner.config.show_home===false||!owner.foodBowl?.isConnected||owner.bowlClaim&&owner.bowlClaim!==a.ownerKey)return null;
  const r=owner.foodBowl.getBoundingClientRect(),s=a===owner?a.home:a.surfaces?.find(s=>!s.narrow&&Math.abs(s.top-r.bottom)<2*a.scale&&r.left>=s.left&&r.right<=s.right);
  if(!s||!a.pathTo(s)||!a.pathTo(a.home,s))return null;return {owner,s,x:(r.left+r.right)/2,y:r.bottom};
 },
 offer(owner,t){
  const members=new Set([...this.homes,...owner.propScene?.members||[]]),options=[...members].filter(a=>a.active&&!a.paused&&!a.suspended&&!a.stranded&&!a.goal&&!a.command&&!a.previewPose&&!a.carriedToy&&!a.mouthAction&&a.config.bowl_eating!==false).map(a=>({a,target:this.bowlTarget(a,owner)})).filter(o=>o.target&&this.appetite(o.a,t)>0).sort((x,y)=>Math.abs(x.a.x-x.target.x)-Math.abs(y.a.x-y.target.x));
  for(const o of options){if(this.random(o.a)>.85*this.appetite(o.a,t))continue;if(this.begin(o.a,'food',o.target,t)){owner.setAttribute?.('data-bowl-response','accepted');return o.a;}if(o.a.motion||o.a.route?.length){const q=this.state(o.a,t);q.foodOffer={owner,until:q.clock+10000};owner.setAttribute?.('data-bowl-response','noticed · finish current movement');return o.a;}}
  owner.setAttribute?.('data-bowl-response','not hungry or not interested');return false;
 },
 plan(a,target,pose,art){
  const clip=art.idleSequences?.[pose];if(!clip)return null;const gaze=clip.gazes?.[0]||art.gazeIndex?.rows?.[rowKey(clip.frames[0])]||{x:19,y:20};
  const local=pose==='bat'?art.interactionContacts.bat.point[0]+.5:Math.min(23,gaze.x+.5),choices=[1,-1].map(facing=>({facing,x:Math.round((target.x-(facing>0?local:24-local)*a.scale)/a.scale)*a.scale})).filter(o=>o.x>=target.s.min&&o.x<=target.s.max);
  return choices.sort((x,y)=>Math.abs(x.x-a.x)-Math.abs(y.x-a.x))[0]||null;
 },
 begin(a,kind,target,t,art=window.pixelCatRoamingExtrasV1){
  if(!this.free(a)||a.carriedToy&&kind!=='drop')return false;const pose=kind==='food'||kind==='pickup'?'eat':kind==='bat'?'bat':'nose',plan=kind==='drop'&&a.support?.id===target.s.id?{facing:a.facing,x:a.x}:this.plan(a,target,pose,art);if(!plan)return false;
  const path=a.pathTo(target.s);if(!path)return false;const p=target.toy;if(kind==='pickup'&&p?.asset?.mouthCarryable===false)return false;if(p&&(p.claimedBy||p.carrier||p.ballMotion))return false;
  a.social?.finish('mouth affordance');a.cancelPlay(t);if(p)p.claimedBy=a.ownerKey;if(target.owner)target.owner.bowlClaim=a.ownerKey;
  a.mouthAction={kind,target,plan,pose,phase:'approach',started:t,clock:this.state(a,t).clock,duration:kind==='food'?(3+Math.floor(this.random(a)*3))*1000:kind==='drop'||kind==='nose'?3000:1600};a.route=[...path,{settle:true,surface:target.s,x:plan.x}];a.urgency=kind==='food'?'prompted':'interested';a.deadline=0;a.setAttribute?.('data-mouth-action',kind);return true;
 },
 cancel(a){if(a.mouthState)a.mouthState.foodOffer=null;const action=a.mouthAction;if(!action)return;if(action.target.owner?.bowlClaim===a.ownerKey)action.target.owner.bowlClaim=null;const p=action.target.toy;if(p&&!p.carrier&&p.claimedBy===a.ownerKey)p.claimedBy=null;if(a.previewPose===action.pose){a.previewPose=null;a.forcedIdleUntil=0;}a.mouthAction=null;a.removeAttribute?.('data-mouth-action');},
 step(a,t,art){
  if(!this.state)return;
  if(!a.foodBowl){const bowl=a.shadowRoot?.querySelector?.('[data-cat-bowl]');if(bowl)this.bowl(a,bowl);}
  const q=this.state(a,t);if(q.clock>=(q.justDroppedUntil||Infinity))q.justDropped=null;if(a.config.toy_carrying===false&&a.carriedToy){const p=a.propScene?.props.find(p=>p.id===a.carriedToy);this.release(a,p,a.propScene,t,true);}
  const play=a.play;if(!a.carriedToy&&play?.stage==='pounce'&&!a.motion&&play.landingX!==undefined&&!play.mouthChecked){play.mouthChecked=true;const p=a.propScene?.props.find(p=>p.id===play.toyId),s=p&&this.surface(a,p);if(s&&Math.abs(this.point(p,s).x-(play.landingX+a.toyPaw(play.direction)*a.scale))<=4*a.scale&&this.random(a)<.45&&this.attach(a,p,t,art,true)){play.released=true;a.cancelPlay(t);}}
  const action=a.mouthAction;
  if(action){
   const target=action.target,p=target.toy,live=a.surfaces?.find(s=>s.id===target.s.id);if(!live||a.goal||a.command||a.motion?.kind==='startle'||q.clock-action.clock>30000||target.owner&&(target.owner.config.show_home===false||!target.owner.active)||p&&(!a.propScene?.props.includes(p)||p.claimedBy!==a.ownerKey)){this.cancel(a);return;}
   if(live!==target.s){const dx=live.left-target.s.left,dy=live.top-target.s.top;target.x+=dx;target.y+=dy;action.plan.x+=dx;target.s=live;}
   if(action.phase==='approach'){
    if(a.motion||a.route?.length)return;if(a.support?.id!==target.s.id){this.cancel(a);return;}
    if(p){const s=this.surface(a,p),point=s&&this.point(p,s);if(!point||Math.abs(point.x-target.x)>4*a.scale){this.cancel(a);return;}}
    a.facing=action.plan.facing;if(action.kind==='bat'){a.mouthAction=null;a.toyHunt={id:p.id,started:t,stage:'play',forced:false};a.startToyBat(t,p,{direction:a.facing});return;}action.phase='act';action.actAt=q.clock;a.previewPose=action.pose;a.forcedIdleUntil=t+10000;a.idle=null;a.deadline=t+10000;
   }
   const elapsed=q.clock-action.actAt;if(action.phase==='act'){a.forcedIdleUntil=t+10000;a.deadline=t+10000;}
   if(action.phase==='act'&&elapsed>700&&!action.contacted){
    if(action.kind==='pickup'&&this.attach(a,p,t,art)){action.contacted=true;}
    if(action.kind==='food'&&a.mouthPoint&&Math.abs(a.mouthPoint.x-target.x)<=4*a.scale&&Math.abs(a.mouthPoint.y-target.y)<=4*a.scale)action.contacted=true;
    if(action.kind==='drop'&&elapsed>1000){const held=a.propScene?.props.find(p=>p.id===a.carriedToy);if(this.release(a,held,a.propScene,t))action.contacted=true;}
   }
   if(elapsed>action.duration){
    const ate=action.kind==='food'&&action.contacted;if(ate){q.lastMeal=q.clock;a.setAttribute?.('data-last-meal',String(q.clock));window.pixelCatPostRestV1?.afterMeal(a);}this.cancel(a);a.idle=null;a.deadline=t+1500;q.next=q.clock+12000;
    if(action.kind==='drop'&&action.contacted&&this.random(a)<.4){const toy=a.propScene.props.find(p=>p.id===q.justDropped),s=toy&&this.surface(a,toy);if(s&&!toy.releaseFall)this.begin(a,'bat',{toy,s,...this.point(toy,s)},t,art);}return;
   }return;
  }
  if(q.foodOffer&&q.clock>q.foodOffer.until)q.foodOffer=null;
  if(q.foodOffer&&this.free(a)){const offer=q.foodOffer;q.foodOffer=null;const target=this.bowlTarget(a,offer.owner);if(target&&this.appetite(a,t)>0&&this.begin(a,'food',target,t,art))return;}
  if(!this.free(a)||q.clock<q.next)return;q.next=q.clock+4000+this.random(a)*6000;
  if(a.carriedToy){if(q.clock>=q.dropAt&&!a.support?.home&&!a.support?.narrow)this.begin(a,'drop',{s:a.support,x:a.x+12*a.scale,y:a.y},t,art);return;}
  if(this.reclaim(a,t,art))return;this.follow(a,t);
  if(a.config.bowl_eating!==false&&this.appetite(a,t)>.3&&this.random(a)<.12){const target=this.bowlTarget(a,a);if(target&&this.begin(a,'food',target,t,art))return;}
  if(a.config.toy_carrying===false||!a.propScene?.enabled||this.random(a)>.3)return;
  const options=a.propScene.props.filter(p=>p.asset.affordance!=='scratch'&&!p.carrier&&!p.claimedBy&&!p.ballMotion&&!p.releaseFall&&p.id!==q.justDropped&&p.cooldownUntil<=a.propScene.time).map(toy=>{const s=this.surface(a,toy),point=s&&a.observedToyPoint(toy,s);return point&&{toy,s,x:point.x,y:point.y};}).filter(o=>o&&o.s.id===a.support?.id&&Math.abs(o.x-(a.x+12*a.scale))<65*a.scale);
  if(options.length){const option=options[Math.floor(this.random(a)*options.length)];this.begin(a,this.random(a)<.65&&option.toy.asset.mouthCarryable!==false?'pickup':'nose',option,t,art);}
 },
 reclaim(a,t,art){
  const q=a.mouthState;if(!q.possessiveToy||q.clock>=q.possessiveUntil||q.clock<(q.reclaimAfter||0))return false;
  const p=a.propScene?.props.find(p=>p.id===q.possessiveToy);if(!p||p.carrier||p.claimedBy||p.releaseFall||p.ballMotion)return false;
  const s=this.surface(a,p),point=s&&a.observedToyPoint(p,s);if(!point||s.id!==a.support?.id||this.random(a)>.65)return false;
  q.reclaimAfter=q.clock+12000;return this.begin(a,'pickup',{toy:p,s,x:point.x,y:point.y},t,art);
 },
 follow(a,t){
  if(!a.config.interaction_behaviour||!a.config.social_behaviour||!a.social?.propMemory)return;const q=a.mouthState;if(q.clock<(q.nextFollow||0))return;
  const seen=[...a.social.propMemory.values()].find(p=>p.carrier&&p.carrier!==a.ownerKey&&a.social.clock-p.observedAt<300);if(!seen)return;
  const carrier=[...a.propScene?.members||[]].find(b=>b.ownerKey===seen.carrier);if(!carrier||carrier.root!==a.root)return;const possessive=q.possessiveToy===seen.id&&q.clock<q.possessiveUntil;if(this.random(a)>(possessive?.85:.25+.55*(a.ensureMood().values.playfulness||0)))return;
  q.nextFollow=q.clock+18000;const s=a.surfaces.find(s=>!s.home&&!s.narrow&&s.el===seen.surface&&Math.abs(s.top-seen.top)<2),gap=30*Math.max(a.scale,carrier.scale),x=s&&Math.round(Math.max(s.min,Math.min(s.max,seen.x-12*a.scale-Math.sign(seen.x-(a.x+12*a.scale))*gap))/a.scale)*a.scale;
  if(!s||!a.pathTo(s)||!a.pathTo(a.home,s)||a.social.clear?.(s,x)===false)return;
  a.route=[...a.pathTo(s),{settle:true,surface:s,x}];a.urgency='interested';a.deadline=0;a.social.log?.('follow noticed carried toy',{target:carrier.ownerKey,toy:seen.id});
 },
 frame(a,rows,drawn,t,art){if(!a.carriedToy&&!a.mouthAction)return;a.mouthTransform=[Number(drawn[1]),Number(drawn[2])];a.mouthPoint=this.mouth(a,rows,{x:Number(drawn[1]),top:Number(drawn[2])},art);if(a.carriedToy){const p=a.propScene?.props.find(p=>p.id===a.carriedToy);if(p)this.paintCarry(a,p);else {a.carriedToy=null;a.removeAttribute?.('data-carried-toy');}}},
 disconnect(a){this.cancel(a);this.homes?.delete(a);a.foodBowl=null;if(a.carriedToy&&a.propScene){const p=a.propScene.props.find(p=>p.id===a.carriedToy);this.release(a,p,a.propScene,performance.now(),true);}if(a.bowlClaim)a.bowlClaim=null;}
});

const catDrag={
 grip(clip,facing){const [x,y]=clip.anchor,half=clip.anchorAtCellCenter?.5:0;return [facing<0?23-x+half:x+half,y+half];},
 target(a,x,top){
  const feet=top+23*a.scale;
  return (a.surfaces||[]).filter(s=>s.el?.isConnected!==false&&!s.narrow&&Number.isFinite(s.min)&&Number.isFinite(s.max)&&s.max>=s.min&&s.top>=feet-2*a.scale)
   .map(s=>({surface:s,x:Math.max(s.min,Math.min(s.max,x))}))
   .filter(p=>Math.abs(p.x-x)<=8*a.scale&&a.social?.clear?.(p.surface,p.x)!==false)
   .sort((p,q)=>p.surface.top-q.surface.top||Math.abs(p.x-x)-Math.abs(q.x-x))[0]||null;
 },
 install(a,art){
  if(!a.svg?.addEventListener||a.dragBinding)return;
  const svg=a.svg;
  const down=e=>{
   if(a.config.draggable===false||e.button!==0||e.isPrimary===false||a.userHeld||!a.active||a.suspended||a.stranded||!a.support||a.blocked?.())return;
   if(!art.lifted)return;
   e.preventDefault();e.stopPropagation();
   const t=performance.now(),s=a.support;
   a.dragState={pointer:e.pointerId,phase:'held',returnId:s.id,returnOffset:a.x-s.left,paused:a.paused,clientX:e.clientX,clientY:e.clientY,faceX:e.clientX,last:t};
   a.userHeld=true;window.pixelCatPostRestV1?.interrupt(a);
   window.pixelCatMouthV1?.startled?.(a,t);
   a.social?.finish('picked up');a.cancelPlay(t);
   a.arriving=null;a.arrived=true;a.motion=null;a.route=[];a.idle=null;a.goal=null;a.command=null;a.recallPending=false;a.finishing=false;a.inspectionPending=null;a.requestedPoint=null;a.toyHuntRequested=false;a.toyAssetRequest=null;
   if(a.social){a.social.pendingImpact=null;a.social.frame=null;}
   window.pixelCatSetupV1?.clearRestMask(a);
   svg.setPointerCapture(e.pointerId);svg.style.cursor='grabbing';
   a.setAttribute('data-drag-state','held');a.setAttribute('data-frame-origin',art.lifted.origin||'unknown');
   this.paint(a,art);
  };
  const move=e=>{const d=a.dragState;if(d?.phase!=='held'||d.pointer!==e.pointerId)return;e.preventDefault();if(Math.abs(e.clientX-d.faceX)>=2){a.facing=e.clientX>d.faceX?1:-1;d.faceX=e.clientX;}d.clientX=e.clientX;d.clientY=e.clientY;};
  const up=e=>{const d=a.dragState;if(d?.phase!=='held'||d.pointer!==e.pointerId)return;e.preventDefault();e.stopPropagation();if(a.blocked?.()){this.restore(a);return;}a.measure?.();d.clientX=e.clientX;d.clientY=e.clientY;this.paint(a,art);this.release(a,performance.now(),art);};
  const cancel=e=>{if(a.dragState&&(e.type==='blur'||e.type==='keydown'&&e.key==='Escape'||a.dragState.phase==='held'&&e.pointerId===a.dragState.pointer)){e.preventDefault?.();this.restore(a);}};
  const click=e=>{e.preventDefault();e.stopPropagation();};
  const menu=e=>{if(a.userHeld)e.preventDefault();};
  for(const [event,fn]of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['click',click],['contextmenu',menu]])svg.addEventListener(event,fn);
  window.addEventListener('keydown',cancel);window.addEventListener('blur',cancel);
  a.dragBinding={svg,art,down,move,up,cancel,click,menu};
  svg.style.pointerEvents=a.config.draggable===false?'none':'visiblePainted';svg.style.touchAction='none';svg.style.cursor='grab';
 },
 preview(a,target){
  if(!a.dragMarker){const p=document.createElement('div');p.dataset.catDropMarker='';p.style.cssText='position:absolute;pointer-events:none;border-top:2px dashed #67ac86;opacity:.7';a.layer.append(p);a.dragMarker=p;}
  a.dragMarker.style.display=target?'':'none';
  if(target){a.dragMarker.style.width=24*a.scale+'px';a.dragMarker.style.transform=`translate(${target.x}px,${target.surface.top}px)`;}
 },
 paint(a,art){
  const d=a.dragState,clip=art.lifted,anchor=this.grip(clip,a.facing),s=a.scale;
  d.x=d.clientX-anchor[0]*s;d.top=d.clientY-anchor[1]*s;
  a.x=d.x;a.y=d.top+23*s;a.draw(clip.rows);a.svg.style.transform=`translate(${d.x}px,${d.top}px)`;
  a.svg.style.filter=`drop-shadow(${3*s}px ${4*s}px ${1.5*s}px rgba(0,0,0,.24))`;
  a.setAttribute('data-activity','held');a.setAttribute('data-pose','lifted');a.setAttribute('data-frame','lifted-1');a.setAttribute('data-sequence-id',clip.sequenceId);
  d.target=this.target(a,d.x,d.top);this.preview(a,d.target);a.renderMoodDebug?.(performance.now());a.status('Picked up · release above a surface; Escape cancels');
 },
 release(a,t,art){
  const d=a.dragState;if(!d?.target){this.restore(a);return false;}
  const target=d.target;d.phase='fall';d.targetId=target.surface.id;d.offset=target.x-target.surface.left;d.surfaceLeft=target.surface.left;d.surfaceTop=target.surface.top;d.fromX=d.x;d.fromTop=d.top;d.elapsed=0;d.last=t;
  const bottom=this.bottom(art.across.at(-1));d.height=Math.max(0,target.surface.top-bottom*a.scale-d.top);d.duration=Math.max(100,Math.min(1800,1000*Math.sqrt(2*d.height/(900*a.scale))));
  a.svg.style.filter='';a.svg.style.cursor='grab';a.dragMarker?.remove();a.dragMarker=null;a.setAttribute('data-drag-state','fall');
  if(a.svg.hasPointerCapture?.(d.pointer))a.svg.releasePointerCapture(d.pointer);
  return true;
 },
 bottom(rows){return rows.findLastIndex(r=>/[^.]/.test(r))+1;},
 finish(a,s,x,t){
  const d=a.dragState;a.support=s;a.x=x;a.y=s.top;a.motion=null;a.route=[];a.idle=null;a.explorationResidence=null;a.paused=d?.paused??a.paused;a.deadline=t+2500;a.nextStartleAt=t+500;window.pixelCatExplorationV1?.observe(a,t);
  a.dragState=null;a.userHeld=false;a.svg.style.filter='';a.svg.style.cursor='grab';a.dragMarker?.remove();a.dragMarker=null;a.signature=null;a.setAttribute('data-drag-state','released');a.setAttribute('data-activity',a.paused?'paused':s.home?'home':'perch');a.setAttribute('data-pose','landed');a.needsMeasure=true;
 },
 restore(a){
  const d=a.dragState;if(!d)return;
  const s=a.surfaces?.find(s=>s.id===d.returnId&&s.el?.isConnected!==false)||a.surfaces?.find(s=>!s.narrow&&s.el?.isConnected!==false);
  if(s){this.finish(a,s,Math.max(s.min,Math.min(s.max,s.left+d.returnOffset)),performance.now());const rows=a.dragBinding.art.stand;a.draw(rows);a.setAttribute('data-pose','stand');a.setAttribute('data-activity','perch');a.setAttribute('data-frame-origin','human');}
  else {a.dragState=null;a.userHeld=false;a.svg.style.filter='';a.dragMarker?.remove();a.dragMarker=null;a.waitingForSurface=true;a.needsMeasure=true;}
  if(a.svg.hasPointerCapture?.(d.pointer))a.svg.releasePointerCapture(d.pointer);
 },
 tick(a,t,art){
  const d=a.dragState;if(!d)return false;
  if(a.suspended||!a.active||typeof document!=='undefined'&&document.hidden){this.restore(a);return true;}
  if(t>=(d.checkAt||0)){d.checkAt=t+700;if(a.blocked?.()){this.restore(a);return true;}}
  a.layer.style.visibility='visible';a.propScene?.tick(t,a);
  if(d.phase==='held'){this.paint(a,art);return true;}
  const s=a.surfaces?.find(s=>s.id===d.targetId&&s.el?.isConnected!==false);
  if(!s){this.restore(a);return true;}
  d.fromX+=s.left-d.surfaceLeft;d.fromTop+=s.top-d.surfaceTop;d.surfaceLeft=s.left;d.surfaceTop=s.top;
  d.elapsed+=Math.min(50,Math.max(0,t-d.last));d.last=t;
  const u=Math.min(1,d.elapsed/d.duration),x=Math.max(s.min,Math.min(s.max,s.left+d.offset)),rows=u<.85?(art.freefallSequence?.frames?.[0]||art.across[2]):art.across.at(-1),end=s.top-this.bottom(rows)*a.scale;
  a.x=d.fromX+(x-d.fromX)*u;a.y=d.fromTop+(end-d.fromTop)*u*u+this.bottom(rows)*a.scale;a.draw(rows);a.setAttribute('data-activity','drop');a.setAttribute('data-pose','drop');a.setAttribute('data-frame-origin',u<.85?(art.freefallSequence?.origins?.[0]||'mixed'):art.frameProvenance?.across?.at(-1)||'human');a.renderMoodDebug?.(t);a.status('Landing after pickup');
  if(u===1){a.publishLanding?.({kind:'jump',fromY:d.fromTop+23*a.scale,y:s.top,target:s,x},t);this.finish(a,s,x,t);}
  return true;
 },
 uninstall(a){
  const b=a.dragBinding;if(!b)return;
  a.userHeld=false;a.dragState=null;
  for(const [event,fn]of [['pointerdown',b.down],['pointermove',b.move],['pointerup',b.up],['pointercancel',b.cancel],['lostpointercapture',b.cancel],['click',b.click],['contextmenu',b.menu]])b.svg.removeEventListener(event,fn);
  window.removeEventListener('keydown',b.cancel);window.removeEventListener('blur',b.cancel);a.dragMarker?.remove();a.dragMarker=null;a.dragBinding=null;
 }
};
window.pixelCatDragV1=catDrag;

const catPostRest={
 state(a){return a.postRest||={clock:0,resting:false,since:0,slept:false,until:0,initial:0};},
 random(a){return a.ensureMood?.().random?.()??Math.random();},
 potential(q){const elapsed=q.clock-q.since;return q.resting?Math.max(0,Math.min(q.slept?1:.55,(elapsed-(q.slept?2500:6000))/(q.slept?8000:20000))):0;},
 strength(a){const q=a.postRest;if(!q||a.config?.[q.source==='meal'?'post_meal_behaviour':'post_rest_behaviour']===false)return 0;return Math.max(this.potential(q),q.until>q.clock?q.initial*(q.until-q.clock)/q.duration:0);},
 afterMeal(a){if(a.config?.post_meal_behaviour===false)return;const q=this.state(a);q.resting=false;q.closedIdle=a.idle;q.source='meal';q.duration=6000+6000*this.random(a);q.initial=.75;q.until=q.clock+q.duration;},
 leave(a){
  const q=this.state(a);if(!q.resting)return false;
  const strength=this.potential(q);q.closedIdle=a.idle;q.resting=false;
  if(strength<=0||a.config?.post_rest_behaviour===false)return false;
  q.duration=(q.slept?5000:2500)+this.random(a)*(q.slept?10000:5000);q.initial=strength;q.until=q.clock+q.duration;q.source=q.slept?'sleep':'loaf';
  return true;
 },
 interrupt(a){const q=this.state(a);q.closedIdle=a.idle;q.resting=false;q.initial=0;q.until=0;},
 step(a,ms){window.pixelCatSettlingV1?.step(a,ms);window.pixelCatExertionV1?.clock(a,ms);
  if(a.paused||a.suspended||a.userHeld||a.active===false)return;
  if(a.config?.post_rest_behaviour===false&&a.postRest?.source!=='meal'){if(a.postRest){a.postRest=null;a.removeAttribute?.('data-post-rest');}return;}
  const q=this.state(a);q.clock+=ms>1000?0:Math.max(0,Math.min(250,ms||0));
  const rest=a.config?.post_rest_behaviour!==false&&!a.motion&&!a.previewPose&&!a.play&&['sleep','loaf'].includes(a.idle?.pose);
  if(rest&&a.idle!==q.closedIdle){if(!q.resting){q.resting=true;q.since=q.clock;q.slept=false;q.until=0;q.initial=0;q.source=a.idle.pose;}q.slept||=a.idle.pose==='sleep';}
  else if(q.resting)this.leave(a);
  if(q.clock>=(q.debugAt||0)){q.debugAt=q.clock+500;const strength=q.until>q.clock?this.strength(a):0;if(strength>0){a.setAttribute?.('data-post-rest',JSON.stringify({source:q.source,strength:Number(strength.toFixed(2)),remainingMs:Math.round(q.until-q.clock)}));q.exposed=true;}else if(q.exposed){a.removeAttribute?.('data-post-rest');q.exposed=false;}}
 },
 beforePlan(a,t,requested){
  if(requested){this.interrupt(a);return false;}
  if(!this.leave(a))return false;
  if(this.random(a)>=.65)return false;
  a.deadline=t+800+this.random(a)*1800;if(a.idle)a.idle.poseUntil=t;return true;
 },
 poseWeight(a,pose){const effort=window.pixelCatExertionV1?.weight(a,pose)??1;return effort*this.restPoseWeight(a,pose);},
 restPoseWeight(a,pose){const s=this.strength(a);if(a.postRest?.source==='meal')return 1+s*({clean:4,sit:1,sithead:.7,stand:.3,stretch:.3}[pose]||0);return 1+s*({yawn:2,stretch:2.5,clean:.8,sit:.6,sithead:.8,look:.8,stand:.5,sleep:-.3,loaf:-.2}[pose]||0);},
 choiceWeight(a,kind){const effort=window.pixelCatExertionV1?.weight(a,kind)??1;return effort*this.restChoiceWeight(a,kind);},
 restChoiceWeight(a,kind){const s=this.strength(a);return Math.max(.1,1+s*({explore:-.55,settle:1,chase:-.85,ambush:-.8,pat:-.25}[kind]||0));},
 departure(a,kind,gait){
  this.leave(a);const s=Math.max(this.strength(a),window.pixelCatExertionV1?.strength(a)??0);
  if(kind==='walk'&&!gait&&s>0&&!a.command&&!a.goal&&!a.previewPose&&!a.play&&!a.toyHunt&&!a.social?.episode&&a.urgency!=='prompted'&&this.random(a)<.55+.4*s)a.urgency='casual';
 },
 idleStarted(a,idle,art){
  window.pixelCatSettlingV1?.begin(a,idle,art);
  if(!['loaf','sleep'].includes(idle.pose)&&this.strength(a)>0&&!a.previewPose&&!a.play&&!a.command&&!a.goal)a.deadline=Math.max(a.deadline||0,idle.poseUntil);
 }
};
window.pixelCatPostRestV1=catPostRest;

const catPrimaryHomes=new Set();
const catPrimary={
 join(a){catPrimaryHomes.add(a);},
 leave(a){catPrimaryHomes.delete(a);},
 current(){return [...catPrimaryHomes].filter(a=>a.active&&a.isConnected&&a.config.mode!=='monitor'&&(typeof location==='undefined'||a.href===location.pathname));},
 defaultPrimary(){return this.current().length===0;},
 selection(root){const homes=this.current().filter(a=>a.root===root),explicit=homes.filter(a=>a.config.primary_home===true);return {primary:explicit.length?explicit[0]:homes.find(a=>a.config.primary_home===undefined),conflict:explicit.length>1,explicit};},
 tick(a,t){
  if(t<(a.primaryAt||0))return;a.primaryAt=t+500;
  const editing=!!(a.root?.editMode||a.root?.lovelace?.editMode),selection=editing?this.selection(a.root):null,primary=editing&&(a.config.primary_home===true||selection.primary===a);
  if(primary&&a.shadowRoot?.append){
   if(!a.primaryFlag){const flag=document.createElement('span');flag.dataset.primaryHomeFlag='';flag.style.cssText='position:absolute;top:6px;right:6px;z-index:2;padding:2px 5px;border-radius:4px;background:var(--primary-color,#168b76);color:var(--text-primary-color,#fff);font:10px system-ui;pointer-events:none';a.shadowRoot.querySelector('ha-card')?.append(flag);a.primaryFlag=flag;}
   const text=selection.conflict?'Primary · conflict':a.config.primary_home===undefined?'Primary · automatic':'Primary';if(a.primaryFlag.textContent!==text)a.primaryFlag.textContent=text;
  }else if(a.primaryFlag){a.primaryFlag.remove();a.primaryFlag=null;}
  if(a.config.show_home===false&&!a.config.show_controls&&a.style){const display=editing||a.worldState?.issue?'':'none';if(a.style.display!==display)a.style.display=display;}
 }
};
window.pixelCatPrimaryV1=catPrimary;

window.pixelCatMotionOptionsV1={
 select(a,kind,gait,target,x,art,basePace=9,random=Math.random){
  const p=window.pixelCatBehaviourV1,preference=kind==='walk'&&!gait?p?.preferredPace(a):null;
  if(kind!=='walk'||gait||!preference||!art.travelChoices)return this.legacy(a,kind,gait,target,x,art,random);
  const cells=Math.abs(x-a.x)/a.scale,options=[];
  for(const entry of art.travelChoices){const clip=art[entry.key];if(!clip||cells<(entry.minCells||0)||entry.engine!=='walk'&&!p.allowed(a,clip))continue;let speed,choice={};
   if(entry.engine==='walk')speed=basePace;
   else if(entry.engine==='step'){if(a.config.fast_walk===false)continue;speed=Math.max(15,Math.min(30,Number(a.config.fast_walk_fps)||clip.fps||21));choice.fast=clip;}
   else if(entry.engine==='bound'){if(!this.canBound(a,clip,target,x))continue;const rate=Math.max(15,Math.min(30,Number(a.config.gallop_fps)||clip.fps||25)),cycles=Math.floor(cells/clip.strideCells),seconds=cycles*clip.frames.length/rate+(cells-cycles*clip.strideCells)/12;speed=cells/seconds;choice.gallop=clip;}
   else continue;
   options.push({...choice,key:entry.key,speed,weight:p.paceWeight(speed,preference,entry.prior??1)});
  }
  if(!options.length)return {};let r=random()*options.reduce((n,o)=>n+o.weight,0);const chosen=options.find(o=>(r-=o.weight)<0)||options.at(-1);
  a.setAttribute?.('data-pace-choice',JSON.stringify({preferred:Number(preference.target.toFixed(1)),chosen:chosen.key,speed:Number(chosen.speed.toFixed(1)),options:options.map(o=>({key:o.key,speed:Number(o.speed.toFixed(1)),weight:Number(o.weight.toFixed(3))}))}));return chosen;
 },
 legacy(a,kind,gait,target,x,art,random){const gallop=this.gallop(a,kind,gait,target,x,art,random);const fast=!gallop&&kind==='walk'&&gait!=='sneak'&&a.config.fast_walk!==false&&window.pixelCatBehaviourV1?.allowed(a,art.fastWalk)!==false&&a.urgency&&!['relaxed','casual'].includes(a.urgency)&&Math.abs(x-a.x)>=8*a.scale?art.fastWalk:null;return {gallop,fast};},
 canBound(a,clip,target,x){
  if(a.config.gallop===false||target?.narrow||a.support?.narrow)return false;let start=a.x;
  if(a.idle){const front=(rows,facing)=>{const y=rows.findLastIndex(r=>r.includes('R')),x=rows[y]?.lastIndexOf('R');return x>=0?(facing<0?23-x:x):null;};const facing=x>=a.x?1:-1,next=front(clip.frames[0],facing),old=a.idle.rows&&front(a.idle.rows,a.idle.facing??a.facing),bearing=old!=null&&a.idle.placement?a.idle.placement.x+old*a.scale:a.idle.contactX;if(next==null||!Number.isFinite(bearing))return false;start=Math.round((bearing-next*a.scale)/a.scale)*a.scale;}
  const cells=Math.abs(Math.round(x/a.scale)*a.scale-start)/a.scale;return clip.strideCells>0&&cells>=clip.strideCells*(a.social?.episode?.kind==='chase'?1:2);
 },
 gallop(a,kind,gait,target,x,art,random=Math.random){
  if(kind!=='walk'||['sneak','trot'].includes(gait)||a.config.gallop===false||!art.gallop||target?.narrow||a.support?.narrow)return null;
  if(window.pixelCatBehaviourV1?.allowed(a,art.gallop)===false)return null;if(gait==='gallop')return art.gallop;
  const chase=a.social?.episode?.kind==='chase',purposeful=a.urgency==='prompted';
  const policy=window.pixelCatBehaviourV1,bias=policy?.weight(a,art.gallop)??1;
  if(!chase&&!purposeful&&!(bias>1&&(a.mood?.values?.playfulness||0)>.45&&a.urgency!=='casual'))return null;
  if(!this.canBound(a,art.gallop,target,x))return null;
  const mood=a.mood?.values,weight=mood?Math.max(.02,.14+.12*mood.playfulness-.12*mood.sleepiness):.14;
  return random()<Math.min(.65,weight*bias)?art.gallop:null;
 },
 hesitation(m,scale,random=Math.random){
  const down=m.y-m.fromY,across=Math.abs(m.x-m.fromX);
  if(m.jumpKind!=='descend'||down<12*scale||down<across*1.25||random()>=.45)return 0;
  return 250+Math.floor(random()*351);
 }
};

const catExploration={
 observe(a,t){
  const s=a.support;if(!s||a.config.local_exploration===false)return null;
  const rect=s.rectSnapshot||{left:s.left,top:0},span={el:s.el||s,left:s.left-rect.left,right:s.right-rect.left,y:s.top-rect.top};
  const q=a.explorationResidence,old=q?.span,overlap=old&&Math.min(old.right,span.right)-Math.max(old.left,span.left);
  if(!old||old.el!==span.el||Math.abs(old.y-span.y)>2*a.scale||overlap<.8*Math.min(old.right-old.left,span.right-span.left)){
   a.explorationResidence={since:t,span,horizon:14000+10000*a.ensureMood().random()};
  }else q.span=span;
  return a.explorationResidence;
 },
 plan(a,t,tools,localOnly=false){
  if(a.config.local_exploration===false||a.command||a.goal||a.motion||a.play||a.previewPose||a.toyHunt||a.social?.episode||a.paused||a.userHeld)return false;
  const q=this.observe(a,t);if(!q)return false;
  const mood=a.ensureMood(),r=()=>mood.random(),v=a.config.mood_behaviour?mood.values:{playfulness:.4,sleepiness:.35,alertness:.25};
  const residence=Math.max(0,Math.min(1,1-(t-q.since)/q.horizon)),s=a.support;
  const points=s.narrow?[]:tools.points(s).filter(p=>Number.isFinite(p.x)&&p.x>=s.min&&p.x<=s.max&&Math.abs(p.x-a.x)>=6*a.scale&&(!a.social?.corridor||a.social.corridor(s,p.x)));
  const choices=[{kind:'stay',weight:.25+.5*v.sleepiness+.4*residence}];
  if(points.length)choices.push({kind:'local',weight:.55+.6*residence});
  if(!localOnly)choices.push({kind:'leave',weight:.65+.4*v.alertness+.2*v.playfulness});
  const intent=tools.pick(choices,p=>p.weight*(window.pixelCatBehaviourV1?.choiceWeight(a,p.kind)??1),r).kind;
  const report={intent,surface:s.id,residenceMs:Math.max(0,Math.round(t-q.since)),preference:Number(residence.toFixed(2))};
  a.setAttribute?.('data-exploration',JSON.stringify(report));a.social?.log?.('exploration '+intent,report);
  if(intent==='leave')return false;
  a.noPathMessage='';a.urgency='relaxed';a.destinationId=s.id;
  if(intent==='stay'){
   const ms=3000+4000*r();a.route=[];a.deadline=t+(window.pixelCatBehaviourV1?.restWindow(a,ms)??ms);a.destinationPoint='observe';
  }else{
   const point=tools.pick(points,p=>(p.weight||1)*tools.weight(a.visits,s.id+'/'+p.id,t),r);
   a.destinationPoint=point.id;a.route=[{settle:true,surface:s,x:point.x}];a.deadline=0;
   window.pixelCatReactionsV1?.wander(a,false);
  }
  a.renderDebug?.();return true;
 }
};
window.pixelCatExplorationV1=catExploration;

window.pixelCatBehaviourRefinementsV1={
 apex(art,m,phase,config){
  if(m.jumpKind!=='ascend'||config.horizontal_apex===false||!art.acrossFlight?.frames.length||!m.jumpProfile?.flight)return null;
  m.horizontalApex??=Math.random()<.75;if(!m.horizontalApex)return null;
  const f=m.jumpProfile.flight,apex=-f.vy/f.gravity/f.seconds;
  if(phase<Math.max(.1,apex-.13))return null;
  const c=art.acrossFlight;return {rows:c.frames[0],origin:c.origins[0],sequenceId:c.sequenceId,assetFrame:0};
 },
 wiggle(a,p,t,art){
  if(p.stage==='wiggle'){p.stage='sneak';p.pose=null;return false;}
  if(p.stage!=='sneak'||p.wiggleChecked||!art.idleSequences?.wiggle)return false;
  p.wiggleChecked=true;if(a.ensureMood().random()>=.72)return false;
  p.stage='wiggle';p.pose='wiggle';p.waitUntil=t+600+600*a.ensureMood().random();a.deadline=p.waitUntil+1000;if(a.idle)a.idle.poseUntil=t;
  a.setAttribute('data-play-stage','wiggle');a.playHistory?.push('wiggle');return true;
 }
};

const nativeScratchCards=new WeakMap();let nativeScratchSerial=0;
window.pixelCatVerticalScratchV1={
 reconcile(a){
  window.pixelCatCardClimbV1?.reconcile(a);
  a.verticalFaces=[];a.verticalRejected=[];if(!a.config.native_vertical_surfaces&&!a.debug?.verticalSurfaces)return;const floors=(a.surfaces||[]).filter(s=>!s.home&&!s.bed&&!s.foodOwner&&s.el&&!s.narrow).sort((a,b)=>a.top-b.top);
  for(const {el,r}of a.verticalCardRects||[])for(const [side,x,direction]of [['left',r.left,1],['right',r.right,-1]]){
   if(r.bottom-r.top<17*a.scale)continue;let state=nativeScratchCards.get(el);if(!state){state=new WeakMap();nativeScratchCards.set(el,state);}
   let lo=0,hi=floors.length;while(lo<hi){const mid=(lo+hi)>>1;if(floors[mid].top<r.top+20*a.scale)lo=mid+1;else hi=mid;}
   for(let i=lo;i<floors.length&&floors[i].top<=r.bottom+3*a.scale;i++){const surface=floors[i];
    const origin=Math.round((x-(direction>0?18:5)*a.scale)/a.scale)*a.scale;
    if(origin<surface.min||origin>surface.max){if(a.debug?.verticalSurfaces)a.verticalRejected.push({x,top:r.top,bottom:r.bottom,reason:'no supported stance',surface});continue;}
    let supports=state.get(surface.el);if(!supports){supports=new Map();state.set(surface.el,supports);}const key=side+':'+surface.id.slice(surface.id.indexOf(':')+1);let prop=supports.get(key);
    if(!prop){prop={id:'native-edge-'+(++nativeScratchSerial),native:true,visualOwner:el,asset:{affordance:'scratch'},claimedBy:null,cooldownUntil:0};supports.set(key,prop);}
    a.verticalFaces.push({id:prop.id+':'+side,prop,surface,x,top:Math.max(r.top,surface.top-20*a.scale),bottom:Math.min(r.bottom,surface.top-3*a.scale),direction,origin,bearing:x-direction*9*a.scale,source:'native card edge · opt-in'});
   }
  }
 },
 publish(layer){if(!layer.actor.config.native_vertical_surfaces)return;for(const f of layer.actor.verticalFaces||[])if(f.prop.visualOwner.isConnected!==false)layer.world.props.set(f.prop.id,{id:f.prop.id,kind:'vertical-face',x:f.x,y:f.bottom,width:2,height:f.bottom-f.top,surface:f.surface.el,top:f.surface.top,moving:false,at:layer.world.clock});},
 stats(layer,key){const q=layer.scratchStats??={};q[key]=(q[key]||0)+1;layer.actor.setAttribute?.('data-scratch-stats',JSON.stringify(q));},
 bind(p,members,root){
  const n=p.node;n.dataset.catPost='';n.setAttribute('role','button');n.setAttribute('tabindex','0');n.setAttribute('aria-label','Invite a nearby cat to scratch');n.style.pointerEvents='auto';n.style.cursor='pointer';
  const offer=e=>{e.stopPropagation();this.invite(p,members(),p.homeOwner?.root??root,performance.now());};
  n.addEventListener?.('pointerdown',e=>e.stopPropagation());n.addEventListener?.('click',offer);
  n.addEventListener?.('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' ')){e.preventDefault();offer(e);}});
 },
 invite(p,members,root,t){
  if(t<(p.inviteAfter||0))return false;p.inviteAfter=t+4000;
  const choices=[];
  for(const a of new Set(members)){
   if(a.root!==root||!a.isConnected||!a.active||a.idle?.pose==='sleep'||!a.config.social_behaviour||!a.config.interaction_behaviour)continue;
   const layer=a.decisionLayer?.();if(!layer?.enabled()||!layer.available(a)||layer.episode||layer.scene.has(a))continue;
   const face=this.faces(layer).filter(f=>f.prop===p).sort((f,g)=>Math.abs(f.origin-a.x)-Math.abs(g.origin-a.x))[0];if(!face)continue;
   const distance=Math.hypot(face.x-(a.x+12*a.scale),face.surface.top-a.y);if(distance<=96*a.scale)choices.push({a,layer,face,distance});
  }
  choices.sort((a,b)=>a.distance-b.distance);
  for(const {a,layer,face}of choices){const mood=a.ensureMood();if(mood.random()>=.8*(1-.65*(mood.values?.sleepiness??.5)))continue;
   if(this.start(layer,face,t)){p.node.dataset.scratchResponse='accepted';layer.log('scratch invitation accepted',{post:p.id});return a;}
  }
  p.node.dataset.scratchResponse='no nearby willing cat';return false;
 },
 faces(layer,routed=true,includeBusy=false){const a=layer.actor,scene=a.propScene,out=[],entries=[...(scene?.enabled?scene.props:[]).map(prop=>({prop})),...window.pixelCatHomePostsV1?.entries(layer)||[]];
  for(const entry of entries){const p=entry.prop;if(p.asset.affordance!=='scratch'||!includeBusy&&(p.claimedBy||p.cooldownUntil>(p.homeOwner?layer.world.clock:scene?.time||0)))continue;const s=entry.surface||a.surfaces.find(s=>s.el===p.surfaceEl&&s.id.slice(s.id.indexOf(':'))===p.surfaceSuffix);
   if(!s||s.narrow||routed&&(!a.pathTo(s)||!a.pathTo(a.home,s))||p.asset.height*p.scale<(p.igloo?10:18)*a.scale)continue;
   const padding=Math.max(4*p.scale,p.asset.width*p.scale/2),left=entry.left??s.left+padding+(s.right-s.left-2*padding)*p.u-p.asset.width*p.scale/2;
   for(const [side,cell,direction]of (p.scratchFaces||[['left',4,1],['right',8,-1]])){const x=left+cell*p.scale,origin=Math.round((x-(direction>0?18:5)*a.scale)/a.scale)*a.scale;
    if(origin>=s.min&&origin<=s.max&&(!routed||layer.clear(s,origin,p.igloo?window.pixelCatHomeLifeV1.occupants(p.homeOwner):[])&&(!a.support||a.support.el!==s.el||layer.corridor(s,origin,p.igloo?window.pixelCatHomeLifeV1.occupants(p.homeOwner):[]))))out.push({id:p.id+':'+side,prop:p,surface:s,x,top:s.top-(p.igloo?13:20)*p.scale,bottom:s.top-3*p.scale,direction,origin,bearing:x-direction*9*a.scale,source:'authored post face'});
   }
  }
  if(a.config.native_vertical_surfaces)for(const f of a.verticalFaces||[]){const p=f.prop;if(!includeBusy&&(p.claimedBy||p.cooldownUntil>layer.world.clock)||p.visualOwner.isConnected===false)continue;if(!routed||a.pathTo(f.surface)&&a.pathTo(a.home,f.surface)&&layer.clear(f.surface,f.origin)&&(!a.support||a.support.el!==f.surface.el||layer.corridor(f.surface,f.origin)))out.push(f);}
  return out;
 },
 decide(layer,t,art){const a=layer.actor;if(!layer.enabled()||!a.config.social_behaviour||a.idle?.pose==='sleep'&&a.idle.poseUntil>t||!layer.available(a)||layer.episode||!art.idleSequences?.postScratch||layer.clock<(layer.nextVertical||0))return false;
  const r=()=>a.ensureMood().random();layer.nextVertical=layer.clock+8000+7000*r();this.stats(layer,'checks');
  const faces=this.faces(layer).filter(f=>{if(f.prop.igloo)return false;const m=layer.propMemory.get(f.prop.id);return m&&layer.clock-m.observedAt<1800;});if(!faces.length)return false;this.stats(layer,'noticedOpportunities');if(r()>.22)return false;this.stats(layer,'chosen');
  return this.start(layer,faces[Math.floor(r()*faces.length)],t);
 },
 start(layer,face,t){const a=layer.actor,path=a.pathTo(face.surface);if(!path||!layer.available(a)||layer.episode||face.prop.claimedBy||!layer.clear(face.surface,face.origin,face.prop.igloo?window.pixelCatHomeLifeV1.occupants(face.prop.homeOwner):[]))return false;
  face.prop.claimedBy=a.ownerKey;const ep={kind:'vertical-scratch',interaction:true,initiator:a,participants:[a],registry:layer.scene,faceId:face.id,prop:face.prop,surface:face.surface,offset:face.origin-face.surface.left,stage:'approach',expires:layer.clock+30000};
  layer.episode=ep;layer.scene.set(a,ep);a.route=[...path,{settle:true,surface:face.surface,x:face.origin}];a.destinationId=face.surface.id;a.urgency='relaxed';a.deadline=t+30000;layer.log('scratch face approach',{face:face.id});return true;
 },
 advance(layer,t){const a=layer.actor,ep=layer.episode,p=ep.prop;
  const present=p?.native?a.config.native_vertical_surfaces&&(a.verticalFaces||[]).some(f=>f.prop===p)&&p.visualOwner.isConnected!==false:p?.homeOwner?window.pixelCatHomePostsV1?.entries(layer).some(e=>e.prop===p):a.propScene?.props.includes(p);
  if(!layer.enabled()||!p||p.claimedBy!==a.ownerKey||!present||a.goal||a.command||a.previewPose||a.play||a.mouthAction||a.userHeld||layer.clock>=ep.expires){layer.finish('scratch interrupted or finished');return;}
  if(a.motion||a.route?.length)return;
  const held=p.claimedBy;p.claimedBy=null;const face=this.faces(layer,false).find(f=>f.id===ep.faceId);p.claimedBy=held;
  if(!face){layer.finish('scratch face no longer reachable');return;}
  ep.surface=face.surface;ep.offset=face.origin-face.surface.left;ep.bearing=face.bearing;
  const frame=layer.frame;if(ep.stage==='stroke'&&a.idle?.pose==='postScratch'&&frame?.rows&&frame.placement&&ep.contactFrame!==a.getAttribute?.('data-frame')){ep.contactFrame=a.getAttribute?.('data-frame');const hit=frame.rows.some((row,y)=>y<22&&[...row].some((cell,x)=>cell==='F'&&Math.abs(frame.placement.x+(frame.facing<0?23-x:x)*a.scale-face.x)<=2*a.scale&&frame.placement.top+y*a.scale>=face.top-2*a.scale&&frame.placement.top+y*a.scale<=face.bottom+2*a.scale));if(hit){ep.contacts=(ep.contacts||0)+1;this.stats(layer,'contacts');const index=Number(a.getAttribute('data-frame').split('-').at(-1))-1,clip=layer.art?.().idleSequences?.postScratch,event=clip?.animationTracks?.tracks.find(x=>x.id===clip.animationTracks.driver)?.events?.find(e=>e.frameId===clip.frameIds[index]);if(event){const point={x:frame.placement.x+((frame.facing<0?23-event.x:event.x)+.5)*a.scale,y:frame.placement.top+(event.y+.5)*a.scale};window.pixelCatEffectsV1?.stroke(layer,face,point,index,t);}}}
  if(layer.clock>=(ep.clearAt||0)){ep.clearAt=layer.clock+500;if(!layer.clear(face.surface,face.origin,face.prop.igloo?window.pixelCatHomeLifeV1.occupants(face.prop.homeOwner):[])){layer.finish('scratch stance occupied');return;}}
  if(a.support.el!==face.surface.el||Math.abs(a.support.top-face.surface.top)>2||Math.abs(a.x-face.origin)>5*a.scale){layer.finish('scratch route ended elsewhere');return;}
  if(ep.stage==='approach'){ep.stage='stroke';ep.expires=layer.clock+6200;a.facing=face.direction;a.idle=null;a.deadline=t+6200;this.stats(layer,'strokes');layer.log(p.native?'scratching card edge':'scratching post',{face:face.id});}
 },
 prepare(layer,idle){if(layer.episode?.kind==='vertical-scratch'&&idle.pose==='postScratch')idle.contactX=layer.episode.bearing;},
 release(layer){const ep=layer.episode,p=ep.prop;window.pixelCatEffectsV1?.resetPost(p);if(ep.stage==='stroke')this.stats(layer,layer.clock>=ep.expires&&ep.contacts?'completed':'interrupted');if(p?.claimedBy===layer.actor.ownerKey){p.claimedBy=null;p.cooldownUntil=(p.homeOwner||p.native?layer.world.clock:layer.actor.propScene?.time||0)+60000+60000*layer.actor.ensureMood().random();}layer.nextVertical=layer.clock+45000;}
};

window.pixelCatShelfAmbushV1={
 options(layer){const a=layer.actor;if(!layer.enabled()||!a.config.social_behaviour||!layer.available(a)||layer.episode||a.support?.home||a.support?.narrow)return [];const out=[];
  const add=(target,m,prop)=>{if(!m||layer.clock-(prop?m.observedAt:m.at)>500)return;const surface=a.surfaces.find(s=>s.el===m.surface&&Math.abs(s.top-(prop?m.top:m.surfaceTop))<2&&!s.home&&!s.narrow),drop=surface&&surface.top-a.support.top;
   if(!surface||surface.id===a.support.id||surface.el===a.support.el&&Math.abs(drop)<2||drop< -4*a.scale||drop>8*a.scale||!a.reachable(a.support,surface)||!a.pathTo(a.home,surface))return;
   const dir=Math.sign((prop?m.x:m.x+12*m.scale)-(a.x+12*a.scale))||a.facing,x=Math.round((prop?m.x-a.toyPaw(dir)*a.scale:m.x-dir*(24*Math.max(a.scale,m.scale)+4*Math.max(a.scale,m.scale)))/a.scale)*a.scale;
   if(Math.abs(x-a.x)<8*a.scale||Math.abs(x-a.x)>60*a.scale||!layer.clear(surface,x,prop?[]:[target]))return;
   const sneak=Math.max(a.support.min,Math.min(a.support.max,a.x+dir*8*a.scale));if(Math.abs(sneak-a.x)<2*a.scale||!layer.corridor(a.support,sneak))return;
   out.push({target,observed:{...m},surface,x,sneak,direction:dir,prop:!!prop});
  };
  for(const m of layer.memory.values()){const b=layer.peers().find(b=>b.ownerKey===m.id);if(!b||!layer.visible?.has(m.id)||!layer.available(b)||layer.scene.has(b)||!b.config.interaction_behaviour||!layer.world.ready(a,b))continue;add(b,m,false);}
  for(const m of layer.propMemory.values()){const p=a.propScene?.props.find(p=>p.id===m.id);if(!p||!['ball','toy_mouse'].includes(p.asset.id)||p.claimedBy||p.carrier||m.falling||p.cooldownUntil>a.propScene.time)continue;if(p.asset.id==='toy_mouse'&&(m.moving||m.direction!==Math.sign(m.x-(a.x+12*a.scale))))continue;add(p,m,true);}
  return out;
 },
 decide(layer,t){if(layer.clock<(layer.nextShelf||0))return false;layer.nextShelf=layer.clock+15000;const a=layer.actor,r=()=>a.ensureMood().random();if(r()>(.04+.12*a.ensureMood().values.playfulness)*(1-.7*a.ensureMood().values.sleepiness))return false;const options=this.options(layer);return options.length?this.start(layer,options[Math.floor(r()*options.length)],t):false;},
 start(layer,o,t){const a=layer.actor;if(!this.options(layer).some(p=>p.target===o.target))return false;const ep={...o,kind:'shelf-ambush',interaction:true,initiator:a,participants:o.prop?[a]:[a,o.target],registry:layer.scene,stage:'sneak',expires:layer.clock+14000};
  layer.episode=ep;layer.scene.set(a,ep);if(o.prop)o.target.claimedBy=a.ownerKey;else{layer.scene.set(o.target,ep);layer.world.cool(a,o.target);}a.facing=o.direction;a.urgency='relaxed';a.deadline=t+15000;a.moveTo(o.sneak,a.support.top,0,'walk',a.support,t,'sneak');layer.log('small-drop stalk',{target:o.prop?o.target.id:o.target.ownerKey});return true;
 },
 advance(layer,t,art){const a=layer.actor,ep=layer.episode,b=ep.target;
  if(!layer.enabled()||a.goal||a.command||a.previewPose||a.userHeld||a.play||a.mouthAction||layer.clock>=ep.expires||!a.active||a.paused||a.suspended){layer.finish('small-drop interrupted');return;}
  if(ep.prop?(!a.propScene?.props.includes(b)||b.claimedBy!==a.ownerKey):(!b.active||!layer.peers().includes(b)||ep.stage!=='land'&&!layer.available(b))){layer.finish('small-drop target removed or busy');return;}
  if(a.motion)return;
  if(ep.stage==='land'){
   if(ep.prop){const f=layer.frame;if(!f?.placement){layer.finish('small-drop contact unknown');return;}const c=art.leapAnchors[ep.jumpKind].at(-1).point,point={x:f.placement.x+((a.facing>0?c[0]:23-c[0])+.5)*a.scale,y:f.placement.top+(c[1]+.5)*a.scale};
    const hit=b.asset.id==='ball'?a.propScene.strikeBall(b.id,a.ownerKey,point,a.facing,.2):a.propScene.touchMouse(b.id,a.ownerKey,point,a.scale);layer.log(hit?'small-drop toy contact':'small-drop toy miss',{target:b.id});if(hit&&a.ensureMood().random()<.45)window.pixelCatMouthV1?.attach(a,b,t,art,true);
   }else if(a.support.el===b.support?.el&&Math.abs(a.y-b.y)<2&&Math.abs(a.x-b.x)<=34*Math.max(a.scale,b.scale)){layer.socialCue(ep,b,{x:a.x+12*a.scale,y:a.y},t,'Nearby play landing');return;}
   layer.finish('small-drop landed');a.deadline=t+2000;return;
  }
  const m=ep.prop?layer.propMemory.get(b.id):layer.memory.get(b.ownerKey);if(!m||layer.clock-(ep.prop?m.observedAt:m.at)>600||Math.abs(m.x-ep.observed.x)>4*a.scale){layer.finish('small-drop observation lost');return;}
  const s=a.surfaces.find(s=>s.id===ep.surface.id&&s.el===ep.surface.el);if(!s||s.top-a.support.top>8*a.scale||s.top-a.support.top< -4*a.scale){layer.finish('local-pounce support changed');return;}ep.x+=s.left-ep.surface.left;ep.surface=s;
  if(ep.stage==='sneak'&&art.idleSequences?.wiggle&&a.ensureMood().random()<.72){ep.stage='wiggle';ep.wait=layer.clock+600+500*a.ensureMood().random();a.idle=null;return;}
  if(ep.stage==='wiggle'&&layer.clock<ep.wait)return;
  if(!layer.clear(s,ep.x,ep.prop?[]:[b])||a.moveTo(ep.x,s.top,0,'jump',s,t)===false){layer.finish('small-drop landing unsafe');return;}ep.stage='land';ep.jumpKind=a.motion.jumpKind;layer.log('small-drop pounce committed',{target:ep.prop?b.id:b.ownerKey});
 },
 release(layer){const ep=layer.episode;if(ep.prop&&!ep.target.carrier&&ep.target.claimedBy===layer.actor.ownerKey){ep.target.claimedBy=null;ep.target.cooldownUntil=(layer.actor.propScene?.time||0)+30000;}layer.nextShelf=layer.clock+30000;}
};

})();
window.pixelCatRoamingExtensionsV1 = {"idleSequences":{"wiggle":{"sequenceId":"1e7741cb-f178-4c6e-916c-ef23f2ebd934","frames":[["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......######.......#...","...############...####..",".######################.",".##..###################",".##..###################","##..###################.","#..######.########......","...##..#....##..#.......","...R...#R....#R..#R....."],["........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................","........................",".......#####............","...##########.......#...",".##############...####..",".##..##################.",".##..###################","##..####################","##.######.#############.","...#####....######......","...#...#....##..#.......","...R...#R....#R..#R....."]],"durations":[150,150],"roles":["cycle","cycle"],"origins":["human","human"],"anchors":[null,null],"loop":true,"behaviourPolicy":{"category":"locomotion","tags":[],"lifeStages":["kitten","adult","senior"]}},"postScratch":{"sequenceId":"proposal-scratching-post-tracks","frames":[["........................","........................","........................","........................","........................","........................","..##....................","..#.....................","..#.....................","..#.....................","..##.............#.#....","...##............###....","...##...........#####...","....##.######..#######..","....##################..","....#################...","....###############.....","...###############......","...###############......","...######...#####.......","..######.....####.......","..##.##.....###.#.......","..#..##.....##..#.......","..#R..#R....R...#R......"],["........................","........................","........................","........................","........................","........................","........................",".#..............#.#.....",".##.............###.....","..#.........########....","..##.......##########...","...##...#############...","...##..#############....","....##############......","....############........","....############........","....#########.##........","...#########...##.......","...#########...###F.....","...########.....##F.....","..####.###..............","..###..###..............","..#....##...............","..#R....#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","............#######.....","............######......","..###......#####........",".##.##.....#####........",".#...##...######........",".....##.########........","......#########.#.......","......#########.##F.....","......########..........","......#######...........",".....#######............",".....#######............",".....#####..............","....#####...............","....##.##...............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","............#######.....","............######......","...........#####........","...###.....#####........","...#.##...######........","...#.##...######........","......##.########.......","......#########.##F.....","......########..........","......########..........",".....########...........",".....########...........",".....#######............","....######..............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","............#######.....","............######......","..###......#####........",".##.##.....#######F.....",".....##...######........",".....##..#######........","......##.########.......","......#########.##F.....","......########..........","......########..........",".....########...........",".....########...........",".....#######............","....#######.............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","..#.........#######.....","..###.......######......","....#......#####........","....##.....#####........",".....##...######........",".....##..#########F.....","......##.########.......","......#########.##F.....","......########..........","......########..........",".....########...........",".....########...........",".....#######............","....#######.............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","....##......#######.....","....#.......#######.....","....#.......######......","....#......#####........","....##.....#####........",".....##...######........",".....##..#########F.....","......##.########.......","......############F.....","......########..........","......########..........",".....########...........",".....########...........",".....#######............","....#######.............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","............#######.....",".....#......######......","....#.#....#####........","....##.....#######F.....",".....##...######........",".....##..#######........","......##.########.......","......############F.....","......########..........","......########..........",".....########...........",".....########...........",".....#######............","....#######.............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","............#######.....",".....##.....######......","....#.##...#####........","....#..#...#####........","....#.....######........","....###..#######........","......##.########.......","......############F.....","......########..........","......########..........",".....########...........",".....#######............",".....######.............","....######..............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","............#######.....","......#.....#######.....",".....##.....######......","....##.....#####........","....#......#######F.....","....##....######........","....###..#########F.....","......##.######.........","......#########.........","......########..........","......########..........",".....########...........",".....#######............",".....######.............","....######..............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","..............#.#.......","..............###.......",".............#####......","....##......#######.....","....#.......#######.....","....#.......######......","....#......#####........","....##.....#######F.....",".....##...######........",".....##..#########F.....","......##.######.........","......#########.........","......########..........","......########..........",".....########...........",".....#######............",".....######.............","....######..............","....##.###..............","....#..##...............","....#R..#R.............."],["........................","........................","........................","........................","........................","........................","........................","...##...........#.#.....","...#............###.....","...#........########....","...##......##########...","....##.....##########...","....##....##########....",".....##..#########......",".....###########........",".....###########........",".....###########........","....##########.##.......","....########...###F.....","....#######.....##F.....","...#######..............","...##.###...............","...#..##................","...#R..#R..............."],["........................","........................","........................","........................","........................","........................","..##....................","..#.....................","..#.....................","..#.....................","..##.............#.#....","...##............###....","...##...........#####...","....##.######..#######..","....##################..","....#################...","....###############.....","...###############......","...###############......","...######...#####.......","..######.....####.......","..##.##.....###.#.......","..#..##.....##..#.......","..#R..#R....R...#R......"]],"durations":[400,200,160,110,110,110,110,110,110,110,110,220,400],"roles":["enter","enter","enter","cycle","cycle","cycle","cycle","cycle","cycle","cycle","cycle","exit","exit"],"origins":["human","mixed","mixed","mixed","mixed","mixed","mixed","mixed","mixed","mixed","mixed","mixed","human"],"anchors":[[7,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[8,23],[7,23]],"loop":true,"gazes":[{"x":19,"y":13,"angle":-2,"fov":106,"canSee":true},{"x":18,"y":10,"angle":-2,"fov":49,"canSee":true},{"x":16,"y":5,"angle":-2,"fov":49,"canSee":true},{"x":16,"y":5,"angle":-2,"fov":49,"canSee":true},{"x":16,"y":5,"angle":-2,"fov":49,"canSee":true},{"x":16,"y":5,"angle":-2,"fov":49,"canSee":true},{"x":16,"y":5,"angle":22,"fov":49,"canSee":true},{"x":16,"y":5,"angle":27,"fov":49,"canSee":true},{"x":16,"y":5,"angle":24,"fov":49,"canSee":true},{"x":16,"y":5,"angle":27,"fov":49,"canSee":true},{"x":16,"y":5,"angle":10,"fov":49,"canSee":true},{"x":18,"y":10,"angle":-2,"fov":49,"canSee":true},{"x":19,"y":13,"angle":-2,"fov":49,"canSee":true}],"frameIds":["track-frame-0","track-frame-1","track-frame-2","track-frame-3","track-frame-4","track-frame-5","track-frame-6","track-frame-7","track-frame-8","track-frame-9","track-frame-10","track-frame-11","track-frame-12"],"animationTracks":{"version":1,"driver":"arms","tracks":[{"id":"arms","name":"Arms / body · contact driver","events":[{"frameId":"track-frame-5","name":"upper-paw-down","x":18,"y":12},{"frameId":"track-frame-8","name":"lower-paw-down","x":18,"y":14}]},{"id":"tail","name":"Tail","mask":[170,171,172,173,174,175,176,194,195,196,197,198,199,200,218,219,220,221,222,223,224,242,243,244,245,246,247,248,266,267,268,269,270,271,272,290,291,292,293,294,295,296,314,315,316,317,318,319,320],"frameIds":["track-frame-3","track-frame-4","track-frame-5","track-frame-6","track-frame-7","track-frame-8","track-frame-9","track-frame-10"],"holds":[210,300,230,190,270,330,220,260],"rateMin":0.8,"rateMax":1.2,"source":{"actor":"ai","kind":"mechanical-region-extraction","versionHash":"dbeac4f74a79b39373b5faff5eb81f6cd435a366be0949c432da17f71d28aa5f"}}]},"versionHash":"e0766dd95302d68c2dc374c70544d8720b4acdf9672bfb23a40441fbbd419e85","behaviourPolicy":{"category":"interaction","tags":[],"lifeStages":["kitten","adult","senior"]}}},"dashboardProps":[{"id":"scratching_post","name":"Scratching post · rope","description":"Upright rope post with a bevelled wooden base, sized against the 24×24 cat. AI proposal awaiting human refinement/approval.","behaviourNotes":"Ground = bottom of the 23-pixel asset. Place at cat-grid (14,1) for the linked scratching draft. Left rope face is asset x=4 (scene x=18), approximately y=3..19. Cat keeps rear feet planted and alternates downward strokes. Future scratch affordance: stationary/non-carryable; optional worn/frayed states later. No runtime behaviour is installed.","tags":["ai-draft","scratching","post"],"familyId":"scratching-post","stateKey":"new","stateKind":"condition","width":12,"height":23,"pixels":[[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,"#c88a4b","#c88a4b","#c88a4b","#c88a4b",null,null,null,null],[null,null,null,null,"#a86635","#a86635","#a86635","#a86635",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#ad9564","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#ad9564","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#ad9564","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#ad9564","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#ad9564","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#ad9564","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#ad9564","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#ad9564","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#ad9564","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#ad9564","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#c4ad7b","#ad9564","#e5d6aa",null,null,null,null],[null,null,null,null,"#887449","#ad9564","#c4ad7b","#e5d6aa",null,null,null,null],[null,null,"#a86635","#a86635","#a86635","#a86635","#a86635","#a86635","#a86635","#a86635",null,null],[null,"#c88a4b","#c88a4b","#c88a4b","#c88a4b","#c88a4b","#c88a4b","#c88a4b","#c88a4b","#c88a4b","#c88a4b",null],[null,"#6e4328","#6e4328","#6e4328","#6e4328","#6e4328","#6e4328","#6e4328","#6e4328","#6e4328","#6e4328",null]],"origin":"mixed","review":"candidate","revision":3,"source":{"proposal":"scratching-post-draft-2026-10-16"},"operations":[{"actor":"ai","kind":"candidate","at":"2026-10-16T18:16:35.576Z"},{"actor":"human","kind":"edit","at":"2026-10-17T14:49:11.942Z"},{"actor":"human","kind":"edit","at":"2026-10-17T14:49:29.069Z"}],"mouthCarryable":false,"colourVariants":{"version":1,"origin":"ai","review":"candidate","sourceRevision":1,"notes":"Draft palette interpretation; original pixels and catalogue identity are unchanged. Review material/functional colours before runtime use.","themes":[{"id":"quiet","name":"Quiet neutrals","variants":[{"name":"Option 1","colours":{"#6e4328":"#4b453d","#887449":"#696055","#a86635":"#6f655a","#ad9564":"#897d6f","#c4ad7b":"#a09282","#c88a4b":"#8a7e70","#e5d6aa":"#c8b7a2"}},{"name":"Option 2","colours":{"#6e4328":"#484b49","#887449":"#646866","#a86635":"#6a6e6c","#ad9564":"#838885","#c4ad7b":"#999f9c","#c88a4b":"#848986","#e5d6aa":"#c0c7c3"}}]},{"id":"colourful","name":"Colourful","variants":[{"name":"Option 1","colours":{"#6e4328":"#14274b","#887449":"#1b3669","#a86635":"#1d396f","#ad9564":"#244789","#c4ad7b":"#2a53a0","#c88a4b":"#244789","#e5d6aa":"#3467c8"}},{"name":"Option 2","colours":{"#6e4328":"#124b44","#887449":"#19695e","#a86635":"#1a6f64","#ad9564":"#20897b","#c4ad7b":"#26a090","#c88a4b":"#218a7c","#e5d6aa":"#2fc8b4"}}]},{"id":"pastel","name":"Soft pastels","variants":[{"name":"Option 1","colours":{"#6e4328":"#40384b","#887449":"#5a4e69","#a86635":"#5f526f","#ad9564":"#756689","#c4ad7b":"#8977a0","#c88a4b":"#76668a","#e5d6aa":"#ab95c8"}},{"name":"Option 2","colours":{"#6e4328":"#384b44","#887449":"#4e695f","#a86635":"#526f65","#ad9564":"#66897d","#c4ad7b":"#77a092","#c88a4b":"#668a7e","#e5d6aa":"#94c8b6"}}]},{"id":"monochrome","name":"Greyscale","variants":[{"name":"Option 1","colours":{"#6e4328":"#4b4b4b","#887449":"#696969","#a86635":"#6f6f6f","#ad9564":"#898989","#c4ad7b":"#a0a0a0","#c88a4b":"#8a8a8a","#e5d6aa":"#c8c8c8"}},{"name":"Option 2","colours":{"#6e4328":"#343434","#887449":"#505050","#a86635":"#565656","#ad9564":"#717171","#c4ad7b":"#8b8b8b","#c88a4b":"#727272","#e5d6aa":"#b9b9b9"}}]},{"id":"pink","name":"All pink","variants":[{"name":"Option 1","colours":{"#6e4328":"#4b323d","#887449":"#694655","#a86635":"#6f4959","#ad9564":"#885b6e","#c4ad7b":"#a06a81","#c88a4b":"#895b6f","#e5d6aa":"#c885a1"}},{"name":"Option 2","colours":{"#6e4328":"#4b2939","#887449":"#69394f","#a86635":"#6f3d54","#ad9564":"#894b67","#c4ad7b":"#a05879","#c88a4b":"#8a4b68","#e5d6aa":"#c86d97"}}]},{"id":"natural","name":"Natural materials","variants":[{"name":"Option 1","colours":{"#6e4328":"#444b30","#887449":"#5f6843","#a86635":"#656e47","#ad9564":"#7c8857","#c4ad7b":"#91a066","#c88a4b":"#7d8958","#e5d6aa":"#b6c780"}},{"name":"Option 2","colours":{"#6e4328":"#4b3e2c","#887449":"#69573e","#a86635":"#6f5c41","#ad9564":"#897151","#c4ad7b":"#a0855e","#c88a4b":"#8a7251","#e5d6aa":"#c8a676"}}]}]},"updatedAt":"2026-10-17T14:49:29.069Z","versionHash":"99334bf77e523fcc7fe20897f36a299caab6e7815cdf511fcb1816c2310b0f88","sourceAssetId":"proposal-scratching-post-rope","sourceRevision":3,"affordance":"scratch"}]};
