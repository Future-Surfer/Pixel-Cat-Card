import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {encounterFixture} from './testing/encounter-fixture.mjs';

function fixture(scale=2,side=1){
 const f=encounterFixture(scale),{box,surface,cat,api}=f,window=box.window;
 const a=cat('edge-cat',0,'clean');a.root.matches=()=>true;
 Object.assign(a.config,{native_vertical_surfaces:true,climbing:false,card_climbing:false});
 Object.assign(surface,{left:0,right:400*scale,min:0,max:376*scale,top:300*scale});a.y=surface.top;
 a.worldRect={left:0,right:400*scale,top:0,bottom:400*scale};
 const el={isConnected:true},rect={left:150*scale,right:210*scale,top:200*scale,bottom:300*scale};
 const panel={id:'wall',rect,clip:a.worldRect,connected:true,visible:true,painted:true,radius:0,blockers:[]};
 const geometry={panels:[panel],byOwner:new Map([['wall',el]])};
 window.pixelCatCardClimbV1={reconcile:()=>geometry};window.pixelCatClimbV1={ready:()=>false};
 a.verticalCardRects=[{el,r:rect}];window.pixelCatVerticalScratchV1.reconcile(a);
 const face=a.verticalFaces.find(f=>f.direction===side);a.x=face.origin;
 a.ensureMood=()=>({random:()=>.1,values:{sleepiness:.2}});
 const elements=new Map(),location={pathname:'/edge-test'};
 vm.runInNewContext(fs.readFileSync('prototype/cat-behaviour-lab.js','utf8'),{window,location,customElements:{get:k=>elements.get(k),define:(k,v)=>elements.set(k,v)},HTMLElement:class{},Option:class{},setInterval:()=>1,clearInterval(){}});
 const card=new (elements.get('pixel-cat-behaviour-lab'))(),select={value:'',add(){}},status={};
 card.parentElement=a.root;card.shadowRoot={querySelector:s=>s==='select'?select:status};card.connectedCallback();
 const choose=value=>{select.value=value;select.onchange();};choose('edgeScratch');
 const lab=window.pixelCatBehaviourLabV1,scratch=window.pixelCatLabScratchV1,vertical=window.pixelCatVerticalScratchV1;
 const tick=t=>lab.tick(a,t,api.art);
 function start(){assert.equal(tick(1000),1);assert.equal(a.social.episode?.kind,'vertical-scratch');return a.social.episode;}
 function stroke(){const ep=start();a.route=[];a.x=face.origin;tick(1016);assert.equal(ep.stage,'stroke');return ep;}
 function contact(){const rows=api.art.idleSequences.postScratch.frames[3],point=api.frameContact(rows,a.facing,api.art.idleSequences.postScratch.anchors[3]);a.idle={pose:'postScratch',start:1016,poseUntil:7016};a.setAttribute('data-frame','idle-postScratch-4');a.social.frame={rows,facing:a.facing,placement:{x:face.bearing-point[0]*scale,top:surface.top-(point[1]+1)*scale}};scratch.tick(a,1032,'edgeScratch');}
 return {...f,a,window,panel,face,lab,scratch,vertical,card,select,status,choose,tick,start,stroke,contact,location};
}

