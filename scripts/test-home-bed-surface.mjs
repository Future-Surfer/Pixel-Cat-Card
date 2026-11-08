import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},customElements:{whenDefined:()=>Promise.resolve()},performance:{now:()=>0}};
for(const f of ['pixel-cat-roaming-extras.js','prototype/cat-setup.js','prototype/cat-home-surfaces.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),box);
const setup=box.window.pixelCatSetupV1;
for(const scale of [1,2,3,4,5,6]){
 const h={id:'home',home:true,left:4,right:500,top:300,min:4,max:500-24*scale,rectSnapshot:{left:0,top:200,width:500,height:100}},a={config:{bed_style:'simple'},scale,home:h,support:h,surfaces:[h],x:22*scale,y:h.top,route:[],moveTo(x,y,d,kind,target){this.motion={fromX:this.x,fromY:this.y,x,y,cells:Math.round(Math.abs(x-this.x)/scale),kind,target};}};
 setup.surfaces(a);const b=a.bedSurface;assert.equal(b.top,h.top-3*scale);assert.equal(b.right-b.left,21*scale);assert.equal(b.rectSnapshot,h.rectSnapshot);b.min=b.max=(b.left+b.right-24*scale)/2;a.support=b;a.y=b.top;a.x=b.min;
 const destination={id:'another:top',min:400,max:450,top:100};a.route=[destination];assert.equal(setup.stepOff(a,destination,0),true);assert.equal(a.motion.kind,'walk');assert.equal(a.motion.target,h);assert.equal(a.route.length,1,'Remote route retained while stepping onto floor');
 const m=a.motion,heights=Array.from({length:m.cells+1},(_,step)=>setup.walkHeight(a,m,{step}));assert.equal(heights[0],b.top);assert.equal(heights.at(-1),h.top);for(let i=1;i<heights.length;i++)assert.ok(heights[i]-heights[i-1]>=0&&heights[i]-heights[i-1]<=scale,'No more than one native pixel lowered per planted clock step');
 a.support=h;a.x=m.x;a.y=h.top;a.route=[b];assert.equal(setup.stepOff(a,b,1000),true);assert.equal(a.motion.kind,'walk');assert.equal(a.route.length,0);assert.equal(setup.walkHeight(a,a.motion,{step:a.motion.cells}),b.top);
 a.config.show_home=false;setup.surfaces(a);assert.equal(a.bedSurface,null);
}
console.log('PASS: real small bed supports at six scales; shared cached geometry, planted incremental walk down/up, remote routes retained and hidden beds omitted.');
