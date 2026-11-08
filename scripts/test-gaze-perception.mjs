import assert from 'node:assert/strict';
import {worldGaze,targetVisibility,Awareness,LabMetrics} from '../prototype/gaze-perception.js';
for(const scale of [1,2,3])for(const facing of [-1,1]){
 const g={x:19,y:12,angle:0,fov:100},p={x:80,top:100},eye=worldGaze(g,p,scale,facing,180);
 assert.equal(eye.x,80+(facing<0?4.5:19.5)*scale);assert.equal(eye.y,100+12.5*scale);
 assert.ok(targetVisibility(eye,{x:eye.x+100*facing,y:eye.y}).visible);
 assert.ok(!targetVisibility(eye,{x:eye.x-100*facing,y:eye.y}).visible);
 assert.ok(!targetVisibility({...eye,range:40},{x:eye.x+100*facing,y:eye.y}).visible);
 assert.ok(targetVisibility({...eye,fov:360},{x:eye.x-100*facing,y:eye.y}).visible);
 assert.ok(!targetVisibility(worldGaze({...g,canSee:false},p,scale,facing),{x:eye.x,y:eye.y}).visible);
}
assert.equal(targetVisibility(worldGaze(null,{x:0,top:0},1),{x:0,y:0}).reason,'unknown');
const eye=worldGaze({x:0,y:0,angle:180,fov:20},{x:0,top:0},1),seam={x:-50,y:-1};assert.ok(targetVisibility(eye,seam).visible);
assert.ok(targetVisibility({...eye,dx:1,dy:0,fov:10},{x:50,y:8,width:10,height:16}).visible,'Partly visible target should count');
const a=new Awareness(),forward={...eye,dx:1,dy:0,fov:100},target={id:'ball',label:'Ball',x:50,y:.5};
assert.equal(a.update(forward,[target],0).notices.length,0);assert.equal(a.update(forward,[target],100).notices.length,0);assert.equal(a.update(forward,[target],300).notices.length,1);
assert.equal(a.update(forward,[target],6000).notices.length,1,'Long unobserved gap expires memory');
assert.equal(a.update(forward,[target],6100).notices.length,0);
const blind={...forward,canSee:false,reason:'blind'};assert.equal(a.update(blind,[target],6200).states[0].status,'remembered');assert.equal(a.update(blind,[target],9000).states[0].status,'blind');
a.reset();assert.equal(a.update(forward,[{...target,moving:true}],0).notices.length,0);assert.equal(a.update(forward,[{...target,moving:true}],100).notices.length,1);
for(let t=200;t<6200;t+=100)assert.equal(a.update(forward,[{...target,moving:true}],t).notices.length,0,'Continuous visibility/motion must not repeat notice events');
assert.equal(a.update(forward,[],6300).states.length,0);assert.equal(a.targets.size,0);
const m=new LabMetrics();for(let i=0;i<650;i++)m.add({frame:1000/60,controller:.2,perception:i%6===0?.03:undefined,overlay:.1});const report=m.summary();assert.equal(report.samples,600);assert.ok(Math.abs(report.fps-60)<1e-6);assert.equal(report.over33,0);assert.ok(Math.abs(report.perception.mean-.03)<1e-9);m.reset();assert.equal(m.summary().samples,0);
console.log('PASS: raw gaze placement/mirroring at three scales, finite 360 range, blindness/unknown, partial target visibility, seam angles, notice dwell, motion salience, awareness memory, event suppression and bounded performance samples.');
