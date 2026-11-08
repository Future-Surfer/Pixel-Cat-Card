import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class{},customElements:{get(){return true;}},performance:{now:()=>1000},requestAnimationFrame(){}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n')+'\nglobalThis.api={startlePlan,startleSample,Home:PixelCatHome};',box);
const {startlePlan,startleSample,Home}=box.api,clip=box.window.pixelCatRoamingExtrasV1.startle;
const source=JSON.parse(fs.readFileSync('frame-studio/user-sequences/startle-hop-2026-10-15/project.json')).project;
assert.equal(JSON.stringify(clip.frames),JSON.stringify(source.frames.map(f=>f.rows)));assert.equal(JSON.stringify(clip.gazes),JSON.stringify(source.frames.map(f=>f.gaze)));
const surface=s=>({id:'floor',left:0,right:200*s,top:200*s,min:0,max:176*s,poses:['stand'],home:false});
for(const s of [1,2,3])for(const facing of [-1,1])for(const side of [-1,1]){
 const support=surface(s),x=80*s,sourceX=x+(12+side*facing*40)*s,m=startlePlan(x,support,facing,sourceX,s,clip,0);
 assert.ok(m);assert.equal(m.direction,facing);assert.equal(Math.sign(m.x-x),-side*facing);assert.equal(Math.abs(m.x-x),24*s);assert.equal(m.flightMs,400);assert.equal(m.duration,700);
 const takeoff=startleSample(m,m.enter/m.duration,clip,s),land=startleSample(m,(m.enter+m.flightMs)/m.duration,clip,s),apex=startleSample(m,(m.enter+m.flightMs/2)/m.duration,clip,s);
 assert.equal(takeoff.x,x);assert.equal(land.x,m.x);assert.equal(takeoff.top,land.top);assert.equal(apex.top,takeoff.top-8*s);assert.equal(apex.x,(x+m.x)/2);
 for(const t of [0,59,60,109]){const p=startleSample(m,t/m.duration,clip,s);assert.equal(p.x,x);assert.equal(p.top+24*s,support.top);}
 for(const t of [510,550,600,700]){const p=startleSample(m,t/m.duration,clip,s);assert.equal(p.x,m.x);assert.equal(p.top+24*s,support.top);assert.ok([5,6].includes(p.frame));}
 let last=x;for(let t=0;t<=700;t+=5){const p=startleSample(m,t/m.duration,clip,s);assert.ok((p.x-last)*m.away>=-1e-8);assert.ok(p.x>=support.left&&p.x+24*s<=support.right);assert.ok(p.top>=0);assert.equal(p.rows,clip.frames[p.frame]);assert.equal(p.origin,source.frames[p.frame].origin);last=p.x;}
 const attrs={},h=Object.create(Home.prototype);Object.assign(h,{scale:s,facing,x,y:support.top,support,surfaces:[support],route:[],config:{},worldRect:{top:0},idle:{contactX:x+(facing<0?6:17)*s},cancelPlay(){},setAttribute(k,v){attrs[k]=v;},status(){}});
 assert.equal(h.requestStartle({x:sourceX},1000),true);assert.equal(h.facing,facing);assert.equal(attrs['data-startle-direction'],side===1?'backward':'forward');
 assert.equal(h.jumpSample(h.motion,.5).rows,clip.frames[3]);const before=h.jumpSample(h.motion,.5),old=h.support,next={...old,left:old.left+13,right:old.right+13,top:old.top-21,min:old.min+13,max:old.max+13};h.surfaces=[next];h.reconcileLayout(old,[old],1100);const after=h.jumpSample(h.motion,.5);assert.equal(after.x,before.x+13);assert.equal(after.top,before.top-21);
 const start=h.motion.start,cool=h.nextStartleAt;h.freezeClocks(200);assert.equal(h.motion.start,start+200);assert.equal(h.nextStartleAt,cool+200);assert.equal(h.requestStartle({x:sourceX},1200),false);
 // Exercise actual tick completion and paused startle branch, not just the sampler.
 Object.assign(h,{active:true,lastTick:0,checkAt:Infinity,debugAt:Infinity,needsMeasure:false,layer:{style:{}},svg:{style:{}},shadowRoot:{querySelector(){return null;}},tryIdleMouseBat(){},updateToyHunt(){},draw(rows){this.drawn=rows;},paused:true});h.tick(10);assert.ok(h.motion);h.paused=false;h.lastTick=h.motion.start+h.motion.duration-16;h.tick(h.motion.start+h.motion.duration);assert.equal(h.motion,null);assert.equal(h.idle.pose,'stand');assert.equal(h.y,next.top);assert.equal(h.facing,facing);assert.equal(h.drawn,clip.frames[6]);
}
for(const s of [1,2,3]){const p=surface(s);assert.equal(startlePlan(0,p,1,40*s,s,clip,0),null,'No backwards leap off left edge');assert.equal(startlePlan(176*s,p,1,160*s,s,clip,0),null,'No forwards leap off right edge');assert.equal(startlePlan(80*s,{...p,narrow:true},1,160*s,s,clip,0),null);assert.equal(startlePlan(80*s,{...p,top:25*s},1,160*s,s,clip,0),null,'Low headroom skips hop');const short=startlePlan(4*s,p,1,80*s,s,clip,0);assert.equal(short.x,0);assert.ok(short.x<short.fromX);}
console.log('PASS: exact approved startle frames/gaze, forward/backward escape at three scales/both facings, ballistic arc, planted entry/landing, edge/headroom guards, cooldown, pause, layout tracking and actual completion.');
