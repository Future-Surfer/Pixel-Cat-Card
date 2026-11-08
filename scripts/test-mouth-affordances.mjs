import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const node=()=>({style:{},dataset:{},children:[],isConnected:true,attrs:{},setAttribute(k,v){this.attrs[k]=v;},append(n){this.children.push(n);},remove(){this.isConnected=false;},addEventListener(){},getContext(){return {clearRect(){},fillRect(){},set fillStyle(v){}};}});
const box={window:{},document:{hidden:false,createElement:node,body:node()},location:{pathname:'/test'},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>0},Math};
for(const f of ['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),box);
vm.runInNewContext('globalThis.api={Home:PixelCatHome,Scene:DashboardPropScene,art:CAT_ART,idleSample,frameContact,idleContact};',box);
const {Home,Scene,art,idleSample}=box.api,M=box.window.pixelCatMouthV1;
const record=JSON.parse(fs.readFileSync('frame-studio/user-sequences/mouth-actions-2026-10-16/eating.json','utf8'));
assert.equal(JSON.stringify(art.idleSequences.eat.frames),JSON.stringify(record.project.frames.map(f=>f.rows)),'Eating uses exact saved human pixels');assert.ok(art.idleSequences.eat.origins.every(o=>o==='human'));
function fixture(scale=2,facing=1){
 const root={},el={isConnected:true},s={id:'s:top',el,left:0,right:500*scale,top:200*scale,min:0,max:476*scale},home={...s,id:'home',home:true},scene=new Scene(root);
 const a={config:{interaction_behaviour:true,social_behaviour:true},active:true,isConnected:true,root,ownerKey:'cat',scale,facing,x:30*scale,y:s.top,support:s,home,surfaces:[s,home],route:[],layer:node(),svg:{style:{}},propScene:scene,attrs:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},removeAttribute(k){delete this.attrs[k];},ensureMood:()=>({random:()=>0,values:{playfulness:1}}),pathTo(target){return target===this.support?[]:[target];},cancelPlay(){M.cancel(this);this.play=null;this.toyHunt=null;scene.release(this.ownerKey);},observedToyPoint(p,s){return M.point(p,s);},toyPaw:()=>18,startToyBat(){this.batted=true;}};scene.join(a);
 const asset=art.dashboardProps.find(p=>p.id==='toy_mouse'),p={id:'toy',asset,node:node(),scale,u:.2,low:.05,high:.7,direction:1,moving:true,cooldownUntil:0,claimedBy:null,surfaceEl:el,surfaceSuffix:':top'};scene.props.push(p);return {a,p,s,home,scene};
}
for(const scale of [1,2,3,4,5,6])for(const facing of [-1,1]){
 const {a,p,s,scene}=fixture(scale,facing),clip=art.idleSequences.eat,rows=clip.frames[0];a.idle={pose:'eat'};a.attrs['data-frame']='idle-eat-1';
 const place={x:30*scale,top:s.top-24*scale},m=M.mouth(a,rows,place,art);assert.equal(m.x,place.x+(facing>0?19.5:4.5)*scale);assert.equal(m.y,place.top+22.5*scale,'Blind gaze still provides mouth position');
 const point=M.point(p,s);a.mouthPoint={x:point.x,y:point.y-scale};assert.equal(M.attach(a,p,0,art),false,'Unclaimed toys cannot be silently stolen');p.claimedBy='other';assert.equal(M.attach(a,p,0,art),false);p.claimedBy=a.ownerKey;assert.equal(M.attach(a,p,0,art),true);assert.equal(p.carrier,a.ownerKey);assert.equal(a.carriedToy,p.id);scene.release(a.ownerKey);assert.equal(p.claimedBy,a.ownerKey,'Ordinary play cleanup retains carrying ownership');assert.equal(M.attach(a,p,0,art),false,'One mouth holds one toy');
 M.frame(a,rows,[null,String(place.x),String(place.top)],10,art);const before=p.node.style.transform;a.facing=-facing;M.frame(a,rows,[null,String(place.x+10*scale),String(place.top-15*scale)],20,art);assert.notEqual(p.node.style.transform,before,'Facing, jump and frame placement move the attached toy');assert.equal(p.node.dataset.motion,'carried');
 a.mouthPoint={x:point.x,y:s.top-8*scale};a.mouthTransform=null;assert.equal(M.release(a,p,scene,100),true);assert.equal(p.carrier,null);assert.equal(p.claimedBy,null);assert.equal(p.lastInteractor,a.ownerKey);assert.ok(p.releaseFall);assert.ok(p.availableToOthersAt<p.cooldownUntil);assert.equal(a.carriedToy,null);
 for(let t=100;t<500;t+=50)M.carried(scene,p,t,[a]);assert.equal(p.releaseFall,null);assert.ok(p.u>=0&&p.u<=1);
}
{
 const {a,p,s,scene}=fixture();a.mouthPoint={...M.point(p,s),y:s.top-2};p.claimedBy=a.ownerKey;M.attach(a,p,0,art,true);a.isConnected=false;M.carried(scene,p,100,[]);assert.equal(p.carrier,null);assert.equal(p.claimedBy,null);assert.equal(a.carriedToy,null,'Removed cats release their toys');
 a.isConnected=true;p.claimedBy=a.ownerKey;M.attach(a,p,200,art,true);s.el.isConnected=false;M.disconnect(a);assert.equal(scene.props.includes(p),false,'No surface means safe removal rather than an orphaned prop');
}
function tickAction(a,until,frame=true){for(let t=0;t<=until;t+=50){if(a.route.length){a.support=a.route.at(-1).surface;a.x=a.route.at(-1).x;a.y=a.support.top;a.route=[];}M.step(a,t,art);if(frame&&a.previewPose){const f=idleSample(art,a.previewPose,t,a.config),anchor=f.anchor||[12,23],place={x:a.x,top:a.support.top-(anchor[1]+1)*a.scale};a.idle={pose:a.previewPose};a.attrs['data-frame']='idle-'+a.previewPose+'-'+(f.frame+1);M.frame(a,f.rows,[null,String(place.x),String(place.top)],t,art);}}}
{
 const {a,p,s}=fixture();a.config.social_behaviour=false;const point=M.point(p,s);assert.equal(M.begin(a,'pickup',{toy:p,s,...point},0,art),true);tickAction(a,1800);assert.equal(a.carriedToy,p.id,'Real eating frames make mouth contact and pick up');assert.equal(a.mouthAction,null);assert.equal(a.previewPose,null);
 a.config.toy_carrying=false;M.step(a,1850,art);assert.equal(a.carriedToy,null,'Disabling carrying releases an existing toy');
}
{
 const {a,p,s}=fixture();assert.equal(M.begin(a,'nose',{toy:p,s,...M.point(p,s)},0,art),true);tickAction(a,3200);assert.equal(a.carriedToy,undefined,'Nosing does not silently attach a toy');assert.equal(p.claimedBy,null);assert.equal(a.mouthAction,null);
}
{
 const {a,home}=fixture();a.support=home;a.config.social_behaviour=false;a.foodBowl={isConnected:true,getBoundingClientRect:()=>({left:14,right:22,bottom:home.top})};M.homes.add(a);const target=M.bowlTarget(a,a);assert.ok(target);assert.equal(M.begin(a,'food',target,0,art),true);tickAction(a,3200);assert.ok(a.mouthState.lastMeal>0,'Only actual eating contact records a meal');assert.equal(M.appetite(a,3250),0);assert.equal(M.offer(a,3300),false,'Repeated bowl clicks do not force another meal');
 a.config.show_home=false;assert.equal(M.bowlTarget(a,a),null,'Hidden bowls are not feeding targets');M.homes.delete(a);
}
{
 const {a,p,s}=fixture();a.pathTo=()=>null;assert.equal(M.begin(a,'pickup',{toy:p,s,...M.point(p,s)},0,art),false);assert.equal(p.claimedBy,null,'No route acquires no claim');a.pathTo=()=>[];assert.equal(M.begin(a,'pickup',{toy:p,s,...M.point(p,s)},0,art),true);a.goal='home';M.step(a,100,art);assert.equal(a.mouthAction,null);assert.equal(p.claimedBy,null,'Commands cancel approach claims');assert.equal(a.mouthState.lastMeal,undefined);
}
{
 const {a,p,s}=fixture();a.toyPaw=()=>18;a.play={stage:'pounce',landingX:M.point(p,s).x-18*a.scale,direction:1,toyId:p.id};p.claimedBy=a.ownerKey;M.step(a,0,art);assert.equal(a.carriedToy,p.id,'Confirmed pounce can become a carry');
 const f=fixture();f.a.toyPaw=()=>18;f.a.play={stage:'pounce',landingX:0,direction:1,toyId:f.p.id};f.p.claimedBy=f.a.ownerKey;M.step(f.a,0,art);assert.equal(f.a.carriedToy,undefined,'Missed pounces never become pickups');
}
{
 const {a,p,s}=fixture();a.config.social_behaviour=false;p.claimedBy=a.ownerKey;a.mouthPoint={x:100,y:s.top-10};M.attach(a,p,0,art,true);assert.equal(M.begin(a,'drop',{s,x:a.x+12*a.scale,y:a.y},0,art),true);tickAction(a,3300);assert.equal(a.carriedToy,null,'Look-down action releases carried toy');assert.equal(p.claimedBy,null);assert.equal(p.carrier,null);
}
{
 const {a,p,s,scene}=fixture();const b={ownerKey:'carrier',root:a.root,scale:2,x:150,support:s};scene.members.add(b);a.social={clock:100,propMemory:new Map([[p.id,{id:p.id,carrier:b.ownerKey,observedAt:100,surface:s.el,top:s.top,x:174}]]),clear:()=>true,log(){}};M.state(a,0);M.follow(a,0);assert.ok(a.route.length,'A recently noticed carried toy attracts following');assert.equal(p.claimedBy,null,'Following never steals the toy');a.route=[];a.mouthState.nextFollow=0;a.social.clock=1000;M.follow(a,0);assert.equal(a.route.length,0,'Stale/unseen carries do not attract magical following');
}
{
 const {a,home}=fixture();a.support=home;a.foodBowl={isConnected:true,getBoundingClientRect:()=>({left:14,right:22,bottom:home.top})};M.homes.add(a);a.motion={kind:'walk'};assert.equal(M.offer(a,0),a);assert.ok(a.mouthState.foodOffer,'An interested walking cat can finish its current movement first');a.motion=null;M.step(a,100,art);assert.equal(a.mouthAction.kind,'food');M.cancel(a);M.homes.delete(a);
}
{
 const {a,p,s,scene}=fixture();p.claimedBy=a.ownerKey;a.mouthPoint={x:100,y:s.top-10};M.attach(a,p,0,art,true);M.carried(scene,p,100,[a]);assert.equal(box.window.pixelCatInteractionsV1.world(a.root).props.get(p.id).carrier,a.ownerKey,'Carried props are visible to the existing observed-event system');
}
{
 const partial={window:{},performance:{now:()=>0}};vm.runInNewContext(fs.readFileSync('prototype/cat-mouth.js','utf8'),partial);const api=partial.window.pixelCatMouthV1;assert.doesNotThrow(()=>api.step({},0,{}));assert.doesNotThrow(()=>api.surfaces({config:{},surfaces:[]}));assert.doesNotThrow(()=>api.disconnect({}));
}
{
 const {a,home}=fixture(),dock={isConnected:true};const owner={active:true,root:a.root,ownerKey:'other',config:{name:'Other'},home:{...home,rectSnapshot:{left:0,top:100,width:500,height:100}},shadowRoot:{querySelector:()=>dock}};M.homes.add(owner);M.surfaces(a);const floor=a.surfaces.find(s=>s.foodOwner===owner);assert.ok(floor);assert.equal(floor.el,dock);assert.equal(floor.home,false);assert.equal(floor.rectSnapshot,owner.home.rectSnapshot,'Visitor floors reuse measured dock geometry');a.surfaces=[];owner.config.show_home=false;M.surfaces(a);assert.equal(a.surfaces.length,0);M.homes.delete(owner);
}
{
 const {a,p,s,scene}=fixture();p.asset=art.dashboardProps.find(p=>p.id==='ball');assert.equal(p.asset.mouthCarryable,true);assert.equal(M.begin(a,'pickup',{toy:p,s,...M.point(p,s)},0,art),true);tickAction(a,1800);assert.equal(a.carriedToy,p.id,'The ball uses the same real mouth-contact pickup as the mouse');
 let droppedBeforeCancel=false;const cancel=a.cancelPlay;a.cancelPlay=function(){droppedBeforeCancel=!p.carrier;cancel.call(this);};
 a.x=120;a.y=s.top;a.support=s;a.mouthPoint={x:140,y:s.top-5};assert.equal(Home.prototype.requestStartle.call(a,{x:200},2000),true);assert.equal(droppedBeforeCancel,true);assert.equal(a.motion.kind,'startle');assert.equal(p.carrier,null);assert.ok(p.releaseFall);assert.equal(a.mouthState.possessiveToy,p.id,'Startle does not erase short-lived toy interest');
 a.motion=null;p.releaseFall=null;p.cooldownUntil=0;scene.time=3000;assert.equal(M.reclaim(a,2200,art),true,'A noticed, free nearby former toy can be reclaimed');M.cancel(a);a.mouthState.clock=a.mouthState.possessiveUntil+1;assert.equal(M.reclaim(a,2300,art),false,'Possessiveness expires');
}
{
 const {a,p,s}=fixture();p.asset={...p.asset,mouthCarryable:false};assert.equal(M.begin(a,'pickup',{toy:p,s,...M.point(p,s)},0,art),false);p.claimedBy=a.ownerKey;assert.equal(M.attach(a,p,0,art,true),false,'Even pounce contact cannot override a prop pickup opt-out');
}
{
 const {a,home}=fixture();a.support={...home,id:'home:bed',bed:true,left:60,right:102,min:57,max:57,top:home.top-6};a.x=57;a.y=a.support.top;a.surfaces.push(a.support);assert.equal(Home.prototype.requestStartle.call(a,{x:30},0),true,'Small bed can startle onto its wider home floor');assert.equal(a.motion.target,home);assert.equal(a.motion.y,home.top);assert.equal(a.motion.flight.end.y-a.motion.flight.start.y,6,'Bed hop retains the real downward landing height');
}
{
 const {a,p,s,scene}=fixture();p.claimedBy=a.ownerKey;a.mouthPoint={x:100,y:s.top-24};M.attach(a,p,0,art,true);M.release(a,p,scene,100);M.carried(scene,p,100,[a]);
 const position=()=>p.node.style.transform.match(/translate\(([-\d.]+)px,([-\d.]+)px\)/).slice(1).map(Number),before=position(),elapsed=p.releaseFall.elapsed;
 const shifted={...s,left:s.left+12.25,right:s.right+12.25,top:s.top-35.5};a.surfaces=[shifted];a.support=shifted;M.carried(scene,p,100,[a]);
 assert.deepEqual(position(),[before[0]+12.25,before[1]-35.5],'A released toy follows fractional support scrolling without resetting its fall');assert.equal(p.releaseFall.elapsed,elapsed);
 a.paused=true;shifted.top-=9.5;M.carried(scene,p,150,[a]);assert.equal(p.releaseFall.elapsed,elapsed,'Manual pause freezes drop progress');assert.equal(position()[1],before[1]-45,'Paused drops still follow scrolling, including in-place geometry updates');a.paused=false;
 shifted.el.isConnected=false;M.carried(scene,p,110,[a]);assert.equal(scene.props.includes(p),false,'Removing the landing support during a release fall cannot leave an orphan');
}
console.log('PASS: exact eating art; blind/raw mouth origins, six scales/both facings, ownership, pose/jump attachments, release/fall/removal, real nibble/nose/food contact, meal cooldown, unreachable and interrupted approaches, pounce hit versus miss.');
