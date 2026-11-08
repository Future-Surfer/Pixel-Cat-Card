import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const callbacks=new Map(),events=new Map();let next=0;
const box={location:{pathname:'/test',href:'http://test/test'},performance:{now:()=>0,timeOrigin:0},window:{},HTMLElement:class{},customElements:{get:()=>true},document:{hidden:false,addEventListener:(k,v)=>events.set(k,v),removeEventListener:k=>events.delete(k)},requestAnimationFrame:fn=>{callbacks.set(++next,fn);return next;},cancelAnimationFrame:id=>callbacks.delete(id)};
vm.runInNewContext(fs.readFileSync('prototype/cat-monitor-diagnostics.js','utf8')+'\n'+fs.readFileSync('prototype/cat-monitor.js','utf8')+'\nglobalThis.Monitor=PixelCatMonitor;globalThis.chart=catMonitorChart;',box);
const hub=box.window.pixelCatMonitorV1,advance=t=>{assert.equal(callbacks.size,1,'Exactly one scheduled RAF');const [id,fn]=[...callbacks][0];callbacks.delete(id);fn(t+8000);};
let a=0,b=0;const offA=hub.subscribe(()=>a++),offB=hub.subscribe(()=>b++);
for(let t=-8000;t<0;t+=10)advance(t);assert.equal(hub.stats().n,0,'Startup frames excluded');assert.equal(hub.history.length,0,'Warm-up cannot set chart scale');a=b=0;
advance(0);advance(10);advance(20);advance(80);assert.equal(hub.stats().n,3);assert.equal(hub.stats().long,1);assert.equal(hub.stats().p95,60);assert.equal(hub.stats().mean,80/3);advance(1000);assert.equal(a,b);assert.equal(a,2);
for(let i=1;i<=650;i++)advance(1000+i*10);assert.equal(hub.samples.length,600,'Bounded rolling samples');
box.document.hidden=true;events.get('visibilitychange')();assert.equal(callbacks.size,0,'Hidden tabs stop sampler');box.document.hidden=false;events.get('visibilitychange')();advance(100000);assert.equal(hub.samples.at(-1),10,'Hidden gap excluded');advance(100010);
for(let i=1;i<=70;i++)advance(100010+i*1000);assert.equal(hub.history.length,60,'Bounded history');
offA();assert.equal(callbacks.size,1,'Second monitor still subscribed');offB();assert.equal(callbacks.size,0);assert.equal(events.size,0);assert.equal(hub.samples.length,0,'Unmount releases history');
const offC=hub.subscribe(()=>{});advance(500000);assert.equal(hub.stats().n,0,'Reattach starts fresh');offC();
// A slow document, late cats and a late startup stall cannot enter plot history.
box.document.readyState='loading';const actor={active:true,isConnected:true,href:'/test',ownerKey:'late',homeArtReady:false,support:null,needsMeasure:true};hub.owners=()=>new Map([[actor,{}]]);const offD=hub.subscribe(()=>{});
for(let t=600000;t<=609000;t+=10)advance(t);assert.equal(hub.samples.length,0);assert.equal(hub.history.length,0,'More than eight seconds is insufficient while loading');
box.document.readyState='complete';actor.homeArtReady=true;actor.support={};actor.needsMeasure=false;
for(let t=609010;t<=610000;t+=10)advance(t);advance(611500);assert.equal(hub.history.length,0,'Late startup spike stays outside graph');
for(let t=611510;t<=613500;t+=10)advance(t);assert.equal(hub.collecting,true);assert.ok(hub.samples.every(ms=>ms===10));advance(614500);assert.equal(hub.samples.at(-1),1000,'Real stalls AFTER startup are retained');assert.equal(hub.stats().long,1);offD();
// Monitor reads counts once per update and does not register/spawn actors.
const root={matches:()=>true},nodes=Object.fromEntries(['fps','mean-time','p95-time','summary','chart-scale','mean','p95','chart-background'].map(k=>[k,{setAttribute(key,value){this[key]=value;}}]));
hub.owners=()=>new Map([[{active:true,isConnected:true,config:{},paused:false},{root}],[{active:true,isConnected:true,config:{},paused:true},{root}],[{active:true,isConnected:true,config:{debug_performance:true}},{root:{}}]]);
box.Monitor.prototype.update.call({nodes,parentElement:root},{n:10,mean:10,p95:15,fps:100,long:0},[{mean:10,p95:15}]);assert.match(nodes.summary.textContent,/1\/2 cats running.*0 individually profiled/);assert.equal(nodes.fps.textContent,'100.0');assert.match(nodes.mean.points,/338,/);
assert.equal(box.Monitor.prototype.tick,undefined);assert.equal(box.Monitor.prototype.getCardSize(),4);
for(const peak of [15,120,1000]){const chart=box.chart([{mean:10,p95:peak}]);assert.equal(chart.max,Math.max(50,peak));assert.equal((chart.background.match(/<rect /g)||[]).length,3);assert.match(chart.background,/>0<|>16\.7</);assert.match(chart.background,new RegExp('>'+Math.ceil(chart.max)+'<'));for(const point of chart.points('p95').split(' ')){const [x,y]=point.split(',').map(Number);assert.equal(x,338);assert.ok(y>=8&&y<=76);}assert.ok(!/NaN|Infinity/.test(chart.background));}
console.log('PASS: one shared sampler, bounded windows, frame stats, hidden-tab gaps, independent subscribers, cleanup, scoped actor counts and no actor spawn.');
