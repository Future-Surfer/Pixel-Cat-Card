import fs from 'node:fs';import vm from 'node:vm';
import {runtimeFiles} from './build-release.mjs';
// Same DOM-free release harness as the contact/track tests. Reuse its clocks.
export function readmeRuntime(){
 const box={window:{},HTMLElement:class{},customElements:{get:()=>true}};
 const expose='\nglobalThis.api={art:CAT_ART,walkSample,walkAppearance,walkTimings,travelSpeed,groundedFront,idleSample,frameContact,idleContact,idleTransitionContact};';
 vm.runInNewContext(runtimeFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n')+expose,box,{timeout:10000});
 return {...box.api,window:box.window};
}
export function readmeAssets(runtime=readmeRuntime()){
 const {art,window}=runtime,owner={config:{bed_style:'simple',bed_primary_color:'#52616c',bed_secondary_color:'#adc1bf'}};
 const bed=window.pixelCatSetupV1.bed(owner,art);
 return {bed:{...bed,pixels:bed.pixels.map(row=>row.map(c=>c?window.pixelCatSetupV1.bedColour(owner,c):c))},post:art.dashboardProps.find(p=>p.id==='scratching_post'),bowl:art.homeProps.bowl};
}
