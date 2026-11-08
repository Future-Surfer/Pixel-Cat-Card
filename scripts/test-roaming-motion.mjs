import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class {},customElements:{get(){return true}},performance:{now:()=>0}};
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming-art.js','utf8')+'\n'+['prototype/cat-polish.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.motionApi={walkSample,frameContact,groundedFront,jumpKindFor,Home:PixelCatHome};',box);
const art=box.window.pixelCatRoamingArtV2, api=box.motionApi;
for(const scale of [.5,1,1.5,2,2.5,3,4,5,6]) for(const direction of [-1,1]) {
  const motion={fromX:120,cells:40,direction,gaitStart:3,stepMs:50};
  for(let step=0;step<40;step++) {
    const first=api.walkSample(motion,step*50,scale,art.walk);
    const held=api.walkSample(motion,step*50+49,scale,art.walk);
    assert.equal(first.x,held.x,'Sprite must not translate while the same gait frame is held');
    assert.equal(first.frame,held.frame);
    assert.equal(first.x,120+direction*step*scale);
  }
  const faster={...motion,stepMs:25};
  assert.equal(api.walkSample(motion,250,scale,art.walk).frame,api.walkSample(faster,125,scale,art.walk).frame);
  assert.equal(api.walkSample(motion,250,scale,art.walk).x,api.walkSample(faster,125,scale,art.walk).x,'Twice the speed must run both displacement and gait twice as fast');
  const pawCells=(rows,step)=>rows.flatMap((row,y)=>[...row].flatMap((v,x)=>v==='R'&&y===23?[120+direction*step*scale+(direction<0?23-x:x)*scale]:[]));
  for(let step=0;step<3;step++) {
    const before=pawCells(art.walk[step],step), after=pawCells(art.walk[step+1],step+1);
    assert(after.some(x=>before.includes(x)),'Authored stance paw must remain in its world cell between gait beats');
  }
}
const home=Object.create(api.Home.prototype);
for(const scale of [.5,1,1.5,2,2.5,3,4,5,6]) for(const direction of [-1,1]) {
  home.scale=scale;home.size=24*scale;
  const altitude=scale<1?200:0;const base={fromX:120*scale,fromY:160*scale+altitude,x:180*scale,y:130*scale+altitude,direction,holds:[1,3,1,1,1],jumpKind:'ascend'};
  const stand=home.jumpSample(base,.01), crouch=home.jumpSample(base,.2);
  const standPoint=api.frameContact(stand.rows,direction,art.leapAnchors.ascend[0].point);
  const crouchPoint=api.frameContact(crouch.rows,direction,art.leapAnchors.ascend[1].point);
  assert.equal(stand.x+standPoint[0]*scale,crouch.x+crouchPoint[0]*scale,'Take-off paw must remain planted across the crouch');
  assert.equal(stand.top+(standPoint[1]+1)*scale,crouch.top+(crouchPoint[1]+1)*scale);
  const landed=home.jumpSample(base,1), point=api.frameContact(landed.rows,direction,art.leapAnchors.ascend[4].point);
  assert.equal(landed.top+(point[1]+1)*scale,base.y,'Authored ascent bearing paw must meet the ledge');
  const walkPaw=api.groundedFront(art.walk[1],direction), handoffX=base.x+(point[0]-walkPaw)*scale;
  assert.equal(handoffX+walkPaw*scale,landed.x+point[0]*scale,'Landing-to-walk handoff must preserve the planted paw');
  const down={...base,y:220*scale+altitude,holds:[1,1,1,3],jumpKind:'descend'};
  for(const p of [.01,.12]) {
    const pose=home.jumpSample(down,p), anchor=art.descentEdges[pose.frame], support=api.frameContact(pose.rows,direction,anchor.support);
    assert.equal(pose.top+(support[1]+1)*scale,down.fromY,'Authored descent support must stay on the source ledge');
  }
  const landing=home.jumpSample(down,1), support=api.frameContact(landing.rows,direction,art.leapAnchors.descend[3].point);
  assert.equal(landing.top+(support[1]+1)*scale,down.y);
  assert.equal(api.jumpKindFor(base.fromY,base.fromY+scale,scale),'across','Sub-cell/near-level layout differences must not trigger climbing');
  assert.equal(api.jumpKindFor(base.fromY,base.fromY-12*scale,scale),'ascend');
  assert.equal(api.jumpKindFor(base.fromY,base.fromY+12*scale,scale),'descend');
  const across={...base,y:base.fromY,holds:[1,2,2,2],jumpKind:'across'};
  const settle=home.jumpSample(across,.9), settledPaw=api.frameContact(settle.rows,direction,art.leapAnchors.across[3].point);
  assert.equal(JSON.stringify(settle.rows),JSON.stringify(art.ascend[1]),'Across landing must use the level crouch, not the pull-up pose');
  assert.equal(settle.top+(settledPaw[1]+1)*scale,across.y);
  const held=home.jumpSample(across,1);
  assert.equal(settle.x,held.x,'Across landing must hold its paw contact');
  assert.equal(settle.top,held.top);
  for(const dy of [-12,-8,8,12,14,16]){
    const fromY=300*scale,dx=40*direction*scale;
    assert.equal(api.jumpKindFor(fromY,fromY+dy*scale,scale,dx),'across','Shallow rises/drops should retain horizontal poses');
    const actor=Object.assign(Object.create(api.Home.prototype),{scale,size:24*scale,config:{},x:200*scale,y:fromY,facing:direction,walkSteps:0,route:[],worldRect:{top:0}});
    actor.moveTo(actor.x+dx,fromY+dy*scale,0,'jump',{},0);
    const m=actor.motion;assert.ok(m);assert.equal(m.jumpKind,'across');
    const landed=actor.jumpSample(m,1),paw=api.frameContact(landed.rows,direction,art.leapAnchors.across[3].point);
    assert.equal(landed.top+(paw[1]+1)*scale,fromY+dy*scale,'Horizontal pose selection must preserve the actual landing altitude');
    const held=actor.jumpSample(m,(m.duration-.001)/m.duration);assert.equal(held.x,landed.x);assert.equal(held.top,landed.top);
  }
  assert.equal(api.jumpKindFor(300*scale,314*scale,scale,27*direction*scale),'descend','Igloo-height drops still need a predominantly sideways landing');
  assert.equal(api.jumpKindFor(300*scale,314*scale,scale,28*direction*scale),'across','Fourteen-cell igloo roof is inside the short sideways drop range');
  for(const sign of [-1,1]){
    const expected=sign<0?'ascend':'descend',fromY=300*scale;
    assert.equal(api.jumpKindFor(fromY,fromY+(sign<0?13:17)*sign*scale,scale,100*direction*scale),expected,'Larger rises/drops keep dedicated poses');
    assert.equal(api.jumpKindFor(fromY,fromY+8*sign*scale,scale,8*direction*scale),expected,'Predominantly vertical hops keep dedicated poses');
    assert.equal(api.jumpKindFor(fromY,fromY+8*sign*scale,scale,16*direction*scale),'across','Slope boundary is consistent in both facings');
  }
}
console.log('PASS: distance-driven gait, proportional speed, contact anchors, shallow up/down sideways leaps, steep/vertical exclusions and planted landings at scales 1-6 in both directions.');
