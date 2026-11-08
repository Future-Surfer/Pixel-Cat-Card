import {clone,id} from './model.js';
export const propMouthCarryable=a=>a?.mouthCarryable??(a?.width<=12&&a?.height<=8&&/ball|mouse/i.test([a.id,a.name,a.familyId,...a.tags||[]].join(' ')));
export const PROP_WIDTH=96,PROP_HEIGHT=64;
export const propPixels=(width,height)=>Array.from({length:height},()=>Array(width).fill(null));
const propCheck=(ok,message)=>{if(!ok)throw Error(message);};
const checkPropState=(familyId,stateKey,stateKind)=>{propCheck(typeof familyId==='string'&&(!familyId||/^[a-zA-Z0-9_-]{1,100}$/.test(familyId)),'Invalid prop family ID.');propCheck(typeof stateKey==='string'&&stateKey.length<=80&&(!stateKey||!!familyId),'A prop state needs a family ID.');propCheck(['','angle','fill','condition','pose'].includes(stateKind),'Invalid state dimension.');};
const checkPropBehaviour=notes=>propCheck(notes===undefined||typeof notes==='string'&&notes.length<=6000,'Behaviour notes must be at most 6000 characters.');
const checkColourVariants=p=>{if(p===undefined)return;propCheck(p&&p.version===1&&p.origin==='ai'&&['candidate','accepted'].includes(p.review)&&Number.isInteger(p.sourceRevision)&&p.sourceRevision>0&&Array.isArray(p.themes)&&p.themes.length<=16,'Invalid prop colour proposals.');for(const t of p.themes){propCheck(typeof t.id==='string'&&/^[a-z-]{1,40}$/.test(t.id)&&typeof t.name==='string'&&t.name.length<=80&&Array.isArray(t.variants)&&t.variants.length<=16,'Invalid colour theme.');for(const v of t.variants)propCheck(typeof v.name==='string'&&v.name.length<=80&&v.colours&&typeof v.colours==='object'&&!Array.isArray(v.colours)&&Object.keys(v.colours).length<=256&&Object.entries(v.colours).every(([a,b])=>/^#[a-f\d]{6}$/i.test(a)&&typeof b==='string'&&/^#[a-f\d]{6}$/i.test(b)),'Invalid colour palette map.');}};
export function validatePropWorkspace(w){
 propCheck(w?.schemaVersion===1&&w.projectId==='props-workspace'&&w.width===PROP_WIDTH&&w.height===PROP_HEIGHT,'Invalid props workspace.');
 const matrix=(rows,width,height)=>{propCheck(Number.isInteger(width)&&width>0&&width<=PROP_WIDTH&&Number.isInteger(height)&&height>0&&height<=PROP_HEIGHT,'Invalid prop dimensions.');propCheck(Array.isArray(rows)&&rows.length===height&&rows.every(r=>Array.isArray(r)&&r.length===width&&r.every(c=>c===null||typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c))),'Prop pixels must be hex colours or transparent.');};
 matrix(w.scratch,w.width,w.height);propCheck(['human','ai','mixed','unknown'].includes(w.scratchOrigin),'Invalid scratch origin.');
 propCheck(Array.isArray(w.assets)&&w.assets.length<=256&&Array.isArray(w.instances)&&w.instances.length<=128,'Maximum 256 props and 128 placements.');
 const ids=new Set();for(const a of w.assets){propCheck(typeof a.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(a.id)&&!ids.has(a.id),'Invalid or duplicate prop ID.');ids.add(a.id);propCheck(typeof a.name==='string'&&a.name.trim().length>0&&a.name.length<=120&&typeof a.description==='string'&&a.description.length<=2000,'Invalid prop label or notes.');propCheck(Array.isArray(a.tags)&&a.tags.length<=20&&a.tags.every(t=>typeof t==='string'&&t.length<=40),'Invalid prop tags.');propCheck(['human','ai','mixed','unknown'].includes(a.origin)&&a.review==='candidate'&&Number.isInteger(a.revision)&&a.revision>0,'Invalid prop provenance.');if(a.familyId!==undefined)propCheck(typeof a.familyId==='string'&&(!a.familyId||/^[a-zA-Z0-9_-]{1,100}$/.test(a.familyId)),'Invalid prop family ID.');if(a.stateKey!==undefined)propCheck(typeof a.stateKey==='string'&&a.stateKey.length<=80&&(!a.stateKey||!!a.familyId),'A prop state needs a family ID.');if(a.stateKind!==undefined)propCheck(['','angle','fill','condition','pose'].includes(a.stateKind),'Invalid state dimension.');propCheck(a.mouthCarryable===undefined||typeof a.mouthCarryable==='boolean','Invalid mouth pickup option.');checkPropBehaviour(a.behaviourNotes);matrix(a.pixels,a.width,a.height);}
 const placements=new Set();for(const i of w.instances){propCheck(typeof i.id==='string'&&!placements.has(i.id)&&ids.has(i.assetId),'Invalid prop placement.');placements.add(i.id);propCheck(Number.isInteger(i.x)&&Number.isInteger(i.y)&&i.x>=0&&i.y>=0&&i.x+i.width<=w.width&&i.y+i.height<=w.height&&typeof i.visible==='boolean'&&typeof i.dirty==='boolean','Placement must fit on the canvas.');propCheck(['human','ai','mixed','unknown'].includes(i.origin),'Invalid placement origin.');matrix(i.pixels,i.width,i.height);}
 for(const a of w.assets)checkColourVariants(a.colourVariants);
 const r=w.reference;propCheck(r&&typeof r.projectId==='string'&&Number.isInteger(r.x)&&r.x>=0&&r.x<=w.width-24&&Number.isInteger(r.y)&&r.y>=0&&r.y<=w.height-24&&typeof r.visible==='boolean'&&typeof r.animate==='boolean','Invalid reference cat placement.');return w;
}
export function newPropWorkspace(references=[],extras=[]){return {schemaVersion:1,projectId:'props-workspace',width:PROP_WIDTH,height:PROP_HEIGHT,scratch:propPixels(PROP_WIDTH,PROP_HEIGHT),scratchOrigin:'human',assets:references.map(p=>({id:'original-'+p.id,name:p.name,mouthCarryable:!!propMouthCarryable(p),description:'Original pixel cat prop. Edit a placement and save as a variant to retain this reference.',tags:['original'],width:p.width,height:p.height,pixels:p.rows.map(r=>[...r].map(t=>t==='.'?null:p.palette[t].toLowerCase())),origin:'human',review:'candidate',revision:1,source:{symbol:p.id,rows:clone(p.rows),palette:clone(p.palette)},operations:[]})).concat(clone(extras)),instances:[],reference:{projectId:'sequence-stand',x:32,y:32,visible:true,animate:true}};}
export function propBounds(a,b){return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x)+1,height:Math.abs(a.y-b.y)+1};}
export function addPropPlacement(w,assetId,x=4,y=4){propCheck(w.instances.length<128,'Maximum 128 placements. Remove a placement first.');const a=w.assets.find(a=>a.id===assetId);propCheck(a,'Prop not found.');const i={id:id(),assetId,x:Math.min(x,w.width-a.width),y:Math.min(y,w.height-a.height),width:a.width,height:a.height,pixels:clone(a.pixels),origin:a.origin,visible:true,dirty:false};w.instances.push(i);return i;}
export function captureProp(w,bounds,{name,description='',behaviourNotes='',tags=[],familyId='',stateKey='',stateKind='',mouthCarryable=false},actor='human'){
 checkPropState(familyId,stateKey,stateKind);checkPropBehaviour(behaviourNotes);
 propCheck(w.assets.length<256,'Maximum 256 props.');propCheck(bounds&&Number.isInteger(bounds.x)&&Number.isInteger(bounds.y)&&bounds.width>0&&bounds.height>0&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=w.width&&bounds.y+bounds.height<=w.height,'Draw a bounding box on the canvas first.');
 propCheck(typeof name==='string'&&name.trim()&&name.trim().length<=120,'Give the prop a label.');const pixels=w.scratch.slice(bounds.y,bounds.y+bounds.height).map(r=>r.slice(bounds.x,bounds.x+bounds.width));propCheck(pixels.some(r=>r.some(Boolean)),'This box contains no loose artwork. Draw on an empty part of the canvas first.');
 const a={id:id(),name:name.trim(),description,behaviourNotes,tags,familyId,stateKey,stateKind,mouthCarryable,width:bounds.width,height:bounds.height,pixels,origin:w.scratchOrigin,review:'candidate',revision:1,source:null,operations:[{actor,kind:'capture',at:new Date().toISOString()}]};w.assets.push(a);for(let y=bounds.y;y<bounds.y+bounds.height;y++)for(let x=bounds.x;x<bounds.x+bounds.width;x++)w.scratch[y][x]=null;
 if(!w.scratch.some(r=>r.some(Boolean)))w.scratchOrigin=actor;
 return addPropPlacement(w,a.id,bounds.x,bounds.y);
}
export function paintProp(w,placementId,points,colour,actor='human'){
 propCheck(['human','ai'].includes(actor),'Invalid artist.');propCheck(colour===null||/^#[0-9a-f]{6}$/i.test(colour),'Choose a valid colour.');const i=placementId?w.instances.find(i=>i.id===placementId):null;
 const rows=i?i.pixels:w.scratch,before=rows.some(r=>r.some(Boolean));let changed=false;
 for(const p of points){const x=p.x-(i?.x||0),y=p.y-(i?.y||0);if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<(i?.width||w.width)&&y<(i?.height||w.height)&&rows[y][x]!==colour){rows[y][x]=colour;changed=true;}}
 if(changed){const key=i?'origin':'scratchOrigin',target=i||w;target[key]=!before?actor:target[key]===actor?actor:target[key]==='unknown'?'unknown':'mixed';if(i)i.dirty=true;}return changed;
}
export function confirmProp(w,placementId,{name,description='',behaviourNotes,tags=[],familyId='',stateKey='',stateKind='',mouthCarryable},actor='human',variant=false){
 checkPropState(familyId,stateKey,stateKind);checkPropBehaviour(behaviourNotes);
 const i=w.instances.find(i=>i.id===placementId);propCheck(i,'Select a prop placement first.');propCheck(name?.trim()&&name.length<=120,'Give the prop a label.');const old=w.assets.find(a=>a.id===i.assetId);propCheck(old,'Prop not found.');
 // Original assets stay immutable; editing one creates a variant automatically.
 variant=variant||!!old.source?.symbol;propCheck(!variant||w.assets.length<256,'Maximum 256 props.');
 const a={...clone(old),id:variant?id():old.id,name:name.trim(),description,mouthCarryable:mouthCarryable??propMouthCarryable(old),behaviourNotes:behaviourNotes??old.behaviourNotes??'',tags,familyId,stateKey,stateKind,pixels:clone(i.pixels),origin:i.origin,revision:variant?1:old.revision+1,source:variant?{assetId:old.id,revision:old.revision}:old.source,operations:[...(old.operations||[]),{actor,kind:variant?'variant':'edit',at:new Date().toISOString()}],updatedAt:new Date().toISOString()};
 if(variant)w.assets.push(a);else w.assets[w.assets.indexOf(old)]=a;i.assetId=a.id;i.dirty=false;return a;
}

// Idempotent, additive catalogue refresh. Saved pixels, revisions, placements
// and explicit family choices always win over bundled reference metadata.
export const propFamilyLabel=id=>id==='robot-vacuum'?'Robot vacuum':id.split(/[-_]/).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
export function refreshPropCatalogue(w,references=[],extras=[]){
 let changed=false;const existing=new Set(w.assets.map(a=>a.id));
 const fresh=newPropWorkspace(references,extras).assets;
 for(const a of fresh)if(!existing.has(a.id)&&w.assets.length<256){w.assets.push(clone(a));existing.add(a.id);changed=true;}
 for(const a of w.assets){if(a.mouthCarryable===undefined){a.mouthCarryable=propMouthCarryable(a);changed=true;}const symbol=a.source?.symbol||a.id.replace(/^original-/,''),match=/^robot_vacuum_(side|turn_[1-8])$/.exec(symbol);
  if(symbol==='water_glass'&&!a.familyId){a.familyId='water-glass';a.stateKey='reference';changed=true;}
  if(match&&!a.familyId){a.familyId='robot-vacuum';a.stateKey=match[1].replaceAll('_','-');a.stateKind='angle';changed=true;}
 }
 for(const a of w.assets){const parent=w.assets.find(p=>p.id===a.source?.assetId);if(!a.familyId&&parent?.familyId){a.familyId=parent.familyId;a.stateKey=parent.stateKey;a.stateKind=parent.stateKind;changed=true;}}
 validatePropWorkspace(w);return changed;
}

const propFingerprint=a=>JSON.stringify([a.name,a.description,a.behaviourNotes||'',a.tags,a.width,a.height,a.pixels,a.origin,a.familyId||'',a.stateKey||'',a.stateKind||'',a.mouthCarryable]);
const recoveryKey=value=>{let hash=2166136261;for(const c of JSON.stringify(value))hash=Math.imul(hash^c.charCodeAt(0),16777619);return (hash>>>0).toString(16);};
// Callers save both exact originals before accepting this conservative merge.
export function reconcilePropWorkspaces(browser,saved,references=[],extras=[]){
 validatePropWorkspace(browser);validatePropWorkspace(saved);const local=clone(browser),w=clone(saved);refreshPropCatalogue(local,references,extras);refreshPropCatalogue(w,references,extras);const remap=new Map();let recoveredAssets=0,recoveredPlacements=0;
 for(const a of local.assets){const prior=w.assets.find(p=>p.id===a.id);if(!prior){w.assets.push(clone(a));continue;}if(propFingerprint(a)===propFingerprint(prior))continue;
  const key='recovered-'+a.id.slice(0,65)+'-'+recoveryKey(a);remap.set(a.id,key);if(w.assets.some(p=>p.id===key))continue;
  w.assets.push({...clone(a),id:key,name:(a.name+' - browser recovery').slice(0,120),source:{...clone(a.source||{}),assetId:a.id,revision:a.revision},recoveryOf:a.id});recoveredAssets++;
 }
 for(const original of local.instances){const i={...clone(original),assetId:remap.get(original.assetId)||original.assetId},prior=w.instances.find(p=>p.id===i.id);if(!prior){w.instances.push(i);continue;}if(JSON.stringify(prior)===JSON.stringify(i))continue;
  const key='recovered-placement-'+recoveryKey(i);if(!w.instances.some(p=>p.id===key)){prior.visible=false;w.instances.push({...i,id:key});recoveredPlacements++;}
 }
 // Keep the browser's current drawing/reference. The exact saved canvas also
 // remains in the durable recovery record, rather than being discarded.
 w.scratch=clone(local.scratch);w.scratchOrigin=local.scratchOrigin;w.reference=clone(local.reference);validatePropWorkspace(w);return {workspace:w,recoveredAssets,recoveredPlacements};
}
