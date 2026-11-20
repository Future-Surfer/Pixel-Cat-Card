// Uses the real controller and renderer; no simulated attachment or copied physics.
export async function runCarryTransitionAudit({actor:a,toy,art,mouth,onReport}){
 const result={status:'Running',phase:'pickup',samples:0,maxAnchorErrorPx:0,ownershipFailures:0,facings:[],phases:[]};
 const facings=new Set(),observedPoses=new Set();
 const transform=node=>/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(node.style.transform||'');
 function inspect(){
  observedPoses.add(a.getAttribute('data-pose'));
  if(toy.carrier!==a.ownerKey||a.carriedToy!==toy.id||toy.claimedBy!==a.ownerKey)result.ownershipFailures++;
  const drawn=transform(a.svg),prop=transform(toy.node);
  if(drawn&&prop&&a.drawnRows){
   const m=mouth.mouth(a,a.drawnRows,{x:Number(drawn[1]),top:Number(drawn[2])},art);
   const error=Math.max(Math.abs(Number(prop[1])+toy.asset.width*toy.scale/2-m.x),Math.abs(Number(prop[2])+toy.asset.height*toy.scale/2-m.y));
   result.maxAnchorErrorPx=Math.max(result.maxAnchorErrorPx,error);result.samples++;facings.add(a.facing);
  }
 }
 async function wait(test,timeout=6000,record=true){
  const start=performance.now();
  do{await new Promise(requestAnimationFrame);if(record)inspect();if(performance.now()-start>timeout)throw Error('Timed out during '+result.phase);}while(!test());
 }
 async function pose(name,ms){
  result.phase=name;result.phases.push(name);if(a.requestAction(name)===false)throw Error('Rejected pose '+name);
  const start=performance.now();await wait(()=>performance.now()-start>=ms);
 }
 async function travel(x,kind='walk'){
  result.phase=kind+' '+(x>a.x?'right':'left');result.phases.push(result.phase);
  a.previewPose=null;a.forcedIdleUntil=0;a.deadline=Infinity;a.route=[];
  if(a.moveTo(x,a.support.top,0,kind,a.support,performance.now())===false)throw Error('Rejected '+result.phase);
  await wait(()=>!a.motion);a.deadline=Infinity;
 }
 try{
  a.paused=false;a.nextPlayAt=a.nextToyAt=Infinity;a.mouthState.dropAt=a.mouthState.next=Infinity;
  // The ordinary preview rejects offscreen supports; let the lab scroll settle.
  const readyAt=performance.now()+500;
  await wait(()=>performance.now()>=readyAt&&!a.layoutPaused&&!a.suspended&&!a.waitingForPlacement,6000,false);
  a.measure();
  await pose('eat',500);await pose('sit',700);
  const origin=a.x;
  await travel(origin+16*a.scale);await pose('sit',500);
  await travel(origin-16*a.scale);await pose('sit',500);
  await travel(origin,'jump');await pose('sit',500);
  result.facings=[...facings].sort();
  result.observedPoses=[...observedPoses].filter(Boolean);
  result.status=result.ownershipFailures===0&&result.maxAnchorErrorPx<=.51&&facings.size===2&&observedPoses.has('sit')&&observedPoses.has('eat')?'PASS':'FAIL';
 }catch(error){result.status='FAIL';result.error=error.message;}
 a.paused=true;onReport(result);return result;
}
