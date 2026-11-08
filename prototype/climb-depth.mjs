// Drawing depth is independent of registration, paw contact and silhouette geometry.
export function cellDepth(frame,x,y){if(frame.rows[y][x]==='.')return '.';return frame.depth?.[y]?.[x]&&frame.depth[y][x]!=='.'?frame.depth[y][x]:frame.rows[y][x]==='R'?'N':'.';}
export function depthMarks(frame){return frame.rows.map((r,y)=>[...r].map((_,x)=>cellDepth(frame,x,y)).join(''));}
// One compositor for the route and its magnified previews. Detached runtime
// poses are foreground; only registered climbing poses provide split depth.
export function paintClimbScene({frame,actor,face,marks,behindEffects,frontEffects}){
 behindEffects();
 if(frame)actor('behind');
 face();
 marks();
 actor(frame?'near':'all');
 frontEffects();
}
export function applyClimbStroke(frame,edits){const rows=frame.rows.map(r=>[...r]),depth=(frame.depth||Array(24).fill('.'.repeat(24))).map(r=>[...r]);for(const {x,y,token}of edits){if(token==='N'||token==='F'){if(rows[y][x]!=='.')depth[y][x]=token;}else {rows[y][x]=token;depth[y][x]='.';}}const result={rows:rows.map(r=>r.join(''))};if(frame.depth||depth.some(r=>r.some(v=>v!=='.')))result.depth=depth.map(r=>r.join(''));return result;}
