import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const option=()=>({}),select={value:'',options:[],replaceChildren(){this.options=[];},append(o){this.options.push(o);}};
const box={window:{},HTMLElement:class{},customElements:{get:()=>true,whenDefined:()=>Promise.resolve()},performance:{now:()=>1000},document:{createElement:option}};
for(const file of ['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js','pixel-cat-roaming.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),box);
vm.runInNewContext('globalThis.Home=PixelCatHome;',box);
const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
for(const scale of [1,2,3,4,5,6]){
 const root={getBoundingClientRect:()=>rect(0,0,1000,10000)},dock={getBoundingClientRect:()=>rect(20,80,600,28*scale)},a=Object.create(box.Home.prototype);
 root.children=Array.from({length:50},(_,i)=>({localName:'ha-card',config:{type:'tile',name:'Card '+i},parentElement:root,isConnected:true,hasAttribute:()=>false,getBoundingClientRect:()=>rect(650,100+i*160,300,140)}));
 Object.assign(a,{config:{arrival:'igloo',show_controls:false,debug_labels:false,mood_behaviour:true,social_behaviour:true,interaction_behaviour:true,dashboard_props:true,prop_reactions:true,landing_reactions:true,startle_followups:true,bed_style:'simple',use_surface_candidates:true,standard_surfaces:false},scale,surfaces:[],surfaceIds:new WeakMap(),nextSurfaceId:0,shadowRoot:{querySelector:s=>s==='.dock'?dock:select},worldRoot:()=>root,setAttribute(){},renderDebug(){}});
 a.measure();assert.equal(a.surfaces.length,103,'Retain all supports beyond the old cap');assert.ok(a.bedSurface);assert.equal(a.surfaces[1].id,'home:bed','Bed reserved before optional cards');assert.ok(a.surfaces.includes(a.home));assert.ok(select.options.some(o=>o.value==='home:bed'));
 box.window.pixelCatSetupV1.restSupport(a);assert.equal(a.support.id,'home:bed');a.measure();assert.equal(a.stranded,false,'Settling onto the simple bed survives the next layout reconciliation');assert.equal(a.support,a.bedSurface);
}
console.log('PASS: exact simple-bed/igloo-arrival settings on an oversized dashboard retain home+bed alongside all discovered supports, expose the bed destination and survive settling/re-measure at six scales.');
