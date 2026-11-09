import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const node=()=>({style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},append(){}}),b={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>0},document:{createElementNS:()=>node()}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,art:CAT_ART,walkSample,walkAppearance,groundedFront,idleSample,idleContact,frameContact};',b);
const {Home,art,walkSample,walkAppearance,groundedFront,idleSample,idleContact,frameContact}=b.api,bed=b.window.pixelCatBedEntryV1,setup=b.window.pixelCatSetupV1,shallow=b.window.pixelCatShallowV1;
const polish=b.window.pixelCatPolishV1;
const climbProbe={getAttribute(){throw Error('Synthetic motion probes have no DOM element');}};
assert.equal(polish.turnaround(climbProbe,art,0,0,null,1,art.walk[0]),null);
for(const facing of [1,-1])for(const urgency of ['casual','relaxed','prompted','interested']){
 const surface={id:'floor',min:0,max:500,top:200},a=Object.assign(Object.create(Home.prototype),{
  config:{},facing,urgency,scale:3,x:210,y:200,support:surface,walkSteps:4,
  drawnRows:art.walk[1],svg:node(),getAttribute:()=> 'walk-2',setAttribute(){},draw(){},status(){}
 });
 a.moveTo(210-facing*60,200,1000,'walk',surface,1000);
 const m=a.motion,slow=['casual','relaxed'].includes(urgency);
 assert.equal(!!m.departure?.facings,slow,'Only unhurried walk reversals get a sit turn');
 if(!slow){assert.equal(a.facing,-facing);continue;}
 assert.equal(a.facing,facing,'The cat keeps its old facing while it sits down');
 assert.equal(m.start,1580);
 for(const [t,direction] of [[1000,facing],[1300,facing],[1310,-facing],[1500,-facing]]){
  assert.equal(polish.departure(a,t,frameContact,idleContact),true);
  assert.equal(a.facing,direction);
 }
 assert.equal(polish.departure(a,m.start,frameContact,idleContact),false);
 const first=walkSample(m,0,a.scale,art.walk),next=walkSample(m,m.cumulativeMs[0],a.scale,art.walk);
 assert.equal(next.x-first.x,-facing*a.scale);
 assert.notEqual(first.frame,next.frame,'A walk frame advances on the same beat as its position');
}
for(const catScale of [2,3,4])for(const bedScale of [2,3,4])for(const entering of [false,true]){
 const fromY=500-(entering?0:3*bedScale),y=500-(entering?3*bedScale:0);
 const motion={homeStep:true,fromY,y,cells:10,target:{bed:entering}};
 const heights=Array.from({length:11},(_,step)=>setup.walkHeight({scale:catScale},motion,{step}));
 assert.equal(heights[0],fromY);
 assert.equal(heights.at(-1),y,'A guest lands at the host bed height even off its own pixel grid');
 assert.ok(heights.every(height=>height>=Math.min(y,fromY)&&height<=Math.max(y,fromY)));
}
let maxCenter=0;for(const scale of [1,2,3,4,5,6])for(const style of ['igloo','simple'])for(const side of [-1,1])for(const coin of [.5,.05]){
 const a=Object.create(Home.prototype),floor={id:'home',home:true,left:100,right:100+120*scale,top:500,min:100,max:100+96*scale},svg=node();svg.firstElementChild=node();Object.assign(a,{config:{bed_style:style},scale,size:24*scale,ownerKey:'audit-'+scale+style+side,home:floor,support:floor,surfaces:[floor],bedEntryManaged:true,active:true,ensureMood:()=>({random:()=>coin}),walkSteps:0,facing:-side,x:100+(side>0?76:4)*scale,y:500,svg,setAttribute(){},route:[]});floor.bedOwner=a;setup.surfaces(a);for(const s of a.surfaces){s.min=s.left;s.max=s.right-24*scale;if(s.bed)s.min=s.max=(s.left+s.right-24*scale)/2;}
 // Only begin within the old centring radius, but visibly outside the doorway.
 const asset=setup.bed(a,art),center=floor.left-4+22*scale+asset.width*scale/2;a.x=center-12*scale+side*20*scale;
 assert.ok(bed.beforeIdle(a,'loaf',1000,art,groundedFront));assert.equal(a.motion.kind,'walk');assert.equal(!!a.motion.sneakTimeline,style==='igloo'||coin<.12);assert.equal(a.bedInside,null);const m=a.motion;assert.equal(a.bedEntry.side,m.direction>0?'left':'right','Entry reveals its approach side');assert.equal(a.support,floor,'Entry does not teleport onto the lining');
 let previousY=m.fromY;for(let t=0;t<=m.duration;t+=20){const sample=walkSample(m,t,scale,art.walk),rows=walkAppearance(art,m,sample,a.config).rows;a.x=sample.x;a.y=setup.walkHeight(a,m,sample);bed.mask(a,rows);assert.ok(Math.abs(a.y-previousY)<=scale);previousY=a.y;}
 if(style==='igloo')assert.ok(a.bedEntryMask.shape.attrs.d.includes('M'),'Moving entrance has a partial-door/outside union mask');a.support=m.target;a.x=m.x;a.y=m.y;a.motion=null;a.idle={pose:'stand'};bed.travelEnd(a,m);assert.equal(a.bedInside,a);assert.equal(a.previewBedPose,'loaf');
 const sample=idleSample(art,'loaf',1000),point=frameContact(sample.rows,a.facing,sample.anchor||idleContact(sample.rows));a.idle={pose:'loaf',contactX:a.x+groundedFront(walkAppearance(art,m,walkSample(m,m.duration,scale,art.walk),a.config).rows,a.facing)*scale};const before=a.idle.contactX-point[0]*scale;
 let p;for(const t of [2000,2200]){const base={x:a.idle.contactX-point[0]*scale,top:a.support.top-(point[1]+1)*scale};p=setup.restPlacement(a,base,sample.rows,art,t);a.x=p.x;}
 maxCenter=Math.max(maxCenter,Math.abs(p.x-before)/scale);assert.ok(Math.abs(p.x-before)<=scale+1.01,'The long approach is walking, not an idle centring slide');
 if(style==='igloo'){a.motion=null;a.route=[];assert.equal(bed.beforeIdle(a,'stand',2500,art,groundedFront),true,'A new upright activity first walks out of the igloo');assert.equal(a.bedEntry.exit,true);assert.ok(a.motion.sneakTimeline);const exit=a.motion;assert.equal(a.bedEntry.side,exit.direction>0?'right':'left','Exit reveals its destination side');a.support=exit.target;a.x=exit.x;a.y=exit.y;a.motion=null;bed.travelEnd(a,exit);assert.equal(a.bedInside,null);assert.equal(a.previewBedPose,'stand');}
 // Right-edge idle sampling no longer silently promotes floor to the bed.
 a.support=floor;a.motion=null;a.route=[];for(let cell=0;cell<=20;cell++){a.x=center-12*scale+cell*scale;setup.restSupport(a,3000);assert.equal(a.support,floor);}
}
for(const scale of [1,2,3,4,5,6])for(const direction of [-1,1])for(const dy of [-4,-2,1,3,4]){const a={scale,facing:direction,x:200*scale,config:{},route:[],ensureMood:()=>({random:()=>.1}),setAttribute(){},moveTo(x,y,d,k,target){this.motion={fromX:this.x,fromY:this.support.top,x,y,kind:k,target};}},from={id:'from',left:0,right:600*scale,min:0,max:576*scale,top:400*scale},to={...from,id:'to',top:(400+dy)*scale};a.support=from;a.route=[to];assert.ok(shallow.edge(a,from,to));assert.ok(shallow.step(a,to,0));assert.equal(a.motion.kind,'walk');assert.equal(a.motion.shallow,true);let last=from.top;for(let i=0;i<=20;i++){const x=a.motion.fromX+(a.motion.x-a.motion.fromX)*i/20,y=shallow.height(a,a.motion,{x});assert.ok(dy>0?y>=last:y<=last);assert.ok(Math.abs(y-last)<=scale);last=y;}assert.equal(last,to.top);assert.equal(shallow.edge(a,from,{...to,top:from.top+5*scale}),null);assert.equal(shallow.edge(a,from,{...to,left:700*scale,right:900*scale,min:700*scale,max:876*scale}),null);}
console.log({maxCenter});console.log('PASS: mostly walking simple-bed entry, optional sneaking, igloo sneak entry and gradual lining height at six scales/both approaches, doorway masking, no right-edge automatic support hop, safe shallow transitions and gap/height rejection.');

const chooser={scale:2,facing:1,x:100,config:{},support:{id:'from',left:0,right:600,min:0,max:552,top:400},route:[],ensureMood:()=>({random:()=>.1}),setAttribute(){},moveTo(x,y,d,k,target){this.motion={fromX:this.x,fromY:this.support.top,x,y,kind:k,target};}};const other={...chooser.support,id:'to',top:404};chooser.shallowChoice={key:'from>to',walk:false};assert.equal(shallow.step(chooser,other,0),false);b.window.pixelCatPolishV1.travelEnd(chooser,{kind:'jump'});assert.equal(chooser.shallowChoice,null,'An optional hop does not pin that actor to hopping the same edge forever');chooser.route=[other];assert.equal(shallow.step(chooser,other,1000),true);assert.equal(chooser.motion.shallow,true);
