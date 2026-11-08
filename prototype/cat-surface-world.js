// View/frame discovery is shared; traversal state, scale and route choices remain actor-local.
const catGeometryFrames=new WeakMap(),catRouteGraphs=new WeakMap();
window.pixelCatSurfaceWorldV1={
 frame(root){const settled=window.pixelCatLayoutV1?.geometry(root);if(settled)return settled;if(!root||typeof requestAnimationFrame!=='function')return null;let f=catGeometryFrames.get(root);if(!f){f={rects:new Map()};catGeometryFrames.set(root,f);requestAnimationFrame(()=>{if(catGeometryFrames.get(root)===f)catGeometryFrames.delete(root);});}return f;},
 cards(root,scan){const f=this.frame(root);if(!f)return scan();return f.cards??=scan();},
 rect(root,el){const f=this.frame(root);if(!f)return el.getBoundingClientRect();if(!f.rects.has(el))f.rects.set(el,el.getBoundingClientRect());return f.rects.get(el);},
 destinations(a,select,force=false){
  select.onfocus=()=>this.destinations(a,select,true);const selected=select.value,label=select.options?.[select.selectedIndex]?.textContent;
  if(!force&&a.surfaces.length>128&&a.shadowRoot?.activeElement!==select){select.replaceChildren();const option=document.createElement('option');option.value=selected;option.textContent=label||'Choose destination · '+a.surfaces.length+' supports';select.append(option);return;}
  select.replaceChildren();for(const surface of a.surfaces)for(const point of [null,...surface.roamPoints||[],...surface.propPoints||[],...surface.inspectionPoints||[]]){const option=document.createElement('option');option.value=surface.id+(point?'::'+point.id:'');option.textContent=surface.label+(point?' · '+(point.label||point.id):'');select.append(option);}if([...select.options].some(o=>o.value===selected))select.value=selected;
 },
 invalidate(a){const g=catRouteGraphs.get(a);if(g)g.checked=false;},
 links(a){if(a.support)this.route(a,a.support,a.support);const g=catRouteGraphs.get(a);return g?[...g.edges].flatMap(([id,edges])=>edges.map(e=>({a:g.byId.get(id),b:g.byId.get(e.id)}))):[];},
 route(a,target,origin){
  if(!target||!origin)return null;const surfaces=a.surfaces||[];let g=catRouteGraphs.get(a);const key=g?.checked&&g.surfaces===surfaces?g.key:surfaces.map(s=>[s.id,s.min,s.max,s.top].join(',')).join('|')+';'+a.scale+';'+(a.worldRect?.top||0)+';'+JSON.stringify(a.config||{});
  if(!g||g.key!==key){g={key,surfaces,byId:new Map(surfaces.map(s=>[s.id,s])),sorted:[...surfaces].sort((a,b)=>a.top-b.top),edges:new Map(),trees:new Map(),checks:0,queries:0};catRouteGraphs.set(a,g);}
  if(g.surfaces!==surfaces){g.surfaces=surfaces;g.byId=new Map(surfaces.map(s=>[s.id,s]));g.sorted=[...surfaces].sort((a,b)=>a.top-b.top);}
  if(!g.checked&&typeof requestAnimationFrame==='function'){g.checked=true;requestAnimationFrame(()=>{g.checked=false;});}
  const start=g.byId.get(origin.id);if(!start||!g.byId.has(target.id))return null;g.queries++;
  const treeKey=start.id+';'+!!target.home;let tree=g.trees.get(treeKey);
  if(!tree){
   const queue=[],costs=new Map([[start.id,0]]),parents=new Map(),done=new Set();let serial=0;
   const less=(a,b)=>a.cost<b.cost||a.cost===b.cost&&a.serial<b.serial;
   const push=item=>{item.serial=serial++;queue.push(item);let i=queue.length-1;while(i){const p=(i-1)>>1;if(!less(queue[i],queue[p]))break;[queue[i],queue[p]]=[queue[p],queue[i]];i=p;}};
   const pop=()=>{const first=queue[0],last=queue.pop();if(queue.length){queue[0]=last;let i=0;for(;;){let j=i,l=i*2+1,r=l+1;if(l<queue.length&&less(queue[l],queue[j]))j=l;if(r<queue.length&&less(queue[r],queue[j]))j=r;if(j===i)break;[queue[i],queue[j]]=[queue[j],queue[i]];i=j;}}return first;};
   push({id:start.id,cost:0});
   while(queue.length){const item=pop(),last=g.byId.get(item.id);if(done.has(last.id))continue;done.add(last.id);let edges=g.edges.get(last.id);
    if(!edges){edges=[];const lo=last.top-90*a.scale,hi=last.top+90*a.scale;let l=0,r=g.sorted.length;while(l<r){const mid=(l+r)>>1;if(g.sorted[mid].top<lo)l=mid+1;else r=mid;}
     for(let i=l;i<g.sorted.length&&g.sorted[i].top<=hi;i++){const next=g.sorted[i],gap=Math.max(0,last.min-next.max,next.min-last.max);if(next===last||gap>150*a.scale)continue;g.checks++;if(a.reachable(last,next))edges.push({id:next.id,cost:Math.hypot(gap,last.top-next.top)+8*a.scale});}g.edges.set(last.id,edges);}
    for(const edge of edges){const next=g.byId.get(edge.id),cost=item.cost+edge.cost+(next.home&&!target.home?24*a.scale:0);if(!done.has(next.id)&&cost<(costs.get(next.id)??Infinity)){costs.set(next.id,cost);parents.set(next.id,last.id);push({id:next.id,cost});}}
   }tree={costs,parents};g.trees.set(treeKey,tree);
  }
  a.surfaceRouteStats={supports:surfaces.length,edgeChecks:g.checks,queries:g.queries,trees:g.trees.size};
  if(!tree.costs.has(target.id))return null;const path=[];for(let id=target.id;id!==start.id;id=tree.parents.get(id)){if(!id)return null;path.push(g.byId.get(id));}return path.reverse();
 }
};
