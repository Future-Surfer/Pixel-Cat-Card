import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const frames=new Map(),listeners=new Set();let serial=0;
const node=()=>({children:[],style:{},dataset:{},setAttribute(){},hasAttribute:()=>false,remove(){},prepend(){},firstElementChild:{style:{},firstElementChild:{innerHTML:''}}});
const events={addEventListener:type=>listeners.add(type),removeEventListener:type=>listeners.delete(type)};
const box={window:{...events},document:{...events,hidden:false,children:[],body:{append(){}},createElement:node,createElementNS:node},location:{pathname:'/lovelace/0'},performance:{now:()=>0},HTMLElement:class{},customElements:{get:()=>true},ResizeObserver:class{observe(){}disconnect(){}},matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>{frames.set(++serial,fn);return serial;},cancelAnimationFrame:id=>frames.delete(id)};
vm.runInNewContext(fs.readFileSync('pixel-cat-roaming.js','utf8')+'\nglobalThis.Home=PixelCatHome;globalThis.owners=()=>CAT_OWNERS.size;',box);
const root={},button={textContent:''},actor=Object.assign(Object.create(box.Home.prototype),{config:{},style:{},isConnected:true,scale:2,shadowRoot:{querySelector:()=>button,querySelectorAll:()=>[]},setAttribute(){},paintHome(){},worldRoot:()=>root,status(){},tick(t){this.suspended=this.blocked(t);this.layer.style.visibility=this.suspended?'hidden':'visible';}});
const paint=()=>{const work=[...frames];frames.clear();for(const [,fn]of work)fn(serial*16);};
actor.connectedCallback();paint();assert.equal(actor.layer.style.visibility,'visible');
// HA can reconnect a cached view while location still names the dashboard being left.
for(let i=0;i<5;i++)for(const destination of ['/dashboard-testing/cat-stress-test','/lovelace/0']){
 actor.disconnectedCallback();assert.equal(box.owners(),0);assert.equal(frames.size,0);
 actor.connectedCallback();assert.equal(frames.size,1);actor.connectedCallback();assert.equal(frames.size,1,'Duplicate connection cannot create another clock');
 box.location.pathname=destination;paint();
 assert.equal(actor.href,destination,'Bind navigation identity at the first paint after HA commits its URL');
 assert.equal(actor.layer.style.visibility,'visible','Returning cached cats must not remain navigation-suspended');
 assert.equal(box.owners(),1);
 const here=box.location.pathname;box.location.pathname='/another-dashboard';assert.equal(actor.blocked(),true,'Keep hiding a still-mounted cat when navigating away');box.location.pathname=here;
}
actor.disconnectedCallback();actor.connectedCallback();actor.disconnectedCallback();box.location.pathname='/unused';paint();assert.equal(box.owners(),0);assert.equal(frames.size,0);assert.equal(listeners.size,0,'An abandoned mount cancels its pending paint and listeners');
console.log('PASS: cached dashboard round trips bind the committed URL, retain navigation isolation and clean up clocks/listeners.');
