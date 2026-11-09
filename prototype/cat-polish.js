// Playback policy and creation defaults; saved artwork stays immutable.
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
 // One full authored stride travels five cells. Head height follows speed
 // at stride boundaries, so changing posture never changes planted feet.
 while(offset<cells||!result.length){const variant=Math.min(2,(start.variant||0)+Math.floor(Math.floor(result.length/8)*5/Math.max(5,cells/3))),speed=[8,5,3][variant],advance=art.sneakAdvances[frame];offset=Math.min(cells,offset+advance);time+=1000*5/(8*speed);result.push({offset,frame,variant,until:time});frame=(frame+1)%8;if(result.length>2048)throw Error('Sneak distance exceeds limit.');}
 return result;
},
 names:["Alfie","Archie","Arthur","Atlas","Bagel","Bailey","Basil","Beans","Bear","Beau","Bella","Benny","Bertie","Biscuit","Blue","Bob","Bonnie","Boots","Bowie","Bruno","Buddy","Buster","Butter","Butters","Buttons","Callie","Casper","Cedar","Charlie","Chester","Chili","Chloe","Cleo","Clover","Coco","Comet","Cookie","Cooper","Cosmo","Cricket","Daisy","Darcy","Dash","Dexter","Domino","Dora","Dot","Dottie","Duke","Dusty","Echo","Eddie","Edith","Effie","Elvis","Ember","Ernie","Esme","Evie","Felix","Fern","Fig","Finn","Flora","Floyd","Frankie","Freya","Fudge","George","Gigi","Ginger","Gizmo","Goldie","Goose","Grace","Gus","Hazel","Hector","Henry","Hobbes","Holly","Honey","Hugo","Indie","Iris","Ivy","Izzy","Jack","Jasper","Jax","Jelly","Jess","Jet","Jinx","Joey","Josie","Jude","Juno","Kiki","Kit","Kiwi","Klaus","Kobe","Koda","Leo","Loki","Lola","Lottie","Louie","Luca","Lucky","Lucy","Luna","Mabel","Maisie","Mango","Maple","Marley","Marmalade","Matilda","Max","Merlin","Merry","Midge","Midnight","Mika","Milo","Mimi","Minnie","Minty","Miso","Misty","Mittens","Mochi","Molly","Monty","Moose","Mouse","Muffin","Murphy","Myrtle","Nacho","Nell","Nelly","Neo","Nico","Noodle","Nori","Nova","Olive","Ollie","Opal","Oreo","Orla","Oscar","Otis","Otto","Pablo","Pancake","Panda","Parsley","Patch","Peach","Peanut","Pebble","Penny","Pepper","Percy","Pickle","Pip","Pippa","Pixel","Plum","Poppy","Porridge","Pumpkin","Queenie","Quinn","Raisin","Ralph","Raven","Remy","Rex","Riley","River","Robin","Rocket","Rocky","Roo","Rory","Rosie","Rowan","Ruby","Rufus","Rusty","Sage","Salem","Sam","Sassy","Scout"],
 name(random=Math.random){const used=new Set((window.pixelCatPrimaryV1?.current?.()||[]).map(a=>a.config.name)),pool=this.names.filter(n=>!used.has(n)),choices=pool.length?pool:this.names;return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];},
 hold(pose,clip,i,rate=1){if(pose==='loaf'&&clip.roles?.[i]==='cycle')return (i===clip.roles.indexOf('cycle')?8000:1200)*rate;return clip.durations[i]*rate*(pose==='scratch'&&clip.roles?.[i]==='cycle'?this.scratchCycleMs/180:1);},
 departureAnchor(old,art){if(old.pose!=='backRoll'||!old.anchor)return null;const clip=art.idleSequences.backRoll,offset=clip.frames[0][23].lastIndexOf('R')-clip.anchors[0][0];return [old.anchor[0]+offset,old.anchor[1]];},
 // Only replay exit frames that have not already been shown by idleSample.
 alertExit(art,old,config={},now=0){
  const clip=art.idleSequences.alertLying,rate=Math.max(80,Number(config.idle_frame_ms)||250)/250,indices=clip.roles.flatMap((r,i)=>r==='exit'?[i]:[]),current=clip.frames.indexOf(old?.rows),frames=[],holds=[];
  let remaining=indices.reduce((n,i)=>n+clip.durations[i]*rate,0);
  for(const i of indices){const hold=clip.durations[i]*rate,end=Number(old?.poseUntil)-remaining+hold;remaining-=hold;if(indices.includes(current)&&(i<current||end<=now))continue;frames.push(clip.frames[i]);holds.push(indices.includes(current)&&i===current?Math.min(hold,Math.max(0,end-now)):hold);}
  frames.holds=holds;return frames;
 },
 bridgeDuration(frames,config={}){return frames.holds?.reduce((n,h)=>n+h,0)??frames.length*Math.max(80,Number(config.idle_frame_ms)||250);},
 bridgeSample(frames,elapsed,beat){let frame=0;while(frame<frames.length-1&&elapsed>=(frames.holds?.[frame]??beat)){elapsed-=frames.holds?.[frame]??beat;frame++;}return {rows:frames[frame],frame};},
 turnFeet(rows,facing){
  const row=rows.findLast(line=>line.includes('R'))||rows.findLast(line=>/[^.]/.test(line));
  const cells=[...row].flatMap((cell,x)=>(row.includes('R')?cell==='R':cell!=='.')?[x]:[]);
  const center=(cells[0]+cells.at(-1)+1)/2;
  return facing<0?24-center:center;
 },
 turnFrames(art,facing,holds=[70,110,130,100,100]){
  const [stand,down,before,after,up]=holds,bridge=art.bridges.walkToSit,sit=art.idleSequences.sit.frames[0];
  return [[art.stand,facing,stand],...bridge.map(rows=>[rows,facing,down]),[sit,facing,before],[sit,-facing,after],...[...bridge].reverse().map(rows=>[rows,-facing,up]),[art.stand,-facing,stand]];
 },
 turnaround(a,art,x,y,target,facing,walkFrame){
  const onFoot=a.idle?a.idle.pose==='stand':a.getAttribute?.('data-frame')?.startsWith('walk-');
  if(!onFoot||facing===a.facing||!['relaxed','casual'].includes(a.urgency)||a.command||a.goal||a.play||a.toyHunt||a.social?.episode||a.mouthAction||a.carriedToy||a.previewPose||a.userHeld||a.bedEntry||a.bedInside||a.support?.narrow||a.support?.bed||target?.id!==a.support?.id||y!==a.y||!a.drawnRows)return null;
  const s=a.scale,bearing=a.x+this.turnFeet(a.drawnRows,a.facing)*s;
  const poses=this.turnFrames(art,a.facing);
  const start=Math.round((bearing-this.turnFeet(walkFrame,facing)*s)/s)*s;
  if((x-start)*facing<s||start<target.min||start>target.max||poses.some(([rows,direction])=>{const origin=bearing-this.turnFeet(rows,direction)*s;return origin<target.min||origin>target.max;}))return null;
  const frames=poses.map(([rows])=>rows);frames.holds=poses.map(([, ,hold])=>hold);
  return {start,frames,bearing,facings:poses.map(([,direction])=>direction),total:frames.holds.reduce((sum,hold)=>sum+hold,0)};
 },
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
 departure(a,t,contact,idleContact){const m=a.motion,d=m?.departure;if(!d)return false;if(t>=m.start){if(d.facings)a.facing=m.direction;delete m.departure;return false;}const frame=this.bridgeSample(d.frames,Math.max(0,t-(m.start-d.total)),d.beat).frame,rows=d.frames[frame];if(d.facings)a.facing=d.facings[frame];const p=contact(rows,a.facing,d.anchors?.[frame]||idleContact(rows));a.draw(rows);a.svg.style.transform=`translate(${d.bearing-(d.facings?this.turnFeet(rows,a.facing):p[0])*a.scale}px,${m.fromY-(p[1]+1)*a.scale}px)`;const drawn=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(a.svg.style.transform);window.pixelCatBedEntryV1?.mask?.(a,rows);if(a.carriedToy&&drawn)window.pixelCatMouthV1?.frame(a,rows,drawn,t,a.carryArt);a.setAttribute('data-pose',d.facings?'turning':'leaving-loaf');a.setAttribute('data-frame',(d.facings?'sit-turn-':'loaf-departure-')+frame);a.status(d.facings?'Turning around':'Getting up');return true;},
 travelEnd(a,m){window.pixelCatExertionV1?.complete(a,m);if(m.kind==='jump'||m.shallow)a.shallowChoice=null;if(m.sneakTimeline&&a.idle){const last=m.sneakTimeline.at(-1);a.sneakState={frame:(last.frame+1)%8,variant:last.variant,direction:m.direction};a.idle.sneakExit=true;}else a.sneakState=null;},
 cancelDeparture(a){if(a.motion?.departure){a.motion=null;a.idle=null;} }
};
