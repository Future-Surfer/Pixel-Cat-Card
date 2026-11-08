import {clone,editable,applyPixels,validateProject} from './model.js';
export const selectionBox=(a,b)=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x)+1,height:Math.abs(a.y-b.y)+1});
export const containsCell=(box,p)=>!!box&&!!p&&p.x>=box.x&&p.x<box.x+box.width&&p.y>=box.y&&p.y<box.y+box.height;
export function shiftedRows(rows,box,dx,dy){
 if(!box||![box.x,box.y,box.width,box.height,dx,dy].every(Number.isInteger)||box.width<1||box.height<1||box.x<0||box.y<0||box.x+box.width>24||box.y+box.height>24)throw Error('Invalid selection');
 if(box.x+dx<0||box.y+dy<0||box.x+box.width+dx>24||box.y+box.height+dy>24)throw Error('Selection would leave the grid; nothing moved.');
 const result=rows.map(r=>[...r]);for(let y=box.y;y<box.y+box.height;y++)for(let x=box.x;x<box.x+box.width;x++)result[y][x]='.';
 // Transparent cells move with the rectangle and replace its destination.
 for(let y=0;y<box.height;y++)for(let x=0;x<box.width;x++)result[box.y+y+dy][box.x+x+dx]=rows[box.y+y][box.x+x];
 return result.map(r=>r.join(''));
}
export function moveSelection(project,frameIds,box,dx,dy,actor='human'){
 const copy=clone(project);if(!frameIds.length||new Set(frameIds).size!==frameIds.length)throw Error('Choose frames to move');
 for(const t of copy.animationTracks?.tracks||[]){if(!t.mask||!t.frameIds.some(id=>frameIds.includes(id))||!t.mask.some(c=>containsCell(box,{x:c%24,y:Math.floor(c/24)})))continue;if(!t.frameIds.every(id=>frameIds.includes(id))||!t.mask.every(c=>containsCell(box,{x:c%24,y:Math.floor(c/24)})))throw Error('Move the complete mask across all of its source frames, or remove the track first.');t.mask=t.mask.map(c=>{const x=c%24+dx,y=Math.floor(c/24)+dy;if(x<0||x>23||y<0||y>23)throw Error('Track mask would leave the grid; nothing changed.');return y*24+x;});}
 for(const id of frameIds){const f=copy.frames.find(f=>f.id===id);if(!f)throw Error('Frame not found');editable(f);const next=shiftedRows(f.rows,box,dx,dy);const edits=next.flatMap((r,y)=>[...r].flatMap((v,x)=>v===f.rows[y][x]?[]:[{x,y,token:v}]));applyPixels(copy,id,edits,actor);
  if(containsCell(box,f.gaze))f.gaze={...f.gaze,x:f.gaze.x+dx,y:f.gaze.y+dy};
  if(containsCell(box,f.anchor))f.anchor={x:f.anchor.x+dx,y:f.anchor.y+dy};
  if(containsCell(box,f.poi))f.poi={x:f.poi.x+dx,y:f.poi.y+dy};
  f.operations.push({actor,kind:'move-selection',box:{...box},dx,dy,at:new Date().toISOString()});}
 validateProject(copy);project.frames=copy.frames;if(copy.animationTracks)project.animationTracks=copy.animationTracks;return project;
}
