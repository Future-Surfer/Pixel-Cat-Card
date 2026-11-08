// Drawing only. Release helpers produce playback rows and placement in Node.
export const size={width:800,height:200},frameMs=20;
export const scene={scale:4,ground:164,bedX:72,postX:396,bowlX:600};
export function commands(assets,state){
 const ops=[{x:0,y:0,w:size.width,h:size.height,c:'#f7f5f0'}];
 const pixel=n=>{const value=Math.round(n);if(Math.abs(value-n)>1e-7)throw Error('Playback left the pixel grid');return value;};
 const rect=(x,y,w,h,c)=>ops.push({x:pixel(x),y:pixel(y),w,h,c});
 const {ground,scale:s,bedX,postX,bowlX}=scene,bedY=ground-assets.bed.height*s;
 function prop(p,x,y){p.pixels.forEach((row,ry)=>row.forEach((c,rx)=>{if(c)rect(x+rx*s,y+ry*s,s,s,c);}));}
 rect(32,ground,736,4,'#b69a7c');rect(32,ground+4,736,2,'#8e755b');
 prop(assets.bed,bedX,bedY);prop(assets.post,postX,ground-assets.post.height*s);prop(assets.bowl,bowlX,ground-assets.bowl.height*s);
 if(!state.hidden)state.rows.forEach((row,y)=>[...row].forEach((c,x)=>{
  if(c==='.')return;
  const px=state.x+(state.facing<0?23-x:x)*s,py=state.top+y*s;
  if(state.mask&&px<bedX+assets.bed.width*s){const bx=Math.floor((px-bedX)/s),by=Math.floor((py-bedY)/s);if(assets.bed.pixels[by]?.[bx]!=='#22323e')return;}
  rect(px,py,s,s,'#cd813c');
 }));
 return {step:state.id,label:state.label,ops};
}
export function draw(ctx,frame){for(const r of frame.ops){ctx.fillStyle=r.c;ctx.fillRect(r.x,r.y,r.w,r.h);}}
