// Read-only adapter for the same ha-card/declared-panel records as shared discovery.
// Called on geometry changes or an explicit diagnostic scan, never animation ticks.
export function snapshotVerticalPanels(records,world){
 const rect=r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}),overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 const colourVisible=c=>c&&c!=='transparent'&&!(c.startsWith('rgba')&&/,\s*0(?:\.0+)?\s*\)$/.test(c))&&!/\/\s*0(?:\.0+)?%?\s*\)$/.test(c);
 const list=records.map(({el,r,id,label})=>{
  const css=getComputedStyle(el),box=r||el.getBoundingClientRect(),p={id:id||el.id,label:label||el.getAttribute('aria-label')||el.localName,rect:rect(box),clip:rect(world),visible:true,connected:el.isConnected,climb:el.getAttribute('data-cat-climb'),painted:colourVisible(css.backgroundColor)||css.backgroundImage!=='none',colour:css.backgroundColor,z:Number(css.zIndex)||0,blockers:[]};
  if(!p.id)throw Error('Supply the stable horizontal-surface owner ID');
  const matrix=css.transform?.match(/^matrix\(([^)]+)\)/)?.[1].split(',').map(Number);if(css.transform?.startsWith('matrix3d')||matrix&&(Math.abs(matrix[1])>1e-6||Math.abs(matrix[2])>1e-6))p.unsupported='Rotated, skewed or 3D panel needs explicit geometry';
  p.radius=Math.max(...['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'].map(k=>{const v=css[k]||'0';return parseFloat(v)*(v.includes('%')?Math.min(box.width,box.height)/100:1)||0;}));
  for(let node=el;node;node=node.parentElement||node.getRootNode()?.host){
   const style=getComputedStyle(node);if(style.display==='none'||style.visibility!=='visible'||Number(style.opacity)===0)p.visible=false;
   if(node!==el&&/hidden|clip|scroll|auto/.test(style.overflowX+' '+style.overflowY)){const b=node.getBoundingClientRect();if(/hidden|clip|scroll|auto/.test(style.overflowX)){p.clip.left=Math.max(p.clip.left,b.left);p.clip.right=Math.min(p.clip.right,b.right);}if(/hidden|clip|scroll|auto/.test(style.overflowY)){p.clip.top=Math.max(p.clip.top,b.top);p.clip.bottom=Math.min(p.clip.bottom,b.bottom);}}
  }
  // Buttons/media are functional content, not inferred claw material.
  const controls=el.querySelectorAll('button,input,select,textarea,video,iframe,[contenteditable="true"]');
  for(const control of controls){const style=getComputedStyle(control);if(style.display!=='none'&&style.visibility==='visible')p.blockers.push(rect(control.getBoundingClientRect()));}
  return p;
 });
 for(let i=0;i<list.length;i++)for(let j=0;j<list.length;j++){
  const p=list[i],q=list[j];if(i===j||!q.visible||!q.connected||!q.painted||!overlap(p.rect,q.rect))continue;
  if(q.z>p.z||q.z===p.z&&j>i)p.blockers.push(q.rect);
 }
 return list;
}
