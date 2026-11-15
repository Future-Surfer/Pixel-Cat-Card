import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const elements = new Map();
const location = {pathname:'/testing/first'};
const window = {pixelCatClimbV1:{ready:a=>!a.paused}};
let planAvailable = true;
let wallAvailable = true;
let attempted = 0;
window.pixelCatCardClimbV1 = {
  reconcile:()=>({faces:wallAvailable?[{}]:[],tops:[]}),
  ascent(a,t,preview,accept,report) {
    if (!planAvailable) { report('No safe route'); return false; }
    if (accept && !accept()) return false;
    attempted++;
    report('Attempted');
    a.complete = ()=>report('Completed');
    return true;
  }
};
const context = {
  window,location,customElements:{get:k=>elements.get(k),define:(k,v)=>elements.set(k,v)},
  HTMLElement:class {},Option:class {},setInterval:()=>1,clearInterval(){}
};
for(const file of ['cat-lab-approach','cat-behaviour-lab']) vm.runInNewContext(fs.readFileSync('prototype/'+file+'.js','utf8'),context);
const Lab = elements.get('pixel-cat-behaviour-lab');
const mount = root => {
  const card = new Lab();
  const select = {value:'',add(){}}, status = {};
  card.parentElement = root;
  card.shadowRoot = {querySelector:s=>s==='select'?select:status};
  card.connectedCallback();
  return {card,select,status};
};
const root = {matches:()=>true}, other = {matches:()=>true};
const {card,select,status} = mount(root);
const actor = (r=root,random=0) => ({root:r,support:{},config:{card_climbing:true},ensureMood:()=>({random:()=>random})});
const offer = window.pixelCatBehaviourLabV1.offer;
const a=actor(), b=actor(), c=actor(root,.9);
assert.equal(offer(a,1000),false);
select.value='climb';select.onchange();
assert.equal(offer(actor(other),1000),false);
assert.equal(offer({...a,paused:true},1000),false);
assert.equal(offer({...a,idle:{pose:'sleep',poseUntil:2000}},1000),false);
assert.equal(offer(c,1000),true);
assert.equal(offer(a,1100),true);
assert.equal(offer(a,1101),false);
assert.equal(offer(b,1200),true);
a.complete();
planAvailable=false;assert.equal(offer(actor(),1300),false);
wallAvailable=false;assert.equal(offer(actor(),1400),false);
assert.equal(attempted,3);
const duplicate=mount(root);
assert.equal(duplicate.select.value,'climb');
assert.match(duplicate.status.textContent,/No usable wall: 1.*No safe route: 1.*Attempted: 3.*Completed: 1/);
select.value='yawn';select.onchange();
const yawner=actor();
yawner.config.card_climbing=false;
assert.equal(window.pixelCatBehaviourLabV1.tick(yawner,1100),1);
assert.equal(yawner.labPose,'yawn');
assert.equal(offer(yawner,1101),false);
assert.equal(offer({...actor(),support:{narrow:true}},1200),false);
assert.match(status.textContent,/Yawns chosen: 0/);
const yawnLab=mount(root);
assert.match(yawnLab.status.textContent,/Yawns chosen: 1/);
yawnLab.card.disconnectedCallback();
location.pathname='/testing/second';
assert.equal(offer(actor(),1005),false);
location.pathname='/testing/first';
card.disconnectedCallback();duplicate.card.disconnectedCallback();
assert.equal(offer(actor(),1006),false);
assert.equal(mount(root).select.value,'');
const priority = mount(other);
priority.select.value='climb';priority.select.onchange();
const eating=actor(other);
eating.idle={pose:'eat',poseUntil:120000};
eating.route=[{}];
let finished=0;
eating.social={episode:{},finish(){finished++;this.episode=null;}};
const tick=window.pixelCatBehaviourLabV1.tick.bind(window.pixelCatBehaviourLabV1);
eating.motion={kind:'jump'};
assert.equal(tick(eating,2000),1);
assert.equal(finished,0);
delete eating.motion;
assert.equal(tick(eating,2016),1);
assert.equal(finished,1);
assert.equal(eating.route.length,0);
assert.equal(eating.idle.poseUntil,2016);
assert.equal(eating.labPose,null);
planAvailable=false;wallAvailable=true;
const faceOwner={}, landingOwner={};
const starter={id:'start',min:0,max:200,top:100,el:faceOwner};
const landing={id:'landing',min:160,max:260,top:125,el:landingOwner};
Object.assign(eating,{support:starter,home:starter,surfaces:[starter,landing],scale:2,x:0});
Object.assign(window.pixelCatCardClimbV1,{
  reconcile:()=>({faces:[{panelId:'start'}],tops:[{...landing,panelId:'landing',sourceId:'landing'}],
    byOwner:new Map([['start',faceOwner],['landing',landingOwner]])}),
  sourceCard:(_a,s)=>s.el,
  route:(_a,to,from,_fresh,mode,x)=>to===landing&&from===starter&&mode==='card-ascent'&&x===200?[{}]:null
});
window.pixelCatSurfaceWorldV1={route:()=>[]};
window.pixelCatPointRoutesV1={plan:(_a,to,x)=>to===starter&&x===200?[{pointRoute:true}]:null};
assert.equal(tick(eating,5000),1);
const approach=eating.route;
assert.equal(approach.length,1);
assert.equal(tick(eating,5016),1);
assert.equal(eating.route,approach);
priority.select.value='';priority.select.onchange();
assert.equal(tick(eating,5100),0);
assert.equal(eating.deadline,5100);
console.log('PASS: view scope, staggered retries, focus interrupts grounded activities, and Natural restores ordinary planning.');
