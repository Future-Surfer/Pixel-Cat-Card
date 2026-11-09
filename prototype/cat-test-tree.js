/* Fixed test furniture. Geometry is in native furniture cells; the pose planner
   still checks each landing and grip in the individual actor's scale. */
const testTree={
 width:62,height:70,
 platforms:[
  {id:'home:test-tree',label:'Cat tree · lower platform',left:20,right:61,top:39},
  {id:'home:test-tree:upper',label:'Cat tree · upper perch',left:1,right:44,top:5}
 ],
 ropes:[
  {left:30,right:36,top:43,bottom:67},
  {left:30,right:36,top:9,bottom:39}
 ],
 pivot:{x:52,y:43},length:11
};
window.pixelCatTreeV1={
 mount(a){
  const dock=a.shadowRoot?.querySelector('.dock'),s=a.worldScale||a.scale;
  if(!dock)return;
  const fits=a.config.test_cat_tree===true&&a.config.show_home!==false&&(a.config.show_scratching_post??a.config.scratching_posts??true)!==false&&dock.clientWidth>=(52+testTree.width)*s;
  if(!fits){if(a.catTree){a.catTree.node.remove();delete a.catTree;}if(dock.style?.getPropertyValue('--test-tree-height'))dock.style.removeProperty('--test-tree-height');return;}
  if(a.catTree?.node.parentNode===dock&&a.catTree.scale===s)return;
  a.catTree?.node.remove();
  const node=document.createElement('div'),canvas=document.createElement('canvas'),toy=document.createElement('canvas');
  node.setAttribute('role','group');node.setAttribute('aria-label','Cat tree with hanging ball');
  node.style.cssText='position:absolute;bottom:0;right:0;pointer-events:none;width:'+testTree.width*s+'px;height:'+testTree.height*s+'px';
  canvas.width=testTree.width;canvas.height=testTree.height;
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
  const c=canvas.getContext('2d');
  const paint=(x,y,w,h,colour)=>{c.fillStyle=colour;c.fillRect(x,y,w,h);};
  paint(9,67,52,2,'#ab7135');paint(11,69,48,1,'#754726');
  for(const r of testTree.ropes){
   paint(r.left,r.top,r.right-r.left,r.bottom-r.top,'#ad9969');
   paint(r.left+1,r.top,r.right-r.left-2,r.bottom-r.top,'#d7c490');
   for(let y=r.top+1;y<r.bottom;y+=3)paint(r.left+1,y,r.right-r.left-2,1,'#e5d6ab');
  }
  for(const p of testTree.platforms){
   paint(p.left,p.top,p.right-p.left,1,'#c58d4b');
   paint(p.left-1,p.top+1,p.right-p.left+2,3,'#ab7135');
   paint(p.left,p.top+4,p.right-p.left,1,'#754726');
  }
  toy.width=7;toy.height=15;toy.style.cssText='position:absolute;image-rendering:pixelated;transform-origin:50% 0;left:'+(testTree.pivot.x-3.5)*s+'px;top:'+testTree.pivot.y*s+'px;width:'+7*s+'px;height:'+15*s+'px';
  const b=toy.getContext('2d');b.fillStyle='#754726';b.fillRect(3,0,1,10);b.fillStyle='#ab7135';b.fillRect(1,10,5,4);b.fillStyle='#c58d4b';b.fillRect(2,9,3,4);
  const ropeHosts=testTree.ropes.map(r=>{
   const host=document.createElement('div');
   host.style.cssText='position:absolute;pointer-events:none;left:'+r.left*s+'px;top:'+r.top*s+'px;width:'+(r.right-r.left)*s+'px;height:'+(r.bottom-r.top)*s+'px';
   return host;
  });
  const ball=document.createElement('button');ball.type='button';ball.dataset.catTreeBall='';ball.setAttribute('aria-label','Sway the hanging ball');
  ball.style.cssText='position:absolute;pointer-events:auto;touch-action:manipulation;margin:0;padding:0;border:0;background:transparent;left:'+(testTree.pivot.x-12)*s+'px;top:'+(testTree.pivot.y+testTree.length-8)*s+'px;width:'+24*s+'px;height:'+24*s+'px';
  ball.onclick=event=>{event.stopPropagation();this.tap(a);};
  node.append(canvas,...ropeHosts,toy,ball);dock.append(node);dock.style.setProperty('--test-tree-height',(testTree.height+24)*s+'px');
  a.catTree={node,canvas,toy,ropeHosts,scale:s,pass:new WeakMap(),clock:0,impulses:[]};
 },
 geometry(a){
  const tree=a.catTree,h=a.home;if(!tree||!h||tree.node.isConnected===false)return null;
  return {tree,s:tree.scale,x:h.right+4-testTree.width*tree.scale,y:h.top-testTree.height*tree.scale};
 },
 surfaces(a){
  const g=this.geometry(a);if(!g)return;
  const {tree,s,x,y}=g,r=a.home.rectSnapshot;
  for(const [level,p] of testTree.platforms.entries()){
   a.surfaces.push({id:p.id,el:tree.node,rectNode:a.home.rectNode,rectSnapshot:r,left:x+p.left*s,right:x+p.right*s,top:y+p.top*s,label:p.label,source:'authored tree',tree:level+1});
  }
 },
 face(a,level=1){
  const g=this.geometry(a),r=testTree.ropes[level-1];if(!g||!r)return null;
  const {s,x,y}=g,centre=x+(r.left+r.right)*s/2;
  const rect={left:x+r.left*s,right:x+r.right*s,top:y+r.top*s,bottom:y+r.bottom*s};
  return {id:'home:test-tree:rope:'+level,rect,grips:{left:centre,right:centre,top:rect.top+2*s,bottom:rect.bottom-2*s},generation:0};
 },
 preferred(a,target,origin){
  if(!target?.tree||!a.catTree||(!origin?.home&&!origin?.tree)||Math.abs(target.tree-(origin.tree||0))!==1||a.ensureMood().random()>=.7)return null;
  return window.pixelCatCardClimbV1?.treeRoute(a,target,origin);
 },
 tap(a,t=performance.now()){
  const tree=a.catTree;if(!tree)return;
  this.impact(tree,.85);
  const g=this.geometry(a),ballX=g&&g.x+testTree.pivot.x*g.s,ballY=g&&g.y+(testTree.pivot.y+testTree.length)*g.s;
  for(const [cat,entry] of a.decisionLayer()?.owners?.()||[[a,{root:a.root}]]){
   if(entry.root!==a.root||!cat.active||cat.paused||cat.suspended||cat.layoutPaused||cat.stranded||cat.userHeld||cat.motion||cat.climb||cat.previewPose)continue;
   const idle=cat.idle;if(!idle)continue;
   const sleeping=idle.pose==='sleep'||cat.settling?.idle===idle;
   if(sleeping){
    if(cat.support?.el!==tree.node||!cat.support.tree)continue;
    window.pixelCatSettlingV1?.wake(cat,t);
    idle.poseUntil=t;cat.deadline=t+1500;
    continue;
   }
   if(!g||cat.command||cat.goal||cat.play||cat.social?.episode||cat.route?.length||t<(cat.nextTreeAttentionAt||0))continue;
   const x=cat.x+12*cat.scale,y=cat.y-12*cat.scale;
   if(Math.hypot(ballX-x,ballY-y)>45*g.s)continue;
   cat.nextTreeAttentionAt=t+2500;
   if(cat.ensureMood().random()>=.45)continue;
   cat.facing=ballX<x?-1:1;cat.previewPose='glance';cat.forcedIdleUntil=t+1100;cat.deadline=t+1400;idle.poseUntil=t;
  }
 },
 impact(tree,strength=1,direction=1,shake=true){
  if(!tree)return;
  tree.impulses.push({at:tree.clock,strength,direction,shake});
  if(tree.impulses.length>8)tree.impulses.shift();
 },
 land(a){if(a.support?.tree)this.impact(a.catTree,1,a.facing);},
 tick(a,t){
  const g=this.geometry(a);if(!g)return;
  const {tree,s,x,y}=g,raw=t-(tree.last??t);tree.last=t;
  if(a.paused||a.layoutPaused||a.suspended||a.stranded||raw>1000)return;
  tree.clock+=Math.max(0,Math.min(50,raw));
  const bx=x+testTree.pivot.x*s,by=y+(testTree.pivot.y+testTree.length)*s;
  for(const [cat,entry] of a.decisionLayer()?.owners?.()||[[a,{root:a.root}]]){
   if(entry.root!==a.root||!cat.active||cat.paused||cat.suspended||cat.userHeld||cat.layoutPaused)continue;
   const placement=cat.social?.frame?.placement,cx=(placement?.x??cat.x)+12*cat.scale,cy=(placement?.top??cat.y-24*cat.scale)+14*cat.scale;
   const old=tree.pass.get(cat),near=Math.abs(cx-bx)<9*s&&Math.abs(cy-by)<10*s;
   if(near&&!old?.near&&old&&Math.abs(cx-old.x)>.1&&(cat.motion||cat.climb))this.impact(tree,.55,Math.sign(cx-old.x),false);
   tree.pass.set(cat,{x:cx,near});
  }
  tree.impulses=tree.impulses.filter(i=>tree.clock-i.at<2400);
  let angle=0,shift=0;
  const shakeLimit=.3*s;
  for(const i of tree.impulses){
   const elapsed=(tree.clock-i.at)/1000;
   angle+=i.direction*14*i.strength*Math.exp(-1.85*elapsed)*Math.sin(11*elapsed);
   if(i.shake)shift+=i.direction*i.strength*shakeLimit*Math.exp(-14*elapsed)*Math.sin(34*elapsed);
  }
  const angleCss='rotate('+Math.max(-14,Math.min(14,angle)).toFixed(2)+'deg)',shiftCss=Math.max(-shakeLimit,Math.min(shakeLimit,shift)).toFixed(2)+'px';
  if(tree.toy.style.transform!==angleCss)tree.toy.style.transform=angleCss;
  // Shake both visual layers together without moving the measured support.
  if(tree.node.style.translate!==shiftCss)tree.node.style.translate=shiftCss;
 }
};
