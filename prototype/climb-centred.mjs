import baseline from '../frame-studio/user-sequences/centred-climb-2026-10-20/front.json' with {type:'json'};
export const bakedCentredFront=baseline;
const copy=value=>JSON.parse(JSON.stringify(value));
export const isBakedCentredFrame=frame=>baseline.clip.frames.some(f=>JSON.stringify(f)===JSON.stringify(frame));
// Same pose geometry on either side of the prop; depth is independent of cells.
export function deriveCentredBehind(front,versionHash=baseline.sourceVersion){
 return {name:'Centred climb behind',reviewStatus:'draft',source:{versionHash,sequence:'centred.front'},notes:'Exact pose/timing/contact copy of the reviewed front-centred baseline, with near/far depth reversed. Review occlusion in the playground.',frames:front.frames.map(source=>({...copy(source),id:source.id.replace('front','back'),sourceFrameId:source.id,reviewStatus:'draft',depth:source.rows.map((r,y)=>[...r].map((v,x)=>v==='.'?'.':source.depth?.[y]?.[x]==='F'?'N':'F').join(''))}))};
}
// Fresh drafts use reviewed front art. Existing saved clips are never replaced.
export function seedCentredClimbs(){return {front:copy(baseline.clip),back:deriveCentredBehind(baseline.clip)};}
