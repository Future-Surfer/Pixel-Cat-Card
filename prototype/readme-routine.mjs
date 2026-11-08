// A deterministic, media-only queue. Uses authored grids without modifying them.
// It does not change the independent clocks or decisions of installed cats.
export const size={width:800,height:200},frameMs=80;
export const queue=[
 {id:'rest',label:'At home',ms:800,from:72,to:72,hidden:true},
 {id:'emerge',label:'Out of bed',ms:2000,from:40,to:184,clip:'walk',mask:true},
 {id:'approach',label:'Over to the post',ms:1600,from:184,to:340,clip:'walk'},
 {id:'post',label:'Scratch the post',ms:3520,from:340,to:340,clip:'postScratch'},
 {id:'food',label:'Over to the bowl',ms:2000,from:340,to:520,clip:'walk'},
 {id:'eat',label:'A little food',ms:3040,from:520,to:520,clip:'eat',facing:-1},
 {id:'groom',label:'An ear scratch',ms:2800,from:520,to:520,clip:'scratch'},
 {id:'return',label:'Back home',ms:2800,from:520,to:184,clip:'walk',facing:-1},
 {id:'enter',label:'Into bed',ms:2000,from:184,to:40,clip:'walk',facing:-1,mask:true},
 {id:'sleep',label:'At home',ms:800,from:72,to:72,hidden:true}
];
export const duration=queue.reduce((sum,step)=>sum+step.ms,0);
function at(frames,durations,time){
 const total=durations.reduce((a,b)=>a+b,0);let t=Math.max(0,time)%total;
 for(let i=0;i<frames.length;i++){if(t<durations[i])return frames[i];t-=durations[i];}
 return frames.at(-1);
}
export function sequenceFrame(clip,time,hold){
 if(!clip?.frames?.length)throw Error('Missing authored clip');
 const roles=clip.roles||clip.frames.map(()=> 'cycle');
 const group=role=>clip.frames.flatMap((rows,i)=>roles[i]===role?[{rows,ms:clip.durations[i]}]:[]);
 const enter=group('enter'),exit=group('exit'),cycle=group('cycle');
 const sum=list=>list.reduce((n,f)=>n+f.ms,0);
 let list=cycle.length?cycle:clip.frames.map((rows,i)=>({rows,ms:clip.durations[i]})),elapsed=time;
 if(enter.length&&time<sum(enter)){list=enter;elapsed=time;}
 else if(exit.length&&time>=hold-sum(exit)){list=exit;elapsed=time-(hold-sum(exit));}
 else elapsed=Math.max(0,time-sum(enter));
 return at(list.map(f=>f.rows),list.map(f=>f.ms),elapsed);
}
export function sample(time){
 let elapsed=((time%duration)+duration)%duration;
 for(const step of queue){if(elapsed<step.ms)return {...step,elapsed,x:Math.round((step.from+(step.to-step.from)*elapsed/step.ms)/4)*4};elapsed-=step.ms;}
 throw Error('Invalid routine time');
}
export function commands(assets,time){
 const step=sample(time),ops=[{x:0,y:0,w:size.width,h:size.height,c:'#f7f5f0'}];
 const rect=(x,y,w,h,c)=>ops.push({x,y,w,h,c});
 const ground=164,s=4,bedX=72,bedY=ground-assets.bed.height*s;
 const recolour=c=>c==='#aa6627'?'#52616c':c==='#744316'?'#38424a':c==='#19222b'?'#22323e':c;
 function prop(p,x,y,filter=()=>true,colour=c=>c){p.pixels.forEach((row,ry)=>row.forEach((c,rx)=>{if(c&&filter(c,rx,ry))rect(x+rx*s,y+ry*s,s,s,colour(c));}));}
 rect(32,ground,736,4,'#b69a7c');rect(32,ground+4,736,2,'#8e755b');
 prop(assets.bed,bedX,bedY,()=>true,recolour);
 prop(assets.post,396,ground-assets.post.height*s);
 prop(assets.bowl,600,ground-assets.bowl.height*s);
 if(!step.hidden){
  const rows=sequenceFrame(assets.clips[step.clip],step.elapsed,step.ms),facing=step.facing||1;
  rows.forEach((row,y)=>[...row].forEach((c,x)=>{
   if(c==='.')return;
   const px=step.x+(facing<0?23-x:x)*s,py=ground-24*s+y*s;
   if(step.mask&&px<bedX+assets.bed.width*s){
    const bx=Math.floor((px-bedX)/s),by=Math.floor((py-bedY)/s);
    if(assets.bed.pixels[by]?.[bx]!=='#19222b')return;
   }
   rect(px,py,s,s,'#cd813c');
  }));
  // Occlude the portions still inside the authored shell. The doorway remains
  // open, and the cat becomes foreground on the side it is approaching from.
  if(step.mask)prop(assets.bed,bedX,bedY,(c,x)=>c!=='#19222b'&&(bedX+x*s<step.x+12*s),recolour);
 }
 return {step:step.id,label:step.label,ops};
}
export function draw(ctx,frame){for(const r of frame.ops){ctx.fillStyle=r.c;ctx.fillRect(r.x,r.y,r.w,r.h);}}
