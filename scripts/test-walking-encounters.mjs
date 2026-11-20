import assert from 'node:assert/strict';
import {encounterFixture} from './testing/encounter-fixture.mjs';
let scenarios=0,delayed=0;
for(const scale of [.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6]){
 const f=encounterFixture(scale);
 for(const edge of ['left','right'])for(const facing of [-1,1])for(const pose of ['sit','stand','loaf','sleep']){
  f.api.owners.clear();const start=edge==='left'?f.surface.min:f.surface.max,direction=edge==='left'?1:-1;
  const a=f.cat('walker',start,pose),b=f.cat('neighbour',start+direction*65*scale,'sleep');
  a.facing=facing;a.idle.facing=facing;a.social.frame.facing=facing;a.social.visible=new Set([b.ownerKey]);a.social.clock=300;a.mood.random=()=>0;
  a.moveTo(start+direction*150*scale,400,0,'walk',f.surface,f.time);
  const m=a.motion,original={...m,cumulativeMs:[...m.cumulativeMs],headOffsets:[...m.headOffsets]},position=a.x;
  a.social.encounter(f.time);scenarios++;
  const evidence=JSON.stringify({scale,edge,facing,pose,from:original.fromX,to:m.x,cells:m.cells});
  assert.equal(a.motion,m);assert.equal(a.x,position,'Queueing the pause cannot snap position');
  assert.ok(m.x>=f.surface.min&&m.x<=f.surface.max,evidence);
  assert.equal(m.x,m.fromX+m.direction*m.cells*scale);
  assert.deepEqual(Array.from(m.cumulativeMs),original.cumulativeMs.slice(0,m.cells));assert.deepEqual(Array.from(m.headOffsets),original.headOffsets.slice(0,m.cells+1));
  assert.equal(m.duration,m.cumulativeMs.at(-1));
  if(m.cells>1&&m.cells<original.cells){delayed++;const earlier=m.fromX+m.direction*(m.cells-1)*scale;assert.ok(earlier<f.surface.min||earlier>f.surface.max,'Use the earliest safe planned beat');}
 }
}
assert.equal(scenarios,192);assert.ok(delayed>0);
for(const mode of ['transfer','no-safe-intermediate','home-command','manual-pause','carrying']){
 const f=encounterFixture(),a=f.cat('walker',100),b=f.cat('neighbour',230,'sleep');a.social.visible=new Set([b.ownerKey]);a.mood.random=()=>0;
 a.moveTo(400,400,0,'walk',f.surface,f.time);const m=a.motion;
 if(mode==='transfer')m.target={...f.surface,id:'other',el:{}};
 if(mode==='no-safe-intermediate'){m.fromX=-4;m.direction=1;m.cells=2;m.x=0;m.cumulativeMs=[100,200];m.headOffsets=[0,1,2];m.duration=200;}
 if(mode==='home-command')a.command='home';
 if(mode==='manual-pause')a.paused=true;
 if(mode==='carrying')a.carriedToy='mouse';
 const before=JSON.stringify(m);a.social.encounter(f.time);
 if(mode!=='carrying')assert.equal(JSON.stringify(m),before,mode+' preserves the original route');
 else assert.equal(a.carriedToy,'mouse','A voluntary walking pause retains possession');
}
console.log(`PASS: ${scenarios} edge/pose/direction/scale combinations, ${delayed} safely delayed stops, intact gait/position, transfers and command/pause/possession guards.`);
