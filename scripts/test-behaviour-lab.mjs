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
  reconcile:()=>({faces:wallAvailable?[{}]:[]}),
  ascent(a,t,preview,accept,report) {
    if (!planAvailable) { report('No safe route'); return false; }
    if (!accept()) return false;
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
vm.runInNewContext(fs.readFileSync('prototype/cat-behaviour-lab.js','utf8'),context);
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
const actor = (r=root,random=0) => ({root:r,config:{card_climbing:true},ensureMood:()=>({random:()=>random})});
const offer = window.pixelCatBehaviourLabV1.offer;
const a=actor(), b=actor(), c=actor(root,.9);
assert.equal(offer(a,1000),false);
select.value='climb';select.onchange();
assert.equal(offer(actor(other),1000),false);
assert.equal(offer({...a,paused:true},1000),false);
assert.equal(offer({...a,idle:{pose:'sleep',poseUntil:2000}},1000),false);
assert.equal(offer(c,1000),false);
assert.equal(offer(a,1000),true);
assert.equal(offer(a,1001),false);
assert.equal(offer(b,1001),true);
a.complete();
planAvailable=false;assert.equal(offer(actor(),1003),false);
wallAvailable=false;assert.equal(offer(actor(),1004),false);
assert.equal(attempted,2);
const duplicate=mount(root);
assert.equal(duplicate.select.value,'climb');
assert.match(duplicate.status.textContent,/No usable wall: 1.*No safe route: 1.*Declined: 1.*Attempted: 2.*Completed: 1/);
location.pathname='/testing/second';
assert.equal(offer(actor(),1005),false);
location.pathname='/testing/first';
card.disconnectedCallback();duplicate.card.disconnectedCallback();
assert.equal(offer(actor(),1006),false);
assert.equal(mount(root).select.value,'');
console.log('PASS: shared focus, per-cat cooldown and refusal, route diagnostics, separate views and removal reset.');
