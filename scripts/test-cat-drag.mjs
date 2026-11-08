import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const listeners=new Map();
class Node {
 constructor(){this.style={};this.dataset={};this.handlers={};}
 addEventListener(k,fn){this.handlers[k]=fn;}
 removeEventListener(k){delete this.handlers[k];}
 append(){} remove(){this.removed=true;}
 setPointerCapture(id){this.capture=id;}hasPointerCapture(id){return this.capture===id;}
 releasePointerCapture(id){this.capture=null;this.handlers.lostpointercapture?.({type:'lostpointercapture',pointerId:id});}
}
const box={window:{addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k)},document:{createElement:()=>new Node()},performance:{now:()=>1000}};
for(const f of ['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','prototype/cat-drag.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),box);
const drag=box.window.pixelCatDragV1,art={...box.window.pixelCatRoamingArtV2,...box.window.pixelCatRoamingExtrasV1};
assert.equal(art.lifted.origin,'mixed');assert.equal(art.lifted.review,'accepted');assert.equal(art.lifted.rows.length,24);assert.ok(art.lifted.rows.every(r=>r.length===24));
let dropped=0;box.window.pixelCatMouthV1={startled:a=>{dropped++;a.carriedToy=null;}};
const event=(type,x,y,id=1)=>({type,clientX:x,clientY:y,pointerId:id,button:0,isPrimary:true,preventDefault(){this.prevented=true;},stopPropagation(){}});
function actor(scale=2,facing=1){
 const s={id:'floor',el:{isConnected:true},left:0,right:1000,min:0,max:1000-24*scale,top:400},a={active:true,config:{},scale,facing,svg:new Node(),layer:new Node(),support:s,surfaces:[s],x:100,y:400,paused:false,carriedToy:'toy',motion:{kind:'walk'},route:[s],attrs:{},social:{finish(){},clear:()=>true},blocked:()=>false,cancelPlay(){this.cancelled=true;},setAttribute(k,v){this.attrs[k]=v;},renderMoodDebug(){},draw(rows){this.rows=rows;this.svg.style.transform=`translate(${this.x}px,${this.y-drag.bottom(rows)*scale}px)`;},status(){}};
 drag.install(a,art);return a;
}
for(const scale of [1,2,3,4,5,6])for(const facing of [-1,1]){
 const a=actor(scale,facing);a.svg.handlers.pointerdown(event('pointerdown',200,100));
 assert.equal(a.userHeld,true);assert.equal(a.motion,null);assert.equal(a.route.length,0);assert.equal(a.carriedToy,null);assert.equal(a.cancelled,true);assert.equal(a.svg.capture,1);
 assert.equal(a.x+drag.grip(art.lifted,facing)[0]*scale,200,'Scruff stays beneath pointer in either facing');
 assert.match(a.svg.style.filter,/drop-shadow/);assert.equal(a.attrs['data-frame-origin'],art.lifted.origin);
 a.svg.handlers.pointerup(event('pointerup',220,110));assert.equal(a.dragState.phase,'fall');assert.equal(a.svg.capture,null);assert.equal(a.userHeld,true,'Capture release must not cancel the release flight');
 for(let t=1016;t<4000&&a.userHeld;t+=16)drag.tick(a,t,art);
 assert.equal(a.userHeld,false);assert.equal(a.support.id,'floor');assert.equal(a.y,400);assert.equal(a.svg.style.filter,'');assert.equal(a.paused,false);drag.uninstall(a);assert.equal(a.svg.handlers.pointerdown,undefined);
}
assert.equal(dropped,12);
{
 const a=actor();a.config.draggable=false;const e=event('pointerdown',150,120);a.svg.handlers.pointerdown(e);assert.equal(a.userHeld,undefined);assert.equal(e.prevented,undefined,'Disabled dragging leaves normal input alone');drag.uninstall(a);
}
{
 const a=actor();a.paused=true;a.svg.handlers.pointerdown(event('pointerdown',150,120));listeners.get('keydown')({type:'keydown',key:'Escape',preventDefault(){}});assert.equal(a.userHeld,false);assert.equal(a.paused,true);assert.equal(a.x,100);assert.equal(a.svg.capture,null);assert.equal(a.rows,art.stand,'Cancellation redraws a paused cat instead of leaving it hanging');drag.uninstall(a);
}
for(const type of ['pointercancel','lostpointercapture']){
 const a=actor();a.svg.handlers.pointerdown(event('pointerdown',150,120));a.svg.handlers[type](event(type,150,120));assert.equal(a.userHeld,false);assert.equal(a.x,100);drag.uninstall(a);
}
{
 const a=actor();a.svg.handlers.pointerdown(event('pointerdown',150,120));
 a.support.top-=40;drag.tick(a,1008,art);assert.equal(a.y,120-drag.grip(art.lifted,a.facing)[1]*a.scale+23*a.scale,'Held cat remains beneath the pointer during scrolling');
 a.svg.handlers.pointerup(event('pointerup',150,120));const start=a.dragState.fromTop;
 a.support.top-=50;a.support.left+=20;a.support.min+=20;a.support.max+=20;drag.tick(a,1016,art);
 assert.equal(a.dragState.fromTop,start-50,'Release trajectory rebases with the scrolling support');
 for(let t=1032;t<4000&&a.userHeld;t+=16)drag.tick(a,t,art);
 assert.equal(a.y,310);assert.equal(a.userHeld,false);drag.uninstall(a);
}
{
 const a=actor();a.svg.handlers.pointerdown(event('pointerdown',150,500));a.svg.handlers.pointerup(event('pointerup',150,500));assert.equal(a.userHeld,false,'No upward teleport when released below every known support');assert.equal(a.x,100);drag.uninstall(a);
}
{
 const a=actor();a.social.clear=()=>false;assert.equal(drag.target(a,100,100),null,'Occupied landings are excluded');a.social.clear=()=>true;a.svg.handlers.pointerdown(event('pointerdown',150,120));a.svg.handlers.pointerup(event('pointerup',150,120));a.surfaces=[];drag.tick(a,1016,art);assert.equal(a.userHeld,false);assert.equal(a.waitingForSurface,true,'Removed supports release the hold and request fresh geometry');assert.equal(a.svg.style.filter,'');drag.uninstall(a);assert.equal(listeners.size,0);
}
console.log('PASS: scruff pointer anchors at six scales/both facings, shadow, exclusive hold, released claims, gravity landing, preserved pause, Escape/capture cancellation, disabled input, invalid/occupied/removed supports and listener cleanup.');

const direction=actor();direction.svg.handlers.pointerdown(event('pointerdown',200,100));direction.svg.handlers.pointermove(event('pointermove',180,100));assert.equal(direction.facing,-1);direction.svg.handlers.pointermove(event('pointermove',220,100));assert.equal(direction.facing,1);direction.svg.handlers.pointerup(event('pointerup',220,100));for(let t=1016;t<4000&&direction.userHeld;t+=16)drag.tick(direction,t,art);assert.equal(direction.facing,1,'Last horizontal drag direction survives landing');drag.uninstall(direction);
