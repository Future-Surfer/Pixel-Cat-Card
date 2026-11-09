// Drawing only. Release helpers produce playback rows and placement in Node.
import {contactShadows} from './contact-shadow.mjs';
export const size={width:480,height:270},frameMs=20;
export const scene={scale:4,ground:192,homeLeft:16,bedX:100,postX:224,bowlX:360};
const floor={left:24,right:size.width-24,top:scene.ground};
const floorInk=['#b69a7c','#8e755b'].map(base=>Array.from({length:9},(_,i)=>
 '#'+base.slice(1).match(/../g).map(byte=>Math.round(parseInt(byte,16)*(1-i/25)).toString(16).padStart(2,'0')).join('')));
function shadow(state,rect){
 const s=scene.scale,points=contactShadows({...state,surfaces:[floor]},s,4).get(floor);
 if(!points?.length)return;
 const field=Array.from({length:6},()=>new Float32Array(size.width));
 for(const {center,density,lift}of points){
  const radius=(2.5+Math.min(2,lift*.065))*s;
  const alpha=(1-Math.exp(-density/2.1))*.4*Math.exp(-lift/12)*.68;
  for(let y=0;y<field.length;y++)for(let x=Math.max(floor.left,Math.floor(center-radius));x<Math.min(floor.right,Math.ceil(center+radius));x++){
   const fade=1-Math.hypot(x+.5-center,(y+.5)/.36)/radius;
   if(fade>0)field[y][x]+=(1-field[y][x])*alpha*fade;
  }
 }
 for(const [y,row]of field.entries()){
  const ink=floorInk[y<4?0:1];
  for(let x=floor.left;x<floor.right;){
   const level=Math.min(8,Math.round(row[x]*25)),start=x++;
   while(x<floor.right&&Math.min(8,Math.round(row[x]*25))===level)x++;
   if(level)rect(start,floor.top+y,x-start,1,ink[level]);
  }
 }
}
export function commands(assets,state,{backgroundOnly=false}={}){
 const ops=[{x:0,y:0,w:size.width,h:size.height,c:'#f7f5f0'}];
 const pixel=n=>{const value=Math.round(n);if(Math.abs(value-n)>1e-7)throw Error('Playback left the pixel grid');return value;};
 const rect=(x,y,w,h,c)=>ops.push({x:pixel(x),y:pixel(y),w,h,c});
 const {ground,scale:s,bedX,postX,bowlX}=scene,bedY=ground+s-assets.bed.height*s;
 function prop(p,x,y){p.pixels.forEach((row,ry)=>row.forEach((c,rx)=>{if(c)rect(x+rx*s,y+ry*s,s,s,c);}));}
 rect(24,ground,size.width-48,4,'#b69a7c');rect(24,ground+4,size.width-48,2,'#8e755b');
 if(!state.hidden)shadow(state,rect);
 if(!backgroundOnly){prop(assets.bed,bedX,bedY);prop(assets.bowl,bowlX,ground-assets.bowl.height*s);}
 if(!backgroundOnly)prop(assets.post,postX+(state.postOffset||0),ground-assets.post.height*s);
 if(!state.hidden)state.rows.forEach((row,y)=>[...row].forEach((c,x)=>{
  if(c==='.')return;
  const px=state.x+(state.facing<0?23-x:x)*s,py=state.top+y*s;
  rect(px,py,s,s,'#cd813c');
 }));
 return {step:state.id,label:state.label,ops:ops.concat(state.particles||[])};
}
export function draw(ctx,frame){for(const r of frame.ops){ctx.fillStyle=r.c;ctx.fillRect(r.x,r.y,r.w,r.h);}}
