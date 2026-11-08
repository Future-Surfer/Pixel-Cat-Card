import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const b={window:{},HTMLElement:class{},customElements:{get:()=>true},performance};for(const f of ['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-affordances.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),b);
const S=b.window.pixelCatSetupV1,art=b.window.pixelCatRoamingExtrasV1,bed=art.homeBeds.igloo;
// Decode the actual generated SVG path; compare its filled regions to source ink.
function polygons(path){const tokens=path.match(/[MHVhvz]|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi),out=[];let i=0,x=0,y=0,points=[];while(i<tokens.length){const op=tokens[i++];if(op==='M'){x=+tokens[i++];y=+tokens[i++];points=[[x,y]];}else if(op==='H')points.push([x=+tokens[i++],y]);else if(op==='V')points.push([x,y=+tokens[i++]]);else if(op==='h')points.push([x+=+tokens[i++],y]);else if(op==='v')points.push([x,y+=+tokens[i++]]);else if(op==='z')out.push(points);else throw Error(op);}return out;}
function visible(polys,x,y){return polys.some(p=>{let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [ax,ay]=p[i],[bx,by]=p[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;}return inside;});}
let cells=0;
for(const worldScale of [1,2,3,4,5,6])for(const ratio of [.5,1])for(const side of ['left','right'])for(const travel of ['enter','exit'])for(const scroll of [0,-83]){
 const scale=worldScale*ratio,left=100+22*worldScale,bottom=500+scroll,owner={worldScale,scale,config:{},home:{left:104,top:bottom},shadowRoot:{querySelector:()=>null}},placement={x:left-3*scale,top:bottom-24*scale},path=S.openingPath(owner,placement,scale,art,side),p=polygons(path),rest=polygons(S.openingPath(owner,placement,scale,art));
 const point=(x,y)=>[(left+x*worldScale-placement.x)/scale,(bottom-bed.height*worldScale+y*worldScale-placement.top)/scale];
 // Semantic contract: the near jamb cannot hide an entering/exiting body;
 // the far jamb must hide it. This deliberately rejects whole-shell clipping.
 assert.equal(visible(p,...point(side==='right'?16.5:4.5,8.5)),true,travel+' body stays in front on '+side);
 assert.equal(visible(p,...point(side==='right'?4.5:16.5,8.5)),false,travel+' body is hidden on opposite side');
 assert.equal(visible(p,...point(10.5,8.5)),true,'Head/body can occupy the doorway');
 for(let y=0;y<bed.height;y++){
  const row=bed.pixels[y],doorXs=row.flatMap((c,x)=>c?.toLowerCase()==='#19222b'?[x]:[]),edge=doorXs.length?(side==='left'?Math.min(...doorXs):Math.max(...doorXs)+1):(side==='left'?6:15);
  for(let x=0;x<bed.width;x++){
   const c=row[x],door=c?.toLowerCase()==='#19222b',outside=side==='left'?x<edge:x>=edge,xy=point(x+.5,y+.5);
   assert.equal(visible(p,...xy),door||outside,`Directional doorway: side=${side} scale=${worldScale}/${ratio} cell=${x},${y}`);
   assert.equal(visible(rest,...xy),door,`Rest remains aperture-only ${x},${y}`);cells++;
  }
 }
 assert.equal(visible(p,...point(side==='left'?bed.width+1:-1,bed.height/2)),false,'Opposite exterior cannot reveal the cat');
 assert.equal(visible(p,...point(side==='left'?-1:bed.width+1,bed.height/2)),true,'Approach side remains outside');
}
console.log(`PASS: ${cells} igloo cells, near side visible/far side hidden, doorway visibility, all four entry/exit cases, kitten/adult ratios, six scales and scroll translation; resting aperture preserved.`);
