// Shared public-card setup. Legacy card types stay usable without picker entries.
window.pixelCatSetupV1={
 bed(a,art){return art.homeBeds?.[a.config.bed_style==='simple'?'simple':'igloo']||art.propCatalogue?.find(p=>p.id==='dd2bda18-62a3-4f52-972e-e6abe3b7df83');},
 shade(colour,factor){const hex=/^#([a-f\d]{3}|[a-f\d]{6})$/i.exec(colour||'');if(!hex)return `color-mix(in srgb, ${colour} ${factor*100}%, black)`;const value=hex[1].length===3?[...hex[1]].map(v=>v+v).join(''):hex[1];return '#'+[0,2,4].map(i=>Math.round(parseInt(value.slice(i,i+2),16)*factor).toString(16).padStart(2,'0')).join('');},
 bedColour(a,colour){
  const simple=a.config.bed_style==='simple',primary=a.config.bed_primary_color||a.config.igloo_color,secondary=a.config.bed_secondary_color,c=colour.toLowerCase();
  if(primary&&c==='#aa6627')return primary;
  if(primary&&c===(simple?'#804b19':'#744316'))return this.shade(primary,simple?.75:.68);
  if(secondary&&c===(simple?'#964252':'#19222b'))return secondary;
  if(secondary&&c==='#762837')return this.shade(secondary,.7);
  return colour;
 },
 openingPath(owner,placement,scale,art,side){
  const home=owner.home||owner.support,bed=this.bed(owner,art),node=owner.shadowRoot?.querySelector?.('[data-cat-bed]');let g=owner.bedInkGeometry;
  if(!g||g.home!==home||g.node!==node){const r=node?.getBoundingClientRect?.();g=owner.bedInkGeometry={home,node,dx:r?.height>0?r.left-home.left-(parseFloat(node.style?.translate)||0):-4+22*(owner.worldScale||owner.scale),dy:r?.height>0?r.bottom-home.top:0};}
  const left=home.left+g.dx,bottom=home.top+g.dy,bs=(owner.worldScale||owner.scale),top=(bottom-bed.height*bs-placement.top)/scale,cell=bs/scale;let path='',low=bed.width,high=0;
  bed.pixels.forEach((row,y)=>row.forEach((c,x)=>{if(c?.toLowerCase()!=='#19222b')return;low=Math.min(low,x);high=Math.max(high,x+1);path+=`M${(left+x*bs-placement.x)/scale} ${top+y*cell}h${cell}v${cell}h-${cell}z`;}));
  // The approach/exit side stays in front; the opposite side hides the cat.
  // Follow the aperture edge per row so the near arch cannot cut a gap
  // between the visible doorway and the visible outside part of the cat.
  if(side){
   const door=c=>c?.toLowerCase()==='#19222b',fallback=side==='left'?low:high,boundary=x=>(left+x*bs-placement.x)/scale,strip=(edge,y,h)=>side==='left'?`M-100 ${y}H${edge}v${h}H-100z`:`M${edge} ${y}H100v${h}H${edge}z`;
   path+=strip(boundary(fallback),-100,top+100)+strip(boundary(fallback),top+bed.height*cell,100-top-bed.height*cell);
   bed.pixels.forEach((row,y)=>{const edge=side==='left'?row.findIndex(door):row.findLastIndex(door),x=edge<0?fallback:edge+(side==='right'?1:0);path+=strip(boundary(x),top+y*cell,cell);});
  }return path;
 },
 clearRestMask(a){if(a.svg?.style)a.svg.style.clipPath='';a.svg?.firstElementChild?.removeAttribute?.('clip-path');},
 restPlacement(a,placement,rows,art,t){
  this.clearRestMask(a);if(window.pixelCatBedEntryV1?.rest(a,placement))return placement;
  const owner=a.support?.bedOwner||a,simple=owner.config.bed_style==='simple',eligible=simple?['sit','sithead','loaf','sleep','clean','scratch','yawn','meow','chatter']:['loaf','sleep'];
  if((!a.support?.home&&!a.support?.bedOwner)||owner.config.show_home===false||!eligible.includes(a.idle?.pose))return placement;
  const bed=this.bed(owner,art),s=a.scale,bs=(owner.worldScale||owner.scale);if(!bed)return placement;
  const raised=!!a.support.bed,left=raised?a.support.left:a.support.left-4+22*bs,bottom=a.support.top+(raised?3*bs:0),center=left+bed.width*bs/2;
  if(Math.abs(a.x+12*s-center)>24*s)return placement;
  // Align to one representative resting silhouette, not the transparent 24-cell
  // canvas or a changing tail/head extent on every animation beat.
  const clip=art.idleSequences?.[a.idle.pose],cycle=clip?.roles?.indexOf('cycle'),reference=clip?.frames[Math.max(0,cycle??0)]||rows;
  const ink=[];reference.forEach(row=>[...row].forEach((v,x)=>{if(v!=='.')ink.push(a.facing<0?23-x:x);}));
  if(!ink.length)return placement;
  const offset=Math.round((bed.width*bs/2-(Math.min(...ink)+Math.max(...ink)+1)*s/2)/s)*s;
  const target=raised?0:simple?3:1,key=a.idle;
  if(key.bedStart===undefined||key.bedFacing!==a.facing){key.bedStart=t;key.bedFromOffset=placement.x-left;key.bedFacing=a.facing;}
  const progress=Math.max(0,Math.min(1,(t-key.bedStart)/160)),lift=Math.round(target*progress)*bs;
  const result={x:left+Math.round((key.bedFromOffset+(offset-key.bedFromOffset)*progress)/s)*s,top:placement.top-lift};
  // Preserve the correction in the logical bearing used by subsequent frames,
  // transitions and walking. Scroll remains relative to the measured bed.
  if(Number.isFinite(key.contactX))key.contactX+=result.x-placement.x;
  if(!simple&&a.svg?.style){const path=this.openingPath(owner,result,s,art);if(a.bedMask?.svg!==a.svg&&document.createElementNS){const ns='http://www.w3.org/2000/svg',defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),shape=document.createElementNS(ns,'path');clip.id='cat-bed-mask-'+(this.maskId=(this.maskId||0)+1);clip.setAttribute('clipPathUnits','userSpaceOnUse');clip.append(shape);defs.append(clip);a.svg.append(defs);a.bedMask={id:clip.id,shape,svg:a.svg};}if(a.bedMask){a.bedMask.shape.setAttribute('d',path);a.svg.firstElementChild.setAttribute('clip-path',`url(#${a.bedMask.id})`);}}
  return result;
 },
 renderHome(a,art){
  window.pixelCatHomePostsV1?.render(a,art);
  const dock=a.shadowRoot?.querySelector?.('.dock');if(!dock?.style||a.homeArtReady||!art.homeBeds)return;
  const s=a.worldScale||a.scale;dock.style.height=28*s+'px';
  const bowl=art.homeProps?.bowl,bed=this.bed(a,art);
  if(!bowl||!bed)return;
  for(const [asset,selector,left,tag]of [[bowl,'.bowl',7,'catBowl'],[bed,'.mat',22,'catBed']]){
   const placeholder=dock.querySelector(selector);if(!placeholder)return;
   const canvas=document.createElement('canvas');canvas.width=asset.width;canvas.height=asset.height;canvas.dataset[tag]='';canvas.setAttribute('aria-label',asset.name||'Food bowl');
   canvas.style.cssText=`position:absolute;bottom:${tag==='catBed'&&a.config.bed_style==='simple'?-s:0}px;left:${left*s}px;image-rendering:pixelated;width:${asset.width*s}px;height:${asset.height*s}px`;
   const c=canvas.getContext('2d');asset.pixels.forEach((row,y)=>row.forEach((colour,x)=>{if(!colour)return;c.fillStyle=tag==='catBed'?this.bedColour(a,colour):colour;c.fillRect(x,y,1,1);}));placeholder.replaceWith(canvas);if(tag==='catBowl')window.pixelCatMouthV1?.bowl?.(a,canvas);
  }
  a.homeArtReady=true;
 },
 connect(a){
  if(a.config.mode!=='monitor')return false;
  a.style.display='';a.shadowRoot.innerHTML='';
  const monitor=document.createElement('pixel-cat-monitor');monitor.setConfig(a.config);monitor.hass=a._hass;a.monitorCard=monitor;a.shadowRoot.append(monitor);
  return true;
 },
 disconnect(a){window.pixelCatAlertV1?.leave(a);window.pixelCatDepthV1?.remove(a);window.pixelCatMouthV1?.disconnect?.(a);a.monitorCard?.remove();a.monitorCard=null;if(a.svg)a.svg.style.clipPath='';a.arriving=null;a.bedInside=null;a.bedEntry=null;a.previewBedPose=null;},
 arrival(a,t,art,sample,appearance,idle,contact,bearing){
  if(a.config.bed_style==='simple'){a.arrived=true;return false;}
  if(a.config.arrival!=='igloo'||a.config.show_home===false||a.arrived)return false;
  if(!a.arriving){
   // A command or preview always takes precedence. Never move an existing actor
   // back to its bed, nor manufacture a home if it is absent or obstructed.
   if(a.motion||a.idle||a.goal||a.command||a.previewPose||!a.support?.home){a.arrived=true;return false;}
   const bed=a.shadowRoot.querySelector('[data-cat-bed]');if(!bed)return true;
   const rect=bed.getBoundingClientRect(),s=a.scale,door=Math.round((rect.left+rect.width*12/21)/s)*s;
   const from=Math.round((door-24*s)/s)*s,to=Math.round((door+6*s)/s)*s;
   if(from<a.support.min||to>a.support.max){a.arrived=true;return false;}
   a.x=from;a.facing=1;
   a.moveTo(to,a.support.top,0,'walk',a.support,t,art.sneak?.every(Boolean)?'sneak':null);
   if(!a.motion){a.arrived=true;return false;}
   if(a.motion.sneakTimeline){let time=0;for(const beat of a.motion.sneakTimeline){beat.variant=2-beat.variant;time+=1000*5/(8*[8,5,3][beat.variant]);beat.until=time;}a.motion.duration=time;}
   a.arriving={motion:a.motion,doorOffset:door-a.support.left};
  }
  const arrival=a.arriving,m=a.motion;
  if(m!==arrival.motion||a.goal||a.command||a.previewPose||a.play){a.svg.style.clipPath='';a.arriving=null;a.arrived=true;return false;}
  const frame=sample(m,t-m.start,a.scale,art.walk),rows=appearance(art,m,frame,a.config).rows;
  a.x=frame.x;a.y=m.fromY;a.draw(rows);
  a.svg.style.transform=`translate(${a.x}px,${a.y-24*a.scale}px)`;
  a.svg.style.clipPath='';window.pixelCatBedEntryV1?.mask(a,rows,a,'right');
  window.pixelCatMouthV1?.frame(a,rows,[null,String(a.x),String(a.y-24*a.scale)],t,art);a.setAttribute('data-pose','emerging');a.status('Emerging from the igloo');
  if(t>=m.start+m.duration){
   a.support=m.target;a.motion=null;a.arriving=null;a.arrived=true;this.clearRestMask(a);a.deadline=t+1800;window.pixelCatExplorationV1?.observe(a,t);
   const stand=idle(art,'stand',0,a.config),point=contact(stand.rows,a.facing,stand.anchor||bearing(stand.rows)),contactX=m.x+contact(rows,a.facing,bearing(rows))[0]*a.scale;
   a.idle={pose:'stand',contactX,support:a.support.id,start:t,poseUntil:t+1800};a.x=contactX-point[0]*a.scale;a.y=m.y;
   a.draw(stand.rows);a.svg.style.transform=`translate(${a.x}px,${m.y-(point[1]+1)*a.scale}px)`;a.setAttribute('data-pose','stand');a.status('Standing outside the igloo');
  }
  return true;
 }
};
// Old /local/ resources may still register these entries. Hide discovery only;
// their custom elements and saved YAML continue to load, in either import order.
const catLegacyPickerTypes=new Set(['stick-pet-card','pixel-pet-card','pixel-cat-monitor','pixel-cat-playground']);
const catCleanPicker=()=>{const cards=window.customCards;if(!cards)return;for(let i=cards.length-1;i>=0;i--)if(catLegacyPickerTypes.has(cards[i].type))cards.splice(i,1);};
catCleanPicker();for(const type of catLegacyPickerTypes)customElements.whenDefined?.(type)?.then(catCleanPicker);
