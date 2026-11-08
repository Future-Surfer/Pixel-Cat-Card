import assert from 'node:assert/strict';
import {freshTreeWorkspace} from '../prototype/tree-components.mjs';
import {generateTree,auditTree,clone,validateTreeWorkspace} from '../prototype/tree-model.mjs';
import {parseTreeCode,encodeTreeCode,planTreeGraph} from '../prototype/tree-code.mjs';
const w=freshTreeWorkspace(),before=JSON.stringify(w),build=(code,workspace=w)=>generateTree(workspace,{mode:'recipe',recipe:code,width:128,height:200});
const code=`tree 2
# Forward references and descriptive names need no declaration ordering.
level 4
top = B on upper.head
level 3
upper = I on shelf.head
level 2
shelf = R on stem.head
level 1
stem = I on base.left
level 0
base = F`;
const t=build(code);assert.ok(t.valid,t.warnings);assert.ok(auditTree(t,w).ok);assert.equal(t.codeVersion,2);assert.ok(t.code.startsWith('tree 2\n'));assert.equal(t.instances.find(n=>n.name==='top').level,4);assert.equal(encodeTreeCode(build(t.code),w),t.code);
assert.deepEqual(build(code.replace(/level \d/g,'level 900')).instances.map(n=>[n.componentId,n.x,n.y]),t.instances.map(n=>[n.componentId,n.x,n.y]),'Level labels do not secretly alter geometry or reach');
const multi=clone(w),bridge=clone(multi.components.find(c=>c.id==='tree-platform'));bridge.id='two-support-deck';bridge.sockets=bridge.sockets.filter(s=>s.direction==='in');bridge.sockets[0].x=5;bridge.sockets.push({...bridge.sockets[0],id:'brace',x:21});multi.components.push(bridge);assert.doesNotThrow(()=>validateTreeWorkspace(multi));
const shared=`tree 2
base = F
left = I on base.left
right = I on base.right
deck = part{two-support-deck} on left.head via foot
join right.head -> deck.brace`;
const g=build(shared,multi);assert.ok(g.valid,g.warnings);assert.equal(g.instances.length,4);assert.equal(g.links.length,4);assert.ok(g.links.at(-1).secondary);assert.ok(auditTree(g,multi).ok);assert.equal(build(g.code,multi).code,g.code,'Shared supports survive canonical export/reimport');
for(const bad of [shared.replace(/\njoin .*/,''),shared.replace('via foot',''),shared+'\njoin right.head -> deck.brace',shared.replace('right = I on base.right','right = I on base.left'),shared.replace('deck.brace','deck.missing')]){const b=build(bad,multi);assert.equal(b.valid,false,bad);assert.equal(b.instances.length,0);}
const lattice=clone(multi),latticeDeck=lattice.components.find(c=>c.id===bridge.id);latticeDeck.sockets.push({id:'left',x:5,y:0,direction:'out',type:'pillar',accepts:['post']},{id:'right',x:21,y:0,direction:'out',type:'pillar',accepts:['post']});
for(let stages=1;stages<=10;stages++){
 const lines=['base = F'];for(let i=0;i<stages;i++){const parent=i?'d'+(i-1):'base';lines.push('l'+i+' = I on '+parent+'.left','r'+i+' = I on '+parent+'.right','d'+i+' = part{two-support-deck} on l'+i+'.head via foot','join r'+i+'.head -> d'+i+'.brace');}
 const code='tree 2\n'+lines.reverse().join('\n'),tree=build(code,lattice);assert.ok(tree.valid,tree.warnings);assert.ok(auditTree(tree,lattice).ok);assert.equal(tree.links.filter(l=>l.secondary).length,stages);assert.equal(build(tree.code,lattice).code,tree.code,'Nested shared supports round-trip exactly');
}
const shifted=clone(multi);shifted.components.find(c=>c.id===bridge.id).sockets.find(s=>s.id==='brace').x=22;assert.match(build(shared,shifted).warnings.join(),/does not align/,'A near-fitting extra support cannot be silently snapped');
const invalid=[
 'tree 3\nbase = F','tree 2','tree 2\nbase = F\nbase = F','tree 2\nlevel -1\nbase = F','tree 2\nlevel 1000\nbase = F',
 'tree 2\nbase = F\np = X on base.left','tree 2\nbase = F\np = part{missing} on base.left','tree 2\nbase = F\np = I on absent.head',
 'tree 2\na = F\nb = F','tree 2\nbase = F\na = I on b.head\nb = I on a.head','tree 2\nbase = F\np = I on p.head',
 'tree 2\nbase = F\np = I on base.left via head','tree 2\nbase = F\np = I on base.nope','tree 2\nbase = F\nunknown extension = true'
];
for(const bad of invalid){const b=build(bad);assert.equal(b.valid,false,bad);assert.ok(b.warnings.length);assert.equal(b.instances.length,0);}
// A support cycle involving a secondary edge is caught before any placement.
const cycleLibrary=clone(multi),support=cycleLibrary.components.find(c=>c.id===bridge.id);support.sockets.push({id:'head',x:5,y:0,direction:'out',type:'pillar',accepts:['platform']});for(const socket of cycleLibrary.components[0].sockets)socket.accepts.push('platform');
const cycleCode='tree 2; base = F; a = part{two-support-deck} on base.left via foot; b = part{two-support-deck} on base.right via foot; join a.head -> b.brace; join b.head -> a.brace';
assert.throws(()=>planTreeGraph(parseTreeCode(cycleCode),cycleLibrary),/Cyclic/);
assert.equal(build('tree 2\n# ignore this whole comment ; bad = Unknown\nbase = F').valid,true);
const thin=clone(w),post=thin.components.find(c=>c.id==='tree-post');post.width=1;post.height=1;post.rows=['r'];post.grips=[];post.sockets=[{id:'foot',x:0,y:1,direction:'in',type:'pillar',accepts:[]},{id:'head',x:0,y:0,direction:'out',type:'pillar',accepts:['post']}];
const long=['tree 2','base = F',...Array.from({length:127},(_,i)=>'n'+i+' = I on '+(i?'n'+(i-1)+'.head':'base.left'))].join('\n'),deep=build(long,thin);assert.ok(deep.valid,deep.warnings);assert.equal(deep.instances.length,128,'Deep arrangements do not depend on JavaScript recursion or 24 nested brackets');assert.equal(build(deep.code,thin).code,deep.code);assert.equal(build(long+'\ntooMany = I on n126.head',thin).valid,false);
for(const mutation of ['child','socket','input','type']){const broken=clone(g);broken.links.at(-1)[mutation]='invalid';assert.equal(auditTree(broken,multi).ok,false);}
const loose=clone(g);loose.links.pop();assert.equal(auditTree(loose,multi).ok,false,'Audit requires every support input');
assert.equal(JSON.stringify(w),before,'Graph compilation never edits artwork or workspace');
console.log('PASS: named/levelled assemblies, forward references, multi-support bridges, exact alignment, malformed/cyclic graphs, canonical export and 128-part deep layouts.');
