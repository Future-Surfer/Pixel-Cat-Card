import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>1000}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={art:CAT_ART,Home:PixelCatHome};',box);
const {art}=box.api,helpers=box.window.pixelCatBehaviourRefinementsV1,vertical=box.window.pixelCatVerticalScratchV1;
const approved=JSON.parse(fs.readFileSync('frame-studio/user-sequences/review-2026-10-17/approved-sequences.json')).map(r=>['proposal-lifted-scruff','proposal-scratching-post-action'].includes(r.projectId)?{...r,project:JSON.parse(fs.readFileSync('frame-studio/user-sequences/refinement-batch-2026-10-17/'+r.projectId+'.json')).snapshot}:r);
// The immutable cap revision must survive build selection with exact metadata.
const cap=JSON.parse(fs.readFileSync('frame-studio/user-sequences/pending-2026-10-17/scratching-post-change.json')),
 capAsset=art.dashboardProps.find(p=>p.id==='scratching_post'),baseline=JSON.parse(fs.readFileSync('frame-studio/user-sequences/review-2026-10-17/approved-scratching-post.json'));
for(const [key,value]of Object.entries(cap.snapshot))if(key!=='id')assert.equal(JSON.stringify(capAsset[key]),JSON.stringify(value),key);
assert.equal(capAsset.sourceAssetId,cap.entityId);assert.equal(capAsset.sourceRevision,3);assert.equal(capAsset.versionHash,cap.versionHash);assert.equal(capAsset.origin,'mixed');
const removed=[];for(let y=0;y<23;y++)for(let x=0;x<12;x++)if(baseline.pixels[y][x]!==capAsset.pixels[y][x]){assert.equal(capAsset.pixels[y][x],null);removed.push([x,y]);}
assert.deepEqual(removed,[[3,1],[8,1],[3,2],[8,2]]);
for(const [id,clip]of [['proposal-lifted-scruff',art.lifted],['proposal-scratching-post-action',art.idleSequences.postScratch],['1e7741cb-f178-4c6e-916c-ef23f2ebd934',art.idleSequences.wiggle]]){const source=approved.find(r=>r.projectId===id).project;assert.equal(JSON.stringify(clip.rows?[clip.rows]:clip.frames),JSON.stringify(source.frames.map(f=>f.rows)));}
const m={jumpKind:'ascend',horizontalApex:true,jumpProfile:{flight:{vy:-100,gravity:200,seconds:1}}};assert.equal(helpers.apex(art,m,.1,{}),null);const mid=helpers.apex(art,m,.5,{});assert.equal(mid.sequenceId,'sequence-across');assert.equal(helpers.apex(art,m,.5,{horizontal_apex:false}),null);assert.equal(helpers.apex(art,{...m,jumpKind:'descend'},.5,{}),null);
const a={ensureMood:()=>({random:()=>.2}),setAttribute(){},idle:{poseUntil:0}},p={stage:'sneak'};assert.ok(helpers.wiggle(a,p,1000,art));assert.equal(p.stage,'wiggle');assert.equal(p.pose,'wiggle');assert.equal(helpers.wiggle(a,p,p.waitUntil,art),false);assert.equal(p.stage,'sneak');assert.equal(helpers.wiggle(a,p,2000,art),false,'One optional wiggle per pounce');
const surface={id:'card:divider',el:{},left:0,right:700,top:500,min:0,max:652},post={id:'post-1',asset:art.dashboardProps.find(p=>p.id==='scratching_post'),scale:2,u:.5,surfaceEl:surface.el,surfaceSuffix:':divider',cooldownUntil:0},scene={enabled:true,time:1000,props:[post]};
const actor={active:true,ownerKey:'scratch-cat',scale:2,config:{social_behaviour:true},propScene:scene,surfaces:[surface],home:surface,support:surface,x:100,y:500,pathTo:()=>[],ensureMood:()=>({random:()=>.2}),route:[]};
const layer={actor,clock:1000,scene:new Map(),available:()=>true,clear:()=>true,corridor:()=>true,log(){},enabled:()=>true,finish(reason){this.reason=reason;vertical.release(this);this.episode=null;}};
const faces=vertical.faces(layer);assert.equal(faces.length,2);assert.equal(faces[0].direction,1);assert.equal(faces[1].direction,-1);assert.ok(vertical.start(layer,faces[0],1000));assert.equal(post.claimedBy,'scratch-cat');actor.route=[];actor.x=faces[0].origin;vertical.advance(layer,1100);assert.equal(layer.episode.stage,'stroke');const idle={pose:'postScratch'};vertical.prepare(layer,idle);assert.equal(idle.contactX,faces[0].bearing);scene.props=[];vertical.advance(layer,1200);assert.equal(layer.episode,null);assert.equal(post.claimedBy,null);assert.ok(post.cooldownUntil>scene.time);
scene.props=[post];post.cooldownUntil=0;layer.episode=null;assert.ok(vertical.start(layer,vertical.faces(layer)[0],2000));actor.route=[];actor.motion=null;actor.x=faces[0].origin;actor.pathTo=()=>{throw Error('Playback must not run a route search');};for(let i=0;i<60;i++)vertical.advance(layer,2000+i,art);assert.equal(layer.episode.stage,'stroke');vertical.release(layer);
for(const scale of [1,2,3,4,5,6])for(const direction of [-1,1]){
 actor.scale=post.scale=scale;post.cooldownUntil=0;layer.episode=null;actor.x=100;actor.route=[];actor.pathTo=()=>[];
 const face=vertical.faces(layer).find(f=>f.direction===direction);assert.ok(face);
 assert.equal(face.x-face.bearing,direction*9*scale);assert.ok(vertical.start(layer,face,3000));
 actor.route=[];actor.x=face.origin;vertical.advance(layer,3100);assert.equal(layer.episode.stage,'stroke');assert.equal(actor.facing,direction);
 const stroke={pose:'postScratch'};vertical.prepare(layer,stroke);assert.equal(stroke.contactX,face.bearing);vertical.release(layer);
}
console.log('PASS: exact approved lift/wiggle/scratch and revision-3 cap metadata/pixels, optional apex sampling, bounded pre-pounce wiggle, two authored scratch faces, planted contact at six scales/both facings, claims/removal/cooldown.');
