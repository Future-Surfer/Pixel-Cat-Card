// Drawing only. Release helpers produce playback rows and placement in Node.
export const size={width:480,height:270},frameMs=20;
export const scene={scale:4,ground:192,homeLeft:16,bedX:100,postX:224,bowlX:360};
export function commands(assets,state,{backgroundOnly=false}={}){
 const ops=[{x:0,y:0,w:size.width,h:size.height,c:'#f7f5f0'}];
 const pixel=n=>{const value=Math.round(n);if(Math.abs(value-n)>1e-7)throw Error('Playback left the pixel grid');return value;};
 const rect=(x,y,w,h,c)=>ops.push({x:pixel(x),y:pixel(y),w,h,c});
 const {ground,scale:s,bedX,postX,bowlX}=scene,bedY=ground+s-assets.bed.height*s;
 function prop(p,x,y){p.pixels.forEach((row,ry)=>row.forEach((c,rx)=>{if(c)rect(x+rx*s,y+ry*s,s,s,c);}));}
 rect(24,ground,size.width-48,4,'#b69a7c');rect(24,ground+4,size.width-48,2,'#8e755b');
 prop(assets.bed,bedX,bedY);prop(assets.bowl,bowlX,ground-assets.bowl.height*s);
 if(!backgroundOnly)prop(assets.post,postX+(state.postOffset||0),ground-assets.post.height*s);
 if(!state.hidden)state.rows.forEach((row,y)=>[...row].forEach((c,x)=>{
  if(c==='.')return;
  const px=state.x+(state.facing<0?23-x:x)*s,py=state.top+y*s;
  rect(px,py,s,s,'#cd813c');
 }));
 return {step:state.id,label:state.label,ops:ops.concat(state.particles||[])};
}
export function draw(ctx,frame){for(const r of frame.ops){ctx.fillStyle=r.c;ctx.fillRect(r.x,r.y,r.w,r.h);}}
