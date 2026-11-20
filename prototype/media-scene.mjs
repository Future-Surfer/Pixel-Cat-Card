// Shared by the browser preview and offline encoder; clip only at canvas edges.
export function sceneCommands(payload,state){
 const {recipe:r,assets}=payload,s=r.scale,ops=[];
 const rect=(x,y,w,h,c)=>{const left=Math.round(x),top=Math.round(y),width=Math.round(x+w)-left,height=Math.round(y+h)-top;if(width>0&&height>0)ops.push({x:left,y:top,w:width,h:height,c});};
 rect(0,0,r.width,r.height,'#f7f5f0');
 rect(r.floor.left,r.ground,r.floor.right-r.floor.left,4,'#b69a7c');
 rect(r.floor.left,r.ground+4,r.floor.right-r.floor.left,2,'#8e755b');
 const prop=p=>{const a=assets[p.asset],cell=p.scale??s;a.pixels.forEach((row,y)=>row.forEach((c,x)=>{if(c)rect(p.x+(p.facing!==undefined&&p.facing!==(a.facing??-1)?a.width-1-x:x)*cell,p.top+y*cell,cell,cell,c);}));};
 for(const p of r.furniture||[])prop(p);
 for(const a of state.actors){
  if(!a.mask)rect(a.x+6*s,a.ground??r.ground,12*s,3,'#a58a6d');
  const actorRect=(px,py,w,h,colour)=>{
   const m=a.mask;if(!m){rect(px,py,w,h,colour);return;}
   // Same union as the runtime box foreground mask, also applied to outlines.
   const upper=Math.max(0,Math.min(h,m.rim-py));
   if(upper)rect(px,py,w,upper,colour);
   const lower=h-upper;
   if(lower){const left=Math.max(0,Math.min(w,m.left-px)),right=Math.max(0,Math.min(w,px+w-m.right));if(left)rect(px,py+upper,left,lower,colour);if(right)rect(px+w-right,py+upper,right,lower,colour);}
  };
  // Rasterise the release's exposed-edge outline behind the unchanged pixels.
  if(a.outlinePath)for(const edge of a.outlinePath.matchAll(/M([\d.-]+) ([\d.-]+)([hv])1/g)){
   const x=a.x+Number(edge[1])*s,y=a.top+Number(edge[2])*s;
   actorRect(x-1,y-1,edge[3]==='h'?s+2:2,edge[3]==='v'?s+2:2,a.outline);
  }
  a.rows.forEach((row,y)=>[...row].forEach((v,x)=>{
   if(v==='.')return;
   actorRect(a.x+(a.facing<0?23-x:x)*s,a.top+y*s,s,s,a.colour);
  }));
 }
 for(const p of state.props)prop({...p,facing:p.facing??1});
 return ops;
}
export function drawScene(ctx,ops){for(const r of ops){ctx.fillStyle=r.c;ctx.fillRect(r.x,r.y,r.w,r.h);}}
