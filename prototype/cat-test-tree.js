/* Fixed test furniture. Geometry is in native furniture cells; the pose planner
   still checks each landing and grip in the individual actor's scale. */
const testTree={width:48,height:36,platform:{left:1,right:47,top:5},rope:{left:22,right:28,top:9,bottom:33},pivot:{x:36,y:9},length:11};
const treeInk=[
 [1,33,46,2,'#ab7135'],[3,35,42,1,'#754726'],
 [22,9,6,24,'#ad9969'],[23,9,4,24,'#d7c490'],
 [1,5,46,1,'#c58d4b'],[0,6,48,3,'#ab7135'],[1,9,46,1,'#754726']
];
window.pixelCatTreeV1={
 mount(a){
  const dock=a.shadowRoot?.querySelector('.dock'),s=a.worldScale||a.scale;
  if(!dock)return;
  const fits=a.config.test_cat_tree===true&&a.config.show_home!==false&&(a.config.show_scratching_post??a.config.scratching_posts??true)!==false&&dock.clientWidth>=100*s;
  if(!fits){if(a.catTree){a.catTree.node.remove();delete a.catTree;}if(dock.style?.getPropertyValue('--test-tree-height'))dock.style.removeProperty('--test-tree-height');return;}
  if(a.catTree?.node.parentNode===dock&&a.catTree.scale===s)return;
  a.catTree?.node.remove();
  const node=document.createElement('div'),canvas=document.createElement('canvas'),toy=document.createElement('canvas');
  node.setAttribute('role','img');node.setAttribute('aria-label','Cat tree with hanging ball');
  node.style.cssText='position:absolute;bottom:0;right:0;pointer-events:none;width:'+testTree.width*s+'px;height:'+testTree.height*s+'px';
  canvas.width=testTree.width;canvas.height=testTree.height;
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
  const c=canvas.getContext('2d');
  for(const [x,y,w,h,colour] of treeInk){c.fillStyle=colour;c.fillRect(x,y,w,h);}
  c.fillStyle='#e5d6ab';for(let y=10;y<33;y+=3)c.fillRect(23,y,4,1);
  toy.width=7;toy.height=15;toy.style.cssText='position:absolute;image-rendering:pixelated;transform-origin:50% 0;left:'+(testTree.pivot.x-3.5)*s+'px;top:'+testTree.pivot.y*s+'px;width:'+7*s+'px;height:'+15*s+'px';
  const b=toy.getContext('2d');b.fillStyle='#754726';b.fillRect(3,0,1,10);b.fillStyle='#ab7135';b.fillRect(1,10,5,4);b.fillStyle='#c58d4b';b.fillRect(2,9,3,4);
  node.append(canvas,toy);dock.append(node);dock.style.setProperty('--test-tree-height',60*s+'px');
  a.catTree={node,canvas,toy,scale:s,pass:new WeakMap(),clock:0,impulses:[]};
 },
 geometry(a){
  const tree=a.catTree,h=a.home;if(!tree||!h||tree.node.isConnected===false)return null;
  return {tree,s:tree.scale,x:h.right+4-testTree.width*tree.scale,y:h.top-testTree.height*tree.scale};
 },
 surfaces(a){
  const g=this.geometry(a);if(!g)return;
  const {tree,s,x,y}=g,p=testTree.platform,r=a.home.rectSnapshot;
  a.surfaces.push({id:'home:test-tree',el:tree.node,rectNode:a.home.rectNode,rectSnapshot:r,left:x+p.left*s,right:x+p.right*s,top:y+p.top*s,label:'Cat tree · platform',source:'authored tree',tree:true});
 },
 face(a){
  const g=this.geometry(a);if(!g)return null;
  const {s,x,y}=g,r=testTree.rope,centre=x+(r.left+r.right)*s/2;
  const rect={left:x+r.left*s,right:x+r.right*s,top:y+r.top*s,bottom:y+r.bottom*s};
  return {id:'home:test-tree:rope',rect,grips:{left:centre,right:centre,top:rect.top+2*s,bottom:rect.bottom-2*s},generation:0};
 },
 preferred(a,target,origin){
  if(!target?.tree||!origin?.home||!a.catTree||a.ensureMood().random()>=.7)return null;
  return window.pixelCatCardClimbV1?.treeRoute(a,target,origin);
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
