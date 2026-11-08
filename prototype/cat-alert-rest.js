// Exact saved components; masks are differences, never repainted source artwork.
window.pixelCatAlertV1={
 actors:new Map(),compiled:new WeakMap(),
 leave(a){this.actors.delete(a.ownerKey);},
 tick(a,t){this.actors.set(a.ownerKey,a);a.alertNow=t;if(a.idle?.pose!=='alertLying')return;if(t<(a.alertCheckAt||0))return;a.alertCheckAt=t+250;const watching=[...a.social?.memory?.values()||[]].some(m=>a.social.clock-m.at<700&&m.pose==='moving');a.alertWatching=watching;a.setAttribute?.('data-alert-watch',watching?'observed movement':'quiet');},
 weight(layer){const v=layer.actor.config.mood_behaviour?layer.actor.ensureMood().values:{alertness:.3,sleepiness:0},seen=[...layer.memory.values()].some(m=>layer.clock-m.at<700&&m.pose==='moving');return (.6+1.4*v.alertness)*(1-.5*v.sleepiness)*(seen?2:1);},
 recoil(a,point,t){if(a.idle?.pose!=='alertLying'||a.paused||a.userHeld||a.motion||a.suspended)return false;const f=a.social?.frame,g=f?.gaze;if(!g)return false;const x=f.placement.x+(a.facing<0?23-g.x:g.x)*a.scale,y=f.placement.top+g.y*a.scale;if(Math.hypot(point.x-x,point.y-y)>8*a.scale)return false;a.alertRecoilAt=t;a.setAttribute?.('data-alert-response','head withdrawal');return true;},
 sample(clip,frame,elapsed,config){
  if(clip.roles[frame]!=='cycle')return {rows:clip.frames[frame],frame,anchor:clip.anchors[frame],origin:clip.origins[frame],gaze:clip.gazes[frame]};
  let c=this.compiled.get(clip);if(!c){const masks=clip.alertParts.map(p=>{const mask=new Set();for(const rows of p.frames)for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(rows[y][x]!==p.frames[0][y][x])mask.add(y*24+x);return [...mask];});c={masks,cache:new Map()};this.compiled.set(clip,c);}
  const a=this.actors.get(config.track_seed),v=a?.mood?.values,flinch=a&&(a.alertNow-a.alertRecoilAt),seed=[...String(config.track_seed||config.name||'cat')].reduce((n,s)=>Math.imul(n^s.charCodeAt(0),31)>>>0,7),t=Math.max(0,elapsed),active=(v?.alertness||0)>.6;
  const [head,tail]=clip.alertParts,retreat=Number.isFinite(flinch)&&flinch>=0&&flinch<1000,h=retreat?[5,6,5,0][Math.min(3,Math.floor(flinch/250))]:a?.alertWatching?0:[0,1,2,3,4,8,9][Math.floor(Math.max(0,(t+seed%5000)%10000-8000)/250)%7],phase=(t+seed%4000)%(active?5000:24000),j=phase<4000?Math.floor(phase/250)%tail.frames.length:0,key=h+':'+j;
  let result=c.cache.get(key);if(!result){const base=clip.frames[clip.roles.indexOf('cycle')].map(r=>[...r]);for(const [part,i,mask]of [[head,h,c.masks[0]],[tail,j,c.masks[1]]])for(const cell of mask)base[Math.floor(cell/24)][cell%24]=part.frames[i][Math.floor(cell/24)][cell%24];result={rows:base.map(r=>r.join('')),gaze:head.gazes[h],origin:head.origins[h]===tail.origins[j]&&head.origins[h]===clip.origins[frame]?head.origins[h]:'mixed'};c.cache.set(key,result);if(c.cache.size>128)c.cache.delete(c.cache.keys().next().value);}
  return {...result,frame,anchor:clip.anchors[frame],headFrame:h,tailFrame:j};
 }
};
