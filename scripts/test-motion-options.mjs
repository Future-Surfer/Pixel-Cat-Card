import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true}};
for(const f of ['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','prototype/cat-motion-options.js','pixel-cat-roaming.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),box);
vm.runInNewContext('globalThis.api={buildJumpPlan,jumpBeat,Home:PixelCatHome};',box);
const {buildJumpPlan,jumpBeat,Home}=box.api,options=box.window.pixelCatMotionOptionsV1,art={...box.window.pixelCatRoamingArtV2,...box.window.pixelCatRoamingExtrasV1};
for(const scale of [1,2,3])for(const direction of [-1,1]){
 const m={fromX:200*scale,fromY:150*scale,x:200*scale,y:210*scale,jumpKind:'descend',direction};
 assert.equal(options.hesitation(m,scale,()=>0),250);assert.equal(options.hesitation(m,scale,()=>.99),0);
 const plain=buildJumpPlan(m,art,scale,{},0);m.hesitationMs=500;const held=buildJumpPlan(m,art,scale,{},0);assert.ok(held);assert.equal(held.duration-plain.duration,500);assert.equal(JSON.stringify(held.flight),JSON.stringify(plain.flight));assert.equal(held.durations[2],plain.durations[2]);
 const actor=Object.assign(Object.create(Home.prototype),{scale,size:24*scale,config:{}});m.jumpProfile=held;m.duration=held.duration;
 const start=held.durations[0],end=start+held.durations[1],one=actor.jumpSample(m,(start+1)/held.duration),two=actor.jumpSample(m,(end-1)/held.duration);assert.equal(one.frame,1);assert.equal(two.frame,1);assert.equal(one.x,two.x);assert.equal(one.top,two.top);
 assert.equal(jumpBeat(held,end/held.duration).frame,2,'Flight begins after the extra ledge hold');assert.equal(options.hesitation({...m,x:m.fromX+100*scale},scale,()=>0),0,'Lateral drops do not hesitate');assert.equal(options.hesitation({...m,jumpKind:'across'},scale,()=>0),0);
}
const a={config:{},scale:2,x:100,support:{},urgency:'prompted'},target={};assert.equal(options.gallop(a,'walk',null,target,300,art,()=>0),art.gallop);assert.equal(options.gallop(a,'walk',null,target,300,art,()=>.99),null);a.urgency='relaxed';assert.equal(options.gallop(a,'walk',null,target,300,art,()=>0),null);a.social={episode:{kind:'chase'}};assert.equal(options.gallop(a,'walk',null,target,300,art,()=>0),art.gallop);assert.equal(options.gallop(a,'walk',null,{narrow:true},300,art,()=>0),null);a.config.gallop=false;assert.equal(options.gallop(a,'walk','gallop',target,300,art,()=>0),null);
console.log('PASS: occasional steep-drop hesitation stays on frame two with fixed ledge contact and unchanged flight at both facings/three scales; rare gallop has purpose/chase, distance, safe-support and opt-out gates.');
