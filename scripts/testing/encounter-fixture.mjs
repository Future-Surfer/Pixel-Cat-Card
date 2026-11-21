import fs from 'node:fs';import vm from 'node:vm';
import {seededMath,testSeed} from './random.mjs';
export function encounterFixture(scale=2){
 let time=1000;
 const box={Math:seededMath(testSeed()),window:{},HTMLElement:class{},customElements:{get:()=>true},performance:{now:()=>time},requestAnimationFrame(){}};
 vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n')+'\nglobalThis.api={Home:PixelCatHome,CatMood,owners:CAT_OWNERS,art:CAT_ART,walkSample,walkAppearance,frameContact,idleContact};',box);
 const {Home,CatMood,owners,art}=box.api,root={},surface={id:'floor:top',el:{isConnected:true},left:0,right:1200,top:400,min:0,max:1200-24*scale};
 function cat(id,x,pose='sit'){
  const rows=art.idleSequences[pose]?.frames[0]||art.stand,attrs={};
  const a=Object.assign(Object.create(Home.prototype),{ownerKey:id,root,config:{interaction_behaviour:true,social_behaviour:true,mood_behaviour:true,playful_pounces:false,toy_hunting:false},active:true,scale,size:24*scale,facing:1,x,y:400,support:surface,surfaces:[surface],home:{...surface,el:{},home:true,id:'home'},route:[],deadline:Infinity,walkSteps:0,lastTick:1000,checkAt:Infinity,debugAt:Infinity,debugOrganized:true,needsMeasure:false,layer:{style:{}},svg:{style:{}},shadowRoot:{querySelector:()=>null},worldRect:{top:0},idle:{pose,rows,placement:{x,top:400-24*scale},start:1000,poseUntil:Infinity,support:surface.id,contactX:x+10*scale},setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k];},removeAttribute(k){delete attrs[k];},status(){},pathTo:()=>[],invalidate(){},draw(rows){this.drawnRows=rows;this.svg.style.transform=`translate(${this.x}px,${this.y-24*scale}px)`;}});
  a.mood=new CatMood(id);a.mood.held=true;a.social=new box.window.pixelCatDecisionsV1(a,()=>owners,()=>art);a.social.frame={rows,placement:{...a.idle.placement},facing:1,gaze:{x:15,y:9,angle:0,fov:360,canSee:true}};owners.set(a,{root});return a;
 }
 return {box,api:box.api,surface,cat,get time(){return time;},tick(a,dt=16){time+=dt;a.tick(time);}};
}
