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
 const chaser=cat('a',90),runner=cat('b',140),ep={chaser,runner,stage:'run',expires:8000};
 for(const a of [chaser,runner])a.social.episode=ep;
 chaser.social.finish=reason=>{ep.reason=reason;for(const a of [chaser,runner]){chase.release(a,ep);a.social.episode=null;}};
 const land=a=>{const step=a.route.shift();a.support=step.surface;a.x=step.x;};
 const see=()=>{chaser.social.visible.add('b');chaser.social.memory.set('b',{id:'b',surface:runner.support.el,supportId:runner.support.id,surfaceTop:runner.support.top,x:runner.x,at:chaser.social.clock});};
 return {chaser,runner,ep,target,land,see};
}
{
 const {chaser,runner,ep,target,land,see}=fixture(),layer=chaser.social;
 runner.config.dashboard_chasing=false;
 assert.equal(chase.advance(layer,0),false);
 runner.config.dashboard_chasing=true;
 assert.equal(chase.advance(layer,0),true);
 assert.equal(runner.route[0].surface,target);
 assert.equal(chaser.route.length,0);
 assert.equal(chase.reserved(runner,target,()=>true),true);
 land(runner);
 assert.equal(chase.advance(layer,700),true);
 assert.equal(chaser.route.length,0,'A private runner route cannot provide a pursuit target');
 layer.clock=800;see();
 assert.equal(chase.advance(layer,800),true);
 assert.ok(runner.x-chaser.route[0].x>=60);
 land(chaser);
 assert.equal(chase.advance(layer,1300),false,'Same-surface chase and pounces resume after the transfer');
 assert.equal(ep.dashboard.legs.size,0);
 assert.ok(layer.trace.includes('chase card transfer completed'));
 const third=shelf('third',360,100);
 chaser.surfaces.push(third);runner.surfaces.push(third);
 layer.clock=1500;
 assert.equal(chase.advance(layer,1500),true,'An observed first chase can be followed by another checked transfer');
 land(runner);see();
 assert.equal(chase.advance(layer,1600),true);
 land(chaser);
 assert.equal(chase.advance(layer,2000),false);
 assert.equal(ep.dashboard.transfers,2);
 layer.clock=3000;
 assert.equal(chase.advance(layer,3000),false,'Transfer budget is bounded');
}
{
 const {chaser,runner}=fixture();
 runner.pathTo=()=>null;
 assert.equal(chase.advance(chaser.social,0),false,'A runner requires a checked route back');
 assert.equal(runner.route.length,0);
}
{
 const {chaser,runner,ep,land}=fixture(),layer=chaser.social;
 chase.advance(layer,0);land(runner);
 chase.advance(layer,750);
 layer.clock=1400;
 chase.advance(layer,1400);
 assert.equal(ep.reason,'lost sight at the card edge');
 assert.equal(ep.dashboard.legs.size,0);
}
for(const interruption of ['occupied','command','removed']){
 const {chaser,runner,ep,target,land,see}=fixture(),layer=chaser.social;
 chase.advance(layer,0);land(runner);see();chase.advance(layer,1000);
 if(interruption==='occupied')chaser.social.clear=()=>false;
 if(interruption==='command'){chaser.command='home';chaser.motion={kind:'jump'};}
 if(interruption==='removed')target.el.isConnected=false;
 if(interruption==='removed')chaser.social.clear=s=>s.el.isConnected;
 chase.advance(layer,1100);
 assert.equal(ep.reason,'cross-card chase interrupted');
 assert.equal(chaser.route.length,0);
 assert.equal(ep.dashboard.legs.size,0);
 if(interruption==='command'){assert.equal(chaser.command,'home');assert.equal(chaser.motion.kind,'jump');}
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
 chase.resetFocus(view);
 assert.equal(chaser.route.length,0);
 assert.equal(chase.reserved(chaser,target,()=>true),false);
}
console.log('PASS: optional transfers, reservations, observed landing only, two-transfer cap, lost gaze, unavailable return, occupancy and command cleanup.');
