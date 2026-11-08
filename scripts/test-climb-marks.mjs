import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {runtimeFiles} from './build-release.mjs';
let boxes=0,createdPaths=0;
function node(name='div'){if(name==='path')createdPaths++;return {localName:name,isConnected:true,style:{},dataset:{},attrs:{},children:[],append(child){child.parent=this;this.children.push(child);},prepend(child){child.parent=this;this.children.unshift(child);},setAttribute(k,v){this.attrs[k]=String(v);},remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);},getBoundingClientRect(){boxes++;return {left:100,top:100,width:400,height:500,right:500,bottom:600};}};}
const wall=node('ha-card'),body=node('body'),root=node(),doc={body,documentElement:node('html'),createElementNS:(_,name)=>node(name),elementFromPoint:()=>wall};
const b={window:{},document:doc,HTMLElement:class{},customElements:{get:()=>true},performance,getComputedStyle:n=>({position:n===wall?'relative':'static',transform:'none',backgroundColor:n.backgroundColor||(n===wall?'rgb(230, 220, 200)':'rgba(0, 0, 0, 0)'),getPropertyValue:()=>''})};
vm.runInNewContext(runtimeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n'),b);
const marks=b.window.pixelCatClimbMarksV1,effects=b.window.pixelCatEffectsV1;
const a={root,active:true,config:{color:'#ff0000'},scale:1,surfaces:[]},clock=effects.join(a);marks.install();
assert.equal(marks.colour('color(srgb 1 0.5 0)'), '#ff8000');assert.equal(marks.colour('#123'),'#112233');assert.equal(marks.colour('rgba(0, 0, 0, 0)'),null);
assert.equal(marks.material(a,{x:120,y:150}).colour,'#e6dcc8');const painted=node('ha-card');painted.backgroundColor='rgb(255, 255, 255)';a.shadowRoot={querySelector:()=>painted};assert.equal(marks.material(a,{x:120,y:150}).colour,'#ffffff','Pointer-transparent painted home material wins over hit-tested background');delete a.shadowRoot;boxes=0;
marks.mark(a,wall,{x:150,y:200},'#e6dcc8',false,0,null);marks.mark(a,wall,{x:160,y:210},'#e6dcc8',true,4,null);
assert.equal(marks.report(root).active,2);assert.equal(marks.report(root).layers,1);assert.equal(boxes,1,'One box read per material layer, not per mark/frame');
const layer=wall.children[0];assert.match(layer.children[0].attrs.d,/M49\.625 100L49\.125 102/,'Catch marks stay short and paw-local');assert.match(layer.children[1].attrs.d,/M59\.625 106L59\.625 110/,'Scrapes follow only actual travelled distance');assert.match(layer.style.cssText,/pointer-events:none/);assert.notEqual(layer.children[0].attrs.stroke,a.config.color);assert.ok(Number(layer.children[1].attrs['stroke-width'])>Number(layer.children[0].attrs['stroke-width']));assert.equal(layer.style.zIndex,'-1','Wall marks sit in the material background below all children');assert.equal(wall.style.isolation,'isolate');assert.equal(body.children.length,0,'Wall marks are not in the foreground cat/prop portal');
clock.time=6000;marks.tick(a,1);assert.equal(marks.report(root).active,2,'Marks outlive the old five-second preview');assert.equal(layer.children[0].attrs.opacity,'0.85');
clock.time=17900;marks.tick(a,2);assert.ok(Number(layer.children[0].attrs.opacity)<.1);
for(let i=0;i<1000;i++)marks.mark(a,wall,{x:150,y:200},'#e6dcc8',false,0,null);assert.equal(marks.report(root).active,960,'Per-owner cap');assert.equal(boxes,1);
const peers=Array.from({length:5},(_,i)=>({...a,config:{color:'#00000'+i}}));for(const peer of peers)for(let i=0;i<1000;i++)marks.mark(peer,wall,{x:160,y:210},'#e6dcc8',false,0,null);assert.equal(marks.report(root).active,3840,'View cap');
const boxReads=boxes;marks.tick(a,3);marks.tick(peers[0],3);assert.equal(boxes,boxReads,'One shared effects-frame pass');
for(const peer of peers)effects.leave(peer);effects.leave(a);assert.equal(marks.report(root).active,0);assert.equal(body.children.length,0);assert.equal(wall.children.length,0,'Material underlay cleaned');assert.equal(wall.style.isolation,'','Original material stacking restored');
marks.mark(a,wall,{x:150,y:200},'#111111',true,3,500,{left:110,right:120,top:140,bottom:300});assert.equal(body.children[0].style.clipPath,'inset(40px 380px 300px 10px)');assert.equal(body.children[0].style.zIndex,String(b.window.pixelCatDepthV1.key(500,1)),'Post scrapes lie on the prop in front of far body and behind wrapping paws');effects.clear(root);assert.equal(marks.report(root).active,0);
marks.mark(a,wall,{x:150,y:200},'#dddddd',true,3,null,null,'slide-1');const stroke=wall.children[0].children[0],first=stroke.attrs.d;
for(let y=205;y<=400;y+=5)marks.mark(a,wall,{x:150,y},'#dddddd',true,5,null,null,'slide-1');assert.equal(marks.report(root).active,1,'A long scrape extends its existing stroke instead of evicting its trail');assert.notEqual(stroke.attrs.d,first);assert.match(stroke.attrs.d,/M49.625 97/,'A scrape begins at the previous real contact without an invented extension');effects.clear(root);assert.equal(wall.style.isolation,'');
console.log('PASS: runtime material-colour marks, stronger scrapes, 18-second fade, behind-cat depth, bounded pools/layers, cached geometry, shared clock and lifecycle cleanup.');
// Six cats can retain a full recent trail without premature per-cat/view eviction.
const residents=Array.from({length:6},()=>({...a,config:{},surfaces:[]}));for(const cat of residents)for(let i=0;i<60;i++)marks.mark(cat,wall,{x:110+i*2,y:200},'#dddddd',false,0,null);assert.equal(marks.report(root).active,360);assert.equal(marks.report(root).evicted,0);assert.equal(marks.report(root).capacity,3840);effects.join(residents[0]).time+=18001;marks.tick(a,100);assert.equal(marks.report(root).active,0,'Normal age expiry remains primary');
const model=b.window.pixelCatClimbModelV1;for(const scale of [.5,1,1.5,2]){const style=model.scratchStyle(scale,true);assert.equal(style.length,3*scale);assert.ok(style.width<=scale);assert.ok(style.claws<=3);assert.ok(style.spread<=scale);}
console.log('PASS: 360 retained six-cat marks without eviction, complete age cleanup, continuous kitten-scaled lengths/widths and narrower paw-centred claw groups.');
const crowd=Array.from({length:20},()=>({...a,config:{},surfaces:[]}));for(const cat of crowd)for(let i=0;i<160;i++)marks.mark(cat,wall,{x:110+i*2,y:200},'#dddddd',false,0,null);assert.equal(marks.report(root).active,3200);assert.equal(marks.report(root).evicted,0);effects.clear(root);
for(let i=0;i<20;i++)marks.mark(a,node('ha-card'),{x:120,y:200},'#dddddd',false,0,null);assert.equal(marks.report(root).layers,20,'Material layers do not silently stop at twelve cards');effects.clear(root);
// A kitten's debris scale follows its paws, not the full-size furniture. Marks
// already on the painted rope stay at their contact instead of its centre line.
const emit=effects.emit,post=effects.postContact,mark=marks.mark,wiggle=effects.wiggle,emitted=[],points=[];effects.emit=(...args)=>emitted.push(args);effects.postContact=(face,point)=>{assert.equal(face.x,150);assert.equal(face.top,50);assert.equal(face.surface.top,550);return {point,materialColour:'#dddddd'};};effects.wiggle=()=>{};marks.mark=(_,host,point)=>points.push(point);a.surfaces=[{left:100,right:500,top:600}];a.climb={virtual:false,base:{top:600},dx:10,dy:-50,face:{x:140,top:100,bottom:500,surface:{top:600}},scene:{face:{x:140,right:148,top:100,bottom:500}},prop:{node:wall,scale:2},serial:1,sample:{segment:1}};
try{marks.contact(a,{rows:Array(24).fill('#'.repeat(24)),paws:[{x:20,y:4},{x:22,y:8}]},{x:130,top:100},'test',true,2);assert.equal(emitted.length,2);assert.ok(emitted.every(args=>args[5]===1));assert.equal(points[0].x,150.5);assert.equal(points[1].x,152.5);}finally{effects.emit=emit;effects.postContact=post;effects.wiggle=wiggle;marks.mark=mark;}
console.log('PASS: twenty-resident retention/material layers and actor-sized, contact-aligned kitten post debris/scrapes.');

// Capacity pressure always admits a new mark and recycles the oldest timestamp,
// including refreshed scrape lifetimes; live extensions do not consume slots.
const resident=()=>({...a,config:{},surfaces:[]}),fresh=resident();
for(let i=0;i<960;i++){effects.join(fresh).time=i;marks.mark(fresh,wall,{x:150,y:200},'#dddddd',true,3,null,null,'trail-'+i);}
const poolLayer=wall.children[0],refreshed=poolLayer.children[0],oldest=poolLayer.children[1],allocated=createdPaths;
effects.join(fresh).time=1000;marks.mark(fresh,wall,{x:150,y:250},'#dddddd',true,5,null,null,'trail-0');
assert.equal(marks.report(root).active,960);assert.equal(marks.report(root).evicted,0);
marks.mark(fresh,wall,{x:160,y:260},'#dddddd',false,0,null);
assert.equal(marks.report(root).active,960);assert.equal(marks.report(root).evicted,1);assert.equal(createdPaths,allocated,'Overflow reuses the retired path node');assert.equal(poolLayer.children.at(-1),oldest,'Least recently refreshed mark is recycled');assert.ok(poolLayer.children.includes(refreshed),'An actively extended scrape survives older marks');effects.clear(root);
const hosts=Array.from({length:65},()=>node('ha-card')),visitor=resident();
for(let i=0;i<hosts.length;i++){effects.join(visitor).time=i;marks.mark(visitor,hosts[i],{x:150,y:200},'#dddddd',false,0,null);}
assert.equal(marks.report(root).layers,64);assert.equal(hosts[0].children.length,0);assert.equal(hosts[0].style.isolation,'');assert.equal(hosts[64].children.length,1,'A new material always receives a layer by retiring the oldest');effects.clear(root);assert.ok(hosts.every(h=>h.children.length===0&&h.style.isolation===''));
console.log('PASS: tenfold pools, 3,200 twenty-cat marks, timestamp-based overflow reuse, refreshed trail survival and oldest-material replacement.');

// One slide crosses background -> card -> background, then scrolls. Geometry
// must join at the edges, use each material's colour, and never bridge the card.
let scroll=0;const panel=node('ha-card');panel.backgroundColor='#e6dcc8';root.backgroundColor='#203040';
root.getBoundingClientRect=()=>({left:0,top:-scroll,width:500,height:600,right:500,bottom:600-scroll});panel.getBoundingClientRect=()=>({left:100,top:200-scroll,width:300,height:60,right:400,bottom:260-scroll});
a.shadowRoot={querySelector:()=>panel};a.climb={virtual:true,serial:88,sample:{segment:2},dx:0,dy:0};
const originalHit=doc.elementFromPoint,originalEmit=effects.emit;doc.elementFromPoint=(x,y)=>y+scroll>=200&&y+scroll<260?panel:root;effects.emit=()=>{};
const pawFrame={rows:Array(24).fill('#'.repeat(24)),paws:[{x:0,y:0}]},slide=y=>marks.contact(a,pawFrame,{x:149.5,top:y-.5},'slide',true,0),coords=path=>[...path.matchAll(/[-+]?\d*\.?\d+/g)].map(m=>Number(m[0])).slice(0,4);
try{
 const actorInk=node('rect');actorInk.closest=()=>actorInk;doc.elementsFromPoint=(x,y)=>[actorInk,doc.elementFromPoint(x,y)];
 slide(150);assert.equal(marks.report(root).active,0,'First contact cannot invent a trail before movement');slide(310);
 assert.equal(marks.report(root).active,3,'Each contiguous material run owns one path');
 const bg=root.children[0],card=panel.children[0];assert.deepEqual(coords(bg.children[0].attrs.d),[149.625,150,149.625,200]);assert.deepEqual(coords(card.children[0].attrs.d),[49.625,0,49.625,60]);assert.deepEqual(coords(bg.children[1].attrs.d),[149.625,260,149.625,310]);assert.notEqual(bg.children[0].attrs.stroke,card.children[0].attrs.stroke);
 effects.join(a).frame=999;scroll=80;a.climb.dy=-80;slide(270);assert.equal(marks.report(root).active,3);assert.deepEqual(coords(bg.children[1].attrs.d),[149.625,260,149.625,350],'Scrolling changes the camera, not the material-local trail');effects.clear(root);
 // Non-home painted panels also split at their exact measured edges.
 scroll=0;a.climb={virtual:true,serial:90,sample:{segment:2},dx:0,dy:0};delete a.shadowRoot;slide(150);slide(310);assert.deepEqual(coords(panel.children[0].children[0].attrs.d),[49.625,0,49.625,60]);effects.clear(root);a.shadowRoot={querySelector:()=>panel};
 // Interactive/unpaintable gaps break the run rather than joining through it.
 scroll=0;a.climb={virtual:true,serial:89,sample:{segment:2},dx:0,dy:0};const button=node('button');doc.elementFromPoint=(x,y)=>y>=220&&y<240?button:y>=200&&y<260?panel:root;slide(150);slide(310);
 assert.equal(panel.children[0].children.length,2,'Re-entering the same card starts a separate run after a gap');for(const path of panel.children[0].children){const [,y,,end]=coords(path.attrs.d);assert.ok(end<=20||y>=40,'No scrape bridges the interactive gap');}effects.clear(root);
}finally{doc.elementFromPoint=originalHit;delete doc.elementsFromPoint;effects.emit=originalEmit;delete a.shadowRoot;}
console.log('PASS: short catch marks, measured slide lengths, background/card/background continuity, material colour, scroll-local trails and gap breaks.');

// HA paints dashboard gaps on a slotless shadow host. Light DOM children there
// do not render; its marks must live in the actual shadow tree. Slotted cards
// continue to use their normal content slot, and cleanup restores isolation.
const backgroundHost=node('hui-view-background'),backgroundShadow=node('shadow-root');backgroundShadow.querySelector=()=>null;backgroundHost.shadowRoot=backgroundShadow;
marks.mark(a,backgroundHost,{x:150,y:200},'#f0f0f0',true,20,null);
assert.equal(backgroundHost.children.length,0);assert.equal(backgroundShadow.children.length,1,'Background SVG mounts in the renderable shadow tree');assert.equal(backgroundShadow.children[0].style.zIndex,'-1');assert.equal(backgroundShadow.children[0].children.length,1);effects.clear(root);assert.equal(backgroundShadow.children.length,0);assert.equal(backgroundHost.style.isolation,'');
const slottedHost=node('ha-card'),slottedShadow=node('shadow-root');slottedShadow.querySelector=()=>node('slot');slottedHost.shadowRoot=slottedShadow;
marks.mark(a,slottedHost,{x:150,y:200},'#f0f0f0',false,0,null);assert.equal(slottedHost.children.length,1);assert.equal(slottedShadow.children.length,0);effects.clear(root);assert.equal(slottedHost.children.length,0);
console.log('PASS: slotless HA background shadow mounting, slotted card content mounting, behind-content depth and exact cleanup.');
