import {runtimeClimbSource} from './runtime-climb-source.mjs';
import {compileBehaviour} from '../frame-studio/dist/behaviour-policy.js';
import {writeGenerated} from './write-generated.mjs';
import {packedAssignment} from './pack-runtime-data.mjs';
import {applyLatestStudioArt} from './apply-latest-studio-art.mjs';
import {savedProject,savedRefinements,groundVariantId} from './saved-user-refinements.mjs';
import {refinedWalk,refinedLeap,highWalk,lowWalk,provenance,integration} from './user-refined-art.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {latestProjects,followupChanges} from './latest-studio-assets.mjs';
import vm from 'node:vm';
import {walkHeadVariants,walkHeadProvenance} from './walk-head-variants.mjs';
const source = fs.readFileSync('pixel-pet-card.js', 'utf8');
const sandbox = { HTMLElement: class {}, customElements: { get() {}, define() {} }, window: {} };
vm.runInNewContext(source + '\nglobalThis.art = {stand: PixelPetCard.POSES.stand, walk: PixelPetCard.WALK_FRAMES, sit: PixelPetCard.SIT_IDLE_FRAMES[0][0], loaf: PixelPetCard.LOAF_IDLE_FRAMES[0], look: PixelPetCard.LOOK_UP_FRAMES[0], ascend: PixelPetCard.ELEVATE_FRAMES, descend: [...PixelPetCard.DESCENT_FRAMES, PixelPetCard.ELEVATE_FRAMES[1]], leapAnchors: PixelPetCard.LEAP_FRAME_ANCHORS, descentEdges: PixelPetCard.DESCENT_EDGE_ANCHORS};', sandbox);
const art = sandbox.art;
vm.runInNewContext('globalThis.idle = {sit:PixelPetCard.SIT_IDLE_FRAMES,stand:PixelPetCard.STAND_PAUSE_FRAMES,loaf:PixelPetCard.LOAF_IDLE_FRAMES,look:PixelPetCard.LOOK_UP_FRAMES,clean:PixelPetCard.CLEANING_FRAMES,perch:PixelPetCard.ELEVATED_SIT_FRAMES,stretch:PixelPetCard.TRANSITIONS.loaf_to_walk,stretchHolds:PixelPetCard.TRANSITION_HOLD_TICKS.loaf_to_walk};', sandbox);
art.idle=sandbox.idle;
vm.runInNewContext('globalThis.bridges = {walkToSit:PixelPetCard.TRANSITIONS.walk_to_sit,sitToLoaf:PixelPetCard.TRANSITIONS.sit_to_loaf};', sandbox);
art.bridges=sandbox.bridges;
art.idleCatalogue=Object.keys(art.idle).filter(key=>key!=='stretchHolds').map(key=>({id:key,origin:'human',source:'pixel-pet-card.js'}));
const idleRows=Object.entries(art.idle).filter(([key])=>key!=='stretchHolds').flatMap(([key,frames])=>key==='sit'||key==='stand'?frames.flat():frames);
// A level hop reuses the authored take-off, airborne pose and level landing
// crouch. The ledge pull-up poses belong only to an actual ascent.
const horizontal=JSON.parse(fs.readFileSync('prototype/horizontal-leap-candidate.json','utf8'));
if(horizontal.origin!=='ai'||horizontal.review!=='accepted')throw Error('Horizontal leap needs explicit review approval.');
art.across=[art.ascend[0],art.ascend[1],refinedLeap.frames[2].rows,art.ascend[1]];
art.frameProvenance={across:['human','human',refinedLeap.frames[2].origin,'human'],horizontal:{...provenance(refinedLeap.frames[2]),integration},freefall:{...provenance(refinedLeap.frames[3]),experimental:true}};
art.freefallCandidate=refinedLeap.frames[3].rows;
art.walkHigh=highWalk.map(f=>f.rows);art.walkLow=lowWalk.map(f=>f.rows);
art.walkHeadVariants=highWalk.map((f,gait)=>[f.rows,lowWalk[gait].rows]);
art.walkHeadProvenance=highWalk.map((f,gait)=>[provenance(f),provenance(lowWalk[gait])]);
art.integration=integration;
const high=savedProject('sequence-walk-high'),low=savedProject('sequence-walk-low'),across=savedProject('sequence-across'),standing=savedProject('sequence-stand');
if(high&&low){art.walkHigh=high.frames.map(f=>f.rows);art.walkLow=low.frames.map(f=>f.rows);art.walkHeadVariants=high.frames.map((f,i)=>[f.rows,low.frames[i].rows]);art.walkHeadProvenance=high.frames.map((f,i)=>[provenance(f),provenance(low.frames[i])]);}
if(across){art.across=across.frames.map(f=>f.rows);art.frameProvenance.across=across.frames.map(f=>f.origin);art.frameProvenance.horizontal={...provenance(across.frames[2]),sequenceId:across.projectId};}
if(standing){art.stand=standing.frames[0].rows;art.ascend[0]=standing.frames[0].rows;}
art.idleSequences={};
for(const [pose,sequenceId,loop] of [['sit',groundVariantId,true],['look','sequence-look-up',true],['lookdown','pose-look-down',false],['glance','pose-sitting-glance',false]]){
 const p=savedProject(sequenceId);if(!p)continue;
 const frames=p.frames,anchors=frames.map(f=>f.anchor?[f.anchor.x,f.anchor.y]:null);
 // The look-down forelegs hang below the perch. A rear bearing marker is
 // present at (14,17) throughout, unlike the lower front-paw guide pixels.
 if(pose==='lookdown'){if(!frames.every(f=>f.rows[17][14]==='R'))throw Error('Look-down rear support changed.');anchors.fill([14,17]);}
 art.idleSequences[pose]={sequenceId,frames:frames.map(f=>f.rows),durations:frames.map(f=>f.durationMs),origins:frames.map(f=>f.origin),anchors,loop};
}
art.integratedSnapshots=[...savedRefinements.values()].filter(r=>r.status==='integrate').map(r=>({sequenceId:r.projectId,savedAt:r.savedAt,name:r.name}));
art.leapAnchors.across=[art.leapAnchors.ascend[0],art.leapAnchors.ascend[1],art.leapAnchors.ascend[2],art.leapAnchors.descend[3]];
applyLatestStudioArt(art);
const additions=art.runtimeAdditions;delete art.runtimeAdditions;
const alertChanges=JSON.parse(fs.readFileSync('frame-studio/user-sequences/alert-lying-2026-10-18/saved-changes.json','utf8'));
for(const c of alertChanges)if(crypto.createHash('sha256').update(JSON.stringify(c.snapshot)).digest('hex')!==c.versionHash)throw Error('Alert snapshot hash mismatch');
const alertClip=p=>({sequenceId:p.projectId,frames:p.frames.map(f=>f.rows),durations:p.frames.map(f=>f.durationMs),roles:p.frames.map(f=>f.role||'cycle'),origins:p.frames.map(f=>f.origin),anchors:p.frames.map(f=>[Math.max(...[...f.rows[23]].flatMap((v,x)=>v==='R'?[x]:[])),23]),gazes:p.frames.map(f=>f.gaze),loop:true});
additions.idleSequences.alertLying=alertClip(alertChanges[0].snapshot);additions.idleSequences.alertLying.alertParts=alertChanges.slice(1).map(c=>({...alertClip(c.snapshot),versionHash:c.versionHash}));additions.idleSequences.alertLying.versionHash=alertChanges[0].versionHash;
const rollChange=JSON.parse(fs.readFileSync('frame-studio/user-sequences/back-roll-2026-10-18/saved-change.json','utf8'));if(crypto.createHash('sha256').update(JSON.stringify(rollChange.snapshot)).digest('hex')!==rollChange.versionHash)throw Error('Back-roll source mismatch');const roll=rollChange.snapshot;
art.idleSequences.backRoll={sequenceId:roll.projectId,versionHash:rollChange.versionHash,frames:roll.frames.map(f=>f.rows),durations:roll.frames.map(f=>f.durationMs),roles:roll.frames.map(f=>f.role),origins:roll.frames.map(f=>f.origin),anchors:roll.frames.map(f=>[f.anchor.x,f.anchor.y]),gazes:roll.frames.map(f=>f.gaze),loop:true};
art.assetManifest.push({sequenceId:roll.projectId,name:roll.name,savedAt:rollChange.at,contentHash:rollChange.versionHash,origin:[...new Set(roll.frames.map(f=>f.origin))],runtime:'active'});
const savedBeds=JSON.parse(fs.readFileSync('frame-studio/user-sequences/beds-2026-10-16/saved-changes.json','utf8'));
additions.homeBeds=Object.fromEntries(savedBeds.map(e=>[e.snapshot.name==='Simple Bed'?'simple':'igloo',{...e.snapshot,versionHash:e.versionHash}]));
const eatingRecord=JSON.parse(fs.readFileSync('frame-studio/user-sequences/mouth-actions-2026-10-16/eating.json','utf8')),eating=eatingRecord.project;
// Alternate longer bites with brief lifts. Keep the original Studio frames and metadata.
additions.idleSequences.eat={sequenceId:eating.projectId,frames:eating.frames.map(f=>f.rows),durations:[1100,160,1320,180],origins:eating.frames.map(f=>f.origin),gazes:eating.frames.map(f=>f.gaze),anchors:eating.frames.map(()=>[12,23]),loop:true};
const nose=art.idleSequences.lookdown;additions.idleSequences.nose={...nose,anchors:nose.frames.map(rows=>{const points=rows.flatMap((r,y)=>[...r].flatMap((v,x)=>v==='R'?[[x,y]]:[]));return points.sort((a,b)=>b[1]-a[1])[0]||[14,23];})};
const reviews=JSON.parse(fs.readFileSync('frame-studio/user-sequences/review-2026-10-17/approved-sequences.json','utf8')).map(r=>{const c=followupChanges.find(c=>c.entityId===r.projectId);return c?{...r,project:c.snapshot,contentHash:c.versionHash,savedAt:c.at}:r;}),lifted=reviews.find(r=>r.projectId==='proposal-lifted-scruff').project;
additions.lifted={sequenceId:lifted.projectId,rows:lifted.frames[0].rows,anchor:lifted.frames[0].poi?[lifted.frames[0].poi.x,lifted.frames[0].poi.y]:[14,7],anchorAtCellCenter:!!lifted.frames[0].poi,origin:lifted.frames[0].origin,review:'accepted',temporary:false};
const extensionClip=(id,loop)=>{const p=reviews.find(r=>r.projectId===id).project;return {sequenceId:id,frames:p.frames.map(f=>f.rows),durations:p.frames.map(f=>f.durationMs),roles:p.frames.map(f=>f.role||'cycle'),origins:p.frames.map(f=>f.origin),anchors:p.frames.map(f=>f.anchor?[f.anchor.x,f.anchor.y]:null),loop};};
const extension={idleSequences:{wiggle:extensionClip('1e7741cb-f178-4c6e-916c-ef23f2ebd934',true),postScratch:extensionClip('proposal-scratching-post-action',true)}};
const trackProject=latestProjects.get('proposal-scratching-post-tracks');if(trackProject){const p=trackProject.project;extension.idleSequences.postScratch={...extension.idleSequences.postScratch,sequenceId:p.projectId,frames:p.frames.map(f=>f.rows),durations:p.frames.map(f=>f.durationMs),origins:p.frames.map(f=>f.origin),roles:p.frames.map(f=>f.role||'cycle'),anchors:p.frames.map(f=>f.anchor?[f.anchor.x,f.anchor.y]:null),gazes:p.frames.map(f=>f.gaze),frameIds:p.frames.map(f=>f.id),animationTracks:p.animationTracks,versionHash:trackProject.contentHash};}
for(const entry of art.assetManifest)if(reviews.some(r=>r.projectId===entry.sequenceId))entry.runtime='active';
// Select the reviewed immutable local Studio version, never the live canvas.
// Historical description/tags and mixed provenance remain exact source metadata.
const postChange=JSON.parse(fs.readFileSync('frame-studio/user-sequences/pending-2026-10-17/scratching-post-change.json','utf8')),post=postChange.snapshot;
if(crypto.createHash('sha256').update(JSON.stringify(post)).digest('hex')!==postChange.versionHash)throw Error('Scratching-post snapshot does not match its saved version hash.');
extension.dashboardProps=[{...post,versionHash:postChange.versionHash,sourceAssetId:post.id,sourceRevision:post.revision,id:'scratching_post',affordance:'scratch',mouthCarryable:false}];

