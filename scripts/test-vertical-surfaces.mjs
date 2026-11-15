import assert from 'node:assert/strict';
import {discoverVerticalSurfaces} from '../prototype/vertical-surface-model.mjs';
import {readFileSync} from 'node:fs';
const frame=JSON.parse(readFileSync('frame-studio/user-sequences/climb-runtime-2026-10-20/snapshot.json','utf8')).draft.centred.front.frames[0],world={left:0,top:0,right:1100,bottom:620},scale=1.5;
const panel={id:'wall',label:'Wall',rect:{left:580,right:730,top:210,bottom:580},painted:true,visible:true,connected:true,radius:12},support={id:'wall-top',ownerId:'wall',top:210,left:590,right:720,min:590,max:684};
const discover=(p=panel,s=scale)=>discoverVerticalSurfaces({panels:[p],supports:[support],world,scale:s,frame});assert.equal(discover().faces.length,1);assert.equal(discover().tops.length,1);
for(const patch of [{painted:false},{visible:false},{connected:false},{climb:'off'},{rect:{left:580,right:590,top:210,bottom:580}},{clip:{left:0,right:1100,top:0,bottom:200}}])assert.equal(discover({...panel,...patch}).faces.length,0,JSON.stringify(patch));assert.equal(discover({...panel,painted:false,climb:'on'}).faces.length,1);
const split=discover({...panel,blockers:[{left:500,right:800,top:350,bottom:430}]});assert.equal(split.faces.length,2);assert.ok(split.faces.every(f=>f.rect.bottom<=350||f.rect.top>=430));
const fit={...panel,rect:{left:580,right:605,top:210,bottom:580},radius:0};assert.equal(discover(fit,1.5).faces.length,1);assert.equal(discover(fit,3).faces.length,0,'Grip fit follows body footprint');
assert.equal(discover({...panel,blockers:[{left:0,right:1100,top:100,bottom:230}]}).tops.length,0,'A covered top is not a landing');
assert.throws(()=>discoverVerticalSurfaces({panels:[panel,panel],supports:[support],world,scale,frame}),/stable panel IDs/);assert.equal(discover({...panel,unsupported:'Rotated panel'}).faces.length,0);

import {snapshotVerticalPanels} from '../prototype/vertical-surface-dom.mjs';
const css={backgroundColor:'rgb(0, 0, 0)',backgroundImage:'none',zIndex:'auto',display:'block',visibility:'visible',opacity:'1',overflowX:'visible',overflowY:'visible',transform:'none'};const element=(style={},rect=panel.rect)=>({id:'test',isConnected:true,style:{...css,...style},parentElement:null,getBoundingClientRect:()=>({...rect,width:rect.right-rect.left,height:rect.bottom-rect.top}),getAttribute:()=>null,getRootNode:()=>({}),querySelectorAll:()=>[]});const priorStyle=globalThis.getComputedStyle;globalThis.getComputedStyle=e=>e.style;try{const el=element();assert.equal(snapshotVerticalPanels([{el}],world)[0].painted,true,'Opaque black stays material');el.style.backgroundColor='rgba(0, 0, 0, 0)';assert.equal(snapshotVerticalPanels([{el}],world)[0].painted,false);el.style.transform='matrix(0, 1, -1, 0, 0, 0)';assert.match(snapshotVerticalPanels([{el}],world)[0].unsupported,/Rotated/);el.parentElement=element({opacity:'0'});assert.equal(snapshotVerticalPanels([{el}],world)[0].visible,false);}finally{if(priorStyle)globalThis.getComputedStyle=priorStyle;else delete globalThis.getComputedStyle;}

console.log('PASS: painted surfaces, visibility, clipping, occlusion, top clearance and footprint checks.');
