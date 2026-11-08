// Controlled planner audit, not natural behaviour rates or a device benchmark.
import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';
const directory=process.argv[2]||'.';
const box={window:{},HTMLElement:class{},customElements:{get:()=>true},performance};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(path.join(directory,f),'utf8')).join('\n')+'\nglobalThis.Home=PixelCatHome;',box);
const P=box.window.pixelCatPointRoutesV1,Home=box.Home;
const fixtures={overlap:[[0,220,350],[0,420,310]],offset:[[0,220,350],[270,520,300]],down:[[0,220,350],[-100,420,390]],shallow:[[0,220,350],[0,420,353]],stack:[[0,220,350],[0,420,300],[300,550,250]],aliases:[[0,220,350],[0,420,300],[300,550,250],[0,220,374],[0,420,324],[300,550,274]],unreachable:[[0,220,350],[700,1000,100]]};
const report={schema:1,note:'Controlled synthetic supports; milliseconds are environment-specific. Chords are endpoint distances, not arc length.',cases:0,planned:0,fallbacks:0,unsafe:0,budgetViolations:0,shorterCandidates:[],byFixture:{},maxChecks:0,maxExpanded:0};
for(const [name,rows]of Object.entries(fixtures))for(const scale of [1,2,3,4,5,6])for(const mirror of [false,true])for(const startU of [.1,.5,.9])for(const goalU of [.1,.5,.9]){
 const surfaces=rows.map(([min,max,top],i)=>{if(mirror)[min,max]=[600-max,600-min];return{id:'s'+i,left:min*scale,right:(max+24)*scale,min:min*scale,max:max*scale,top:top*scale,el:{isConnected:true}};}),origin=surfaces[0],target=surfaces[name==='aliases'?2:surfaces.length-1],a=Object.create(Home.prototype);
 Object.assign(a,{scale,size:24*scale,x:origin.min+(origin.max-origin.min)*startU,y:origin.top,facing:mirror?-1:1,support:origin,home:origin,surfaces,config:{},worldRect:{top:0},route:[],setAttribute(){}});
 const row=report.byFixture[name]??={cases:0,planned:0,fallbacks:0,jumps:0,walks:0,shallow:0,maxHorizontalCells:0,planningMs:0};row.cases++;report.cases++;const goal=target.min+(target.max-target.min)*goalU,path=P.plan(a,target,goal),stats=a.pointRouteStats;row.planningMs+=stats?.ms||0;report.maxChecks=Math.max(report.maxChecks,stats?.physicalChecks||0);report.maxExpanded=Math.max(report.maxExpanded,stats?.expanded||0);if(stats?.physicalChecks>P.limits.checks||stats?.expanded>P.limits.states)report.budgetViolations++;
 if(!path){row.fallbacks++;report.fallbacks++;continue;}row.planned++;report.planned++;
 for(const step of path){if(step.kind!=='jump'){row[step.kind==='shallow'?'shallow':'walks']++;continue;}row.jumps++;const from=surfaces.find(s=>s.id===step.fromId),dx=Math.abs(step.x-step.launch)/scale;row.maxHorizontalCells=Math.max(row.maxHorizontalCells,dx);if(!a.routeJump(from,step.surface,step.launch,step.x))report.unsafe++;
  const overlapLow=Math.max(from.min,step.surface.min),overlapHigh=Math.min(from.max,step.surface.max),launch=overlapLow<=overlapHigh?Math.max(overlapLow,Math.min(overlapHigh,step.launch)):from.max<step.surface.min?from.max:from.min,land=Math.max(step.surface.min,Math.min(step.surface.max,launch)),alternative=Math.abs(land-launch)/scale;
  if(dx>alternative+2&&a.routeJump(from,step.surface,launch,land)&&report.shorterCandidates.length<30)report.shorterCandidates.push({fixture:name,scale,mirror,startU,goalU,chosen:dx,alternative,extraTakeoffWalk:Math.abs(launch-step.launch)/scale});
 }
}
for(const row of Object.values(report.byFixture))row.planningMs=+row.planningMs.toFixed(2);
console.log(JSON.stringify(report,null,2));if(report.unsafe||report.budgetViolations)process.exitCode=1;
