import fs from 'node:fs';import {newFrame,validateProject} from '../frame-studio/dist/model.js';import {ensureQueue} from '../frame-studio/dist/queue.js';
const root='frame-studio/user-sequences/scratching-post-draft-2026-10-16';fs.mkdirSync(root,{recursive:true});
if(fs.existsSync(root+'/proposal.json'))throw Error('Draft already exists. Retain later refinements; do not regenerate over it.');
const response=await fetch('http://127.0.0.1:8767/api/projects/sequence-stand');if(!response.ok)throw Error('Saved standing reference unavailable');const saved=await response.json(),base=saved.project.frames[0];fs.writeFileSync(root+'/standing-reference.json',JSON.stringify(saved,null,2));
const at=new Date().toISOString(),propId='proposal-scratching-post-rope',projectId='proposal-scratching-post-action';
const pixels=Array.from({length:23},()=>Array(12).fill(null));
for(let y=2;y<=20;y++)for(let x=4;x<=7;x++)pixels[y][x]=x===4?'#887449':x===7?'#e5d6aa':(y+x)%3===0?'#ad9564':'#c4ad7b';
for(let x=3;x<=8;x++){pixels[1][x]='#c88a4b';pixels[2][x]='#a86635';}
for(let x=1;x<=10;x++){pixels[21][x]='#c88a4b';pixels[22][x]='#6e4328';}for(let x=2;x<=9;x++)pixels[20][x]='#a86635';
const prop={id:propId,name:'Scratching post · rope · AI draft',description:'Upright rope post with a bevelled wooden base, sized against the 24×24 cat. AI proposal awaiting human refinement/approval.',behaviourNotes:'Ground = bottom of the 23-pixel asset. Place at cat-grid (14,1) for the linked scratching draft. Left rope face is asset x=4 (scene x=18), approximately y=3..19. Cat keeps rear feet planted and alternates downward strokes. Future scratch affordance: stationary/non-carryable; optional worn/frayed states later. No runtime behaviour is installed.',tags:['ai-draft','scratching','post'],familyId:'scratching-post',stateKey:'new',stateKind:'condition',width:12,height:23,pixels,origin:'ai',review:'candidate',revision:1,source:{proposal:'scratching-post-draft-2026-10-16'},operations:[{actor:'ai',kind:'candidate',at}]};
function stretch(lift,near,far){
 const r=Array.from({length:24},()=>Array(24).fill('.')),put=(x,y,v='#')=>{if(x>=0&&x<24&&y>=0&&y<24)r[y][x]=v;};
 const line=(a,b,width=1)=>{const n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let i=0;i<=n;i++){const x=Math.round(a[0]+(b[0]-a[0])*i/(n||1)),y=Math.round(a[1]+(b[1]-a[1])*i/(n||1));put(x,y);if(width===2)put(x-1,y);}};
 const ellipse=(cx,cy,rx,ry)=>{for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y);};
 // Retain authored tail and rear feet; draw the raised torso/forelegs as AI work.
 base.rows.forEach((row,y)=>[...row].forEach((v,x)=>{if(v!=='.'&&(x<=5||x<=10&&y>=17))put(x,y,v);}));
 ellipse(9,19,3,3);ellipse(11,16-lift*2,3,4);ellipse(13,13-lift*3,2.5,3);line([9,23],[11,17],2);
 const dx=-Math.round(3*lift),dy=-Math.round(7*lift);for(let y=10;y<=16;y++)for(let x=15;x<=22;x++)if(base.rows[y][x]!=='.')put(x+dx,y+dy);
 const shoulder=[14,Math.round(14-4*lift)];line(shoulder,[16,far],1);line([16,far],[18,far]);line(shoulder,[16,near],2);line([16,near],[18,near],2);put(18,far,'F');put(18,near,'F');put(7,23,'R');return r.map(row=>row.join(''));
}
const frames=[];
function add(name,rows,role,ms,origin='mixed',contact=null){const f=newFrame(name,rows,origin);Object.assign(f,{role,durationMs:ms,anchor:{x:7,y:23},source:{sequenceId:saved.project.projectId,frameId:base.id,proposal:'scratching-post-draft-2026-10-16'},operations:[{actor:'ai',kind:origin==='human'?'borrow-reference':'compose-candidate',at}]});if(contact)f.metadata={category:'interaction',description:`Draft front-paw contact at scene x18, near y${contact[0]}, far y${contact[1]}. Refine against the rope; front markers move, rear anchor stays planted.`,tags:['scratch-contact']};frames.push(f);}
add('Stand beside post',base.rows,'enter',400,'human');add('Raise shoulders',stretch(.45,18,19),'enter',200);add('Reach onto rope',stretch(1,8,14),'enter',160);
for(const [i,paws]of [[8,14],[10,14],[12,14],[14,12],[14,10],[14,8],[12,10],[10,12]].entries())add('Alternating scratch '+(i+1),stretch(1,...paws),'cycle',110,'mixed',paws);
add('Release and lower',stretch(.45,18,19),'exit',220);add('Stand after scratching',base.rows,'exit',400,'human');
const project={schemaVersion:1,projectId,name:'Scratch post · alternating strokes · AI draft',width:24,height:24,category:'interaction',description:'Draft for human review: stretch up, alternate downward forepaw strokes on the left rope face, then lower again. Rear bearing (7,23) is fixed. Human standing references bookend AI-composed/mixed stretched frames. Toggle contact markers to inspect the paw points. Show prop is preconfigured at (14,1). Review shoulders, neck, paw contact and rhythm; no runtime integration is approved.',tags:['ai-draft','scratch-post'],wip:true,frames,preferredNeighbours:{before:['sequence-stand'],after:['sequence-stand','sequence-clean']},propReference:{assetId:propId,x:14,y:1,visible:true,flip:false,foreground:false,opacity:1}};
ensureQueue(project);validateProject(project);fs.writeFileSync(root+'/proposal.json',JSON.stringify({prop,project},null,2)+'\n');console.log('Drafted post and',frames.length,'frames; no runtime changes.');
