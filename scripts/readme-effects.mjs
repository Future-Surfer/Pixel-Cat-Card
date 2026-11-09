// Drive the release's contact handlers on the export clock, then rasterize
// their foreground particles and post offset for both media formats.
export function captureReadmeEffects(window, art, face, surface, stages, sample, duration, frameMs){
 const effects=window.pixelCatEffectsV1, scratch=window.pixelCatVerticalScratchV1;
 const post={...face.prop,node:{style:{}},claimedBy:'readme-miso'};
 const actor={root:{},ownerKey:post.claimedBy,active:true,scale:post.scale,config:{},support:surface,surfaces:[surface],propScene:{enabled:true,props:[post],time:0}};
 const layer={actor,art:()=>art,enabled:()=>true,clear:()=>true,finish(reason){throw Error(reason);}};
 const stage=stages.find(s=>s.id==='post');
 layer.episode={prop:post,faceId:face.id,stage:'stroke',expires:stage.start+stage.ms};
 const pool=effects.join(actor).pool, frames=new Map();
 for(let time=0;time<duration;time+=frameMs){
  effects.tick(actor,time);
  const state=sample(time);
  const placement={x:state.x,top:state.top};
  actor.x=state.x;
  actor.facing=state.facing;
  if(state.id==='post'){
   actor.idle??={pose:'postScratch',start:stage.start};
   actor.getAttribute=()=>`idle-postScratch-${state.frame+1}`;
   layer.clock=time;
   layer.frame={rows:state.rows,facing:state.facing,placement};
   scratch.advance(layer,time);
  }else if(actor.idle){
   effects.resetPost(post);
   actor.idle=null;
  }
  effects.paintPost(post);
  const postOffset=Math.round(parseFloat(post.node.style.translate)||0);
  const particles=pool.filter(p=>p.active).map(p=>{
   const size=Math.max(1,Math.ceil(p.size));
   const fade=p.landed<0?Math.min(1,(p.life-p.age)/180):Math.max(0,1-(p.age-p.landed)/260);
   return {x:Math.round(p.x),y:Math.round(p.y)-size,w:size,h:Math.max(1,Math.round(size*fade)),c:p.colour};
  });
  if(postOffset||particles.length)frames.set(time,{postOffset,particles});
 }
 return frames;
}
