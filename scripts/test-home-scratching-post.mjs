import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const b={window:{},document:{createElement(){return {dataset:{},style:{},isConnected:true,setAttribute(){},getContext(){return {fillRect(){},set fillStyle(v){}};}};}}};
for(const f of ['prototype/cat-home-posts.js','prototype/cat-vertical-scratch.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),b);
const h=b.window.pixelCatHomePostsV1,v=b.window.pixelCatVerticalScratchV1,root={},asset={id:'scratching_post',affordance:'scratch',width:12,height:23,pixels:Array.from({length:23},()=>Array(12).fill('#aa6627'))};
for(const scale of [1,2,3,4,5,6]){
 const dock={clientWidth:100*scale,append(n){this.node=n;}},a={active:true,isConnected:true,ownerKey:'home-'+scale,root,config:{dashboard_props:false},scale,home:{id:'home',el:{},left:4,right:100*scale-4,min:4,max:100*scale-24*scale,top:400},shadowRoot:{querySelector:()=>dock},pathTo:()=>[],ensureMood:()=>({random:()=>.5})};a.support=a.home;a.surfaces=[a.home];
 const layer={actor:a,owners:()=>[[a,{root}]],world:{clock:1000,props:new Map()},clear:()=>true,corridor:()=>true,available:()=>true,scene:new Map(),clock:1000,log(){},enabled:()=>true};
 h.render(a,{dashboardProps:[asset]});assert.ok(a.homePost);assert.equal(a.homePost.scale,scale);assert.equal(a.homePost.node.style.display,'');const p=a.homePost;h.render(a,{dashboardProps:[asset]});assert.equal(a.homePost,p,'No redraw or claim replacement on repeated render');
 h.publish(layer);assert.ok(layer.world.props.has(p.id),'Stationary home post enters normal gaze/dwell perception');
 const faces=v.faces(layer);assert.equal(faces.length,2);assert.equal(faces[0].prop,p);assert.ok(v.start(layer,faces[0],1000));assert.equal(p.claimedBy,a.ownerKey);assert.ok(a.route.length);a.route=[];a.x=faces[0].origin;a.y=400;v.advance(layer,1100);assert.equal(layer.episode.stage,'stroke','Home post works with dashboard toys disabled');v.release(layer);assert.equal(p.claimedBy,null);assert.ok(p.cooldownUntil>layer.world.clock);
 a.config.show_home=false;h.sync(a);assert.equal(a.homePost.node.style.display,'none');assert.equal(h.entries(layer).length,0);a.config.show_home=true;a.config.show_scratching_post=false;h.sync(a);assert.equal(h.entries(layer).length,0);
 a.config.show_scratching_post=true;h.sync(a,40*scale);assert.equal(p.node.style.display,'none','Narrow home does not overlap the bed');h.sync(a,100*scale);assert.equal(h.entries(layer).length,1);a.root={};assert.equal(h.entries(layer).length,0,'No cross-view post targets');
}
console.log('PASS: default native-scale home post, cached drawing, gaze publication, two reusable scratch faces, real approach/stroke/claim cleanup without shared toys, visibility/narrow-layout/view guards at six scales.');
