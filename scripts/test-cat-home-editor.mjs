import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Node{
 constructor(tag=''){this.tag=tag;this.style={};this.children=[];this.dataset={};this.attrs={};this.listeners={};}
 attachShadow(){return this.shadowRoot=new Node('shadow');}
 set innerHTML(value){this.html=value;this.children=[];}
 append(...nodes){this.children.push(...nodes);}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,v){this.listeners[k]=v;}
 dispatchEvent(e){this.event=e;this.listeners[e.type]?.(e);return true;}
 querySelectorAll(tag){return this.children.flatMap(n=>[...(n.tag===tag?[n]:[]),...n.querySelectorAll(tag)]);}
 reportValidity(){return this.value===''||Number.isInteger(Number(this.value))&&Number(this.value)>=this.min&&Number(this.value)<=this.max;}
 setCustomValidity(value){this.validationMessage=value;}
 checkValidity(){return this.reportValidity();}
}
const registered=new Map(),document={createElement:tag=>registered.has(tag)?new (registered.get(tag))():new Node(tag)};
const timers=new Map();let nextTimer=0;
const box={window:{},document,Event:class{constructor(type){this.type=type;}},setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id),HTMLElement:Node,CustomEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}},customElements:{get:k=>registered.get(k),define:(k,v)=>registered.set(k,v),whenDefined:k=>registered.has(k)?Promise.resolve():Promise.reject(Error(k))}};
vm.runInNewContext(fs.readFileSync('prototype/cat-home-editor.js','utf8')+'\n'+['prototype/cat-polish.js','prototype/cat-outline.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.Editor=PixelCatHomeEditor;globalThis.Home=PixelCatHome;',box);
const editor=await box.Home.getConfigElement();assert.ok(editor instanceof box.Editor);assert.equal(box.Home.getStubConfig().type,'custom:pixel-cat-home');
const polish=box.window.pixelCatPolishV1,outline=box.window.pixelCatOutlineV1;
const darkTheme=outline.darkTheme;
for(const dark of [true,false]){
 outline.darkTheme=()=>dark;
 assert.equal(outline.colour({color:'#eee'}),dark?'none':'black');
 assert.equal(outline.colour({color:'#222'}),'white');
 assert.equal(outline.colour({color:'#eee',outline:'none'}),'none');
 assert.equal(outline.colour({color:'#222',outline:'black'}),'black');
 assert.equal(outline.colour({color:'#bb783d'}),'none');
 assert.equal(polish.colour(()=>.99),'#eeeeee');
}
outline.darkTheme=darkTheme;
const advanced={surface_rules:[{match:{type:'entities'},surfaces:[]}],mood:{seed:17}},initial={type:'custom:pixel-cat-home',name:'<b>Miso</b>',...advanced};editor.setConfig(initial);assert.equal(editor.event,undefined,'Opening editor never writes defaults');
const input=key=>editor.shadowRoot.querySelectorAll('input').find(n=>n.dataset.key===key);
assert.equal(input('name').value,'<b>Miso</b>');assert.equal(input('show_home').checked,true);assert.equal(input('debug_labels').checked,true);assert.equal(input('casual_speed').value,6);
const change=(key,value)=>{const n=input(key);if(n.type==='checkbox')n.checked=value;else n.value=value;n.listeners.change();};
change('show_home',false);assert.equal(editor.event.type,'config-changed');assert.equal(editor.event.bubbles,true);assert.equal(editor.event.composed,true);assert.equal(editor.event.detail.config.show_home,false);assert.equal(editor.event.detail.config.show_controls,true,'Changing an old card’s igloo switch preserves its displayed controls choice');assert.equal(initial.show_home,undefined);assert.equal(editor.event.detail.config.surface_rules,advanced.surface_rules);assert.equal(editor.event.detail.config.mood,advanced.mood);assert.equal(editor.event.detail.config.relaxed_speed,undefined);
change('casual_speed','7');assert.equal(editor.event.detail.config.casual_speed,7);const valid=editor.event;change('cell_size','7');assert.equal(editor.event,valid,'Invalid size cannot emit a configuration update');change('name','');assert.equal('name' in editor.event.detail.config,false);
editor.setConfig({...initial,show_home:false,walk_speed:12,test_freefall_pose:false});assert.equal(input('show_home').checked,false);assert.equal(input('relaxed_speed').value,12);assert.equal(input('freefall_enabled').checked,false);change('freefall_enabled',true);assert.equal(editor.event.detail.config.freefall_enabled,true);assert.equal('test_freefall_pose' in editor.event.detail.config,false);
const movement=editor.shadowRoot.querySelectorAll('details').find(n=>n.dataset.group==='Movement & surfaces');movement.open=true;editor.setConfig(editor.config);assert.equal(editor.shadowRoot.querySelectorAll('details').find(n=>n.dataset.group==='Movement & surfaces').open,true,'HA config echo preserves expanded groups');
const name=input('name');name.value='Pea';name.listeners.input();name.value='Peanut';name.listeners.input();assert.equal(timers.size,1,'Typing coalesces into one pending update');for(const fn of [...timers.values()])fn();assert.equal(editor.event.detail.config.name,'Peanut');assert.equal(timers.size,0);editor.setConfig(editor.event.detail.config);assert.equal(input('name'),name,'HA echo preserves the focused input DOM');const event=editor.event;name.listeners.change();assert.equal(editor.event,event,'Blur does not duplicate an already committed input');name.value='Unsaved';name.listeners.input();editor.setConfig({...editor.config,name:'External'});assert.equal(timers.size,0,'External YAML cancels stale pending text');assert.equal(input('name').value,'External');input('name').listeners.input();editor.disconnectedCallback();assert.equal(timers.size,0,'Teardown cancels pending work');
console.log('PASS: real editor factory/stub, silent defaults, composed config-changed events, unknown YAML preservation, immutable updates, validation, clearing overrides, legacy speed/freefall aliases and expanded-group retention.');

const swatch=editor.shadowRoot.querySelectorAll('button').find(n=>n.title==='Ginger');swatch.listeners.click();assert.equal(editor.config.color,'#ad6c2d');
const purpose=()=>editor.shadowRoot.querySelectorAll('select').find(n=>n.dataset.key==='mode');
input('name').value='Pending name';input('name').listeners.input();purpose().value='monitor';purpose().listeners.change();assert.equal(editor.config.name,'Pending name');assert.equal(editor.config.mode,'monitor');assert.equal(input('name'),undefined);assert.equal(input('title').value,'Cat performance');change('title','Stress timing');assert.equal(editor.event.detail.config.title,'Stress timing');assert.equal(editor.config.surface_rules,advanced.surface_rules);
purpose().value='companion';purpose().listeners.change();assert.equal(input('name').value,'Pending name');assert.equal(input('color').value,'#ad6c2d');assert.equal(editor.config.title,'Stress timing');assert.equal(timers.size,0);
assert.equal(box.Home.getStubConfig().arrival,'igloo');assert.equal(box.Home.getStubConfig().debug_labels,false);
assert.deepEqual(Array.from(box.window.customCards,c=>c.type),['pixel-cat-home']);
console.log('PASS: purpose switching retains pending text/unknown YAML and companion settings, monitor title, colour presets and quiet igloo arrival stub.');

const stub=box.Home.getStubConfig();for(const key of ['mood_behaviour','social_behaviour','interaction_behaviour','dashboard_props','prop_reactions','landing_reactions','startle_followups'])assert.equal(stub[key],true);
editor.setConfig(stub);for(const key of ['mood_behaviour','social_behaviour','interaction_behaviour','dashboard_props','prop_reactions','landing_reactions','startle_followups'])assert.equal(input(key).checked,true);assert.equal(input('show_controls').checked,false,'New cards hide controls');const advancedSettings=editor.shadowRoot.querySelectorAll('details').find(n=>n.dataset.group==='Advanced settings');assert.ok(advancedSettings.querySelectorAll('input').includes(input('show_controls')));assert.equal(advancedSettings.open,false,'Advanced settings starts collapsed');change('show_controls',true);assert.equal(editor.config.show_controls,true);change('show_controls',false);assert.equal(editor.config.show_home,undefined,'Controls do not hide the igloo');change('show_home',false);assert.equal(editor.config.show_controls,false);editor.setConfig({type:stub.type,show_home:false});assert.equal(input('show_controls').checked,false,'Legacy hidden home remains fully hidden');
console.log('PASS: new companion behaviour defaults enabled; home and controls toggle independently, with legacy hidden-home compatibility.');

const defaultCat=box.Home.getStubConfig();editor.setConfig(defaultCat);change('cell_size','6');assert.equal(editor.config.cell_size,6);assert.equal(input('bed_primary_color').value,'#aa6627');editor.shadowRoot.querySelectorAll('button').find(n=>n.attrs['aria-label']==='Blue bed primary colour').listeners.click();assert.equal(editor.config.bed_primary_color,'#4e86ae');assert.equal(editor.config.color,defaultCat.color,'Igloo tint is independent from cat ink');const homeGroup=editor.shadowRoot.querySelectorAll('details').find(n=>n.dataset.group==='Make them at home');assert.ok(homeGroup.querySelectorAll('input').some(n=>n.dataset.key==='show_home'));

const bedStyle=editor.shadowRoot.querySelectorAll('select').find(n=>n.dataset.key==='bed_style');assert.ok(['igloo','simple'].includes(bedStyle.value));bedStyle.value='simple';bedStyle.listeners.change();assert.equal(editor.config.bed_style,'simple');change('bed_secondary_color','#964252');assert.equal(editor.config.bed_secondary_color,'#964252');editor.setConfig({type:stub.type,igloo_color:'#123456'});assert.equal(input('bed_primary_color').value,'#123456','Legacy igloo colour remains editable');

box.window.pixelCatPrimaryV1={defaultPrimary:()=>true};const firstHome=box.Home.getStubConfig();assert.equal(firstHome.primary_home,true);editor.setConfig(firstHome);assert.equal(input('primary_home').checked,true);assert.equal(input('post_rest_behaviour').checked,true);
box.window.pixelCatPrimaryV1={defaultPrimary:()=>false};const laterHome=box.Home.getStubConfig();assert.equal(laterHome.primary_home,false);editor.setConfig(laterHome);assert.equal(input('primary_home').checked,false);editor.setConfig({type:laterHome.type});assert.equal(input('primary_home').indeterminate,true,'Legacy automatic mode is distinct from an explicitly unchecked new home');

editor.setConfig(initial);const stageSelect=()=>editor.shadowRoot.querySelectorAll('select').find(n=>n.dataset.key==='life_stage');assert.equal(stageSelect().value,'adult');for(const stage of ['kitten','senior','adult']){stageSelect().value=stage;stageSelect().listeners.change();assert.equal(editor.config.life_stage,stage);assert.equal(editor.config.surface_rules,advanced.surface_rules);editor.setConfig({...editor.config});assert.equal(stageSelect().value,stage);}console.log('PASS: silent adult default and life-stage editor round trips retain advanced configuration.');

const settlingSelect=()=>editor.shadowRoot.querySelectorAll('select').find(n=>n.dataset.key==='settling_mode'),chooseSettling=mode=>{settlingSelect().value=mode;settlingSelect().listeners.change();};
editor.setConfig(initial);assert.equal(settlingSelect().value,'default');assert.equal(editor.config.settling_mode,undefined,'Displayed default does not change YAML');assert.equal(input('settle_after_minutes'),undefined);assert.ok(editor.shadowRoot.querySelectorAll('details').find(n=>n.dataset.group==='Daily rhythm').querySelectorAll('select').includes(settlingSelect()));
input('name').value='Pending settling name';input('name').listeners.input();chooseSettling('custom');assert.equal(editor.config.name,'Pending settling name');assert.equal(timers.size,0);assert.equal(input('settle_after_minutes').value,5);assert.equal(input('settled_rest_min_minutes').value,5);assert.equal(input('settled_rest_max_minutes').value,10);
change('settle_after_minutes','0');change('settled_rest_min_minutes','20');assert.equal(editor.config.settled_rest_min_minutes,undefined,'Inverted range cannot be saved');assert.ok(input('settled_rest_min_minutes').validationMessage);change('settled_rest_max_minutes','30');change('settled_rest_min_minutes','20');assert.equal(editor.config.settled_rest_min_minutes,20);assert.equal(input('settled_rest_min_minutes').validationMessage,'');const saved=editor.event;change('settle_after_minutes','-1');assert.equal(editor.event,saved);change('settle_after_minutes','0');
for(const mode of ['active','default','extended','custom']){chooseSettling(mode);editor.setConfig({...editor.config});assert.equal(settlingSelect().value,mode);assert.equal(editor.config.surface_rules,advanced.surface_rules);assert.equal(editor.config.settled_rest_min_minutes,20,'Presets retain custom values for a later return');assert.equal(!!input('settle_after_minutes'),mode==='custom');}
editor.setConfig({...initial,settling_mode:'unknown'});assert.equal(settlingSelect().value,'default','Unknown YAML mode displays runtime fallback');console.log('PASS: early settling selection, silent defaults, conditional custom ranges, validation, pending edits and preset/YAML round trips.');
