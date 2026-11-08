// Decorative fixtures for routing tests. No HA services or entity writes.
class PixelCatPlayground extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});}
 setConfig(config){this.config={...config,type:'custom:pixel-cat-playground',cat_surfaces:config.cat_surfaces||[{id:'shelf',label:'Middle shelf',x1:10,x2:90,y:45,poses:['sit','look','clean'],interest:true},{id:'small-perch',label:'Small perch',x1:10,x2:20,y:68,poses:['perch']},{id:'floor',label:'Inside floor',x1:5,x2:95,y:90,poses:['loaf','sit','clean','stretch']}]};this.paint();}
 set hass(value){}
 getCardSize(){return Math.ceil((this.config.height||260)/56);}
 getGridOptions(){return {columns:12,rows:'auto'};}
 paint(){const height=Math.max(180,Math.min(500,Number(this.config.height)||260));this.shadowRoot.innerHTML='<style>:host{display:block}ha-card{display:block;position:relative;box-sizing:border-box;background:var(--ha-card-background,#fff);border:1px solid var(--divider-color,#cbd5df);border-radius:12px;overflow:hidden;font:13px system-ui;color:var(--primary-text-color,#24313d)}h3{position:absolute;top:8px;left:16px;margin:0;font-size:14px}.shelf{position:absolute;height:5px;background:#9b7958}.label{position:absolute;font-size:10px;color:#7f8b98}.books{position:absolute;height:24px;bottom:5px;left:4px;width:34px;background:repeating-linear-gradient(90deg,#b97f66 0 5px,#d0a478 5px 8px,#6595a2 8px 13px)}button{position:absolute;top:30px;left:12px;font:10px system-ui;cursor:pointer}.bowl{position:absolute;bottom:10%;right:12%;width:20px;height:8px;background:#ce9068;border-radius:0 0 10px 10px}</style><ha-card><h3></h3><button>Change height</button><div class="bowl"></div></ha-card>';const card=this.shadowRoot.querySelector('ha-card');card.style.height=height+'px';card.querySelector('h3').textContent=this.config.name||'Shelves & inside floor';
  for(const def of this.config.cat_surfaces){if(![def.x1,def.x2,def.y].every(Number.isFinite))continue;const line=document.createElement('div');line.className='shelf';line.style.cssText=`left:${def.x1}%;width:${def.x2-def.x1}%;top:${def.y}%;`;const label=document.createElement('span');label.className='label';label.textContent=def.label||def.id;label.style.cssText=`left:${def.x1}%;top:calc(${def.y}% + 7px)`;card.append(line,label);}
  card.querySelector('button').onclick=()=>{this.config.height=height===260?320:260;this.paint();};
 }
}
if(!customElements.get('pixel-cat-playground'))customElements.define('pixel-cat-playground',PixelCatPlayground);
// Development fixture: available through YAML, not the public card picker.
