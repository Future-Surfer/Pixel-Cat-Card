// Actor-local active time. Long rest reuses the normal clip and its authored exit.
const catSettling={
 settings(config={}){
  const mode=['active','extended','custom'].includes(config.settling_mode)?config.settling_mode:'default';
  const minutes=(key,fallback,min)=>{const n=config[key];return typeof n==='number'&&Number.isInteger(n)&&n>=min&&n<=1440?n:fallback;};
  const after=mode==='custom'?minutes('settle_after_minutes',5,0):5,min=mode==='custom'?minutes('settled_rest_min_minutes',5,1):mode==='extended'?15:5,max=mode==='custom'?minutes('settled_rest_max_minutes',10,1):mode==='extended'?30:10;
  return {enabled:mode!=='active',afterMs:after*60000,minMs:Math.min(min,max)*60000,maxMs:Math.max(min,max)*60000};
 },
 wake(a,t){const q=a.settling;if(q){if(q.idle===a.idle&&a.idle){a.idle.poseUntil=t;a.deadline=t;}q.idle=null;q.activeMs=0;}a.removeAttribute('data-settling');},
 step(a,ms){
  if(a.active===false||a.paused||a.layoutPaused||a.suspended||a.stranded||a.userHeld||typeof document!=='undefined'&&document.hidden)return;
  const q=a.settling||={activeMs:0,idle:null};
  if(ms>0&&ms<=1000)q.activeMs+=ms;
 },
 begin(a,idle,art){
  const q=a.settling,p=this.settings(a.config);
  if(!p.enabled||!q||q.activeMs<p.afterMs||!art.idleSequences?.[idle.pose]?.behaviourPolicy?.tags?.includes('rest')||this.busy(a))return;
  if(this.restEpisode(a))a.social.finish('settled rest');
  idle.poseUntil=idle.start+(idle.bridgeMs||0)+p.minMs+(p.maxMs-p.minMs)*(a.ensureMood?.().random?.()??Math.random());
  q.idle=idle;a.deadline=Math.max(a.deadline||0,idle.poseUntil);
  a.setAttribute?.('data-settling','resting');
 },
 restEpisode(a){const e=a.social?.episode;return e?.stage==='rest'&&['bed','company'].includes(e.kind);},
 busy(a){return a.motion||a.route?.length||a.climb||a.userHeld||a.command||a.goal||a.previewPose||a.play||a.playRequested||a.toyHunt||a.toyHuntRequested||a.mouthAction||a.recallPending||a.social?.episode&&!this.restEpisode(a);},
 holding(a,t){
  const q=a.settling;if(!q?.idle)return false;
  if(q.idle!==a.idle||this.busy(a)||a.idle.support!==a.support?.id||t>=a.idle.poseUntil){q.idle=null;a.removeAttribute?.('data-settling');return false;}
  a.deadline=Math.max(a.deadline||0,a.idle.poseUntil);a.propScene?.tick(t,a);return true;
 }
};
window.pixelCatSettlingV1=catSettling;
