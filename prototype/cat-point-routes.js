// Bounded destination-point planning. Geometry-only pathTo remains the cheap reachability API.
(()=>{
 const attempts=new WeakSet(),cache=new WeakMap(),snap=(x,s)=>Math.round(x/s)*s,clamp=(x,f)=>Math.max(f.min,Math.min(f.max,x));
 window.pixelCatPointRoutesV1={
  limits:{states:128,checks:96,neighbours:16},
  plan(a,target,endX,origin=a.support,startX=a.x){
   if(origin===a.support){const climb=window.pixelCatTreeV1?.preferred(a,target,origin);if(climb)return climb;}
   if(a.config.point_routes===false||!origin||!target||origin.bed||target.bed||origin.narrow||target.narrow)return null;
   const started=performance.now(),scale=a.scale,goal=snap(clamp(endX,target),scale),start=snap(clamp(startX,origin),scale),surfaces=a.surfaces||[],profile=JSON.stringify(a.config),prior=cache.get(a),geometry=surfaces.map(f=>[f.id,f.min,f.max,f.top].join(',')).join(';'),key=[origin.id,start,target.id,goal,scale,a.facing,a.urgency,a.worldRect?.top||0,profile,geometry].join('|');
   if(prior?.surfaces===surfaces&&prior.key===key){a.pointRouteStats={...prior.stats,cached:true};return prior.steps?.map(s=>({...s}))??null;}
   let sorted;const limits=this.limits,points=new Map(),neighbours=new Map(),physical=new Map(),nodes=new Map(),queue=[];let serial=0,expanded=0,checks=0,limited=false,finish=null;
   // Walking and jump costs both include horizontal travel at routeSpeed, so this
   // is a lower bound; the old 140-cell divisor spent the budget on weak detours.
   const speed=a.routeSpeed(),heuristic=(f,x)=>Math.abs(goal-x)/(scale*speed),nodeKey=(f,x,j)=>f.id+'@'+x+'@'+Number(j);
   const less=(p,q)=>p.priority<q.priority||p.priority===q.priority&&p.serial<q.serial;
   function push(n){queue.push(n);let i=queue.length-1;while(i){const p=(i-1)>>1;if(!less(queue[i],queue[p]))break;[queue[i],queue[p]]=[queue[p],queue[i]];i=p;}}
   function pop(){const n=queue[0],last=queue.pop();if(queue.length){queue[0]=last;let i=0;for(;;){let j=i,l=i*2+1,r=l+1;if(l<queue.length&&less(queue[l],queue[j]))j=l;if(r<queue.length&&less(queue[r],queue[j]))j=r;if(j===i)break;[queue[i],queue[j]]=[queue[j],queue[i]];i=j;}}return n;}
   // Neighbour entry projections expose short takeoffs inside the same seven-point budget.
   const candidates=f=>{if(!points.has(f.id)){const xs=[clamp(goal,f),clamp(start,f),f.min,f.max,...near(f).slice(0,2).map(g=>clamp(clamp(start,g),f)),(f.min+f.max)/2,...(f.points||[]).filter(p=>Number.isFinite(p.x)).sort((p,q)=>Math.abs(p.x-goal)-Math.abs(q.x-goal)).slice(0,2).map(p=>p.x)];points.set(f.id,[...new Set(xs.map(x=>snap(clamp(x,f),scale)))].slice(0,7));}return points.get(f.id);};
   const near=f=>{if(neighbours.has(f.id))return neighbours.get(f.id);sorted||=[...surfaces].filter(f=>!f.bed&&!f.narrow&&f.max>=f.min).sort((f,g)=>f.top-g.top||f.left-g.left||String(f.id).localeCompare(String(g.id)));let lo=0,hi=sorted.length;while(lo<hi){const m=(lo+hi)>>1;if(sorted[m].top<f.top-90*scale)lo=m+1;else hi=m;}const found=[];for(let i=lo;i<sorted.length&&sorted[i].top<=f.top+90*scale;i++){const g=sorted[i];if(g.id!==f.id&&Math.max(0,f.min-g.max,g.min-f.max)<=150*scale)found.push(g);}found.sort((p,q)=>(p.id===target.id?-1:q.id===target.id?1:Math.hypot(clamp(goal,p)-goal,p.top-target.top)-Math.hypot(clamp(goal,q)-goal,q.top-target.top))||String(p.id).localeCompare(String(q.id)));const result=found.slice(0,limits.neighbours);neighbours.set(f.id,result);return result;};
   const offer=(from,f,x,cost,step,jump=false)=>{const id=nodeKey(f,x,jump),total=from.cost+cost,old=nodes.get(id);if(old&&old.cost<=total+.000001)return;const n={id,surface:f,x,jump,cost:total,priority:total+heuristic(f,x),parent:from,step,serial:serial++};nodes.set(id,n);push(n);};
   const step=(from,f,x,kind)=>({...f,pointRoute:true,surface:f,fromId:from.surface.id,fromLeft:from.surface.left,launch:from.x,launchOffset:from.x-from.surface.left,targetOffset:x-f.left,x,kind});
   const first={id:nodeKey(origin,start,false),surface:origin,x:start,jump:false,cost:0,priority:heuristic(origin,start),serial:serial++};nodes.set(first.id,first);push(first);
   if(origin.id!==target.id&&Math.abs(origin.top-target.top)<=90*scale&&!window.pixelCatShallowV1?.edge(a,origin,target,start)){
    let best;for(const launch of new Set([start,snap(clamp(goal,origin),scale)])){const x=snap(clamp(launch,target),scale);if(checks>=limits.checks||Math.abs(x-launch)>150*scale)continue;checks++;const flight=a.routeJump(origin,target,launch,x);if(!flight)continue;const score=Math.abs(x-launch)/scale*.2+(Math.abs(launch-start)+Math.abs(goal-x))/scale/speed+flight.duration/1000;if(!best||score<best.score)best={launch,x,score};}
    if(best){const steps=[];let from=first;if(Math.abs(best.launch-start)>=2*scale){steps.push(step(from,origin,best.launch,'walk'));from={surface:origin,x:best.launch};}steps.push(step(from,target,best.x,'jump'));if(Math.abs(goal-best.x)>=2*scale)steps.push(step({surface:target,x:best.x},target,goal,'walk'));const stats={expanded:0,physicalChecks:checks,states:limits.states,checks:limits.checks,limited:false,fallback:false,cached:false,direct:true,ms:performance.now()-started,steps:steps.length};a.pointRouteStats=stats;a.setAttribute?.('data-point-route',JSON.stringify(stats));cache.set(a,{surfaces,key,stats,steps});return steps.map(s=>({...s}));}
   }
   while(queue.length){const n=pop();if(nodes.get(n.id)!==n)continue;if(n.surface.id===target.id&&Math.abs(n.x-goal)<scale*.5){finish=n;break;}if(expanded>=limits.states){limited=true;break;}expanded++;let nodeChecks=0;
    for(const x of candidates(n.surface)){const d=Math.abs(x-n.x);if(d>=2*scale||d>=scale*.5&&n.surface.id===target.id&&Math.abs(x-goal)<scale*.5)offer(n,n.surface,x,d/scale/speed,step(n,n.surface,x,'walk'));}
    for(const f of near(n.surface)){
     let revisits=false;for(let p=n.parent;p;p=p.parent)if(p.surface.id===f.id){revisits=true;break;}if(revisits)continue;
     const shallow=window.pixelCatShallowV1?.edge(a,n.surface,f,n.x),canWalk=shallow&&Math.abs(shallow.launch-n.x)<scale*.5;
     if(canWalk)offer(n,f,shallow.landing,Math.abs(shallow.landing-n.x)/scale/speed+.02,step(n,f,shallow.landing,'shallow'));
     for(const x of candidates(f)){if(nodeChecks>=12)break;if(Math.abs(x-n.x)>150*scale)continue;const id=n.surface.id+'@'+n.x+'>'+f.id+'@'+x;let plan=physical.get(id);if(!physical.has(id)){if(checks>=limits.checks){limited=true;break;}checks++;nodeChecks++;plan=a.routeJump(n.surface,f,n.x,x);physical.set(id,plan);}if(!plan)continue;
      const rise=Math.max(0,(n.surface.top-f.top)/scale),drop=Math.max(0,(f.top-n.surface.top)/scale),groundAlternative=!!shallow;let cost=plan.duration/1000+.8+Math.abs(x-n.x)/scale/speed+.04*Math.abs(x-n.x)/scale+.018*rise+.004*drop+(n.jump?.35:0);if(groundAlternative)cost=Math.max(cost,Math.abs(x-n.x)/scale/speed+.65);offer(n,f,x,cost,step(n,f,x,'jump'),true);
     }if(checks>=limits.checks||nodeChecks>=12)break;
    }
   }
   let steps=null;if(finish){steps=[];for(let n=finish;n.parent;n=n.parent)steps.push(n.step);steps.reverse();}
   const stats={expanded,physicalChecks:checks,states:limits.states,checks:limits.checks,limited,fallback:!steps,cached:false,ms:performance.now()-started,steps:steps?.length||0};a.pointRouteStats=stats;a.setAttribute?.('data-point-route',JSON.stringify(stats));cache.set(a,{surfaces,key,stats,steps:steps?.map(s=>({...s}))});return steps;
  },
  reconcile(a,step,target){const from=a.surfaces.find(f=>f.id===step.fromId);return{...step,...target,kind:step.kind,pointRoute:true,surface:target,launch:from?from.left+step.launchOffset:step.launch,x:clamp(target.left+step.targetOffset,target)};},
  retry(a,t,last,message){a.route=[];a.deadline=t+1000;a.noPathMessage=message;if(a.urgency==='prompted'&&last?.settle){const target=a.surfaces.find(f=>f.id===last.surface.id);if(target){a.requestedPoint={id:'click',x:clamp(last.x,target),weight:1};a.goal=target.id+'::click';a.command='explore';}}},
  advance(a,t){
   if(a.config.point_routes===false||!a.route?.length)return false;let next=a.route[0];
   if(!next.pointRoute&&!a.route.some(s=>s.pointRoute)&&!attempts.has(a.route)){attempts.add(a.route);const last=a.route.at(-1);if(last?.settle){const planned=this.plan(a,last.surface,last.x);if(planned){a.route=[...planned,last];attempts.add(a.route);next=a.route[0];}}}
   if(!next?.pointRoute)return false;
   const target=a.surfaces.find(f=>f.id===next.surface.id);if(!target||a.support.id!==next.fromId||target.el?.isConnected===false){this.retry(a,t,a.route.at(-1),'Route changed · waiting for a safe plan');return true;}
   if(next.kind==='jump'&&Math.abs(a.x-next.launch)>a.scale){a.moveTo(next.launch,a.support.top,0,'walk',a.support,t);return true;}
   const last=a.route.at(-1);a.route.shift();let kind=next.kind==='jump'?'jump':'walk';if(next.kind==='shallow'&&a.urgency!=='prompted'&&a.ensureMood().random()>=.88&&a.routeJump(a.support,target,a.x,next.x))kind='jump';
   a.plannedRouteJump=kind==='jump';try{a.moveTo(next.x,target.top,0,kind,target,t);}finally{a.plannedRouteJump=false;}
   if(!a.motion)this.retry(a,t,last,'Route changed · rechecking physical endpoints');
   if(a.motion&&next.kind==='shallow'&&kind==='walk'){a.motion.shallow=true;a.motion.shallowFrom=a.support.id;a.setAttribute?.('data-transition','shallow-walk');}
   return true;
  }
 };
})();
