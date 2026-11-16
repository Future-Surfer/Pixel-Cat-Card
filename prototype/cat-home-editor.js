// Dependency-free Lovelace editor. Unknown YAML settings are retained, and
// defaults are displayed without materialising them in the saved config.
const catEditorGroups=[
 {title:'Your cat',open:true,fields:[
  ['name','Name','text',null,'What would you like to call them?'],
  ['color','Fur colour','color','#222222','Pick a colour or try a swatch.'],
  ['outline','Fur outline','select','auto','Automatic outlines help very light or dark fur stand out.'],
  ['life_stage','Age','select','adult','Kittens are smaller and tend to move and play a little more.'],
  ['mood_preset','Mood','select','natural','Give their changing mood a nudge.']
 ]},
 {title:'Personality',fields:[
  ['boldness','Boldness','range',3,'Bolder cats are less easily startled.'],
  ['sociability','Sociability','range',3,'How much they seek out other cats.'],
  ['curiosity','Curiosity','range',3,'How readily they investigate nearby activity.'],
  ['patience','Patience','range',3,'How long they give an interaction to play out.']
 ]},
 {title:'Daily rhythm',fields:[
  ['settling_mode','Activity & settling','select','default','Choose how long your cat settles in for a nap.'],
  ['settle_after_minutes','Settle after (minutes)','number',5,'How long before they may take a longer nap.',0,1440],
  ['settled_rest_min_minutes','Minimum settled rest (minutes)','number',5,'The shortest a long nap can be.',1,1440],
  ['settled_rest_max_minutes','Maximum settled rest (minutes)','number',10,'The longest a long nap can be.',1,1440]
 ]},
 {title:'Make them at home',fields:[
  ['include_bed','Include a bed','checkbox',true,'Give your cat a place to curl up.'],
  ['bed_style','Bed style','select','igloo','Choose a place to curl up.'],
  ['bed_primary_color','Bed primary colour','color','#aa6627','Pick a colour for the outside of the bed.'],
  ['bed_secondary_color','Bed secondary colour','color','#55312a','Pick a colour for the inside of the bed.'],
  ['include_bowl','Include a food bowl','checkbox',true,'Let cats stop by for a bite.'],
  ['bowl_primary_color','Bowl primary colour','color','#f5ad68','Pick a colour for the bowl.'],
  ['bowl_secondary_color','Bowl secondary colour','color','#c95e4b','Pick a colour for the rim.'],
  ['show_scratching_post','Include a scratching post','checkbox',true,'Give your cat somewhere to scratch.'],
  ['post_type','Post type','select','post','A tree gives your cat extra places to climb.'],
  ['tree_levels','Tree levels','select','2','Choose the height of the climbing tree.']
 ]},
 {title:'Home & appearance',fields:[
  ['cell_size','Pixel scale','number',2,'Higher numbers make cats, toys, and furniture bigger.',1,6],
  ['card_color','Card colour','color','#ffffff','Choose the card background.'],
  ['card_background_transparency','Background transparency','percent',0,'Solid at 0%, clear at 100%.',0,100],
  ['card_border_color','Border colour','color','#dddddd','Choose the card border.'],
  ['card_radius','Corner rounding','number',12,'The corner radius in pixels.',0,40],
  ['floor_shadow','Floor shadow','checkbox',true,'Show a soft shadow underneath your cat.'],
  ['scratch_debris','Debris size','select','small','Choose the bits that appear when scratching and climbing.']
 ]},
 {title:'Behaviour & toys',fields:[
  ['quiet_company','Quiet company','checkbox',true,'A cat may settle beside a resting cat without waking it.'],
  ['chasing','Chasing','checkbox',true,'Cats may invite each other to a short chase on the same surface.'],
  ['dashboard_props','Shared dashboard toys','checkbox',false,'Put toys on the dashboard for cats to share.'],
  ['toy_mice','Add mice','number',1,'How many shared mice to put out.',0,6],
  ['toy_balls','Add balls','number',1,'How many shared balls to put out.',0,6],
  ['click_attention','Follow dashboard clicks','checkbox',true,'The nearest eligible cat can investigate the clicked surface.']
 ]},
 {title:'Advanced settings',fields:[
  ['show_controls','Show on-card controls','checkbox',false,'Show Pause, Spawn toy, Come home, and diagnostics.'],
  ['draggable','Pick up and drag cats','checkbox',true,'Pick up your cat and set them down somewhere clear. Press Escape to cancel.']
 ]},
 {title:'Labels & diagnostics',fields:[
  ['debug_names','Above cat: name','checkbox',false,'Show the cat’s name above them.'],
  ['debug_action_above','Above cat: activity','checkbox',false,'Show their current activity above them.'],
  ['debug_name_below','Below cat: name','checkbox',true,'Show the cat’s name below them.'],
  ['debug_action_below','Below cat: activity','checkbox',true,'Show their current activity below them.'],
  ['debug_mood','Mood glow','checkbox',false,'Show a coloured glow around the cat.'],
  ['debug_vertical_surfaces','Show card outlines & climbing faces','checkbox',false,'Show card borders, grip areas, usable tops and rejection reasons.'],
  ['debug_surfaces','Show walking surfaces','checkbox',false,'Draw discovered supports on the dashboard.'],
  ['debug_paths','Show routes & jump arcs','checkbox',false,'Draw where your cat plans to walk and jump.'],
  ['debug_pois','Show points of interest','checkbox',false,'Mark potential destinations and resting points.']
 ]}
];
const catEditorFields=new Map(catEditorGroups.flatMap(g=>g.fields.map(f=>[f[0],f])));
const catEditorOptions={mood_preset:[['natural','Natural'],['playful','Playful'],['relaxed','Relaxed'],['alert','Alert']],post_type:[['post','Post'],['tree','Tree']],tree_levels:[['1','One level'],['2','Two levels']],scratch_debris:[['small','Small bits'],['pixel','Pixel-sized bits'],['none','No bits']],outline:[['auto','Automatic'],['none','None'],['black','Black'],['white','White']],life_stage:[['kitten','Kitten'],['adult','Adult'],['senior','Senior']],bed_style:[['igloo','Igloo'],['simple','Simple bed'],['box','Cardboard box']],settling_mode:[['active','Always active'],['default','Default settle periods (5–10 min)'],['extended','Extended settle periods (15–30 min)'],['custom','Custom']]};
const catEditorValue=(config,key)=>{
 if(key==='settling_mode')return catEditorOptions.settling_mode.some(([v])=>v===config[key])?config[key]:'default';
 if(config[key]!==undefined)return config[key];
 if(key==='bed_primary_color')return config.igloo_color||'#aa6627';
 if(key==='show_scratching_post')return config.scratching_posts!==false;
 if(key==='show_controls')return config.show_home!==false;
 if(catEditorFields.get(key)?.[2]==='range')return 1+Math.round(4*(window.pixelCatTemperamentV1?.(config.cat_id||'cat',config.temperament)[key]??.5));
 if(key==='post_type')return config.test_cat_tree?'tree':'post';
 if(key==='scratch_debris')return config.full_pixel_scratch_debris?'pixel':'small';
 if(key==='quiet_company'||key==='chasing')return !!config.social_behaviour;
 if(key==='debug_name_below'||key==='debug_action_below')return config.debug_labels!==false;
 return catEditorFields.get(key)?.[3];
};
const catEditorChange=(config,key,raw)=>{
 const field=catEditorFields.get(key);if(!field)throw Error('Unknown editor field');
 const next={...config},kind=field[2];
 if(kind==='checkbox')next[key]=!!raw;
 else if(raw==='')delete next[key];
 else if(kind==='number'||kind==='percent'){
  const value=Number(raw);if(!Number.isFinite(value)||value<field[5]||value>field[6]||!Number.isInteger(value))throw Error('Invalid numeric value');next[key]=value;
 }else {if(kind==='select'&&!catEditorOptions[key]?.some(([v])=>v===raw))throw Error('Invalid selection');next[key]=String(raw);}
 // The legacy preview override otherwise wins over the editor's freefall field.
 if(kind==='range'){delete next[key];next.temperament={...config.temperament,[key]:(Number(raw)-1)/4};}
 if((key==='quiet_company'||key==='chasing')&&next[key]){const other=key==='chasing'?'quiet_company':'chasing';next[other]??=!!config.social_behaviour;next.social_behaviour=true;}
 if(key==='mood_preset')next.mood_behaviour=true;
 return next;
};
class PixelCatHomeEditor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this.config={};this.timers=new Map();}
 set hass(value){this._hass=value;}
 setConfig(config){if(this.rendered&&JSON.stringify(config)===JSON.stringify(this.config))return;this.clearPending();this.config={...config};this.render();}
 clearPending(){for(const timer of this.timers.values())clearTimeout(timer);this.timers.clear();}
 connectedCallback(){if(this.rendered&&!this.catPreview&&!['monitor','behaviour-lab'].includes(this.config.mode))this.render();}
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
  let last=actions[Math.floor(Math.random()*actions.length)],pending=[...last||[]];
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
  const lab=this.config.mode==='behaviour-lab',monitor=this.config.mode==='monitor',utility=lab||monitor,purpose=document.createElement('label');purpose.className='purpose';purpose.textContent='Card purpose';purpose.title='Choose a companion, performance monitor or Behaviour Lab.';
  const select=document.createElement('select');select.setAttribute('aria-label','Card purpose');select.dataset.key='mode';
  for(const [value,label]of [['companion','Cat companion'],['monitor','Performance monitor · no cat'],['behaviour-lab','Behaviour Lab · no cat']]){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option);}select.value=utility?this.config.mode:'companion';
  select.addEventListener('change',()=>{for(const input of this.shadowRoot.querySelectorAll('input'))if(this.timers.has(input.dataset.key))input.dispatchEvent(new Event('change'));this.config={...this.config,mode:select.value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config}},bubbles:true,composed:true}));this.render();});purpose.append(select);
  const welcome=document.createElement('div'),intro=document.createElement('p');welcome.className='welcome';intro.textContent=lab?'Temporarily favour a behaviour for cats on this view.':monitor?'Give your monitor a name. It tracks how this dashboard is running.':'It’s time to meet your new friend. Give them a name, choose their fur colour and age, and make them feel at home.';welcome.append(intro);const cat=utility?null:this.makePreview();if(cat)welcome.append(cat);this.shadowRoot.append(welcome);
  const groups=lab?[{title:'Behaviour Lab',open:true,fields:[]}]:monitor?[{title:'Performance monitor',open:true,fields:[['title','Monitor title','text','Cat performance','Saved title for this page’s shared performance monitor.']]}]:catEditorGroups;
  for(const group of groups){
   const section=document.createElement('details');section.dataset.group=group.title;const hasPurpose=utility||group.title==='Advanced settings';section.open=(hasPurpose&&focusedKey==='mode')||(expanded.get(group.title)??!!group.open);
   const summary=document.createElement('summary');summary.textContent=group.title;section.append(summary);
   const fields=document.createElement('div');fields.className='fields';
   for(const [key,title,kind,,help,min,max]of group.fields){
    if(key.startsWith('bed_')&&(this.config.include_bed===false||this.config.show_home===false)||key.startsWith('bowl_')&&this.config.include_bowl===false||key==='post_type'&&!catEditorValue(this.config,'show_scratching_post')||key==='tree_levels'&&(!catEditorValue(this.config,'show_scratching_post')||catEditorValue(this.config,'post_type')!=='tree')||key.startsWith('toy_')&&!this.config.dashboard_props)continue;
    if(['settle_after_minutes','settled_rest_min_minutes','settled_rest_max_minutes'].includes(key)&&catEditorValue(this.config,'settling_mode')!=='custom')continue;
    const label=document.createElement('label');label.className='field';const copy=document.createElement('span');copy.textContent=title;
    const hint=document.createElement('small');hint.id='hint-'+key;hint.textContent=help;copy.append(hint);
    const input=document.createElement(kind==='select'?'select':'input');if(kind!=='select')input.type=kind==='percent'?'range':kind;else for(const [value,text]of catEditorOptions[key]){const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);}input.dataset.key=key;input.setAttribute('aria-label',title);input.setAttribute('aria-describedby',hint.id);
    const value=key==='title'?(this.config.title??'Cat performance'):catEditorValue(this.config,key);if(kind==='checkbox'){input.checked=!!value;}else input.value=kind==='color'&&/^#[0-9a-f]{3}$/i.test(value)?'#'+[...value.slice(1)].map(x=>x+x).join(''):kind==='color'&&!/^#[0-9a-f]{6}$/i.test(value)?catEditorFields.get(key)[3]:value??'';
    if(kind==='range'){input.min=1;input.max=5;input.step=1;}
    if(kind==='number'||kind==='percent'){input.min=min;input.max=max;input.step=1;}
    const commit=(reset=false)=>{
     clearTimeout(this.timers.get(key));this.timers.delete(key);
     input.setCustomValidity?.('');
     if((kind==='number'||kind==='percent')&&!input.checkValidity())return;
     if(key==='settling_mode')for(const pending of this.shadowRoot.querySelectorAll('input'))if(this.timers.has(pending.dataset.key))pending.dispatchEvent(new Event('change'));
     if(key==='settled_rest_min_minutes'||key==='settled_rest_max_minutes'){
      const other=key==='settled_rest_min_minutes'?'settled_rest_max_minutes':'settled_rest_min_minutes',value=input.value===''?catEditorFields.get(key)[3]:Number(input.value),bound=Number(catEditorValue(this.config,other)),invalid=key==='settled_rest_min_minutes'?value>bound:value<bound;
      input.setCustomValidity?.(invalid?'Maximum rest must be at least the minimum.':'');if(invalid){input.reportValidity();return;}
     }
     const next=key==='title'?{...this.config,title:input.value}:catEditorChange(this.config,key,reset===true?'':kind==='checkbox'?input.checked:input.value);
     if(JSON.stringify(next)===JSON.stringify(this.config))return;
     this.config=next;
     this.updatePreview();
     this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config}},bubbles:true,composed:true}));
     if(['settling_mode','include_bed','include_bowl','show_scratching_post','post_type','dashboard_props'].includes(key))this.render();
    };
    input.addEventListener('change',commit);
    if(kind!=='checkbox'&&kind!=='select')input.addEventListener('input',()=>{input.setCustomValidity?.('');clearTimeout(this.timers.get(key));this.timers.set(key,setTimeout(commit,200));});
    label.append(copy,input);fields.append(label);
    if(kind==='color'&&key!=='color'&&this.config[key]!==undefined){const reset=document.createElement('button');reset.type='button';reset.textContent='Reset '+title.toLowerCase();reset.onclick=()=>{commit(true);this.render();};fields.append(reset);}
    if(key==='color'||key==='bed_primary_color'||key==='bed_secondary_color'){
     const cat=key==='color',swatches=document.createElement('div');swatches.className='swatches';swatches.setAttribute('aria-label',cat?'Cat colour presets':title+' presets');
     const palette=cat?[['Charcoal','#222222'],['Ginger','#ad6c2d'],['Cream','#e7cf9c'],['Grey','#70818d'],['White','#eeeeee']]:[['Brown','#aa6627'],['Slate','#70818d'],['Blue','#4e86ae'],['Green','#518d70'],['Rose','#b77f91']];
     for(const [name,colour]of palette){const button=document.createElement('button');button.type='button';button.style.background=colour;button.setAttribute('aria-label',name+(cat?' cat':' '+title.toLowerCase()));button.title=name;button.addEventListener('click',()=>{input.value=colour;input.dispatchEvent(new Event('change'));});swatches.append(button);}fields.append(swatches);
    }
   }
   if(hasPurpose)fields.append(purpose);
   section.append(fields);this.shadowRoot.append(section);

  }

  if(focusedKey)[...this.shadowRoot.querySelectorAll('[data-key]')].find(control=>control.dataset.key===focusedKey)?.focus();
  const note=document.createElement('p');note.className='note';note.textContent=lab?'Save to add Behaviour Lab.':monitor?'Save to add your monitor.':'When you’re ready, save to welcome your cat to the dashboard.';this.shadowRoot.append(note);this.rendered=true;
 }
}
if(!customElements.get('pixel-cat-home-editor'))customElements.define('pixel-cat-home-editor',PixelCatHomeEditor);
