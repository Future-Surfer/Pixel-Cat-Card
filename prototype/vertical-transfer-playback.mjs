// Preview adapter: reuse reviewed climb cycles and real movement/flight samples.
export function verticalTransferPlayback(route,face,from,target,scale,model,assets,age){
 const segments=[],add=(duration,sample,label)=>{const start=segments.at(-1)?.end||0;segments.push({start,end:start+duration,sample,label});};
 if(route.approach)add(route.approach.duration,t=>route.approach.sample(t),'Walk to take-off');
 add(route.enter.duration,t=>route.enter.sample(t),'Leap to find grip');
 const still=root=>()=>({frame:route.frame,root});add(160,still(route.entryRoot),'Find grip / reassess');
 let root={...route.entryRoot},hops=0;
 const scene={scale,floor:{...from,id:'home',source:from},face:{id:face.id,x:root.x-8*scale,right:root.x+8*scale,top:face.grips.top-4*scale,bottom:face.rect.bottom,grippy:true,passThrough:true},target:{...target,source:target},gripCeilingY:face.grips.top,gripFloorY:face.grips.bottom};
 const draft={...assets,config:{...model.defaults,scale,age,entry:'grip',entryPose:'centre-front',scenario:'plane',tempo:4,hop:1,gainBasis:2,hold:120,decisionHold:160,exitPose:'none'}};
 while(Math.abs(route.releaseRoot.y-root.y)>.01&&hops++<100){
  const distance=Math.abs(route.releaseRoot.y-root.y)/scale,action=route.releaseRoot.y<root.y?'up':'down',plan=model.planClimb(draft,{ground:()=>null,release:()=>null},{state:{surfaceId:face.id,root,side:'centre-front',frame:route.frame},action,distanceCells:distance},{scene});
  if(!plan.ok)throw Error('Checked grip path cannot play: '+plan.reason);
  const start=plan.segments[0].end;add(plan.duration-start,t=>model.samplePlan(plan,start+t),action==='up'?'Climb / catch':'Draft descent / catch');const next=plan.grips.at(-1).root;if(Math.abs(next.y-root.y)<.001)throw Error('No grip progress');root={...next};
 }
 if(hops>=100)throw Error('Climb playback exceeded bounded cycle count');
 add(100,still(route.releaseRoot),'Release grip');add(route.exit.duration,t=>route.exit.sample(t),'Leap to checked landing');
 return {segments,duration:segments.at(-1).end};
}
