import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {compileBehaviour,validateBehaviourPolicy} from '../frame-studio/dist/behaviour-policy.js';
import {exportSequenceProject,validateProject} from '../frame-studio/dist/model.js';
const saved=JSON.parse(fs.readFileSync('frame-studio/user-sequences/back-roll-2026-10-18/saved-change.json')).snapshot;
const original=JSON.stringify(saved),project=structuredClone(saved);assert.deepEqual(compileBehaviour(project).lifeStages,['kitten','adult','senior']);assert.equal(JSON.stringify(saved),original);
project.behaviourPolicy={tags:['energetic','play'],lifeStages:['kitten']};validateProject(project);assert.deepEqual(exportSequenceProject(project),project);assert.equal(JSON.stringify(project.frames),JSON.stringify(saved.frames),'Metadata does not touch artwork, holds, gaze or provenance');
for(const b of [{tags:['Play']},{tags:['play','play']},{tags:['a b']},{lifeStages:['dog']},{lifeStages:['adult','adult']},{surprise:true},null])assert.throws(()=>validateBehaviourPolicy({behaviourPolicy:b}));
assert.doesNotThrow(()=>validateBehaviourPolicy({behaviourPolicy:{lifeStages:[]}}));
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>0},Math:Object.assign(Object.create(Math),{random:()=>.5})};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,art:CAT_ART,walkSample,walkAppearance,idleSample};',box);
const {Home,art,walkSample,walkAppearance,idleSample}=box.api,P=box.window.pixelCatBehaviourV1,O=box.window.pixelCatMotionOptionsV1;
const actor=(stage,playfulness=0)=>({lifeStage:stage,config:{life_stage:stage},mood:{values:{playfulness,sleepiness:0}}});
const synthetic={behaviourPolicy:compileBehaviour({category:'interaction',behaviourPolicy:{tags:['energetic','unrecognised']}})};
assert.equal(P.weight(actor('adult',1),synthetic),1);assert.equal(P.weight(actor('senior',1),synthetic),1);assert.equal(P.weight(actor('kitten'),synthetic),1.8);assert.equal(P.weight(actor('kitten',1),synthetic),2.6);
const restricted={...synthetic,behaviourPolicy:{...synthetic.behaviourPolicy,lifeStages:['kitten']}};assert.equal(P.weight(actor('adult'),restricted),0);assert.equal(P.allowed(actor('kitten'),restricted),true);assert.equal(P.allowed(actor('kitten'),{behaviourPolicy:{lifeStages:[]}}),false);
const a={...actor('kitten',1),scale:1,x:100,support:{},urgency:'interested'};
assert.equal(O.gallop(a,'walk',null,{},300,art,()=>.4),art.gallop,'Playful kitten may choose an energetic gait on an ordinary interested journey');
assert.equal(O.gallop({...a,lifeStage:'adult'},'walk',null,{},300,art,()=>0),null);assert.equal(O.gallop({...a,urgency:'casual'},'walk',null,{},300,art,()=>0),null);
for(const [kind,gait,target,x] of [['jump',null,{},300],['walk','sneak',{},300],['walk',null,{narrow:true},300],['walk',null,{},101]])assert.equal(O.gallop(a,kind,gait,target,x,art,()=>0),null);
assert.equal(O.gallop({...a,config:{gallop:false}},'walk','gallop',{},300,art,()=>0),null);assert.equal(O.gallop(a,'walk','gallop',{},300,{...art,gallop:restricted},()=>0),restricted);assert.equal(O.gallop({...a,lifeStage:'adult'},'walk','gallop',{},300,{...art,gallop:restricted},()=>0),null);
// Real movement construction: phase, cells and displacement stay coupled in both facings.
for(const stage of ['adult','senior','kitten'])for(const facing of [-1,1])for(const gait of ['walk','trot','sneak','gallop']){
 const make=lifeStage=>{const h=Object.create(Home.prototype);Object.assign(h,{lifeStage,config:{life_stage:lifeStage,gallop:gait==='gallop',fast_walk:gait==='trot'},scale:1,size:24,support:{id:'floor',top:600},x:200,y:600,walkSteps:0,headSeed:1,urgency:gait==='trot'?'prompted':'relaxed',route:[],setAttribute(){}});h.moveTo(200+facing*100,600,10000,'walk',{id:'floor',top:600},0,gait==='walk'?undefined:gait);return h.motion;};
 const adult=make('adult'),m=make(stage),factor=stage==='kitten'?m.cadenceFactor:1;
 assert.equal(m.duration,adult.duration/factor);assert.equal(m.x,adult.x);assert.equal(m.cells,adult.cells);if(stage==='kitten')assert.ok(factor>1&&factor<=1.35);
 for(const phase of [.0137,.1737,.4937,.8337,.9997]){const one=walkSample(adult,phase*adult.duration,1,art.walk),two=walkSample(m,phase*m.duration,1,art.walk);assert.equal(two.x,one.x,`${stage}/${facing}/${gait}/${phase} factor ${factor}`);assert.equal(two.frame,one.frame);assert.equal(JSON.stringify(walkAppearance(art,m,two,{life_stage:stage}).rows),JSON.stringify(walkAppearance(art,adult,one,{}).rows));}
}
const capped={duration:100,stepMs:1000/60,cumulativeMs:[1000/60,1000/30]};P.movement(actor('kitten'),capped,{category:'locomotion'});assert.equal(capped.cadenceFactor,1,'No policy exceeds the normal 60 fps timeline cap');
for(const category of ['idle','interaction','care','other']){const m={duration:500,stepMs:100};P.movement(actor('kitten'),m,{category});assert.equal(m.duration,500);}
const artRestricted={stand:art.stand,idleSequences:{...art.idleSequences,loaf:{...art.idleSequences.loaf,behaviourPolicy:{lifeStages:['kitten']}}}};assert.equal(idleSample(artRestricted,'loaf',0,{life_stage:'adult'}).rows,art.stand,'Ineligible optional pose has a terminating safe stand fallback');
console.log('PASS: shared semantic weights/age defaults, metadata preservation, bounded playful gallop gates and mirrored real walk/trot/sneak/gallop phase/contact at quicker kitten cadence.');

