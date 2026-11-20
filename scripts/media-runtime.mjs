import {readmeRuntime} from './readme-assets.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {runtimeFiles} from './build-release.mjs';

export function mediaRuntimeHash(){return createHash('sha256').update(runtimeFiles.map(file=>file+'\0'+fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')).join('\0')).digest('hex');}

// Minimal in-memory paint target: capture the release's own prop rendering.
export function mediaElement(){
 const node={style:{setProperty(){}},dataset:{},attrs:{},children:[],ops:[],isConnected:true,
  append(...nodes){this.children.push(...nodes);for(const n of nodes)n.parentNode=this;},
  setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},remove(){this.isConnected=false;}};
 const context={fillStyle:'#000000',fillRect(x,y,w,h){node.ops.push({x,y,w,h,c:this.fillStyle});},clearRect(){node.ops=[];}};
 node.getContext=()=>context;return node;
}
export function mediaRuntime(){return readmeRuntime({document:{createElement:mediaElement,createElementNS:mediaElement}});}

export function releaseSceneAssets(api){
 const dock=mediaElement();dock.clientWidth=1000;
 const actor={config:{post_type:'tree'},scale:1,worldScale:1,shadowRoot:{querySelector:()=>dock}};
 api.window.pixelCatTreeV1.mount(actor);
 const {model,canvas,toy}=actor.catTree;
 const pixels=Array.from({length:model.height},()=>Array(model.width).fill(null));
 const paint=(ops,dx=0,dy=0)=>{for(const r of ops)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(pixels[y+dy]?.[x+dx]!==undefined)pixels[y+dy][x+dx]=r.c;};
 paint(canvas.ops);paint(toy.ops,model.pivot.x-3,model.pivot.y);
 return {box:api.window.pixelCatBoxV1.asset,tree:{id:'release-cat-tree',width:model.width,height:model.height,pixels,platforms:model.platforms,ropes:model.ropes,source:'pixelCatTreeV1.mount'}};
}
