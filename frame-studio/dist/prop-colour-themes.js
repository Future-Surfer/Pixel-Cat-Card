export const PROP_COLOUR_THEMES=[
 {id:'quiet',name:'Quiet neutrals',pairs:[['#b7a895','#62717c'],['#aeb5b1','#75695f']]},
 {id:'colourful',name:'Colourful',pairs:[['#386fd6','#e96c54'],['#249889','#e4b448']]},
 {id:'pastel',name:'Soft pastels',pairs:[['#b9a1d8','#edb2a1'],['#91c3b2','#dfa6ba']]},
 {id:'monochrome',name:'Greyscale',pairs:[['#aaaaaa','#666666'],['#bbbbbb','#777777']]},
 {id:'pink',name:'All pink',pairs:[['#d78fae','#973f6d'],['#e27cab','#b0719f']]},
 {id:'natural',name:'Natural materials',pairs:[['#8e9c64','#b87350'],['#c3a273','#78563e']]}
];
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex=values=>'#'+values.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
export function colourProposals(asset){
 const colours=[...new Set(asset.pixels.flat().filter(Boolean).map(c=>c.toLowerCase()))].sort();
 const map=(pair,gamma=1)=>Object.fromEntries(colours.map(c=>{const v=rgb(c),hi=Math.max(...v),lo=Math.min(...v),light=(hi+lo)/510;
  // Keep outlines, highlights and transparency; brightness retains authored shading.
  if(light<.15||light>.94)return [c,c];
  const channel=hi===v[2]||v[0]>v[1]*1.25&&v[2]>v[1]*1.1?1:0,target=rgb(pair[channel]),base=Math.max(...target)/255,factor=Math.pow(light,gamma)/Math.max(.2,base);
  return [c,hex(target.map(n=>n*factor))];}));
 return {version:1,origin:'ai',review:'candidate',sourceRevision:asset.revision,notes:'Draft palette interpretation; original pixels and catalogue identity are unchanged. Review material/functional colours before runtime use.',themes:PROP_COLOUR_THEMES.map(t=>({id:t.id,name:t.name,variants:t.pairs.map((p,i)=>({name:'Option '+(i+1),colours:map(p,t.id==='monochrome'&&i===1?1.3:1)}))}))};
}
export function renderColourProposals(container,asset){
 container.replaceChildren();container.hidden=!asset?.colourVariants;if(!asset?.colourVariants)return;
 const summary=document.createElement('summary');summary.textContent='Colour themes · AI proposals';container.append(summary);
 const note=document.createElement('p');note.className='hint';note.textContent='Review only · two options per style. Original pixels, catalogue entries and live props are unchanged.';container.append(note);
 for(const theme of asset.colourVariants.themes){const row=document.createElement('div');row.className='prop-theme-row';const name=document.createElement('span');name.textContent=theme.name;row.append(name);
  for(const variant of theme.variants){const zoom=Math.max(1,Math.min(8,Math.floor(96/Math.max(asset.width,asset.height)))),canvas=document.createElement('canvas');canvas.width=asset.width;canvas.height=asset.height;canvas.style.cssText=`width:${asset.width*zoom}px;height:${asset.height*zoom}px;image-rendering:pixelated;max-width:100%;background:#9ba8b633`;canvas.title=theme.name+' · '+variant.name+' · draft';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',canvas.title);const c=canvas.getContext('2d');asset.pixels.forEach((r,y)=>r.forEach((v,x)=>{if(v){c.fillStyle=variant.colours[v.toLowerCase()]||v;c.fillRect(x,y,1,1);}}));row.append(canvas);}container.append(row);
 }
}
