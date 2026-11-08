import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const svgNode=()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},append(){}});
const canvases=[];const document={createElementNS:()=>svgNode(),createElement(){const c={dataset:{},style:{},pixels:[],setAttribute(){},getContext(){let colour;return {set fillStyle(v){colour=v;},fillRect:(x,y)=>c.pixels.push({x,y,colour})};}};canvases.push(c);return c;}};
const box={window:{},document,HTMLElement:class{},customElements:{get:()=>true}};
for(const f of ['pixel-cat-roaming-art.js','pixel-cat-roaming-extras.js','prototype/cat-setup.js','pixel-cat-roaming.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),box);
vm.runInNewContext('globalThis.Home=PixelCatHome;',box);const setup=box.window.pixelCatSetupV1,art={...box.window.pixelCatRoamingArtV2,...box.window.pixelCatRoamingExtrasV1},bed=art.homeBeds.igloo,original=JSON.stringify(bed),bowl=art.homeProps.bowl;
assert.equal(bowl.origin,'human');assert.equal(bowl.source.file,'pixel-pet-card.js');
for(const scale of [1,2,3,4,5,6]){
 const installed={},dock={style:{},querySelector:key=>({replaceWith:c=>installed[key]=c})},a=Object.assign(Object.create(box.Home.prototype),{shadowRoot:{querySelector:()=>dock}});
 a.setConfig({cell_size:scale,igloo_color:'#4e86ae'});assert.equal(a.scale,scale);assert.equal(a.getGridOptions().columns,scale>3?12:6);setup.renderHome(a,art);assert.equal(dock.style.height,28*scale+'px');assert.equal(installed['.bowl'].width,bowl.width);assert.equal(installed['.mat'].width,bed.width);assert.match(installed['.bowl'].style.cssText,new RegExp('width:'+bowl.width*scale+'px'));assert.match(installed['.mat'].style.cssText,new RegExp('width:'+bed.width*scale+'px'));assert.match(installed['.mat'].style.cssText,new RegExp('left:'+22*scale+'px'));
 for(const p of installed['.mat'].pixels)assert.equal(p.colour,setup.bedColour(a,bed.pixels[p.y][p.x]),'Shell shades follow the primary palette');assert.deepEqual(installed['.bowl'].pixels.map(p=>p.colour),Array.from(bowl.pixels.flat().filter(Boolean)));const count=canvases.length;setup.renderHome(a,art);assert.equal(canvases.length,count,'Settled home is not repainted per frame');
}
assert.equal(JSON.stringify(bed),original,'Original human pixels are immutable');const large=Object.create(box.Home.prototype);large.setConfig({cell_size:99});assert.equal(large.scale,6);
console.log('PASS: scales 1–6 reach actual home geometry, original bowl/bed pixels, canvas sizes and layout; shell tint preserves doorway and source art; larger homes request full width; settled homes render once.');

// Exact saved art, independent palettes, and authored lining heights in both facings.
const saved=JSON.parse(fs.readFileSync('frame-studio/user-sequences/beds-2026-10-16/saved-changes.json','utf8'));
for(const e of saved){const bed=art.homeBeds[e.name==='Simple Bed'?'simple':'igloo'];assert.equal(JSON.stringify(bed.pixels),JSON.stringify(e.snapshot.pixels));assert.equal(bed.origin,'human');assert.equal(bed.revision,e.snapshot.revision);assert.equal(bed.versionHash,e.versionHash);}
for(const scale of [1,2,3,4,5,6])for(const style of ['simple','igloo'])for(const facing of [-1,1]){
 const a={config:{bed_style:style,bed_primary_color:'#4488cc',bed_secondary_color:'#cc4488'},scale,facing,x:20*scale,support:{home:true,left:4,top:200},idle:{pose:'loaf'},svg:{style:{},firstElementChild:svgNode(),append(){}}},p={x:20*scale,top:200-24*scale};
 assert.equal(setup.bed(a,art),art.homeBeds[style]);assert.equal(setup.bedColour(a,'#aa6627'),'#4488cc');assert.notEqual(setup.bedColour(a,style==='simple'?'#804b19':'#744316'),'#4488cc');assert.equal(setup.bedColour(a,style==='simple'?'#964252':'#19222b'),'#cc4488');if(style==='simple')assert.notEqual(setup.bedColour(a,'#762837'),'#cc4488');
 const start=setup.restPlacement(a,p,art.loaf,art,0);assert.equal(start.top,p.top);const rest=setup.restPlacement(a,p,art.loaf,art,200);assert.equal(rest.top,p.top-(style==='simple'?3:1)*scale);assert.equal(rest.x%scale,0);assert.equal(!!a.svg.firstElementChild.attrs['clip-path'],style==='igloo');if(style==='igloo')assert.match(a.bedMask.shape.attrs.d,/h1v1h-1z/);
 a.support.home=false;assert.equal(setup.restPlacement(a,p,art.loaf,art,300),p);assert.equal(a.svg.style.clipPath,'','Foreign supports never clip or lift');a.support.home=true;a.config.show_home=false;assert.equal(setup.restPlacement(a,p,art.loaf,art,400),p);
}
assert.equal(setup.arrival({config:{bed_style:'simple'}},0),false,'Open beds do not use a doorway reveal');
console.log('PASS: exact saved beds, two palette channels with derived shadows, six scales/both facings, lining offsets, entrance masking and foreign/hidden/arrival guards.');
