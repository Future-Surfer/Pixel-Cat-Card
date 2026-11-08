// Coordinates use pixel-cell centres; gestures remain metadata-only.
export function gazeCoverage(frames){
 const total=frames.length,configured=frames.filter(f=>f.gaze!=null).length,misplaced=frames.filter(f=>f.gaze&&f.rows?.[f.gaze.y]?.[f.gaze.x]==='.').length;
 return {total,configured,misplaced,status:configured===0?'missing':configured===total?'complete':'partial'};
}
export function placePoi(project,frame,point,actor='human'){
 if(frame.locked)throw Error('Unlock this keyframe before editing it.');
 if(!Number.isInteger(point.x)||!Number.isInteger(point.y)||point.x<0||point.y<0||point.x>23||point.y>23)throw Error('POI must be inside the grid.');
 const first=!project.frames.some(f=>f.poi),targets=first?project.frames.filter(f=>!f.locked):[frame];
 for(const f of targets){f.poi={...point};f.operations.push({actor,kind:first?'poi-sequence-seed':'poi',at:new Date().toISOString()});}return targets.length;
}
export function applyPoiToAll(project,frame,actor='human'){
 if(!frame.poi)throw Error('Place a POI first.');let count=0;
 for(const f of project.frames)if(!f.locked&&JSON.stringify(f.poi)!==JSON.stringify(frame.poi)){f.poi={...frame.poi};f.operations.push({actor,kind:'poi-apply-all',at:new Date().toISOString()});count++;}return count;
}
export const wrapAngle=value=>((value+180)%360+360)%360-180;
export function gazeHandles(gaze){
 const origin={x:gaze.x+.5,y:gaze.y+.5};
 if(gaze.canSee===false)return [{kind:'origin',...origin}];
 const endpoint=(kind,angle,radius)=>{
  const dx=Math.cos(angle*Math.PI/180),dy=Math.sin(angle*Math.PI/180);
  const reach=Math.min(Math.abs(dx)<1e-9?Infinity:((dx>0?23.7:.3)-origin.x)/dx,Math.abs(dy)<1e-9?Infinity:((dy>0?23.7:.3)-origin.y)/dy);
  const r=Math.min(radius,reach*(kind==='direction'?.6:1));
  return {kind,angle,x:origin.x+dx*r,y:origin.y+dy*r};
 };
 return [{kind:'origin',...origin},endpoint('direction',gaze.angle,5),endpoint('edge-start',gaze.angle-gaze.fov/2,8),...(gaze.fov===360?[]:[endpoint('edge-end',gaze.angle+gaze.fov/2,8)])];
}
export function dragGaze(gaze,kind,point){
 const result={...gaze};
 if(kind==='origin'){result.x=Math.max(0,Math.min(23,Math.floor(point.x)));result.y=Math.max(0,Math.min(23,Math.floor(point.y)));return result;}
 const angle=Math.atan2(point.y-gaze.y-.5,point.x-gaze.x-.5)*180/Math.PI;
 if(kind==='direction')result.angle=Math.round(wrapAngle(angle));
 else result.fov=Math.max(10,Math.min(360,Math.round(Math.abs(wrapAngle(angle-gaze.angle))*2)));
 return result;
}
export function placeGaze(project,frame,gaze,actor='human'){
 // Seed a sequence only once; moving/adding a later frame never overwrites neighbours.
 const first=!project.frames.some(f=>f.gaze),targets=first?project.frames.filter(f=>!f.locked):[frame];
 if(frame.locked)throw Error('Unlock this keyframe before editing it.');
 for(const target of targets){target.gaze={...gaze};target.operations.push({actor,kind:first?'gaze-sequence-seed':'gaze',at:new Date().toISOString()});}
 return targets.length;
}
export function applyGazeToAll(project,frame,actor='human'){
 if(!frame.gaze)throw Error('Place a gaze marker on the current frame first.');
 const gaze={...frame.gaze};let count=0;
 for(const target of project.frames){
  if(target.locked||JSON.stringify(target.gaze)===JSON.stringify(gaze))continue;
  target.gaze={...gaze};target.operations.push({actor,kind:'gaze-apply-all',at:new Date().toISOString()});count++;
 }
 return count;
}
export function setGazeVision(frame,canSee,actor='human'){
 if(frame.locked)throw Error('Unlock this keyframe before editing it.');
 if(typeof canSee!=='boolean')throw Error('Vision must be enabled or disabled.');
 frame.gaze={x:12,y:12,angle:0,fov:100,...frame.gaze,canSee};
 frame.operations.push({actor,kind:'gaze-vision',at:new Date().toISOString()});
}
