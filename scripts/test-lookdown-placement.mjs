import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {latestProjects} from './latest-studio-assets.mjs';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>0}};
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming-art.js','utf8')+fs.readFileSync('pixel-cat-roaming-extras.js','utf8')+fs.readFileSync('pixel-cat-affordances.js','utf8')+fs.readFileSync('pixel-cat-behaviours.js','utf8')+fs.readFileSync('pixel-cat-roaming.js','utf8')+'\nglobalThis.api={Home:PixelCatHome,walkSample,walkAppearance,idleSample,idleContact,frameContact,rearContact,idleTransitionContact,narrowIdleContact,art:CAT_ART};',box);
const {idleSample,idleContact,frameContact,rearContact,idleTransitionContact,narrowIdleContact,art}=box.api;
assert.equal(JSON.stringify(art.idleSequences.lookdown.frames),JSON.stringify(latestProjects.get('pose-look-down').project.frames.map(f=>f.rows)),'Keep every saved pixel');
for(const scale of [1,2,3])for(const facing of [-1,1]){
 const startX=100*scale,supportY=300*scale,perch=idleSample(art,'perch',0),perchAnchor=frameContact(perch.rows,facing,perch.anchor||idleContact(perch.rows)),first=idleSample(art,'lookdown',0),anchor=frameContact(first.rows,facing,first.anchor),rear=frameContact(first.rows,facing,rearContact(first.rows));
 const old={pose:'perch',facing,rows:perch.rows,placement:{x:startX,top:supportY-(perchAnchor[1]+1)*scale},contactX:startX+perchAnchor[0]*scale};
 assert.equal(JSON.stringify(perch.rows),JSON.stringify(first.rows));
 const contactX=idleTransitionContact(old,'lookdown',first,facing,scale,startX),rearWorld=startX+rear[0]*scale;
 assert.equal(contactX,rearWorld);assert.equal(contactX-anchor[0]*scale,startX,'Identical entry artwork cannot slide');
 let last;
 for(let elapsed=0;elapsed<4000;elapsed+=25){
  const sample=idleSample(art,'lookdown',elapsed,{clip_exit_at_ms:4000}),point=frameContact(sample.rows,facing,sample.anchor),x=contactX-point[0]*scale,top=supportY-(point[1]+1)*scale;
  assert.equal(x+frameContact(sample.rows,facing,rearContact(sample.rows))[0]*scale,rearWorld,'Fixed rear support through every phase');assert.equal(top+(point[1]+1)*scale,supportY);
  last={pose:'lookdown',facing,rows:sample.rows,placement:{x,top},contactX};
  assert.equal(narrowIdleContact({left:rearWorld-3*scale,right:rearWorld+scale},sample.rows,point,facing,scale,contactX,'lookdown'),contactX,'Overhanging forepaws cannot push the bearing sideways');
 }
 assert.equal(last.placement.x,startX);assert.equal(JSON.stringify(last.rows),JSON.stringify(perch.rows));
 const exitContact=idleTransitionContact(last,'perch',perch,facing,scale,last.placement.x);assert.equal(exitContact-perchAnchor[0]*scale,startX,'Identical exit artwork cannot slide');assert.equal(exitContact,old.contactX,'No accumulated drift');
 for(const pose of ['sit','sithead','clean','look','glance','loaf']){const next=idleSample(art,pose,0),point=frameContact(next.rows,facing,next.anchor||idleContact(next.rows)),nextRear=frameContact(next.rows,facing,rearContact(next.rows)),world=idleTransitionContact(last,pose,next,facing,scale,startX);assert.equal(world-point[0]*scale+nextRear[0]*scale,rearWorld,'Other exits retain the rear bearing');}
 assert.equal(idleTransitionContact(old,'lookdown',first,-facing,scale,startX),rearWorld,'Facing changes pivot on the previous rear support');
 assert.equal(idleTransitionContact(old,'sit',idleSample(art,'sit',0),facing,scale,startX),old.contactX,'Unrelated idle transitions keep the existing policy');
}
// Identical artwork cannot translate when switching front/rear anchor semantics.
for(const scale of [1,2,3])for(const facing of [-1,1])for(const pose of ['sniff','scratch','yawn','sleep','rub','meow','chatter']){
 const first=idleSample(art,pose,0),point=frameContact(first.rows,facing,first.anchor||idleContact(first.rows)),front=frameContact(first.rows,facing,idleContact(first.rows)),old={pose:'stand',rows:first.rows,facing,placement:{x:200,top:300},contactX:200+front[0]*scale};
 const contact=idleTransitionContact(old,pose,first,facing,scale,200);assert.equal(contact-point[0]*scale,200,pose+' entry cannot jump because of a different anchor meaning');
 old.pose=pose;old.anchor=first.anchor;old.contactX=contact;const exit={rows:first.rows};assert.equal(idleTransitionContact(old,'stand',exit,facing,scale,200)-front[0]*scale,200,pose+' exit cannot drift');
}
// Departure must convert the displayed rear/custom bearing back into a walking
// front-paw coordinate, rather than treating every idle.contactX as a front paw.
for(const scale of [1,2,3,4,5,6])for(const facing of [-1,1])for(const pose of ['lookdown','bat','sniff','scratch','yawn','sleep','rub','meow','chatter','sit','loaf']){
 const sample=idleSample(art,pose,0),front=frameContact(sample.rows,facing,idleContact(sample.rows)),anchor=frameContact(sample.rows,facing,sample.anchor||idleContact(sample.rows)),x=200*scale;
 const old={pose,rows:sample.rows,anchor:sample.anchor,facing,placement:{x,top:300},contactX:x+anchor[0]*scale};
 const a=Object.assign(Object.create(box.api.Home.prototype),{config:{},x,y:400*scale,scale,size:24*scale,facing,walkSteps:0,idle:old});
 a.moveTo(x+facing*40*scale,a.y,0,'walk',{id:'floor'},0);
 const beat=box.api.walkSample(a.motion,0,scale,art.walk),rows=box.api.walkAppearance(art,a.motion,beat,a.config).rows,walkFront=frameContact(rows,facing,idleContact(rows));
 assert.equal(beat.x+walkFront[0]*scale,x+front[0]*scale,pose+' → walk must retain the displayed front bearing');
}
console.log('PASS: exact look-down artwork, stationary entry/exit/rear bearing, narrow ledges, turns and exits; eleven idle-to-walk handoffs at six scales/both facings without anchor drift.');