const propLibrary=JSON.parse(fs.readFileSync('frame-studio/dist/library.json','utf8'));
additions.dashboardProps=propLibrary.props.filter(p=>['toy_mouse','ball'].includes(p.id)).map(p=>({id:p.id,name:p.name,width:p.width,height:p.height,pixels:p.rows.map(r=>[...r].map(v=>v==='.'?null:p.palette[v])),origin:p.origin,source:p.source,mouthCarryable:p.id==='toy_mouse'||p.id==='ball',...(p.id==='toy_mouse'?{facing:-1}:{})}));
const bowl=propLibrary.props.find(p=>p.id==='food_bowl');if(!bowl)throw Error('Missing original food bowl');additions.homeProps={bowl:{id:bowl.id,name:bowl.name,width:bowl.width,height:bowl.height,pixels:bowl.rows.map(r=>[...r].map(v=>v==='.'?null:bowl.palette[v])),origin:bowl.origin,source:bowl.source}};
// Compact lookup of exact authored gaze; conflicts stay unknown rather than
// borrowing vision from a different pose. Hash collisions fail the build.
const gazeKey=rows=>{let h=2166136261;for(const row of rows)for(let i=0;i<row.length;i++)h=Math.imul(h^row.charCodeAt(i),16777619)>>>0;return h.toString(36);};
const index={rows:{},sequences:{},frames:{}},hashes=new Map();
const merge=(dest,key,gaze)=>{if(!(key in dest))dest[key]=gaze??null;else if(JSON.stringify(dest[key])!==JSON.stringify(gaze??null))dest[key]=null;};
const gazeSnapshots=JSON.parse(fs.readFileSync('frame-studio/user-sequences/gaze-runtime-2026-10-15/metadata.json','utf8')).records;
for(const {project:p} of [...latestProjects.values(),...alertChanges.map(c=>({project:c.snapshot})),{project:roll}]){if(p.deletedAt||p.archived)continue;const sequence=index.sequences[p.projectId]={},frames=index.frames[p.projectId]=[],snapshot=gazeSnapshots.find(s=>s.sequenceId===p.projectId);for(const frame of p.frames){const key=gazeKey(frame.rows),rows=frame.rows.join(''),saved=snapshot?.frames.find(f=>f.id===frame.id&&f.rowsHash===crypto.createHash('sha256').update(rows).digest('hex')),gaze=saved?saved.gaze:frame.gaze;if(hashes.has(key)&&hashes.get(key)!==rows)throw Error('Gaze row hash collision');hashes.set(key,rows);merge(sequence,key,gaze);merge(index.rows,key,gaze);frames.push({key,gaze:gaze??null});}}
// Some original sequences are supplied by pixel-pet-card, not latestProjects.
// Adopt their saved markers only when their exact pixel hash exists in this build.
const policyProjects=new Map([...latestProjects].map(([id,r])=>[id,r.project]));
for(const project of [...alertChanges.map(c=>c.snapshot),roll,eating])policyProjects.set(project.projectId,project);
const policy=(clip,fallback={})=>{if(clip)clip.behaviourPolicy=compileBehaviour(policyProjects.get(clip.sequenceId)||{},fallback);};
for(const [pose,clip] of Object.entries({...art.idleSequences,...additions.idleSequences,...extension.idleSequences}))policy(clip,{tags:['loaf','sleep'].includes(pose)?['rest']:[]});
for(const clip of art.sneak||[])policy(clip,{category:'locomotion'});
policy(additions.gallop,{category:'locomotion',tags:['energetic']});policy(additions.fastWalk,{category:'locomotion',tags:['brisk']});
art.walkBehaviour=compileBehaviour(latestProjects.get('sequence-walk-high')?.project||{},{category:'locomotion'});
// Reviewed playback registration; profiles only compare speeds/capabilities.
additions.fastWalk.fps=21;
art.travelChoices=[{key:'walk',engine:'walk',minCells:0},{key:'fastWalk',engine:'step',minCells:8},{key:'gallop',engine:'bound',prior:.3}];
// Required core motion needs a compatible age variant before it can be restricted.
const optionalClips=[...Object.values({...art.idleSequences,...additions.idleSequences,...extension.idleSequences}),additions.gallop,additions.fastWalk].filter(Boolean),optionalIds=new Set(optionalClips.map(c=>c.sequenceId));
for(const entry of art.assetManifest.filter(e=>e.runtime==='active')){const p=policyProjects.get(entry.sequenceId);if(p?.behaviourPolicy?.lifeStages?.length<3&&!optionalIds.has(entry.sequenceId))throw Error('Age-restricted core sequence requires a compatible fallback: '+entry.sequenceId);}
const runtimeHashes=new Map();
const scan=value=>{if(!value||typeof value!=='object')return;if(Array.isArray(value)&&value.length===24&&value.every(r=>typeof r==='string'&&r.length===24)){runtimeHashes.set(gazeKey(value),crypto.createHash('sha256').update(value.join('')).digest('hex'));return;}for(const child of Object.values(value))scan(child);};
scan(art);scan(additions);
for(const s of gazeSnapshots){if(index.sequences[s.sequenceId])continue;const sequence=index.sequences[s.sequenceId]={};index.frames[s.sequenceId]=s.frames.map(f=>{if(runtimeHashes.has(f.key)&&runtimeHashes.get(f.key)!==f.rowsHash)throw Error('Saved gaze hash collision');const gaze=runtimeHashes.get(f.key)===f.rowsHash?f.gaze:null;merge(sequence,f.key,gaze);merge(index.rows,f.key,gaze);return {key:f.key,gaze};});}
additions.gazeIndex=index;
const decisions='\n(()=>{\n'+fs.readFileSync('prototype/gaze-perception.js','utf8').split('export class LabMetrics')[0].replaceAll('export ','')+'\n'+fs.readFileSync('prototype/cat-decisions.js','utf8')+'\n'+fs.readFileSync('prototype/cat-observer.js','utf8')+'\n'+fs.readFileSync('prototype/cat-interactions.js','utf8')+'\n'+fs.readFileSync('prototype/cat-bed-visits.js','utf8')+'\n'+fs.readFileSync('prototype/cat-hidden-home.js','utf8')+'\n'+fs.readFileSync('prototype/cat-scroll-overlay.js','utf8')+'\n'+fs.readFileSync('prototype/contact-shadow.mjs','utf8').replace(/^export /gm,'')+'\n'+fs.readFileSync('prototype/cat-floor-shadow.js','utf8')+'\n'+fs.readFileSync('prototype/cat-scroll.js','utf8')+'\n'+fs.readFileSync('prototype/cat-monitor-diagnostics.js','utf8')+'\n'+fs.readFileSync('prototype/cat-monitor.js','utf8')+'\n'+fs.readFileSync('prototype/cat-reactions.js','utf8')+'\n'+fs.readFileSync('prototype/cat-debug.js','utf8')+'\n'+fs.readFileSync('prototype/cat-label-render.js','utf8')+'\n})();\n';
writeGenerated('pixel-cat-roaming-extras.js','// Saved refined actions; exact grids and origins, losslessly packed at build time.\n'+packedAssignment('window.pixelCatRoamingExtrasV1',additions)+fs.readFileSync('prototype/cat-point-routes.js','utf8')+'\n(()=>{'+fs.readFileSync('prototype/cat-contact-effects.js','utf8')+fs.readFileSync('prototype/cat-home-life.js','utf8')+fs.readFileSync('prototype/cat-alert-rest.js','utf8')+'})();\n' );
writeGenerated('pixel-cat-affordances.js','// Home surfaces and mouth affordances; optional hooks preserve legacy runtime loading.\n(()=>{const rowKey=rows=>{let h=2166136261;for(const row of rows)for(const v of row)h=Math.imul(h^v.charCodeAt(0),16777619)>>>0;return h.toString(36);};\n'+['frame-studio/dist/animation-tracks.js','prototype/cat-track-runtime.js','prototype/cat-polish.js','prototype/cat-behaviour-policy.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','prototype/cat-home-posts.js','prototype/cat-setup.js','prototype/cat-home-surfaces.js','prototype/cat-bed-entry.js','prototype/cat-shallow-travel.js','prototype/cat-mouth-carry.js','prototype/cat-mouth.js','prototype/cat-drag.js','prototype/cat-post-rest.js','prototype/cat-primary-home.js','prototype/cat-motion-options.js','prototype/cat-exploration.js','prototype/cat-behaviour-refinements.js','prototype/cat-vertical-scratch.js','prototype/cat-toy-invitation.js','prototype/cat-shelf-ambush.js'].map(f=>fs.readFileSync(f,'utf8').replace(/^export /gm,'').replace(/^[ \t]*\/\/[^\r\n]*\r?\n/gm,'')).join('\n')+'\n})();\nwindow.pixelCatRoamingExtensionsV1 = '+JSON.stringify(extension)+';\n');
writeGenerated('pixel-cat-behaviours.js',decisions.replace(/^[ \t]*\/\/[^\r\n]*\r?\n/gm,''));
for (const rows of [art.stand, ...art.walk, art.sit, art.loaf, art.look, ...art.ascend, ...art.descend,...art.across,...art.walkHeadVariants.flat(),...Object.values(art.idleSequences).flatMap(s=>s.frames),...idleRows]) {
  if (rows.length !== 24 || rows.some(row => row.length !== 24)) throw Error('Invalid source grid');
}
delete art.integratedSnapshots; // derive this index from the manifest instead of duplicating its records
// Self-contained hooks use the spacious first module; all actors start after ordered loading.
const coreHooks=['prototype/cat-home-markup.js','prototype/cat-commands.js','prototype/cat-outline.js','prototype/cat-home-editor.js','prototype/cat-settling.js','prototype/cat-world-authority.js','prototype/cat-layout-pause.js','prototype/cat-depth.js','prototype/cat-surface-debug.js'].map(f=>(f==='prototype/cat-home-editor.js'?'if(typeof HTMLElement!==\"undefined\"){'+fs.readFileSync(f,'utf8')+'}':fs.readFileSync(f,'utf8')).replace(/^[ \t]*\/\/[^\r\n]*\r?\n/gm,'')).join('\n');
writeGenerated('pixel-cat-roaming-art.js','// Exact source artwork and provenance; lossless synchronous string interning.\n'+'(()=>{'+fs.readFileSync('prototype/cat-mood.js','utf8')+';window.pixelCatMoodV1={CatMood,landingCue};})();\n'+packedAssignment('window.pixelCatRoamingArtV2',art)+"window.pixelCatRoamingArtV2.integratedSnapshots=window.pixelCatRoamingArtV2.assetManifest.filter(s=>s.runtime==='active');\n"+'(()=>{'+coreHooks+'})();\n');
writeGenerated('pixel-cat-climbing.js','// Exact reviewed climb snapshot and shared bounded planner; optional runtime capability.\n'+runtimeClimbSource().source+'\n(()=>{'+['prototype/vertical-surface-model.mjs','prototype/vertical-surface-dom.mjs','prototype/cat-card-climb.js'].map(f=>fs.readFileSync(f,'utf8').replace(/^export /gm,'')).join('\n')+'})();\n'+fs.readFileSync('prototype/cat-climb-effects.js','utf8')+'\n'+fs.readFileSync('prototype/cat-climb.js','utf8'));
// Omit standalone source comments in the generated controller; the three reviewed source files retain documentation.
writeGenerated('pixel-cat-roaming.js','class CatMood {static keys=["playfulness","sleepiness","alertness"];constructor(...args){return new window.pixelCatMoodV1.CatMood(...args);}}\nconst landingCue=(...args)=>window.pixelCatMoodV1.landingCue(...args);\n'+['prototype/cat-exertion.js','prototype/prop-scene.js','prototype/roaming-controller.js'].map(file=>fs.readFileSync(file,'utf8').replace(/^[ \t]*\/\/[^\r\n]*\r?\n/gm, '')).join('\n').replace(/\r\n/g,'\n'));
for(const file of ['pixel-cat-roaming.js','pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-behaviours.js','pixel-cat-affordances.js','pixel-cat-climbing.js'])if(fs.statSync(file).size>128000)throw Error(file+' exceeds the inline HA resource limit; split its packaging before deployment.');
console.log('Built roaming controller:', fs.statSync('pixel-cat-roaming.js').size, 'bytes; artwork:',fs.statSync('pixel-cat-roaming-art.js').size,'bytes; source frames unchanged');
