import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const window={pixelCatPointRoutesV1:{plan:(a,surface,x,origin)=>origin&&!a.pathTo()?null:a.routeTo?.(surface,x)}};
vm.runInNewContext(fs.readFileSync('prototype/cat-dashboard-chase.js','utf8'),{window});
const chase=window.pixelCatDashboardChaseV1;
const shelf=(id,left,top)=>({id,el:{isConnected:true},left,min:left,max:left+160,top});
function fixture(){
 const origin=shelf('start',0,150),target=shelf('next',190,125),root={};
 const cat=(ownerKey,x)=>{
  const a={ownerKey,x,facing:1,scale:2,root,active:true,config:{dashboard_chasing:true,social_behaviour:true,interaction_behaviour:true},
   support:origin,home:origin,surfaces:[origin,target],route:[],pathTo:()=>[],ensureMood:()=>({random:()=>0,values:{playfulness:1,sleepiness:0}})};
  a.routeTo=(surface,x)=>[{surface,fromId:a.support.id,x,kind:'jump'}];
  a.social={actor:a,clock:0,memory:new Map(),visible:new Set(),clear:()=>true,corridor:()=>true,trace:[],log(kind){this.trace.push(kind);}};
  return a;
 };
 const chaser=cat('a',90),runner=cat('b',140);
 return {chaser,runner,target};
}
{
 const {chaser,runner,target}=fixture(),layer=chaser.social,view={counts:{}};
 layer.episode=runner.social.episode=null;
 chaser.decisionLayer=()=>layer;
 chaser.config.dashboard_chasing=runner.config.dashboard_chasing=false;
 let roll=.9;
 chaser.ensureMood=()=>({random:()=>roll});
 const see=(surface,x,at)=>{
  layer.clock=at;
  layer.visible.add('b');
  layer.memory.set('b',{id:'b',surface:surface.el,surfaceTop:surface.top,scale:2,x,at});
 };
 see(chaser.support,140,0);
 assert.equal(chase.focus(chaser,0,view),0,'The focus leaves the normal decision clock running');
 roll=.6;
 layer.clock=700;
 chase.focus(chaser,700,view);
 assert.equal(chaser.route.length,0,'An unchanged sighting cannot trigger pursuit');
 see(target,280,1000);
 chase.focus(chaser,1200,view);
 assert.equal(view.counts.Following,1);
 assert.equal(chaser.route[0].surface,target);
 assert.equal(runner.route.length,0,'Following commits only the observer');
 assert.equal(layer.episode,null,'The focus does not create a shared episode');
 assert.equal(chase.reserved(chaser,target,()=>true),true);
 chase.detach(chaser);
 assert.equal(view.chaseActors.has(chaser),false);
 assert.equal(chaser.route.length,0);
 chase.resetFocus(view);
 assert.equal(chase.reserved(chaser,target,()=>true),false);
}

for(const reason of ['clear','blind','sleep','disabled','blocked','no return','stale','same card']){
 const {chaser,runner,target}=fixture(),layer=chaser.social,origin=chaser.support;
 runner.config.chasing=false;
 runner.config.social_behaviour=false;
 chaser.config.dashboard_chasing=false;
 chaser.decisionLayer=()=>layer;
 const see=(surface,x,at)=>{
  layer.clock=at;
  layer.visible.add('b');
  layer.memory.set('b',{id:'b',surface:surface.el,surfaceTop:surface.top,scale:2,x,at});
 };
 see(origin,140,0);
 chase.natural(chaser,0);
 see(reason==='same card'?origin:target,280,1000);
 if(reason==='blind')layer.visible.clear();
 if(reason==='sleep')chaser.idle={pose:'sleep'};
 if(reason==='disabled')chaser.config.chasing=false;
 if(reason==='blocked')layer.clear=()=>false;
 if(reason==='no return')chaser.pathTo=()=>null;
 if(reason==='stale')layer.clock+=500;
 chase.natural(chaser,1000);
 if(reason==='clear'){
  assert.equal(chaser.route[0]?.surface,target);
  assert.ok(280-chaser.route[0].x>=60);
  assert.equal(runner.route.length,0);
  assert.equal(layer.episode,undefined);
  assert.equal(chase.reserved(chaser,target,()=>true),true);
  chaser.command='home';chaser.motion={kind:'jump'};
  chase.natural(chaser,1200);
  assert.equal(chase.reserved(chaser,target,()=>true),false);
  assert.equal(chaser.command,'home');
  assert.equal(chaser.motion.kind,'jump');
 }
 assert.equal(chaser.route.length,0,reason);
}
console.log('PASS: independent ordinary and focus pursuit, unilateral eligibility, observed safe landings and scoped cleanup.');
