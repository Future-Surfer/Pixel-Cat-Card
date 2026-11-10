// Explicit invitations share the existing actor tick: no extra timers or world scans.
window.pixelCatCommandsV1={
 bind(a,owners){
  a.shadowRoot.querySelector('[data-action="spawn-toy"]').onclick=()=>a.spawnDashboardProp('toy_mouse');
  a.shadowRoot.querySelector('[data-action="startle-all"]').onclick=()=>this.startleAll(a,owners,performance.now());
  a.shadowRoot.querySelector('[data-action="wall-jump"]').onclick=()=>this.wallJump(a,performance.now());
 },
 wake(a,t){window.pixelCatSettlingV1?.wake(a,t);},
 startleAll(source,owners,t){
  for(const [a,entry]of owners())if(entry.root===source.root&&a.active){
   this.wake(a,t);a.manualWallJump=null;
   if(a.paused){a.setAttribute('data-manual-startle','woken · paused');continue;}
   a.manualStartle={expires:t+120000};this.tick(a,t);
  }
 },
 wallJump(a,t){
  if(a.paused){a.status('Resume this cat before asking for a wall jump');return;}
  if(!window.pixelCatCardClimbV1){a.status('Wall-jump module is not available');return;}
  this.wake(a,t);a.manualStartle=null;a.manualWallJump={expires:t+120000};
  a.setAttribute('data-wall-jump-command','queued');a.status('Wall jump queued after the current movement');this.tick(a,t);
 },
 tick(a,t){
  const startle=a.manualStartle,wall=a.manualWallJump,pending=startle||wall;if(!pending)return;
  if(t>pending.expires||!a.active){a.manualStartle=a.manualWallJump=null;return;}
  if(a.paused||a.suspended||a.stranded||a.layoutPaused||a.userHeld||!a.support||a.climb)return;
  if(startle){
   if(a.motion&&a.motion.kind!=='walk'||window.pixelCatReactionsV1?.airborne(a,t))return;
   // Each actor reacts from its own actual position and facing, including after landing.
   a.manualStartle=null;const cue={x:a.x+(a.facing<0?0:24)*a.scale,y:a.y};
   const hopped=a.requestStartle(cue,t);a.setAttribute('data-manual-startle',hopped?'hop':'woken · no safe hop');return;
  }
  if(a.motion||a.mouthAction)return;
  a.manualWallJump=null;
  const path=window.pixelCatCardClimbV1.wallRoute(a);
  if(!path){a.setAttribute('data-wall-jump-command','no checked wall');a.status('No reachable wall with a checked entry and landing');return;}
  window.pixelCatPostRestV1?.interrupt(a);a.social?.finish('manual wall jump');a.cancelPlay(t);
  a.previewPose=null;a.toyHuntRequested=false;a.recallPending=false;a.requestedPoint=null;a.goal=a.command=null;a.idle=null;
  a.route=path;a.deadline=t;a.setAttribute('data-wall-jump-command','approaching');a.advance(t);
 }
};
