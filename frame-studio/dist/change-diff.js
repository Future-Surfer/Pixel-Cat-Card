export function savedFrameEntries(asset){return [...(asset?.components||[]).map((frame,index)=>({frame,index,sequence:'tree-component'})),...(asset?.frames||[]).map((frame,index)=>({frame,index,sequence:'climb'})),...['front','back'].flatMap(sequence=>(asset?.rotations?.[sequence]?.frames||[]).map((frame,index)=>({frame,index,sequence}))),...['front','back'].flatMap(path=>(asset?.centred?.[path]?.frames||[]).map((frame,index)=>({frame,index,sequence:'centre-'+path})))];}
// Stable frame identities distinguish insert/reorder from edits to existing pixels.
export function compareSavedVersions(before,after){
 const frameSet=value=>savedFrameEntries(value).map(e=>e.frame);
 const different=(a,b)=>JSON.stringify(a)!==JSON.stringify(b),old=new Map(frameSet(before).map(f=>[f.id,f])),fresh=frameSet(after);
 const frames=fresh.map((f,index)=>{const p=old.get(f.id),pixels=p?f.rows.reduce((n,row,y)=>n+[...row].filter((v,x)=>v!==p.rows[y]?.[x]).length,0):f.rows.reduce((n,row)=>n+[...row].filter(v=>v!=='.').length,0),fields=[...new Set([...Object.keys(p||{}),...Object.keys(f)])].filter(k=>!['rows','id'].includes(k)&&different(p?.[k],f[k]));return {id:f.id,index:index+1,added:!p,pixels,fields};});
 const metadata=[...new Set([...Object.keys(before||{}),...Object.keys(after)])].filter(k=>k!=='frames'&&different(before?.[k],after[k]));
 return {frames,removed:frameSet(before).filter(f=>!fresh.some(n=>n.id===f.id)).map(f=>f.id),reordered:!!before&&different(frameSet(before).filter(f=>fresh.some(n=>n.id===f.id)).map(f=>f.id),fresh.filter(f=>old.has(f.id)).map(f=>f.id)),metadata};
}
