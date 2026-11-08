// Dependency-free Lovelace editor. Unknown YAML settings are retained, and
// defaults are displayed without materialising them in the saved config.
const catEditorGroups=[
 {title:'Your cat',open:true,fields:[
  ['name','Name','text',null,'Optional display name for this resident.'],
  ['life_stage','Life stage','select','adult','Kitten is half body size with quicker steps and more playful gallops. Adult and senior keep baseline behaviour; furniture keeps its pixel scale.'],
  ['settling_mode','Activity & settling','select','default','Default: after 5 active, visible minutes, newly chosen sleep/loaf bouts last 5–10 minutes. Settling reduces ordinary decisions during longer rests; commands and startles can wake the cat. Always active disables these prolonged holds, while allowing ordinary brief rests. Extended keeps the 5-minute threshold and holds rests for 15–30 minutes.'],
  ['settle_after_minutes','Settle after (minutes)','number',5,'Custom: active, visible time before longer rests become eligible. Default: 5 minutes. Zero allows them immediately; it does not force sleep.',0,1440],
  ['settled_rest_min_minutes','Minimum settled rest (minutes)','number',5,'Custom: shortest prolonged sleep/loaf bout. Default: 5 minutes. Each cat chooses its own duration within the range.',1,1440],
  ['settled_rest_max_minutes','Maximum settled rest (minutes)','number',10,'Custom: longest prolonged sleep/loaf bout. Default: 10 minutes. Must be at least the minimum.',1,1440],
  ['color','Cat colour','text','#222','Choose a swatch below, or enter any CSS colour.'],
  ['bed_style','Bed style','select','igloo','Choose an igloo or open simple bed.'],
  ['bed_primary_color','Bed primary colour','text','#aa6627','Shell colour. Its darker shading is derived automatically.'],
  ['bed_secondary_color','Bed secondary colour','text',null,'Lining / entrance colour. Blank keeps the selected bed’s authored palette.'],
  ['show_home','Show bed home','checkbox',true,'Turn off to place the cat on another suitable surface. Controls have their own switch.'],
  ['show_scratching_post','Show scratching post','checkbox',true,'Include a post beside the bed when the home has room. Reduce pixel scale if the card is too narrow.']
 ]},
 {title:'Home & appearance',fields:[
  ['primary_home','Primary home','checkbox',false,'Editor presentation only. This flag does not grant world authority; explicit world linkage is configured separately.'],
  ['cell_size','Pixel scale','number',2,'Integer scale 1–6 for furniture, toys and adult-sized cats. Kitten body cells are half this size.',1,6],
  ['start_paused','Start paused','checkbox',false,'Pause this cat until Explore or Home is requested.']
 ]},
 {title:'Behaviour & toys',fields:[
  ['post_rest_behaviour','Gentle waking after rest','checkbox',true,'Varied yawns, stretches, quiet activity and slower first walks after sustained sleep/loaf; surprises and commands still take precedence.'],
  ['mood_behaviour','Mood-driven exploration','checkbox',false,'Softly varies resting, pace and playful interest.'],
  ['social_behaviour','Nearby company & chasing','checkbox',false,'Allows independent cats to invite one another to rest or play.'],
  ['interaction_behaviour','Gaze-aware encounters','checkbox',false,'Passing acknowledgement, stalking, pats and shared play. Enable moods and company too.'],
  ['dashboard_props','Shared dashboard toys','checkbox',false,'Join the shared mouse/ball scene; multiple homes share one scene.'],
  ['toy_carrying','Pick up & carry toys','checkbox',true,'Nibble or catch a toy, carry it, then nose down to release it.'],
  ['bowl_eating','Eat at food bowls','checkbox',true,'Occasional meals; a bowl click offers food. Recently fed cats can ignore it.'],
  ['prop_reactions','React to moving prop contact','checkbox',false,'Can watch, ignore or startle after a toy brushes past.'],
  ['landing_reactions','React to nearby landings','checkbox',false,'Physical surprise can be noticed without looking at its source.'],
  ['startle_followups','Varied startle recovery','checkbox',false,'May settle, retreat or counter-pounce after a hop.']
 ]},
 {title:'Advanced settings',fields:[
  ['show_controls','Show controls','checkbox',false,'Explore, Home, Pause, status and diagnostics. New cards hide these controls. Igloo visibility is independent; HA may retain a layout gap when both are hidden.'],
  ['draggable','Pick up and drag cats','checkbox',true,'Drag painted cat pixels with a mouse or touch; release above a clear surface. Escape cancels.'],
  ['cat_id','Stable cat ID','text',null,'Optional identity override. Use a different ID for each home; changing it changes the cat’s identity.']
 ]},
 {title:'Movement & surfaces',fields:[
  ['casual_wander','Occasional meandering','checkbox',true,'Adds a slower casual pace to uncommitted exploration.'],
  ['casual_speed','Meandering speed','number',6,'Cell-clock rate; animation and travel stay in step.',1,60],
  ['relaxed_speed','Strolling speed','number',9,'Cell-clock rate for ordinary relaxed walking.',1,60],
  ['freefall_enabled','Long-drop freefall pose','checkbox',true,'Use the reviewed freefall pose on eligible long drops.'],
  ['use_surface_candidates','Try interior and bottom-border candidates','checkbox',true,'Candidates are decorative possible supports, not detected physical shelves.'],
  ['card_climbing','Climb visible card faces (experimental)','checkbox',false,'Use checked wall-jump/climb transfers only when ordinary routes fail. Vertical surfaces diagnostics show exact card and grip bounds.'],
  ['native_vertical_surfaces','Scratch native card edges (experimental)','checkbox',false,'Allow noticed structural card borders with a supported stance and safe approach. Use Vertical surfaces diagnostics to inspect candidates.'],
  ['shared_home_surfaces','Share visible home-card roofs','checkbox',false,'Both home cards must enable this; hidden homes never provide a roof.'],
  ['click_attention','Follow dashboard clicks','checkbox',true,'The nearest eligible cat can investigate the clicked surface.']
 ]},
 {title:'Labels & diagnostics',fields:[
  ['debug_labels','Name & action below cat','checkbox',true,'Cat name and current activity; colour indicates mood.'],
  ['debug_names','Extra name above cat','checkbox',false,'Optional second name label above the cat.'],
  ['debug_mood','Mood glow','checkbox',false,'Optional coloured halo around the cat.'],
  ['debug_vertical_surfaces','Show card outlines & climbing faces','checkbox',false,'Cyan card borders, purple grip areas and green usable tops; labels explain rejected faces.'],
  ['debug_surfaces','Show walking surfaces','checkbox',false,'Draw discovered supports on the dashboard.'],
  ['debug_paths','Show routes & jump arcs','checkbox',false,'Visualise travel and ballistic flight paths.'],
  ['debug_pois','Show points of interest','checkbox',false,'Mark potential destinations and resting points.']
 ]}
];
const catEditorFields=new Map(catEditorGroups.flatMap(g=>g.fields.map(f=>[f[0],f])));
const catEditorOptions={life_stage:[['kitten','Kitten'],['adult','Adult'],['senior','Senior']],bed_style:[['igloo','Igloo'],['simple','Simple bed']],settling_mode:[['active','Always active'],['default','Default settle periods (5–10 min)'],['extended','Extended settle periods (15–30 min)'],['custom','Custom']]};
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
 disconnectedCallback(){this.clearPending();}
 render(){
  const expanded=new Map([...this.shadowRoot.querySelectorAll('details')].map(el=>[el.dataset.group,el.open]));
  this.shadowRoot.innerHTML=`<style>
   :host{display:block;color:var(--primary-text-color,#202b33);font:14px var(--paper-font-body1_-_font-family,system-ui)}
   p{color:var(--secondary-text-color,#64717d);line-height:1.5;margin:0 0 16px}details{border:1px solid var(--divider-color,#dce3e8);border-radius:12px;margin:12px 0;overflow:hidden}summary{cursor:pointer;padding:16px;font-weight:650;background:var(--secondary-background-color,#f5f7f9)}.fields{padding:0 16px}.field{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,42%);align-items:center;gap:8px 16px;padding:13px 0;border-bottom:1px solid var(--divider-color,#e4e8ec)}.field:last-child{border:0}.field small{display:block;color:var(--secondary-text-color,#667482);font-size:12px;line-height:1.4;margin-top:5px}.field input{box-sizing:border-box;width:100%;padding:9px 10px;border:1px solid var(--divider-color,#bdcbd5);border-radius:7px;font:inherit;background:var(--card-background-color,#fff);color:inherit;min-width:0}.field input[type=checkbox]{width:20px;height:20px;justify-self:end;accent-color:var(--primary-color,#189b87);cursor:pointer}.note{font-size:12px;margin-top:14px}@media(max-width:360px){.field{gap:8px}.fields{padding:0 12px}}
   .purpose{display:grid;gap:8px;margin-bottom:16px}.purpose select{padding:12px;font:inherit;color:inherit;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#aaa);border-radius:8px}.swatches{display:flex;gap:8px;flex-wrap:wrap;padding:0 16px 16px}.swatches button{width:30px;height:30px;border:2px solid var(--divider-color,#aaa);border-radius:50%;cursor:pointer}.steps{font-weight:600;color:var(--primary-text-color)}
   .field select{box-sizing:border-box;width:100%;min-width:0;padding:9px 6px;font:inherit;color:inherit;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#bdcbd5);border-radius:7px}
   .field:has(select[data-key=settling_mode]){grid-template-columns:1fr}
   </style><p class="steps">1 · Choose your card</p>`;
  const monitor=this.config.mode==='monitor',purpose=document.createElement('label');purpose.className='purpose';purpose.textContent='What would you like to add?';
  const select=document.createElement('select');select.setAttribute('aria-label','Card purpose');select.dataset.key='mode';
  for(const [value,label]of [['companion','Cat companion'],['monitor','Performance monitor · no cat']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=monitor?'monitor':'companion';
  select.addEventListener('change',()=>{for(const input of this.shadowRoot.querySelectorAll('input'))if(this.timers.has(input.dataset.key))input.dispatchEvent(new Event('change'));this.config={...this.config,mode:select.value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config}},bubbles:true,composed:true}));this.render();});purpose.append(select);this.shadowRoot.append(purpose);
  const intro=document.createElement('p');intro.textContent=monitor?'2 · Name your monitor. It measures the page and creates no cat.':'2 · Meet your cat. Choose a name, colours and bed, check the preview, then Save in Home Assistant. Igloo residents sneak out on arrival; open beds use normal placement.';this.shadowRoot.append(intro);
  const groups=monitor?[{title:'Performance monitor',open:true,fields:[['title','Monitor title','text','Cat performance','Saved title for this page’s shared performance monitor.']]}]:catEditorGroups;
  for(const group of groups){
   const section=document.createElement('details');section.dataset.group=group.title;section.open=expanded.get(group.title)??!!group.open;
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
   section.append(fields);this.shadowRoot.append(section);

  }
  if(!monitor)window.pixelCatWorldV1?.editor(this,expanded);
  const note=document.createElement('p');note.className='note';note.textContent=monitor?'Save to add a shared page monitor. Switching purpose retains your companion settings.':'3 · Save to welcome your cat. Extra settings are optional. Preview never spawns a roaming cat. One resident per home for now; existing YAML and advanced settings are retained. Hidden homes skip igloo emergence.';this.shadowRoot.append(note);this.rendered=true;
 }
}
if(!customElements.get('pixel-cat-home-editor'))customElements.define('pixel-cat-home-editor',PixelCatHomeEditor);
