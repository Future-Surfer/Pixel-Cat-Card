import fs from 'node:fs';
import {latestProjects} from './latest-studio-assets.mjs';
import {newFrame,validateProject,pixelVolume} from '../frame-studio/dist/model.js';

// A code-native pixel proposal: reuse the exact human head/tail motifs, author
// new torso and leg pixels. Every resulting frame is mixed, never human.
const source=latestProjects.get('6cfeeb8e-959a-4d04-b3cf-173d8093f0dc').project;
const specs=[
 {name:'Fore catch',cx:12,cy:17,rx:7,ry:3,headY:1,tailY:1,legs:[[[8,18],[10,20],[13,21]],[[10,18],[12,20],[15,21]],[[17,18],[20,21],[20,23]],[[16,18],[18,20],[18,22]]],contact:['near-front'],ms:80},
 {name:'Fore support · gather',cx:12,cy:16,rx:6,ry:4,headY:0,tailY:0,legs:[[[8,18],[10,21],[13,22]],[[10,18],[12,20],[15,21]],[[17,18],[19,21],[19,23]],[[16,18],[17,20],[17,22]]],contact:['near-front'],ms:80},
 {name:'Hind load under body',cx:12,cy:15,rx:6,ry:4,headY:-1,tailY:-1,legs:[[[8,17],[11,20],[14,23]],[[10,17],[12,20],[12,22]],[[17,17],[19,19],[17,21]],[[16,17],[17,19],[15,20]]],contact:['near-hind'],ms:80},
 {name:'Hind push · extend',cx:12,cy:16,rx:7,ry:3,headY:0,tailY:0,legs:[[[8,18],[8,20],[9,23]],[[10,18],[10,20],[11,22]],[[17,18],[19,19],[21,20]],[[16,18],[18,19],[20,19]]],contact:['near-hind'],ms:70},
 {name:'Release · flight',cx:12,cy:14,rx:7,ry:3,headY:-2,tailY:-1,legs:[[[7,16],[5,18],[3,20]],[[9,16],[8,18],[6,19]],[[17,16],[20,17],[22,18]],[[16,16],[18,18],[20,19]]],contact:[],ms:80},
 {name:'Extended flight · reach',cx:12,cy:14,rx:7,ry:3,headY:-2,tailY:-1,legs:[[[7,16],[5,18],[4,19]],[[9,16],[8,18],[7,20]],[[17,16],[21,18],[23,21]],[[16,16],[19,18],[21,20]]],contact:[],ms:90},
 {name:'Fore reach toward ground',cx:12,cy:15,rx:7,ry:3,headY:-1,tailY:0,legs:[[[7,17],[7,19],[9,20]],[[9,17],[10,18],[12,19]],[[17,17],[21,20],[22,23]],[[16,17],[19,19],[20,22]]],contact:['near-front'],ms:80},
 {name:'Fore support · recover',cx:12,cy:17,rx:7,ry:3,headY:1,tailY:1,legs:[[[8,18],[9,20],[12,21]],[[10,18],[12,19],[14,20]],[[17,18],[21,21],[21,23]],[[16,18],[19,20],[19,23]]],contact:['near-front','far-front'],ms:80}
];
const frames=specs.map((spec,i)=>{
 const grid=Array.from({length:24},()=>Array(24).fill('.'));
 const dot=(x,y,token='#')=>{if(x<0||x>=24||y<0||y>=24)throw Error(`Clipped gallop pixel ${i}:${x},${y}`);grid[y][x]=token;};
 const line=(a,b,width=1)=>{const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let k=0;k<=n;k++){const x=Math.round(a[0]+(b[0]-a[0])*k/(n||1)),y=Math.round(a[1]+(b[1]-a[1])*k/(n||1));dot(x,y);if(width===2&&x>0)dot(x-1,y);}};
 for(let y=spec.cy-spec.ry;y<=spec.cy+spec.ry;y++)for(let x=spec.cx-spec.rx;x<=spec.cx+spec.rx;x++)if(((x-spec.cx)/spec.rx)**2+((y-spec.cy)/spec.ry)**2<=1.15)dot(x,y);
 // Far limbs first, near limbs have a slightly heavier silhouette.
 for(const legIndex of [1,3,0,2]){const leg=spec.legs[legIndex];line(leg[0],leg[1],legIndex%2?1:2);line(leg[1],leg[2]);dot(...leg[2],'R');}
 const original=source.frames[0].rows;
 for(let y=6;y<=16;y++)for(let x=0;x<=6;x++)if(original[y][x]!=='.')dot(x,y+spec.tailY,original[y][x]);
 // Join tail base into the varying rump without stretching the head.
 line([5,15+spec.tailY],[7,spec.cy],2);
 for(let y=10;y<=18;y++)for(let x=16;x<24;x++)if(original[y][x]!=='.')dot(x,y+spec.headY,original[y][x]);
 const frame=newFrame(spec.name,grid.map(r=>r.join('')),'mixed');frame.id=`gallop-draft-${i+1}`;frame.durationMs=spec.ms;frame.role='cycle';frame.source={projectId:source.projectId,frameId:source.frames[0].id};frame.operations=[{actor:'ai',kind:'gallop-body-and-limbs',at:'2026-10-15T00:00:00.000Z',preserved:'Human head and tail motifs',reference:'CAT_GAITS.md'}];frame.metadata={category:'walk',tags:['gallop','draft',spec.contact.length?'support':'airborne'],description:`Mixed-origin draft. Proposed support: ${spec.contact.join(', ')||'none'}. Contact timing needs human review; not runtime enabled.`};frame.gaitContacts=spec.contact;return frame;
});
const project=validateProject({schemaVersion:1,width:24,height:24,projectId:'proposal-gallop-24',name:'Gallop · compact sprint draft',category:'walk',wip:true,description:'Mixed-origin eight-frame gallop proposal based on the human faster walk head/tail. New gathered/extended body and legs fit 24×24 with no clipped pixels. Review silhouette, footfall order and loop before runtime integration. Contact labels are proposals, not verified anchors.',variantOf:{projectId:source.projectId,name:source.name},gait:{status:'proposal',runtimeEnabled:false,gridFit:'24x24-no-clipping',sourceProjectId:source.projectId},frames});
fs.writeFileSync('frame-studio/user-sequences/gallop-draft.json',JSON.stringify(project,null,2)+'\n');
console.log('Gallop draft:',frames.map(f=>({name:f.name,volume:pixelVolume(f.rows)})));
