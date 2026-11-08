import assert from 'node:assert/strict';
import {freshTreeWorkspace} from '../prototype/tree-components.mjs';
import {generateTree,auditTree,clone,validateTreeWorkspace} from '../prototype/tree-model.mjs';
import {parseTreeCode,encodeTreeCode} from '../prototype/tree-code.mjs';
const w=freshTreeWorkspace(),original=JSON.stringify(w),build=(recipe,extra={})=>generateTree(w,{mode:'recipe',recipe,...extra});
for(const code of ['ITOO','I T(O,O)','I2 T(I B,I O)','F(left:I P,right:I2 O)','v1: I T(O,.)']){const t=build(code);assert.ok(t.valid,code+': '+t.warnings);assert.ok(auditTree(t,w).ok);}
const simple=build('ITOO');assert.deepEqual(simple.instances.map(n=>n.componentId),['tree-base','tree-post','tree-fork','tree-house','tree-house']);
assert.deepEqual(build('ITOO',{seed:'ignored'}).instances,simple.instances,'Recipe geometry is independent of random seed');
for(const code of ['', '.', 'Q','I0','I17','O2','T(O)','T(O,O,O)','F(nope:I)','F(left:I,left:I)','I F','O(I)','ITOOO','I16 I16 I16 I16 I16 I16 I16 I16 I16']){const t=build(code);assert.equal(t.valid,false,code);assert.equal(t.instances.length,0,'Failed explicit codes never return a silently shortened tree');assert.ok(t.warnings[0]);}
assert.equal(build('ITOO',{width:32}).valid,false);assert.match(build('I16 O').warnings[0],/Exact code needs/);
const legacy=clone(w);delete legacy.parameters.mode;delete legacy.parameters.recipe;legacy.components=legacy.components.filter(c=>['tree-base','tree-post','tree-platform','tree-wide','tree-house','tree-bed','tree-toy'].includes(c.id));assert.ok(generateTree(legacy).valid);assert.match(generateTree(legacy,{mode:'recipe',recipe:'ITOO'}).warnings[0],/Add missing draft components/);assert.equal(legacy.components.length,7);
const custom=clone(w),post=clone(custom.components.find(c=>c.id==='tree-post'));post.id='my-post';post.sockets[1].id='up';custom.components.push(post);const ct=generateTree(custom,{mode:'recipe',recipe:'I2{my-post}(up:B)'});assert.ok(ct.valid,ct.warnings);assert.equal(generateTree(custom,{mode:'recipe',recipe:ct.code}).valid,true);assert.ok(ct.code.includes('{my-post}'));
// Compare by socket path: code canonicalisation can reorder sibling instance IDs.
function geometry(t){const parts=new Map(t.instances.map(n=>[n.id,n])),path=n=>n.parent?path(parts.get(n.parent))+'/'+n.socket:'root';return t.instances.map(n=>({path:path(n),component:n.componentId,x:n.x,y:n.y})).sort((a,b)=>a.path.localeCompare(b.path));}
for(let i=0;i<500;i++){const a=generateTree(w,{seed:'code-'+i,width:96,height:150,toyChance:1}),b=build(a.code,{width:96,height:150});assert.ok(b.valid,a.code+': '+b.warnings);assert.ok(auditTree(b,w).ok);assert.deepEqual(geometry(b),geometry(a),a.code);assert.equal(encodeTreeCode(b,w),a.code);}
assert.throws(()=>parseTreeCode('I '.repeat(130)),/limit/);assert.throws(()=>parseTreeCode('I'.repeat(20001)),/20,000/);
const incomplete=clone(w);incomplete.parameters.mode='recipe';incomplete.parameters.recipe='T(';assert.doesNotThrow(()=>validateTreeWorkspace(incomplete),'Incomplete code can be autosaved for recovery');assert.equal(JSON.stringify(w),original,'Compiling never mutates artwork/workspace');
console.log('PASS: readable tree codes, exact fit failures, legacy/custom libraries, limits and 500 exact random/code geometry round trips.');

const spine=build('I R(head:I L(head:I B))',{width:64,height:100});assert.ok(spine.valid,spine.warnings);assert.ok(auditTree(spine,w).ok);assert.equal(spine.instances.filter(n=>n.componentId.startsWith('tree-spine')).length,2);
for(const link of spine.links.filter(l=>l.socket==='head')){const a=spine.instances.find(n=>n.id===link.parent),b=spine.instances.find(n=>n.id===link.child),ac=w.components.find(c=>c.id===a.componentId),bc=w.components.find(c=>c.id===b.componentId);assert.equal(a.x+ac.sockets.find(s=>s.id==='head').x,b.x+bc.sockets.find(s=>s.direction==='in').x,'Central post remains straight through shelves');}
for(const c of w.components.filter(c=>c.id.startsWith('tree-spine')))for(let y=0;y<c.height;y++){const axis=c.sockets.find(s=>s.id==='head').x;assert.notEqual(c.rows[y][axis],'.','No visual gap in spine');}

assert.equal(generateTree(legacy,{mode:'recipe',recipe:'I R(head:I B)'}).valid,false,'Missing spine parts cannot silently become a different platform');
