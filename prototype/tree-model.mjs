import {parseTreeCode,resolveTreeSymbol,encodeTreeCode,planTreeGraph} from './tree-code.mjs';
export const clone=value=>JSON.parse(JSON.stringify(value));
const kinds=['base','post','platform','house','bed','toy'],safeId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(v);
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const fail=message=>{throw Error(message);};
export function validateTreeWorkspace(w){
 if(!w||w.schema!=='pixel-cat-tree-workspace/v1'||typeof w.name!=='string'||w.name.length>100||!Array.isArray(w.components)||w.components.length<1||w.components.length>64)fail('Expected a tree workspace with 1–64 components.');
 if(!w.palette||Object.keys(w.palette).length<1||Object.keys(w.palette).length>32||Object.entries(w.palette).some(([k,v])=>!/^[a-zA-Z0-9]$/.test(k)||!/^#[a-f\d]{6}$/i.test(v)))fail('Palette needs single-character material tokens and hex colours.');
 if(w.paletteOrigin&&!['ai','human','mixed','unknown'].includes(w.paletteOrigin))fail('Invalid palette provenance.');
 const ids=new Set();for(const c of w.components){
  if(!safeId(c.id)||ids.has(c.id)||!kinds.includes(c.kind)||!integer(c.width,1,64)||!integer(c.height,1,64)||typeof c.name!=='string'||c.name.length>100||typeof c.notes!=='string'||c.notes.length>5000||!['ai','human','mixed','unknown'].includes(c.origin)||!['draft','reviewed'].includes(c.review)||!integer(c.revision,1,1000000))fail('Invalid component identity, dimensions or provenance.');ids.add(c.id);
  if(!Array.isArray(c.rows)||c.rows.length!==c.height||c.rows.some(r=>typeof r!=='string'||r.length!==c.width||[...r].some(t=>t!=='.'&&!Object.hasOwn(w.palette,t))))fail(c.name+': invalid pixel rows/material token.');
  const point=p=>integer(p.x,0,c.width)&&integer(p.y,0,c.height),unique=new Set();
  if(!Array.isArray(c.sockets)||c.sockets.length>16)fail('Limit each component to 16 sockets.');
  for(const s of c.sockets){if(!safeId(s.id)||unique.has(s.id)||!point(s)||!['in','out'].includes(s.direction)||!['pillar','toy'].includes(s.type)||!Array.isArray(s.accepts)||s.accepts.some(k=>!kinds.includes(k)))fail(c.name+': invalid socket.');unique.add(s.id);}
  if(c.kind==='base'?c.sockets.some(s=>s.direction==='in'):!c.sockets.some(s=>s.direction==='in'))fail(c.name+': foundation has no input; other parts require at least one input.');
  if(!Array.isArray(c.supports)||c.supports.length>16||c.supports.some(s=>!safeId(s.id)||!integer(s.x1,0,c.width)||!integer(s.x2,s.x1+1,c.width)||!integer(s.y,0,c.height)))fail(c.name+': invalid standing span.');
  if(!Array.isArray(c.grips)||c.grips.length>16||c.grips.some(g=>!safeId(g.id)||!integer(g.x1,0,c.width)||!integer(g.x2,g.x1+1,c.width)||!integer(g.y1,0,c.height)||!integer(g.y2,g.y1+1,c.height)||!['rope','fabric','wood'].includes(g.material)||!Array.isArray(g.sides)||g.sides.some(s=>!['left','right','front','back'].includes(s))))fail(c.name+': invalid climb span.');
  for(const layer of ['near','far'])if(!Array.isArray(c[layer])||c[layer].length>c.width*c.height||c[layer].some(p=>!integer(p.x,0,c.width-1)||!integer(p.y,0,c.height-1)||c.rows[p.y][p.x]==='.'))fail(c.name+': depth guides must sit on painted cells.');
  const near=new Set(c.near.map(p=>p.x+','+p.y));if(c.far.some(p=>near.has(p.x+','+p.y)))fail('A cell cannot be both always near and always far.');
  if(c.entrance&&(!integer(c.entrance.x1,0,c.width)||!integer(c.entrance.x2,c.entrance.x1+1,c.width)||!integer(c.entrance.y1,0,c.height)||!integer(c.entrance.y2,c.entrance.y1+1,c.height)||!Object.hasOwn(w.palette,c.entrance.token)))fail('Invalid doorway region/material.');
 }
 const p=w.parameters;if(!p||typeof p.seed!=='string'||p.seed.length>100||!integer(p.width,16,160)||!integer(p.height,16,200)||!integer(p.levels,1,5)||!integer(p.branches,1,3)||!integer(p.minPost,1,5)||!integer(p.maxPost,p.minPost,5)||['houseChance','bedChance','toyChance'].some(k=>!Number.isFinite(p[k])||p[k]<0||p[k]>1))fail('Generation parameters are outside supported limits.');
 if(p.mode!==undefined&&! ['random','recipe'].includes(p.mode))fail('Unknown generation mode.');if(p.recipe!==undefined&&(typeof p.recipe!=='string'||p.recipe.length>20000))fail('Tree code must be at most 20,000 characters.');
 return w;
}
export function treeRandom(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,h|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function compatible(parent,socket,child,inputId){const input=child.sockets.find(s=>s.direction==='in'&&(!inputId||s.id===inputId));return socket.direction==='out'&&input&&socket.type===input.type&&socket.accepts.includes(child.kind);}
const overlap=(a,b)=>Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>0&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>0;
export function generateTree(workspace,overrides={}){
 const w=validateTreeWorkspace({...workspace,parameters:{...workspace.parameters,...overrides}});
 try{return buildTree(w);}catch(error){if(w.parameters.mode!=='recipe')throw error;return {schema:'pixel-cat-tree/v2',seed:w.parameters.seed,code:w.parameters.recipe,codeVersion:2,bounds:{width:w.parameters.width,height:w.parameters.height},instances:[],links:[],affordances:[],valid:false,warnings:[error.message],attempts:0};}
}
function buildTree(w){
 const p=w.parameters,random=treeRandom(p.seed),pick=a=>a.length?a[Math.floor(random()*a.length)]:null,byKind=k=>w.components.filter(c=>c.kind===k&&(p.mode==='recipe'||c.sockets.filter(s=>s.direction==='in').length<=1)&&c.rows.some(row=>[...row].some(t=>t!=='.'))),byId=new Map(w.components.map(c=>[c.id,c])),instances=[],links=[],used=new Set(),rejected=[];let attempts=0;
 const instance=(c,x,y,parent=null,socket=null)=>({id:'part-'+instances.length,componentId:c.id,kind:c.kind,x,y,width:c.width,height:c.height,parent,socket});
 const fits=(n,parent,otherParents=[])=>{
  if(p.mode!=='recipe'&&(n.x<0||n.y<0||n.x+n.width>p.width||n.y+n.height>p.height))return 'card bounds';
  for(const old of instances)if(overlap(n,old)){const oy=Math.min(n.y+n.height,old.y+old.height)-Math.max(n.y,old.y);if((old.id!==parent&&!otherParents.includes(old.id))||oy>2)return 'component overlap';}return '';
 };
 const attach=(parent,socket,c,inputId,otherParents=[])=>{if(attempts>=256)return null;attempts++;const pc=byId.get(parent.componentId),key=parent.id+':'+socket.id;if(used.has(key)||!compatible(pc,socket,c,inputId))return null;const input=c.sockets.find(s=>s.direction==='in'&&(!inputId||s.id===inputId)),n=instance(c,parent.x+socket.x-input.x,parent.y+socket.y-input.y,parent.id,socket.id),reason=fits(n,parent.id,otherParents);if(reason){if(rejected.length<24)rejected.push({component:c.id,reason});return null;}instances.push(n);used.add(key);links.push({parent:parent.id,socket:socket.id,child:n.id,input:input.id,type:socket.type});return n;};
 const recipe=p.mode==='recipe'?parseTreeCode(p.recipe):null;
 if(p.mode==='recipe'&&!recipe)throw Error('The root cannot be empty.');
 const graph=recipe?.format==='graph'?planTreeGraph(recipe,w):null;
 const base=graph?graph.root.component:recipe?resolveTreeSymbol(w,recipe.symbol==='F'?recipe:{symbol:'F'}):pick(byKind('base').filter(c=>c.width<=p.width&&c.height<=p.height));if(!base)return {schema:'pixel-cat-tree/v2',codeVersion:2,code:'',seed:p.seed,bounds:{width:p.width,height:p.height},instances,links,affordances:[],valid:false,warnings:['No foundation fits the allocated card space.'],attempts};
 const foundation=instance(base,Math.floor((p.width-base.width)/2),p.height-base.height);instances.push(foundation);
 const minimumCap=Math.min(...['platform','house','bed'].flatMap(k=>byKind(k).map(c=>c.height)));
 const roots=base.sockets.filter(s=>s.direction==='out'&&s.type==='pillar'); // authored order is stable
 if(graph){
  foundation.name=graph.root.id;foundation.level=graph.root.level;const placed=new Map([[graph.root.id,foundation]]);
  for(const node of graph.order.filter(n=>n!==graph.root)){
   const edge=graph.links.find(l=>l.child===node.id&&!l.secondary),parent=placed.get(edge.parent),pc=byId.get(parent.componentId),socket=pc.sockets.find(s=>s.id===edge.socket),others=graph.links.filter(l=>l.child===node.id&&l.secondary).map(l=>placed.get(l.parent).id);
   const n=attach(parent,socket,node.component,edge.input,others);if(!n)throw Error('Cannot place '+node.id+': '+(rejected.at(-1)?.reason||'connection budget exhausted'));n.name=node.id;n.level=node.level;placed.set(node.id,n);
  }
  for(const edge of graph.links.filter(l=>l.secondary)){const a=placed.get(edge.parent),b=placed.get(edge.child),output=byId.get(a.componentId).sockets.find(s=>s.id===edge.socket),input=byId.get(b.componentId).sockets.find(s=>s.id===edge.input);
   if(a.x+output.x!==b.x+input.x||a.y+output.y!==b.y+input.y)throw Error('Support does not align: '+edge.parent+'.'+edge.socket+' -> '+edge.child+'.'+edge.input);links.push({parent:a.id,socket:edge.socket,child:b.id,input:edge.input,type:output.type,secondary:true});
  }
 }else if(recipe){
  const placeChildren=(parent,node,depth=0)=>{
   if(depth>128||instances.length>128)throw Error('Tree code exceeds 128 parts.');
   const c=byId.get(parent.componentId),available=c.sockets.filter(s=>s.direction==='out');
   if(node.symbol==='T'&&available.filter(s=>s.type==='pillar').length!==2)throw Error('T needs a component with two pillar outputs.');
   const claimed=new Set();for(const child of node.children){
    const target=child.node,cc=target?resolveTreeSymbol(w,target):null;
    const socket=child.port?available.find(s=>s.id===child.port):available.find(s=>!claimed.has(s.id)&&(cc?compatible(c,s,cc):s.type==='pillar'));
    if(!socket||claimed.has(socket.id))throw Error('Missing or repeated output on '+c.name+(child.port?': '+child.port:''));claimed.add(socket.id);if(!target)continue;
    if(target.symbol==='F')throw Error('F is only allowed at the root.');let next=attach(parent,socket,cc);if(!next)throw Error('Cannot attach '+cc.name+' to '+c.name+': '+(rejected.at(-1)?.reason||'incompatible socket'));
    for(let i=1;i<target.count;i++){const head=cc.sockets.find(s=>s.direction==='out'&&s.type==='pillar');if(!head)throw Error('Repeated post has no continuation.');const added=attach(next,head,cc);if(!added)throw Error('Repeated post cannot attach.');next=added;if(instances.length>128)throw Error('Tree code exceeds 128 parts.');}
    placeChildren(next,target,depth+target.count);
   }
  };
  placeChildren(foundation,recipe.symbol==='F'?recipe:{symbol:'F',children:[{port:null,node:recipe}]});
 }else for(let branch=0;branch<Math.min(p.branches,roots.length);branch++){
  let parent=foundation,socket=roots[(branch+Math.floor(random()*roots.length))%roots.length];if(used.has(parent.id+':'+socket.id))socket=roots.find(s=>!used.has(parent.id+':'+s.id));if(!socket)break;
  for(let level=0;level<p.levels&&attempts<256;level++){
   const stage={parts:instances.length,links:links.length,used:[...used]},rollback=()=>{instances.length=stage.parts;links.length=stage.links;used.clear();for(const key of stage.used)used.add(key);};
   const count=p.minPost+Math.floor(random()*(p.maxPost-p.minPost+1));let added=0;
   for(let n=0;n<count;n++){const post=pick(byKind('post'));if(!post)break;const foot=post.sockets.find(s=>s.direction==='in');if(parent.y+socket.y-foot.y<minimumCap)break;const next=attach(parent,socket,post);if(!next)break;parent=next;socket=post.sockets.find(s=>s.direction==='out'&&s.type==='pillar');added++;if(!socket)break;}
   if(!added||!socket){rollback();break;}
   const roll=random(),desired=roll<p.houseChance?'house':roll<p.houseChance+p.bedChance?'bed':'platform';
   const order=[...byKind(desired),...byKind('platform'),...byKind('bed')].filter((v,i,a)=>a.findIndex(c=>c.id===v.id)===i);let cap;
   // Randomised starting component, bounded fallbacks; no forced scaling or crop.
   if(order.length){const shift=Math.floor(random()*Math.max(1,byKind(desired).length));order.push(...order.splice(0,shift));}
   for(const c of order){cap=attach(parent,socket,c);if(cap)break;}
   if(!cap){rollback();break;}const component=byId.get(cap.componentId);
   const toySocket=component.sockets.find(s=>s.type==='toy'&&s.direction==='out');if(toySocket&&random()<p.toyChance){const toy=pick(byKind('toy'));if(toy)attach(cap,toySocket,toy);}
   const exits=component.sockets.filter(s=>s.type==='pillar'&&s.direction==='out');if(!exits.length)break;parent=cap;socket=pick(exits);
  }
 }
 if(recipe){
  const minX=Math.min(...instances.map(n=>n.x)),maxX=Math.max(...instances.map(n=>n.x+n.width)),minY=Math.min(...instances.map(n=>n.y));
  if(maxX-minX>p.width||p.height-minY>p.height)throw Error('Exact code needs '+(maxX-minX)+' × '+(p.height-minY)+' cells; available '+p.width+' × '+p.height+'. Increase the slot or edit the code.');
  const shift=minX<0?-minX:maxX>p.width?p.width-maxX:0;for(const n of instances)n.x+=shift;
 }
 const affordances=instances.flatMap(n=>{const c=byId.get(n.componentId);return[...c.supports.map(s=>({...s,id:n.id+':'+s.id,kind:'support',owner:n.id,x1:n.x+s.x1,x2:n.x+s.x2,y:n.y+s.y,passThrough:true})),...c.grips.map(g=>({...g,id:n.id+':'+g.id,kind:'grip',owner:n.id,x1:n.x+g.x1,x2:n.x+g.x2,y1:n.y+g.y1,y2:n.y+g.y2,passThrough:true}))];});
 const warnings=[];if(instances.length===1)warnings.push('Only the foundation fits. Increase the space budget or adjust socket geometry.');if(!instances.some(n=>['platform','house','bed'].includes(n.kind)))warnings.push('No upper resting component fits this seed/budget.');
 const result={schema:'pixel-cat-tree/v2',seed:p.seed,codeVersion:2,bounds:{width:p.width,height:p.height},instances,links,affordances,valid:true,warnings,attempts,rejected};const audit=auditTree(result,w);if(!audit.ok)throw Error(audit.errors.join('; '));result.code=encodeTreeCode(result,w);return result;
}
// Structural audit is separate from actor-specific routes and physical jump proofs.
export function auditTree(tree,workspace){
 const errors=[],byId=new Map(tree.instances.map(n=>[n.id,n])),defs=new Map(workspace.components.map(c=>[c.id,c])),ids=new Set(),outputs=new Set(),inputs=new Set(),primary=new Set(),roots=tree.instances.filter(n=>!n.parent),edges=new Set();
 if(roots.length!==1||roots[0]?.kind!=='base')errors.push('One foundation root is required');
 for(const n of tree.instances){const c=defs.get(n.componentId);if(ids.has(n.id)||!c||n.kind!==c.kind||n.width!==c.width||n.height!==c.height||![n.x,n.y].every(Number.isInteger)||n.x<0||n.y<0||n.x+n.width>tree.bounds.width||n.y+n.height>tree.bounds.height)errors.push('Invalid placement '+n.id);ids.add(n.id);}
 for(const l of tree.links){const a=byId.get(l.parent),b=byId.get(l.child),ac=a&&defs.get(a.componentId),bc=b&&defs.get(b.componentId),s=ac?.sockets.find(s=>s.id===l.socket),input=bc?.sockets.find(s=>s.id===l.input),out=l.parent+':'+l.socket,into=l.child+':'+l.input;
  if(!a||!b||a===b||!s||!input||input.direction!=='in'||!compatible(ac,s,bc,input.id)||l.type!==s.type||a.x+s.x!==b.x+input.x||a.y+s.y!==b.y+input.y||outputs.has(out)||inputs.has(into))errors.push('Broken connection '+l.child);
  if(!l.secondary){if(!b||b.parent!==l.parent||b.socket!==l.socket||primary.has(l.child))errors.push('Invalid primary parent '+l.child);primary.add(l.child);}outputs.add(out);inputs.add(into);edges.add(l.parent+':'+l.child);
 }
 for(const n of tree.instances){if(n.parent&&!primary.has(n.id))errors.push('Missing primary connection '+n.id);for(const s of defs.get(n.componentId)?.sockets.filter(s=>s.direction==='in')||[])if(!inputs.has(n.id+':'+s.id))errors.push('Unconnected required input '+n.id+'.'+s.id);}
 const degree=new Map(tree.instances.map(n=>[n.id,0]));for(const l of tree.links)degree.set(l.child,(degree.get(l.child)||0)+1);const queue=tree.instances.filter(n=>degree.get(n.id)===0).map(n=>n.id),reached=new Set();for(let i=0;i<queue.length;i++){const id=queue[i];reached.add(id);for(const l of tree.links.filter(l=>l.parent===id)){degree.set(l.child,degree.get(l.child)-1);if(degree.get(l.child)===0)queue.push(l.child);}}
 if(reached.size!==tree.instances.length||primary.size!==tree.instances.length-1)errors.push('Disconnected or cyclic structure');
 for(let i=0;i<tree.instances.length;i++)for(let j=i+1;j<tree.instances.length;j++){const a=tree.instances[i],b=tree.instances[j];if(overlap(a,b)&&(!(edges.has(a.id+':'+b.id)||edges.has(b.id+':'+a.id))||Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>2))errors.push('Overlapping parts '+a.id+'/'+b.id);}
 return {ok:tree.valid&&!errors.length,errors,geometryOnly:true};
}
export function componentPixels(c,palette){return c.rows.flatMap((row,y)=>[...row].flatMap((token,x)=>token==='.'?[]:[{x,y,token,colour:palette[token]}]));}
