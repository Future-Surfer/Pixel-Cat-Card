import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const b={window:{},performance};for(const f of ['cat-settling.js','cat-commands.js'])vm.runInNewContext(fs.readFileSync('prototype/'+f,'utf8'),b);
const Q=b.window.pixelCatCommandsV1,S=b.window.pixelCatSettlingV1,root={};
function actor(){const a={active:true,root,x:120,y:300,scale:2,facing:1,support:{id:'floor'},idle:{pose:'sleep',poseUntil:600000},deadline:600000,attrs:{},removeAttribute(k){delete this.attrs[k]},setAttribute(k,v){this.attrs[k]=v},status(){},requestStartle(cue){this.cue=cue;this.idle=null;this.motion={kind:'startle'};return true;}};a.settling={activeMs:400000,idle:a.idle};return a;}
const source=actor(),sleeping=actor(),flying=actor(),paused=actor(),away=actor(),climbing=actor();away.root={};flying.motion={kind:'jump'};paused.paused=true;climbing.climb={};
b.window.pixelCatReactionsV1={airborne:a=>a.motion?.kind==='jump'};
const owners=()=>new Map([source,sleeping,flying,paused,away,climbing].map(a=>[a,{root:a.root}]));Q.startleAll(source,owners,1000);
for(const a of [source,sleeping,flying,paused,climbing]){assert.equal(a.settling.activeMs,0);assert.equal(a.settling.idle,null);assert.equal(S.holding(a,1001),false);}
assert.equal(away.settling.activeMs,400000,'Other views stay asleep');assert.equal(source.cue.x,168);assert.ok(sleeping.motion);assert.equal(paused.paused,true);assert.equal(paused.motion,undefined);assert.ok(flying.manualStartle);assert.ok(climbing.manualStartle);
flying.motion=null;flying.x=400;flying.y=700;Q.tick(flying,1200);assert.equal(flying.cue.x,448,'Queued startle uses actual landing, not old coordinates');climbing.climb=null;Q.tick(climbing,1300);assert.ok(climbing.motion);
{const a=actor();a.requestStartle=()=>false;Q.startleAll(a,()=>new Map([[a,{root}]]),2000);assert.equal(a.settling.activeMs,0);assert.equal(a.manualStartle,null);assert.equal(a.attrs['data-manual-startle'],'woken · no safe hop');}
{const a=actor();a.motion={kind:'jump'};let queries=0,advances=0;b.window.pixelCatCardClimbV1={wallRoute:()=>{queries++;return[{surface:a.support}]}};a.cancelPlay=()=>{};a.advance=()=>advances++;Q.wallJump(a,2000);assert.equal(queries,0);a.motion=null;Q.tick(a,2100);assert.equal(queries,1);assert.equal(advances,1);Q.tick(a,2200);assert.equal(queries,1,'No repeated planning after one command');}
console.log('PASS: view-scoped wake/startle, independent safe landing queues, manual Pause, blocked-hop wake and one-shot wall planning.');
