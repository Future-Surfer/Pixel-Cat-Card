import {latestProjects} from './latest-studio-assets.mjs';
import {savedProject} from './saved-user-refinements.mjs';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {highWalk,lowWalk,refinedLeap} from './user-refined-art.mjs';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true}};
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming-art.js','utf8')+'\n'+['prototype/cat-polish.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={walkAppearance,walkSample,airborneRows,Home:PixelCatHome,bodyCentre};',box);
const art=box.window.pixelCatRoamingArtV2,{walkAppearance,walkSample,airborneRows,Home,bodyCentre}=box.api;
const equal=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
for(const scale of [1,2,3])for(const direction of [-1,1])for(const mode of ['step','high','low','auto','cycle','half']){
 const motion={fromX:150,cells:40,direction,gaitStart:3,stepMs:25,headStart:0};
 for(let step=0;step<32;step++){
  const sample=walkSample(motion,step*25,scale,art.walk),held=walkSample(motion,step*25+24,scale,art.walk),appearance=walkAppearance(art,motion,sample,{walk_head_bob:mode});
  assert.equal(sample.x,held.x);assert.equal(sample.frame,held.frame);
  equal(appearance.rows.map(r=>r.replace(/[^R]/g,'.')),art.walk[sample.frame].map(r=>r.replace(/[^R]/g,'.')));
  if(mode==='high'||mode==='low')equal(appearance.rows,savedProject(mode==='high'?'sequence-walk-high':'sequence-walk-low').frames[sample.frame].rows);
  if(mode==='step')equal(appearance.rows,art.walk[sample.frame]);
 }
}
equal(art.across[2],latestProjects.get('sequence-across').project.frames[2].rows);equal(art.freefallCandidate,refinedLeap.frames[3].rows);
const motion={jumpKind:'descend',fromX:200,fromY:300,x:200,y:360,direction:1};
equal(airborneRows(art,motion,.8,1,{test_freefall_pose:false}),art.descend[2]);
equal(airborneRows(art,motion,.8,1,{test_freefall_pose:true}),art.freefallSequence.frames[2]);
for(const m of [{...motion,y:320},{...motion,jumpKind:'across'}])equal(airborneRows(art,m,.8,1,{test_freefall_pose:true}),m.jumpKind==='across'?art.acrossFlight.frames[2]:art[m.jumpKind][2]);
equal(airborneRows(art,{...motion,x:250},.8,1,{test_freefall_pose:true}),art.freefallSequence.frames[2]);
const home=Object.create(Home.prototype);Object.assign(home,{scale:2,size:48,config:{test_freefall_pose:true},worldRect:{top:64}});
const m={...motion,fromX:400,fromY:600,x:400,y:720};m.jumpProfile=home.planJump(m);
const before=m.jumpProfile.durations[0]+m.jumpProfile.durations[1],air=m.jumpProfile.flight.flightMs;
const pose=home.jumpSample(m,(before+air*.8)/m.jumpProfile.duration);assert.ok(art.freefallSequence.frames.some(rows=>JSON.stringify(rows)===JSON.stringify(pose.rows)));
home.config={test_freefall_pose:false};const regular=home.jumpSample(m,(before+air*.8)/m.jumpProfile.duration);
const a=bodyCentre(pose.rows,1),b=bodyCentre(regular.rows,1);assert.ok(Math.abs(pose.x+a.x*2-regular.x-b.x*2)<=2);assert.ok(Math.abs(pose.top+a.y*2-regular.top-b.y*2)<=2);
console.log('PASS: exact user walk/leap grids, fixed head cycles, unchanged stance clock and optional tall-drop sequence on the same ballistic trajectory.');
