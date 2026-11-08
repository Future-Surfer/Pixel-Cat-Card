import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newFrame,validateProject,transform} from '../frame-studio/dist/model.js';
import {moveSelection} from '../frame-studio/dist/selection.js';
import {sequenceMesh,flowRecipes,categoryMapLayout,MAP_TILE} from '../frame-studio/dist/behaviour-map.js';
import {newPropWorkspace,validatePropWorkspace,addPropPlacement,confirmProp} from '../frame-studio/dist/props-model.js';
const f=newFrame();f.gaze={x:18,y:10,angle:-30,fov:100};const p={schemaVersion:1,width:24,height:24,projectId:'test',name:'Gaze',frames:[f]};validateProject(p);
transform(p,f.id,'flip-x');assert.deepEqual(f.gaze,{x:5,y:10,angle:-150,fov:100});transform(p,f.id,'flip-y');assert.equal(f.gaze.angle,150);
moveSelection(p,[f.id],{x:4,y:12,width:4,height:4},1,0);assert.equal(p.frames[0].gaze.x,6);assert.equal(p.frames[0].origin,'human');
assert.throws(()=>validateProject({...p,frames:[{...p.frames[0],gaze:{x:24,y:2,angle:0,fov:100}}]}));
const mesh=sequenceMesh([{projectId:'a',preferredNeighbours:{after:['b','deleted'],before:[]}},{projectId:'b',preferredNeighbours:{before:['a'],after:[]}},{projectId:'deleted',deletedAt:'yes'}]);assert.equal(mesh.nodes.length,2);assert.equal(mesh.edges.length,2);assert.equal(mesh.edges.filter(e=>e.missing).length,1);assert.equal(flowRecipes.social.planned,true);assert.equal(flowRecipes.playful.planned,false);
const proposals=JSON.parse(fs.readFileSync('frame-studio/user-sequences/small-prop-drafts-2026-10-15.json')).assets,w=newPropWorkspace([],proposals);validatePropWorkspace(w);assert.equal(proposals.length,19);assert.equal(new Set(proposals.map(a=>a.familyId)).size,9);assert.ok(proposals.every(a=>a.origin==='ai'&&a.width<=12&&a.height<=8));
const i=addPropPlacement(w,proposals[0].id),a=confirmProp(w,i.id,{name:'Blue ball refined',familyId:'blue-ball',stateKey:'new',stateKind:'condition'});assert.equal(a.familyId,'blue-ball');validatePropWorkspace(w);assert.throws(()=>validatePropWorkspace({...w,assets:[{...a,stateKind:'automatic-script'}]}));
const before=JSON.stringify(w);assert.throws(()=>confirmProp(w,i.id,{name:'Invalid',familyId:'',stateKey:'full',stateKind:'fill'}));assert.equal(JSON.stringify(w),before,'Invalid state metadata must not mutate a saved prop.');
console.log('PASS: optional gaze validation, mirrored/transformed/moved gaze, preserved origin, soft mesh links with unavailable targets, planned encounter separation and 19 small AI prop states.');

const samples=Array.from({length:35},(_,i)=>({projectId:'layout-'+i,name:'Sample '+i,category:['idle','walk','jump','interaction','other'][i%5],idlePosture:['standing','sitting','loafing'][i%3],frames:[newFrame()]}));
for(const width of [320,880,1400]){const layout=categoryMapLayout(samples,width);assert.equal(layout.nodes.length,samples.length);assert.equal(layout.zones.length,7);for(const n of layout.nodes){const zone=layout.zones.find(z=>z.category===n.category);assert.ok(n.x>=zone.x&&n.x+MAP_TILE.width<=zone.x+zone.width);assert.ok(n.y>=zone.y+30&&n.y+MAP_TILE.height<=zone.y+zone.height);}for(let i=0;i<layout.zones.length;i++)for(let j=i+1;j<layout.zones.length;j++){const a=layout.zones[i],b=layout.zones[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y,'Category zones must not overlap');}}
assert.deepEqual(categoryMapLayout(samples,880),categoryMapLayout(samples,880),'Layout stays stable between selections');
console.log('PASS: compact category tiles remain inside non-overlapping zones at narrow, medium and wide canvas sizes.');
