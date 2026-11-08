// Export actual runtime samples for a small two-direction review GIF.
import fs from 'node:fs';import vm from 'node:vm';
const b={window:{},HTMLElement:class{},customElements:{get(){return true;}}};
vm.runInNewContext(['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','pixel-cat-behaviours.js','pixel-cat-roaming.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n')+'\nglobalThis.sample=startleSample;globalThis.plan=startlePlan;',b);
const clip=b.window.pixelCatRoamingExtrasV1.startle,surface={left:0,right:160,top:55},clips=[];
for(const sourceX of [110,20]){const m=b.plan(65,surface,1,sourceX,1,clip,0);clips.push({sourceX,label:sourceX>65?'Front disturbance: backward hop':'Rear disturbance: forward hop',samples:Array.from({length:29},(_,i)=>b.sample(m,i/28,clip,1))});}
fs.writeFileSync('.studio-data/startle-motion-samples.json',JSON.stringify(clips));
