import fs from 'node:fs';import vm from 'node:vm';
import {runtimeFiles} from './build-release.mjs';
export function readmeAssets(){
 const box={window:{},HTMLElement:class{},customElements:{get:()=>true}};
 for(const file of runtimeFiles)vm.runInNewContext(fs.readFileSync(file,'utf8'),box,{timeout:10000});
 const art=box.window.pixelCatRoamingArtV2,extras=box.window.pixelCatRoamingExtrasV1,extension=box.window.pixelCatRoamingExtensionsV1;
 return {bed:extras.homeBeds.igloo,post:extension.dashboardProps.find(p=>p.id==='scratching_post'),bowl:extras.homeProps.bowl,
  clips:{...art.idleSequences,...extras.idleSequences,...extension.idleSequences,walk:{frames:art.walk,durations:art.walk.map(()=>160),roles:art.walk.map(()=> 'cycle')}}};
}
