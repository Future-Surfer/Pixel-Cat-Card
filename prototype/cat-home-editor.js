// Dependency-free Lovelace editor. Unknown YAML settings are retained, and
// defaults are displayed without materialising them in the saved config.
const catEditorGroups=[
 {title:'Your cat',open:true,fields:[
  ['name','Name','text',null,'What would you like to call them?'],
  ['color','Fur colour','text','#222','Pick a swatch or enter a colour of your own.'],
  ['outline','Fur outline','select','auto','Automatic helps black fur stand out and gives white fur an edge on light themes.'],
  ['floor_shadow','Floor shadow','checkbox',true,'Show a soft shadow underneath your cat.'],
  ['life_stage','Age','select','adult','Kittens are smaller and tend to move and play a little more.'],
 ]},
 {title:'Daily rhythm',fields:[
  ['settling_mode','Activity & settling','select','default','Choose how long your cat settles in for a nap. They still take short rests when set to Always active.'],
  ['settle_after_minutes','Settle after (minutes)','number',5,'How long your cat spends on the open dashboard before they may take a longer nap.',0,1440],
  ['settled_rest_min_minutes','Minimum settled rest (minutes)','number',5,'The shortest a long nap can be.',1,1440],
  ['settled_rest_max_minutes','Maximum settled rest (minutes)','number',10,'The longest a long nap can be.',1,1440],
 ]},
 {title:'Make them at home',fields:[
  ['bed_style','Bed style','select','igloo','Choose an igloo or open simple bed.'],
  ['bed_primary_color','Bed primary colour','text','#aa6627','Pick a colour for the outside of the bed.'],
  ['bed_secondary_color','Bed secondary colour','text',null,'Pick a colour for the inside, or leave it blank for the original colour.'],
  ['show_home','Show bed home','checkbox',true,'Hide the bed and let your cat find another spot.'],
  ['show_scratching_post','Show scratching post','checkbox',true,'Put a scratching post beside the bed if there’s room.'],
  ['test_cat_tree','Test cat tree','checkbox',false,'Try a fixed climbing tree and hanging ball. On narrow cards, use the post.']
 ]},
 {title:'Home & appearance',fields:[
  ['primary_home','Primary home','checkbox',false,'Mark this card as the main home in the editor.'],
  ['cell_size','Pixel scale','number',2,'Higher numbers make cats, toys, and furniture bigger.',1,6],
  ['start_paused','Start paused','checkbox',false,'Let this cat wait until you press Resume or Come home.']
 ]},
 {title:'Behaviour & toys',fields:[
  ['post_rest_behaviour','Gentle waking after rest','checkbox',true,'After a long nap, your cat may yawn, stretch, or take a slow walk.'],
  ['mood_behaviour','Mood-driven exploration','checkbox',false,'Softly varies resting, pace and playful interest.'],
  ['social_behaviour','Nearby company & chasing','checkbox',false,'Allows independent cats to invite one another to rest or play.'],
  ['interaction_behaviour','Notice other cats','checkbox',false,'Cats can notice, greet, or play with each other. Works with moods and nearby company.'],
  ['dashboard_props','Shared dashboard toys','checkbox',false,'Put mice and balls on the dashboard for cats to share.'],
  ['toy_carrying','Pick up & carry toys','checkbox',true,'Nibble or catch a toy, carry it, then nose down to release it.'],
  ['bowl_eating','Eat at food bowls','checkbox',true,'Occasional meals; a bowl click offers food. Recently fed cats can ignore it.'],
  ['prop_reactions','React when a toy brushes past','checkbox',false,'Can watch, ignore or startle after a toy brushes past.'],
  ['landing_reactions','React to nearby landings','checkbox',false,'A landing nearby can surprise your cat.'],
  ['startle_followups','Different reactions after a scare','checkbox',false,'A startled cat may settle down, back away, or pounce.']
 ]},
 {title:'Advanced settings',fields:[
  ['show_controls','Show controls','checkbox',false,'Show Pause, Spawn toy, Come home, and the debug menu.'],
  ['draggable','Pick up and drag cats','checkbox',true,'Pick up your cat and set them down somewhere clear. Press Escape to cancel.'],
  ['cat_id','Stable cat ID','text',null,'Give each cat a unique ID. Keep it the same when editing their home.']
 ]},
 {title:'Movement & surfaces',fields:[
  ['casual_wander','Occasional meandering','checkbox',true,'Adds a slower casual pace to uncommitted exploration.'],
  ['casual_speed','Meandering speed','number',6,'Higher numbers make this gentle walk faster.',1,60],
  ['relaxed_speed','Strolling speed','number',9,'Higher numbers make an ordinary stroll faster.',1,60],
  ['freefall_enabled','Long-drop freefall pose','checkbox',true,'Let your cat stretch out during a long fall.'],
  ['use_surface_candidates','Try interior and bottom-border candidates','checkbox',true,'Let your cat try extra spots inside cards and along their lower edges.'],
  ['card_climbing','Climb visible card faces (experimental)','checkbox',false,'Let your cat climb a card when they can’t reach a spot by walking or jumping.'],
  ['native_vertical_surfaces','Scratch native card edges (experimental)','checkbox',false,'Let your cat scratch a card edge if they can reach it safely.'],
  ['shared_home_surfaces','Share visible home-card roofs','checkbox',false,'Both home cards must enable this; hidden homes never provide a roof.'],
  ['click_attention','Follow dashboard clicks','checkbox',true,'The nearest eligible cat can investigate the clicked surface.']
 ]},
 {title:'Labels & diagnostics',fields:[
  ['debug_labels','Name & action below cat','checkbox',true,'Cat name and current activity; colour indicates mood.'],
  ['debug_names','Extra name above cat','checkbox',false,'Optional second name label above the cat.'],
  ['debug_mood','Mood glow','checkbox',false,'Optional coloured halo around the cat.'],
  ['debug_vertical_surfaces','Show card outlines & climbing faces','checkbox',false,'Cyan card borders, purple grip areas and green usable tops; labels explain rejected faces.'],
  ['debug_surfaces','Show walking surfaces','checkbox',false,'Draw discovered supports on the dashboard.'],
  ['debug_paths','Show routes & jump arcs','checkbox',false,'Draw where your cat plans to walk and jump.'],
  ['debug_pois','Show points of interest','checkbox',false,'Mark potential destinations and resting points.']
 ]}
];
const catEditorFields=new Map(catEditorGroups.flatMap(g=>g.fields.map(f=>[f[0],f])));
const catEditorOptions={outline:[['auto','Automatic'],['none','None'],['black','Black'],['white','White']],life_stage:[['kitten','Kitten'],['adult','Adult'],['senior','Senior']],bed_style:[['igloo','Igloo'],['simple','Simple bed']],settling_mode:[['active','Always active'],['default','Default settle periods (5–10 min)'],['extended','Extended settle periods (15–30 min)'],['custom','Custom']]};
const catEditorValue=(config,key)=>{
 if(key==='settling_mode')return catEditorOptions.settling_mode.some(([v])=>v===config[key])?config[key]:'default';
 if(config[key]!==undefined)return config[key];
 if(key==='bed_primary_color')return config.igloo_color||'#aa6627';
 if(key==='show_scratching_post')return config.scratching_posts!==false;
 if(key==='show_controls')return config.show_home!==false;
 if(key==='relaxed_speed'&&config.walk_speed!==undefined)return config.walk_speed;
 if(key==='freefall_enabled'&&config.test_freefall_pose!==undefined)return config.test_freefall_pose;
 return catEditorFields.get(key)?.[3];
};
const catEditorChange=(config,key,raw)=>{
 const field=catEditorFields.get(key);if(!field)throw Error('Unknown editor field');
 const next={...config},kind=field[2];
 if(kind==='checkbox')next[key]=!!raw;
 else if(raw==='')delete next[key];
 else if(kind==='number'){
  const value=Number(raw);if(!Number.isFinite(value)||value<field[5]||value>field[6]||!Number.isInteger(value))throw Error('Invalid numeric value');next[key]=value;
 }else {if(kind==='select'&&!catEditorOptions[key]?.some(([v])=>v===raw))throw Error('Invalid selection');next[key]=String(raw);}
 // The legacy preview override otherwise wins over the editor's freefall field.
 if(key==='freefall_enabled')delete next.test_freefall_pose;
 if(key==='show_home'&&config.show_controls===undefined)next.show_controls=catEditorValue(config,'show_controls');
 return next;
};
class PixelCatHomeEditor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this.config={};this.timers=new Map();}
 set hass(value){this._hass=value;}
 setConfig(config){if(this.rendered&&JSON.stringify(config)===JSON.stringify(this.config))return;this.clearPending();this.config={...config};this.render();}
 clearPending(){for(const timer of this.timers.values())clearTimeout(timer);this.timers.clear();}
 connectedCallback(){if(this.rendered&&!this.catPreview&&this.config.mode!=='monitor')this.render();}
 disconnectedCallback(){this.clearPending();clearTimeout(this.previewTimer);this.catPreview=null;}
 updatePreview(){
  if(!this.catPreview)return;
  this.catPreview.style.color=catEditorValue(this.config,'color');
  this.catPreview.dataset.age=catEditorValue(this.config,'life_stage');
  this.catPreview.firstElementChild.setAttribute('stroke',window.pixelCatOutlineV1.colour(this.config));
 }
 makePreview(){
  const art=window.pixelCatRoamingArtV2?.idleSequences,extras=window.pixelCatRoamingExtrasV1?.idleSequences;
  const outline=window.pixelCatOutlineV1;
  if(!art?.sit||!outline||!document.createElementNS)return;
  const ns='http://www.w3.org/2000/svg',cat=document.createElementNS(ns,'svg'),ink=document.createElementNS(ns,'path'),edge=document.createElementNS(ns,'path');
  cat.setAttribute('viewBox','0 0 24 24');cat.setAttribute('aria-hidden','true');cat.setAttribute('class','patient-cat');
  edge.setAttribute('fill','none');edge.setAttribute('stroke-width',outline.width);edge.setAttribute('stroke-linecap','round');edge.setAttribute('shape-rendering','geometricPrecision');
  ink.setAttribute('fill','currentColor');cat.append(edge,ink);this.catPreview=cat;this.updatePreview();
  const seat=art.sit.frames[0],clip=(sequence,name)=>sequence?.frames.map((rows,i)=>[rows,window.pixelCatPolishV1.hold(name,sequence,i)])||[];
  const actions=[clip(art.clean,'clean'),clip(extras?.scratch||art.scratch,'scratch'),clip(extras?.yawn,'yawn')].filter(action=>action.length);
  let pending=[],last=null;
  const reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  const draw=()=>{
   if(this.catPreview!==cat)return;
   if(document.hidden){this.previewTimer=setTimeout(draw,500);return;}
   const still=reduced?.matches;
   const [rows,hold]=still?[seat,0]:pending.shift()||[seat,1300+Math.random()*1400];
   if(!still&&rows===seat&&!pending.length&&actions.length){
    const choices=actions.filter(action=>action!==last||actions.length===1);
    last=choices[Math.floor(Math.random()*choices.length)];
    pending=[...last];
   }
   ink.setAttribute('d',rows.map((row,y)=>[...row].map((v,x)=>v==='.'?'':`M${x} ${y}h1v1h-1Z`).join('')).join(''));
   edge.setAttribute('d',outline.path(rows));
   if(!still)this.previewTimer=setTimeout(draw,hold);
  };
  draw();return cat;
 }
 render(){
  clearTimeout(this.previewTimer);this.catPreview=null;
  const expanded=new Map([...this.shadowRoot.querySelectorAll('details')].map(el=>[el.dataset.group,el.open]));
  const focusedKey=this.shadowRoot.activeElement?.dataset.key;
  this.shadowRoot.innerHTML=`<style>
   :host{display:block;color:var(--primary-text-color,#202b33);font:14px var(--paper-font-body1_-_font-family,system-ui)}
   p{color:var(--secondary-text-color,#64717d);line-height:1.5;margin:0 0 16px}details{border:1px solid var(--divider-color,#dce3e8);border-radius:12px;margin:12px 0;overflow:hidden}summary{cursor:pointer;padding:16px;font-weight:650;background:var(--secondary-background-color,#f5f7f9)}.fields{padding:0 16px}.field{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,42%);align-items:center;gap:8px 16px;padding:13px 0;border-bottom:1px solid var(--divider-color,#e4e8ec)}.field:last-child{border:0}.field small{display:block;color:var(--secondary-text-color,#667482);font-size:12px;line-height:1.4;margin-top:5px}.field input{box-sizing:border-box;width:100%;padding:9px 10px;border:1px solid var(--divider-color,#bdcbd5);border-radius:7px;font:inherit;background:var(--card-background-color,#fff);color:inherit;min-width:0}.field input[type=checkbox]{width:20px;height:20px;justify-self:end;accent-color:var(--primary-color,#189b87);cursor:pointer}.note{font-size:12px;margin-top:14px}@media(max-width:360px){.field{gap:8px}.fields{padding:0 12px}}
   .purpose{display:grid;gap:8px;margin:12px 0 16px}.purpose select{padding:12px;font:inherit;color:inherit;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#aaa);border-radius:8px}.swatches{display:flex;gap:8px;flex-wrap:wrap;padding:0 16px 16px}.swatches button{width:30px;height:30px;border:2px solid var(--divider-color,#aaa);border-radius:50%;cursor:pointer}
   .welcome{display:flex;align-items:center;gap:16px}.welcome p{margin:0}.patient-cat{width:72px;height:72px;flex:none;shape-rendering:crispEdges;overflow:visible;transform-origin:center bottom}.patient-cat[data-age=kitten]{transform:scale(.5)}
   .field select{box-sizing:border-box;width:100%;min-width:0;padding:9px 6px;font:inherit;color:inherit;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#bdcbd5);border-radius:7px}
   .field:has(select[data-key=settling_mode]){grid-template-columns:1fr}
   :is(summary,input,select,button):focus-visible{outline:2px solid var(--primary-color,#006b78);outline-offset:2px}
   summary:focus-visible{outline-offset:-3px}
   @media(pointer:coarse){.swatches button{width:44px;height:44px}}
   </style>`;
  const monitor=this.config.mode==='monitor',purpose=document.createElement('label');purpose.className='purpose';purpose.textContent='Card purpose';
  const select=document.createElement('select');select.setAttribute('aria-label','Card purpose');select.dataset.key='mode';
  for(const [value,label]of [['companion','Cat companion'],['monitor','Performance monitor · no cat']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=monitor?'monitor':'companion';
  select.addEventListener('change',()=>{for(const input of this.shadowRoot.querySelectorAll('input'))if(this.timers.has(input.dataset.key))input.dispatchEvent(new Event('change'));this.config={...this.config,mode:select.value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config}},bubbles:true,composed:true}));this.render();});purpose.append(select);
  const welcome=document.createElement('div'),intro=document.createElement('p');welcome.className='welcome';intro.textContent=monitor?'Give your monitor a name. It tracks how this dashboard is running.':'It’s time to meet your new friend. Give them a name, choose their fur colour and age, and make them feel at home.';welcome.append(intro);const cat=monitor?null:this.makePreview();if(cat)welcome.append(cat);this.shadowRoot.append(welcome);
  const groups=monitor?[{title:'Performance monitor',open:true,fields:[['title','Monitor title','text','Cat performance','Saved title for this page’s shared performance monitor.']]}]:catEditorGroups;
  for(const group of groups){
   const section=document.createElement('details');section.dataset.group=group.title;const hasPurpose=monitor||group.title==='Advanced settings';section.open=(hasPurpose&&focusedKey==='mode')||(expanded.get(group.title)??!!group.open);
   const summary=document.createElement('summary');summary.textContent=group.title;section.append(summary);
   const fields=document.createElement('div');fields.className='fields';
   for(const [key,title,kind,,help,min,max]of group.fields){
    if(['settle_after_minutes','settled_rest_min_minutes','settled_rest_max_minutes'].includes(key)&&catEditorValue(this.config,'settling_mode')!=='custom')continue;
    const label=document.createElement('label');label.className='field';const copy=document.createElement('span');copy.textContent=title;
    const hint=document.createElement('small');hint.id='hint-'+key;hint.textContent=help;copy.append(hint);
    const input=document.createElement(kind==='select'?'select':'input');if(kind!=='select')input.type=kind;else for(const [value,text]of catEditorOptions[key]){const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);}input.dataset.key=key;input.setAttribute('aria-label',title);input.setAttribute('aria-describedby',hint.id);
    const value=key==='title'?(this.config.title??'Cat performance'):catEditorValue(this.config,key);if(kind==='checkbox'){input.checked=!!value;if(key==='primary_home'&&this.config.primary_home===undefined)input.indeterminate=true;}else input.value=value??'';
    if(kind==='number'){input.min=min;input.max=max;input.step=1;}
    const commit=()=>{
     clearTimeout(this.timers.get(key));this.timers.delete(key);
     input.setCustomValidity?.('');
     if(kind==='number'&&!input.checkValidity())return;
     if(key==='settling_mode')for(const pending of this.shadowRoot.querySelectorAll('input'))if(this.timers.has(pending.dataset.key))pending.dispatchEvent(new Event('change'));
     if(key==='settled_rest_min_minutes'||key==='settled_rest_max_minutes'){
      const other=key==='settled_rest_min_minutes'?'settled_rest_max_minutes':'settled_rest_min_minutes',value=input.value===''?catEditorFields.get(key)[3]:Number(input.value),bound=Number(catEditorValue(this.config,other)),invalid=key==='settled_rest_min_minutes'?value>bound:value<bound;
      input.setCustomValidity?.(invalid?'Maximum rest must be at least the minimum.':'');if(invalid){input.reportValidity();return;}
     }
     const next=key==='title'?{...this.config,title:input.value}:catEditorChange(this.config,key,kind==='checkbox'?input.checked:input.value);
     if(JSON.stringify(next)===JSON.stringify(this.config))return;
     this.config=next;
     this.updatePreview();
     this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config}},bubbles:true,composed:true}));
     if(key==='settling_mode')this.render();
    };
    input.addEventListener('change',commit);
    if(kind!=='checkbox'&&kind!=='select')input.addEventListener('input',()=>{input.setCustomValidity?.('');clearTimeout(this.timers.get(key));this.timers.set(key,setTimeout(commit,200));});
    label.append(copy,input);fields.append(label);
    if(key==='color'||key==='bed_primary_color'||key==='bed_secondary_color'){
     const cat=key==='color',swatches=document.createElement('div');swatches.className='swatches';swatches.setAttribute('aria-label',cat?'Cat colour presets':title+' presets');
     const palette=cat?[['Charcoal','#222222'],['Ginger','#ad6c2d'],['Cream','#e7cf9c'],['Grey','#70818d'],['White','#eeeeee']]:[['Brown','#aa6627'],['Slate','#70818d'],['Blue','#4e86ae'],['Green','#518d70'],['Rose','#b77f91']];
     for(const [name,colour]of palette){const button=document.createElement('button');button.type='button';button.style.background=colour;button.setAttribute('aria-label',name+(cat?' cat':' '+title.toLowerCase()));button.title=name;button.addEventListener('click',()=>{input.value=colour;input.dispatchEvent(new Event('change'));});swatches.append(button);}fields.append(swatches);
    }
   }
   if(hasPurpose)fields.append(purpose);
   section.append(fields);this.shadowRoot.append(section);

  }
  if(!monitor)window.pixelCatWorldV1?.editor(this,expanded);
  if(focusedKey)[...this.shadowRoot.querySelectorAll('[data-key]')].find(control=>control.dataset.key===focusedKey)?.focus();
  const note=document.createElement('p');note.className='note';note.textContent=monitor?'Save to add your monitor.':'When you’re ready, save to welcome your cat to the dashboard.';this.shadowRoot.append(note);this.rendered=true;
 }
}
if(!customElements.get('pixel-cat-home-editor'))customElements.define('pixel-cat-home-editor',PixelCatHomeEditor);
