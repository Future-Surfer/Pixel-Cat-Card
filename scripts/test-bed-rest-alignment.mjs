import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={art:CAT_ART,idleSample,idleContact,frameContact,idleTransitionContact};',box);
const {art,idleSample,idleContact,frameContact,idleTransitionContact}=box.api,setup=box.window.pixelCatSetupV1;
const bounds=(rows,facing)=>{const xs=rows.flatMap(r=>[...r].flatMap((v,x)=>v==='.'?[]:[facing<0?23-x:x]));return {left:Math.min(...xs),right:Math.max(...xs)+1};};
for(const scale of [1,2,3,4,5,6])for(const facing of [-1,1])for(const guest of [false,true])for(const pose of ['loaf','sleep']){
 const owner={config:{bed_style:'simple'},scale},left=100.25,right=left+21*scale,top=300-3*scale;
 const surface={bed:true,bedOwner:owner,left,right,top},a={config:{bed_style:guest?'igloo':'simple'},scale,facing,x:left-10*scale,support:surface,idle:{pose,contactX:left+3*scale},svg:{style:{}}};if(!guest)surface.bedOwner=a;
 // Deliberately reproduce a rear/front inherited offset, then run the actual
 // frame/placement feedback instead of applying a correction only once.
 let last;
 for(let elapsed=0;elapsed<6000;elapsed+=40){
  const sample=idleSample(art,pose,elapsed,{clip_exit_at_ms:6000}),point=frameContact(sample.rows,facing,sample.anchor||idleContact(sample.rows)),base={x:a.idle.contactX-point[0]*scale,top:surface.top-(point[1]+1)*scale};
  const result=setup.restPlacement(a,base,sample.rows,art,elapsed);a.x=result.x;a.idle.rows=sample.rows;a.idle.anchor=sample.anchor;a.idle.facing=facing;a.idle.placement=result;
  assert.equal(result.top,base.top,'Raised bed support must never lift twice');
  assert.equal(a.idle.contactX-point[0]*scale,result.x,'Rendered and logical contact stay in sync');
  if(elapsed>=200){const ink=bounds(sample.rows,facing);assert.ok(result.x+ink.left*scale>=surface.left,'Resting body must not hang off the left side');assert.ok(result.x+ink.right*scale<=surface.right,'Resting body must not hang off the right side');}
  if(elapsed===400){last=result.x;surface.left+=13.5;surface.right+=13.5;a.idle.contactX+=13.5;}
  if(elapsed===440)assert.equal(result.x,last+13.5,'Fractional scroll carries the settled pose with the bed');
 }
 const old=a.idle,next=idleSample(art,'sit',0),contact=idleTransitionContact(old,'sit',next,facing,scale,a.x);assert.ok(Number.isFinite(contact));
 // Repeat a new rest bout: old corrected bearing must not pull the cat back
 // to its original off-bed position on every sequence change.
 a.idle={pose,contactX:old.contactX};for(const t of [7000,7200]){const sample=idleSample(art,pose,1000),point=frameContact(sample.rows,facing,sample.anchor||idleContact(sample.rows)),base={x:a.idle.contactX-point[0]*scale,top:surface.top-(point[1]+1)*scale};const p=setup.restPlacement(a,base,sample.rows,art,t);a.x=p.x;if(t===7200){const b=bounds(sample.rows,facing);assert.ok(p.x+b.left*scale>=surface.left&&p.x+b.right*scale<=surface.right);}}
}
// Non-bed contexts and active actions must not acquire bed alignment.
{const a={config:{bed_style:'simple'},scale:2,facing:1,x:150,support:{left:100,top:300},idle:{pose:'loaf'}},p={x:100,top:252};assert.equal(setup.restPlacement(a,p,art.loaf,art,1000),p);a.support={...a.support,bed:true};a.motion={kind:'walk'};assert.equal(setup.restPlacement(a,p,art.loaf,art,1000),p);}
console.log('PASS: raised-bed loaf/sleep alignment over real frame loops, both facings/six scales, own/guest beds, no double lift, logical bearing feedback, fractional scroll and repeated rest bouts.');
