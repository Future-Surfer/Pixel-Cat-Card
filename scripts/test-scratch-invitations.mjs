import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
let now=1000;const node=()=>({dataset:{},style:{},isConnected:true,attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.events[k]=f;},getContext(){return {fillRect(){}};}});
const b={window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>now},document:{createElement:node}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.attract=PixelCatHome.prototype.attractToClick;globalThis.available=window.pixelCatDecisionsV1.prototype.available;globalThis.art=CAT_ART;',b);
const v=b.window.pixelCatVerticalScratchV1,h=b.window.pixelCatHomePostsV1;
function setup(kind,scale=2){
 const root={},el={},surface={id:'card:floor',el,left:0,right:600*scale,min:0,max:576*scale,top:400},members=[],scene={enabled:true,time:1000,props:[]},registry=new Map();
 const make=(name,x,random=.1)=>{const a={ownerKey:name,root,scale,active:true,isConnected:true,config:{interaction_behaviour:true,social_behaviour:true},x:x*scale,y:400,home:surface,support:surface,surfaces:[surface],propScene:scene,route:[],idle:{pose:'sit'},pathTo:()=>[],ensureMood:()=>({values:{sleepiness:.2},random:()=>random})};
  const layer={actor:a,world:{clock:1000,props:new Map()},scene:registry,clock:1000,enabled:()=>!!a.config.interaction_behaviour,available:b.available,clear:()=>true,corridor:()=>true,log(){},owners:()=>members.map(a=>[a,{root:a.root}])};a.decisionLayer=()=>layer;members.push(a);return a;};
 const owner=make('owner',15),near=make('near',48),far=make('far',100);let p;
 if(kind==='home'){const dock={clientWidth:600*scale,append(){}};owner.shadowRoot={querySelector:()=>dock};h.render(owner,b.art);p=owner.homePost;for(const a of [near,far])a.surfaces=[{...surface,bedOwner:owner}];}
 else {p={id:'loose',asset:b.art.dashboardProps.find(p=>p.id==='scratching_post'),node:node(),scale,u:.1,surfaceEl:el,surfaceSuffix:':floor',cooldownUntil:0};scene.props=[p];v.bind(p,()=>members,root);}
 return {p,owner,near,far,members,root,scene,make};
}
for(const kind of ['home','loose'])for(const scale of [1,2,3,4,5,6]){
 let w=setup(kind,scale);const {p,root,members}=w;assert.equal(p.node.attrs.role,'button');assert.equal(p.node.attrs.tabindex,'0');assert.equal(p.node.style.pointerEvents,'auto');
 // One closest willing cat claims a real routed scratch; other cats stay independent.
 const result=v.invite(p,members,root,now);assert.equal(result,w.near);const layer=result.decisionLayer();assert.equal(p.claimedBy,result.ownerKey);assert.equal(layer.episode.stage,'approach');assert.equal(members.filter(a=>a.route.length).length,1);
 result.route=[];result.x=surfaceOrigin(layer,p);v.advance(layer,1100);assert.equal(layer.episode.stage,'stroke');v.release(layer);assert.equal(p.claimedBy,null);assert.ok(p.cooldownUntil>1000);assert.equal(v.invite(p,members,root,now+5000),false,'Scratch cooldown is respected');
 w=setup(kind,scale);w.near.ensureMood=()=>({values:{sleepiness:.2},random:()=>.99});assert.equal(v.invite(w.p,w.members,w.root,now),w.owner,'A closer cat can decline independently');
 w=setup(kind,scale);for(const a of w.members)a.ensureMood=()=>({values:{sleepiness:.2},random:()=>.99});assert.equal(v.invite(w.p,w.members,w.root,now),false,'All cats may decline');assert.equal(w.p.node.dataset.scratchResponse,'no nearby willing cat');
 w=setup(kind,scale);for(const a of w.members)a.paused=true;assert.equal(v.invite(w.p,w.members,w.root,now),false);for(const a of w.members)a.paused=false;assert.equal(v.invite(w.p,w.members,w.root,now+1),false,'Repeated clicks cannot resample immediately');
 for(const flag of ['suspended','stranded','userHeld','command','mouthAction','play','previewPose','motion']){w=setup(kind,scale);for(const a of w.members)a[flag]=true;assert.equal(v.invite(w.p,w.members,w.root,now),false,flag);}
 w=setup(kind,scale);for(const a of w.members)a.idle.pose='sleep';assert.equal(v.invite(w.p,w.members,w.root,now),false,'Do not wake sleepers');
 w=setup(kind,scale);for(const a of w.members)a.x=2000*scale;assert.equal(v.invite(w.p,w.members,w.root,now),false,'No distant summoning');
 w=setup(kind,scale);for(const a of w.members)a.pathTo=()=>null;assert.equal(v.invite(w.p,w.members,w.root,now),false,'Safe route required');
 w=setup(kind,scale);for(const a of w.members)a.root={};assert.equal(v.invite(w.p,w.members,w.root,now),false,'No cross-view invitations');
 w=setup(kind,scale);for(const a of w.members)a.config.interaction_behaviour=false;assert.equal(v.invite(w.p,w.members,w.root,now),false,'Feature opt-out');
 w=setup(kind,scale);w.owner.config.show_home=false;if(kind==='loose')w.scene.props=[];assert.equal(v.invite(w.p,w.members,w.root,now),false,'Hidden/removed post cannot invite');
 w=setup(kind,scale);let stopped=0,prevented=0;w.p.node.events.keydown({key:'Enter',stopPropagation(){stopped++;},preventDefault(){prevented++;}});assert.equal(stopped,1);assert.equal(prevented,1);assert.ok(w.p.claimedBy,'Keyboard activation takes the same real path');
 if(kind==='home'){w=setup(kind,scale);const p=w.p;p.homeOwner.ownerKey='mounted-owner';h.sync(p.homeOwner);assert.equal(p.id,'home-post-mounted-owner');
  const freshRoot={};for(const a of w.members)a.root=freshRoot;p.node.events.click({stopPropagation(){}});assert.ok(p.claimedBy,'Binding resolves the current mounted root, not the pre-connect root');}
}
function surfaceOrigin(layer,p){const held=p.claimedBy;p.claimedBy=null;const f=v.faces(layer).find(f=>f.id===layer.episode.faceId);p.claimedBy=held;return f.origin;}
const clicked={dataset:{catPost:''}},clickRoot={},observer={root:clickRoot,config:{},blocked:()=>false,get surfaces(){throw Error('Post clicks must not plan card attention');}};b.attract.call(observer,{button:0,composedPath:()=>[clicked,{localName:'ha-card'},clickRoot]});
console.log('PASS: home/loose click and keyboard invitations, optional nearest willing selection, one real approach/stroke/claim, six scales, cooldown/debounce, sleepers/busy/disabled/remote/unreachable/hidden/other-view guards.');
