// Mouth affordances: raw authored gaze origins are anchors even on blind frames.
// Shared claims remain authoritative; carrying does not prescribe the cat's gait.
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