for(const scale of [.5,1,1.5,2,3,4,5,6])for(const side of [-1,1]){
 const f=fixture(scale,side),{a,face,scratch}=f,ep=f.start(),route=a.route;
 assert.equal(ep.faceId,face.id);assert.equal(face.prop.claimedBy,a.ownerKey);
 a.motion={kind:'walk'};f.tick(1016);assert.equal(a.route,route);assert.equal(a.social.episode,ep);a.motion=null;
 a.route=[];a.x=face.origin;f.tick(1032);assert.equal(ep.stage,'stroke');assert.equal(a.facing,side);
 f.contact();assert.ok(ep.contacts>0,`Authored paw contact at scale ${scale}, facing ${side}`);
 const clock=a.social.clock,last=ep.labLast;a.freezeClocks(400);scratch.tick(a,last+400,'edgeScratch');assert.equal(a.social.clock,clock,'Manual Pause freezes the same episode clock');
 a.pathTo=()=>{throw Error('No route search during scratch playback');};
 a.social.clock=ep.expires-16;scratch.tick(a,ep.labLast+16,'edgeScratch');
 assert.equal(a.social.episode,null);assert.equal(a.labScratch,null);assert.equal(face.prop.claimedBy,null);assert.equal(a.social.scratchStats.completed,1);
 assert.ok(face.prop.cooldownUntil>a.social.world.clock);assert.ok(a.idle.poseUntil<=ep.labLast);
}
for(const phase of ['approach','stroke'])for(const reason of ['natural','other focus','route change','removed','occluded','command','permission']){
 const f=fixture(),{a,face}=f,ep=phase==='stroke'?f.stroke():f.start();
 let newer;
 if(reason==='natural')f.choose('');
 if(reason==='other focus')f.choose('yawn');
 if(reason==='route change'){newer=[{id:'new-command'}];a.route=newer;f.choose('');}
 if(reason==='removed')face.prop.visualOwner.isConnected=false;
 if(reason==='occluded')f.panel.blockers.push({left:face.x-1,right:face.x+1,top:face.top,bottom:face.bottom});
 if(reason==='command')a.command={kind:'recall'};
 if(reason==='permission')a.config.native_vertical_surfaces=false;
 f.tick(1050);assert.equal(a.social.episode,null,`${phase}: ${reason}`);assert.equal(face.prop.claimedBy,null);
 if(phase==='approach'&&!newer)assert.equal(a.route.length,0,'Only the scratch-owned route is cancelled');
 if(newer)assert.equal(a.route,newer,'Newer command route survives cleanup');
 if(phase==='stroke')assert.notEqual(a.labPose,'postScratch');
 assert.equal(ep.contacts,undefined,'No contact is not a completion');
}
for(const patch of [{paused:true},{userHeld:true},{carriedToy:{}},{suspended:true},{layoutPaused:true}]){
 const f=fixture();Object.assign(f.a,patch);f.tick(1000);assert.equal(f.a.labScratch,undefined);
}
for(const action of ['natural','unmount']){
 const f=fixture();f.stroke();f.a.paused=true;
 if(action==='natural')f.choose('');else f.card.disconnectedCallback();
 assert.equal(f.a.social.episode,null,'Focus removal releases even a paused cat without waiting for another animation tick');assert.equal(f.face.prop.claimedBy,null);assert.equal(f.a.paused,true);
}
{
 const f=fixture();f.stroke();f.a.root={};f.scratch.tick(f.a,1050,'edgeScratch');assert.equal(f.a.social.episode,null,'The same focus on another view cannot retain the old edge');assert.equal(f.face.prop.claimedBy,null);
}
for(const key of ['native_vertical_surfaces','social_behaviour','interaction_behaviour']){
 const f=fixture();f.a.config[key]=false;f.tick(1000);assert.equal(f.a.labScratch,undefined);
}
for(const patch of [{painted:false},{visible:false},{connected:false},{climb:'off'},{unsupported:'rotation'},{permissionReason:'home sharing off'},{clip:{left:0,right:1,top:0,bottom:1}}]){
 const f=fixture();Object.assign(f.panel,patch);f.tick(1000);assert.equal(f.a.labScratch,undefined);
}
{
 const f=fixture();f.panel.radius=12;f.stroke();assert.ok(f.a.labScratch,'A rounded card is usable when the authored claw strokes touch its straight edge');
 const blocked=fixture();blocked.panel.radius=30;blocked.tick(1000);assert.equal(blocked.a.labScratch,undefined,'Do not scratch a rounded corner with no straight material at the claw events');
}
{
 const f=fixture();f.a.ensureMood=()=>({random:()=>.99,values:{sleepiness:.8}});f.tick(1000);assert.equal(f.a.labScratch,undefined,'A cat may decline');assert.equal(f.a.labPose,null,'Waiting keeps ordinary quiet pose variety');
 f.choose('edgeScratch');f.a.pathTo=()=>null;f.tick(5000);assert.equal(f.a.labScratch,undefined,'A safe return route is required');
}
{
 const f=fixture();f.face.prop.claimedBy='other-cat';f.a.verticalFaces=f.a.verticalFaces.filter(x=>x===f.face);f.tick(1000);assert.equal(f.a.labScratch,undefined,'A shared edge claim is respected');
}
{
 const f=fixture(),ep=f.stroke();f.a.social.clock=ep.expires;f.scratch.tick(f.a,1032,'edgeScratch');assert.equal(f.a.social.scratchStats.completed,undefined,'Timed playback without physical contacts is not completion');
}
console.log('PASS: edge scratch focus at eight body scales/both facings, actual paw contacts, independent climb settings, reserved approach/playback, active clocks, declines, safe routes, exclusions, cancellation and contact-based completion.');
