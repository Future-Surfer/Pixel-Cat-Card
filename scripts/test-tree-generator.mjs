import fs from 'node:fs';
import assert from 'node:assert/strict';
import {freshTreeWorkspace} from '../prototype/tree-components.mjs';
import {clone,validateTreeWorkspace,generateTree,auditTree,compatible} from '../prototype/tree-model.mjs';
const w=freshTreeWorkspace(),before=JSON.stringify(w),shapes=new Set();validateTreeWorkspace(w);
for(let i=0;i<250;i++)for(const [width,height]of [[32,32],[48,48],[64,72],[90,120]]){const t=generateTree(w,{seed:'audit-'+i,width,height});assert.equal(JSON.stringify(t),JSON.stringify(generateTree(w,{seed:'audit-'+i,width,height})),'Same seed/library/parameters reproduce the exact structure');assert.ok(auditTree(t,w).ok);assert.ok(t.attempts<=256);const ids=new Map(t.instances.map(n=>[n.id,n])),used=new Set();
 for(const n of t.instances){assert.ok(n.x>=0&&n.y>=0&&n.x+n.width<=width&&n.y+n.height<=height);if(n.parent)assert.ok(ids.has(n.parent));}
 for(const l of t.links){const key=l.parent+':'+l.socket;assert.ok(!used.has(key),'Output socket cannot be occupied twice');used.add(key);}
 for(let a=0;a<t.instances.length;a++)for(let b=a+1;b<t.instances.length;b++){const x=t.instances[a],y=t.instances[b],dx=Math.min(x.x+x.width,y.x+y.width)-Math.max(x.x,y.x),dy=Math.min(x.y+x.height,y.y+y.height)-Math.max(x.y,y.y);if(dx>0&&dy>0)assert.ok((x.parent===y.id||y.parent===x.id)&&dy<=2,'Only direct attachment contact may overlap');}
 assert.ok(t.affordances.every(a=>a.passThrough));if(width===64)shapes.add(t.instances.map(n=>n.componentId+':'+n.x+','+n.y).join('|'));
}
for(let i=0;i<40;i++){const small=generateTree(w,{seed:'compact-'+i,width:48,height:28});assert.ok(small.instances.some(n=>['platform','house','bed'].includes(n.kind)),'Compact budget shortens the stem to leave space for a cap');}
assert.ok(shapes.size>20,'Seeds vary structure rather than palette alone');assert.equal(JSON.stringify(w),before,'Generation never edits authored components');assert.equal(generateTree(w,{width:16,height:16}).valid,false,'No cropped/shrunk foundation fallback');
const post=w.components.find(c=>c.kind==='post'),head=post.sockets.find(s=>s.direction==='out');assert.ok(compatible(post,head,post),'Rope segments can repeat the same component');const toy=w.components.find(c=>c.kind==='toy');assert.equal(compatible(post,head,toy),false,'Typed sockets reject unrelated attachments');
for(const change of [v=>v.components[0].rows[0]='?',v=>v.components[0].sockets[0].x=999,v=>v.components[1].grips[0].y2=999,v=>v.parameters.width=Infinity,v=>v.components.push(clone(v.components[0])),v=>v.components[0].near=[{x:0,y:0}],v=>v.palette.a='url(evil)']){const bad=clone(w);change(bad);assert.throws(()=>validateTreeWorkspace(bad));}
const simpleSource=JSON.parse(fs.readFileSync('frame-studio/user-sequences/beds-2026-10-16/saved-changes.json','utf8')).find(e=>e.snapshot.name==='Simple Bed'),bed=w.components.find(c=>c.id==='tree-bed'),materials={'#804b19':'c','#aa6627':'b','#762837':'g','#964252':'f'};
assert.deepEqual(bed.rows,simpleSource.snapshot.pixels.map(row=>row.map(c=>c?materials[c]:'.').join('')),'Tree bed preserves the authored default-bed silhouette and material regions');assert.equal(bed.source.versionHash,simpleSource.versionHash);assert.equal(bed.origin,'mixed');assert.equal(bed.width,21);assert.equal(bed.height,7);
const enclosures=w.components.filter(c=>c.variantOf==='tree-house');assert.equal(enclosures.length,4);
for(const c of enclosures){const e=c.entrance,rows=c.rows.flatMap((r,y)=>[...r].flatMap((token,x)=>token==='o'?[{x,y}]:[]));assert.ok(rows.length>0);assert.ok(rows.every(p=>p.x>=e.x1&&p.x<e.x2&&p.y>=e.y1&&p.y<e.y2),'Every cavity pixel remains inside the entrance bounds');
 if(e.shape==='round'){assert.equal(c.rows[e.y1][e.x1],'b','Round opening retains solid corners');const center=Math.floor((e.y1+e.y2)/2);assert.ok([...c.rows[center]].filter(t=>t==='o').length>[...c.rows[e.y1]].filter(t=>t==='o').length,'Round aperture widens in its middle');}
 const tree=generateTree(w,{mode:'recipe',recipe:'tree 2; base = F; post = I on base.left; box = part{'+c.id+'} on post.head'});assert.ok(tree.valid,tree.warnings);assert.ok(auditTree(tree,w).ok);assert.equal(c.origin,'ai');assert.equal(c.review,'draft');
}
const tree=generateTree(w),broken=clone(tree);broken.links[0].socket='missing';assert.equal(auditTree(broken,w).ok,false);
console.log(`PASS: 1,000 seeded fit/collision/socket audits, ${shapes.size} distinct default-budget structures, repeatable native-scale posts, immutable assets, typed compatibility and malformed geometry rejection.`);
