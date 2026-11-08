import {lineCells} from './model.js';

// Shared, non-destructive canvas interaction. Hosts own schema, undo and saves.
export function frameCell(canvas,event,size=24,r=canvas.getBoundingClientRect()){const width=typeof size==='number'?size:size.width,height=typeof size==='number'?size:size.height;return {x:Math.max(0,Math.min(width-1,Math.floor((event.clientX-r.left)/r.width*width))),y:Math.max(0,Math.min(height-1,Math.floor((event.clientY-r.top)/r.height*height)))};}
export function strokeRows(rows,stroke,identity=null){if(!stroke||identity!==null&&identity!==stroke.identity)return rows;const result=rows.map(r=>[...r]);for(const p of stroke.cells.values())result[p.y][p.x]=p.token;return result.map(r=>r.join(''));}
export function installFrameCanvas(canvas,{getTool,getToken,getSize=()=>24,getIdentity=()=>null,canStart=()=>true,shouldHandle=()=>true,onBegin=()=>{},onPoint=()=>{},onPreview=()=>{},onCommit=()=>{},onCancel=()=>{}}){
 let stroke=null;const listeners=[];
 const listen=(type,fn)=>{canvas.addEventListener(type,fn);listeners.push([type,fn]);};
 const claim=e=>{e.preventDefault();e.stopImmediatePropagation();};
 const release=s=>{if(canvas.hasPointerCapture?.(s.pointer))canvas.releasePointerCapture(s.pointer);};
 const cancel=()=>{if(!stroke)return;const old=stroke;stroke=null;onPreview(null);release(old);onCancel();};
 const add=(a,b)=>{for(const p of lineCells(a,b))stroke.cells.set(p.x+','+p.y,{...p,token:stroke.tool==='erase'?'.':stroke.token});};
 const update=p=>{if(stroke.tool==='line'){stroke.cells.clear();add(stroke.start,p);}else if(stroke.tool==='rect'){stroke.cells.clear();const a=stroke.start;for(const [u,v]of [[a,{x:p.x,y:a.y}],[{x:p.x,y:a.y},p],[p,{x:a.x,y:p.y}],[{x:a.x,y:p.y},a]])add(u,v);}else add(stroke.last,p);stroke.last=p;onPoint(p);onPreview(stroke);};
 listen('pointerdown',e=>{
  if(stroke||e.isPrimary===false||![0,2].includes(e.button))return;
  const selectedTool=getTool(),tool=e.button===2?'erase':selectedTool;
  if(!['pencil','erase','line','rect'].includes(tool)||!shouldHandle(e,selectedTool)||!canStart())return;
  claim(e);const rect=canvas.getBoundingClientRect(),p=frameCell(canvas,e,getSize(),rect);if(onBegin(e,p)===false)return;
  stroke={tool,token:getToken(),pointer:e.pointerId,start:p,last:p,cells:new Map(),identity:getIdentity(),rect};canvas.setPointerCapture(e.pointerId);update(p);
 });
 listen('pointermove',e=>{if(!stroke||e.pointerId!==stroke.pointer)return;claim(e);if(getIdentity()!==stroke.identity){cancel();return;}update(frameCell(canvas,e,getSize(),stroke.rect));});
 listen('pointerup',e=>{if(!stroke||e.pointerId!==stroke.pointer)return;claim(e);if(getIdentity()!==stroke.identity){cancel();return;}update(frameCell(canvas,e,getSize(),stroke.rect));const completed=stroke;stroke=null;onPreview(null);release(completed);onCommit([...completed.cells.values()],completed);});
 for(const type of ['pointercancel','lostpointercapture'])listen(type,e=>{if(stroke&&e.pointerId===stroke.pointer){claim(e);cancel();}});
 listen('contextmenu',e=>e.preventDefault());
 return {cancel,destroy(){cancel();for(const [type,fn]of listeners)canvas.removeEventListener(type,fn);}};
}

export function onionLayers(frames,index,{previous=true,next=true,reference=null,mirror=false,align='grid',x=0,y=0}={}){
 const current=frames[index];if(!current)return [];
 const layer=(frame,colour,label,flip=false,dx=0,dy=0)=>{if(!frame)return null;const anchor=frame.anchor,registered=align==='anchor'&&anchor&&current.anchor;return {rows:frame.rows,colour,label,facing:flip?-1:1,x:dx+(registered?current.anchor.x-(flip?23-anchor.x:anchor.x):0),y:dy+(registered?current.anchor.y-anchor.y:0)};};
 return [previous?layer(frames[index-1],'#2678bc','Previous'):null,next?layer(frames[index+1],'#db498a','Next'):null,reference?layer(reference,'#28856b','Neighbour',mirror,x,y):null].filter(Boolean);
}
export function drawOnionSkin(context,skin,{cell=16,opacity=.25}={}){context.save();context.globalAlpha=Math.max(0,Math.min(1,opacity));context.fillStyle=skin.colour;skin.rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='.')context.fillRect(((skin.x||0)+(skin.facing<0?23-x:x))*cell,((skin.y||0)+y)*cell,cell,cell);}));context.restore();}

// Host-defined annotations share one renderer; they never repaint silhouette pixels.
export function drawCellMarks(context,rows,{cell=16,styles={}}={}){context.save();for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++){const style=styles[rows[y][x]];if(!style)continue;context.strokeStyle=style.colour;context.lineWidth=style.width||1.5;context.setLineDash(style.dash||[]);context.strokeRect(x*cell+1.5,y*cell+1.5,cell-3,cell-3);}context.restore();}
