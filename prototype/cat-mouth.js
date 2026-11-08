// Eating, nosing and voluntary pickup/drop decisions share the mouth affordance.
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