// Pace preference consumes candidate metadata, including a newly registered clip.
const traveler={...actor('kitten',.7),scale:1,x:100,support:{},urgency:'casual',setAttribute(){}};const counts={walk:0,step:0,bound:0};
for(let i=0;i<1000;i++){const o=O.select(traveler,'walk',null,{},300,art,6,()=>i/1000);counts[o.fast?'step':o.gallop?'bound':'walk']++;}
assert.ok(counts.step>700&&counts.walk>0&&counts.bound>0&&counts.bound<200,JSON.stringify(counts));
for(const x of [101,105]){const o=O.select(traveler,'walk',null,{},x,art,6,()=>.5);assert.ok(!o.fast&&!o.gallop);}
const stealth=O.select(traveler,'walk','sneak',{},300,art,3,()=>0);assert.ok(!stealth.fast&&!stealth.gallop,'Deliberate stealth never competes with ordinary speed preference');
const futureClip={...art.fastWalk,sequenceId:'future-brisk-step',fps:28},futureArt={walk:art.walk,walkBehaviour:art.walkBehaviour,fastWalk:art.fastWalk,gallop:art.gallop,future:futureClip,travelChoices:[...art.travelChoices,{key:'future',engine:'step',minCells:8}]};let future=0;for(let i=0;i<1000;i++)future+=O.select(traveler,'walk',null,{},300,futureArt,6,()=>i/1000).fast===futureClip;assert.ok(future>300,'A new compatible pace candidate inherits the profile without an age-specific rule');
const noFast={...traveler,config:{fast_walk:false,gallop:false}};assert.ok(!O.select(noFast,'walk',null,{},300,futureArt,6,()=>.8).fast);
for(const pose of ['loaf','sleep']){const a={...actor('kitten',.6),config:{},ownerKey:'rest-test'},clip=art.idleSequences[pose],ms=30000,short=P.restBout(a,pose,clip,ms);assert.ok(short<ms);assert.ok(short>=clip.frames.reduce((n,_,i)=>n+box.window.pixelCatPolishV1.hold(pose,clip,i,1),0));a.previewPose=pose;assert.equal(P.restBout(a,pose,clip,ms),ms);delete a.previewPose;a.command='home';assert.equal(P.restWindow(a,10000),10000);}
assert.equal(P.restWindow(actor('adult'),10000),10000);assert.equal(P.restWindow(actor('senior'),10000),10000);assert.equal(P.restBout(actor('kitten'),'scratch',art.idleSequences.scratch,6000),6000,'Grooming source clocks/bouts are not scaled as passive rest');
console.log('PASS: numeric pace preferences keep slow alternatives/stealth, admit a future clip without profile edits, respect opt-outs, and shorten rest without shortening authored cycles or explicit commands.',JSON.stringify(counts));

const noop={cells:0,duration:0,fromX:100,direction:1,gaitStart:0,cumulativeMs:[]};P.movement(actor('kitten'),noop,{category:'locomotion'});assert.equal(noop.duration,1000/60);assert.equal(walkSample(noop,noop.duration,1,art.walk).x,100,'A stance rebase already at its endpoint completes on one grounded beat');
const awake=actor('kitten',.7),sleepy=actor('kitten',.1);sleepy.mood.values.sleepiness=1;assert.ok(P.restWindow(sleepy,10000)>P.restWindow(awake,10000));assert.ok(P.preferredPace(sleepy).target<P.preferredPace(awake).target);
assert.equal(P.restWindow(actor('kitten'),1000),1000,'An already-short rest override is never lengthened');
