import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { runtimeFiles } from './build-release.mjs';

function element() {
 return {style:{},attrs:{},children:[],append(...children){this.children.push(...children);},
  setAttribute(key,value){this.attrs[key]=value;},removeAttribute(key){delete this.attrs[key];}};
}
const world={window:{},HTMLElement:class{},customElements:{get:()=>true},document:{createElementNS:element}};
vm.runInNewContext(runtimeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n'),world);
const box=world.window.pixelCatBoxV1,art=world.window.pixelCatBoxArtV1;
assert.equal(art.exit.length,3);
assert.ok([...art.entry,...art.exit].every(rows=>rows.length===24&&rows.every(row=>row.length===24)));
assert.equal(box.asset.width,24);
for(const scale of [1,2])for(const direction of [1,-1]){
 const svg=element(),bed=element(),floor={id:'home',left:4,right:250,top:150,min:0,max:200};
 svg.firstElementChild=element();
 const kitten=scale===1,resting=kitten?'box-rest':'box-peek';
 const a={config:{bed_style:'box'},lifeStage:kitten?'kitten':'adult',active:true,ownerKey:'box-test',scale,worldScale:2,
  support:floor,home:floor,facing:direction,x:direction>0?44-21*scale:92-3*scale,y:150,
  shadowRoot:{querySelector:()=>bed},svg,ensureMood:()=>({random:()=>0}),
  draw(rows){this.rows=rows;},status(){},setAttribute(key,value){this[key]=value;}};
 assert.equal(world.window.pixelCatSetupV1.bed(a,{}),box.asset);
 assert.equal(box.begin(a,'stand',0),false);
 assert.equal(box.begin(a,'sleep',0),true);
 assert.equal(a.boxBed.facing,direction);
 assert.equal(a.boxClaim,a);
 const poses=new Set();
 let t=0;
 const tick=()=>{t+=25;box.tick(a,t,25);poses.add(a['data-pose']);};
 while(t<1000)tick();
 assert.equal(a.bedInside,a);
 assert.equal(a['data-pose'],resting);
 assert.ok(svg.firstElementChild.attrs['clip-path']);
 if(kitten)assert.equal(a.boxMask.path.attrs.d,'M0 0Z','Kitten stays hidden while resting');
 else {
  let elapsed=0;
  const upperEdge=floor.top-box.asset.height*a.worldScale-1;
  for(const beat of art.beats){
   a.boxBed.elapsed=elapsed;
   box.tick(a,t,0);
   const earRow=art.parts.head[beat.head].findIndex(row=>row.includes('#'));
   assert.ok(a.idle.placement.top+(earRow+1)*scale<=upperEdge,'Each adult peek exposes at least one complete ear cell above the upper edge');
   assert.notEqual(a.boxMask.path.attrs.d,'M0 0Z');
   elapsed+=beat.hold*260;
  }
 }
 a.boxBed.elapsed=0;
 a.command='explore';
 while(a.boxBed&&t<2100)tick();
 assert.deepEqual([...poses],['box-entry',resting,'box-exit']);
 assert.equal(a.boxBed,null);
 assert.equal(a.boxClaim,null);
 assert.equal(a.bedInside,null);
 assert.equal(svg.firstElementChild.attrs['clip-path'],undefined);
 assert.equal(a.y,floor.top);
 assert.equal(a.command,'explore','Queued travel survives the box exit');
 assert.ok(a.x>=floor.min&&a.x<=floor.max);
 a.command=null;
 a.config.arrival='none';
 box.arrive(a,t);
 assert.equal(a.boxBed,null);
 a.boxArrivalChecked=false;
 delete a.config.arrival;
 box.arrive(a,t);
 assert.equal(a.bedInside,a);
 assert.equal(a['data-pose'],resting,'Startup begins inside without jumping in');
 box.cancel(a);
 box.arrive(a,t);
 assert.equal(a.boxBed,null,'Remeasuring an active cat cannot restart the arrival');
}
console.log('PASS: box art at adult and kitten scales, both approach sides, foreground mask, optional rest, command exit, and restored floor support.');
