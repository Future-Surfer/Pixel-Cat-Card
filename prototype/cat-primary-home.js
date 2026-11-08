// Persist first-placement choices in new card stubs. Legacy fallback is only a
// presentation default: it never rewrites another card or controls world scale.
const catPrimaryHomes=new Set();
const catPrimary={
 join(a){catPrimaryHomes.add(a);},
 leave(a){catPrimaryHomes.delete(a);},
 current(){return [...catPrimaryHomes].filter(a=>a.active&&a.isConnected&&a.config.mode!=='monitor'&&(typeof location==='undefined'||a.href===location.pathname));},
 defaultPrimary(){return this.current().length===0;},
 selection(root){const homes=this.current().filter(a=>a.root===root),explicit=homes.filter(a=>a.config.primary_home===true);return {primary:explicit.length?explicit[0]:homes.find(a=>a.config.primary_home===undefined),conflict:explicit.length>1,explicit};},
 tick(a,t){
  if(t<(a.primaryAt||0))return;a.primaryAt=t+500;
  const editing=!!(a.root?.editMode||a.root?.lovelace?.editMode),selection=editing?this.selection(a.root):null,primary=editing&&(a.config.primary_home===true||selection.primary===a);
  if(primary&&a.shadowRoot?.append){
   if(!a.primaryFlag){const flag=document.createElement('span');flag.dataset.primaryHomeFlag='';flag.style.cssText='position:absolute;top:6px;right:6px;z-index:2;padding:2px 5px;border-radius:4px;background:var(--primary-color,#168b76);color:var(--text-primary-color,#fff);font:10px system-ui;pointer-events:none';a.shadowRoot.querySelector('ha-card')?.append(flag);a.primaryFlag=flag;}
   const text=selection.conflict?'Primary · conflict':a.config.primary_home===undefined?'Primary · automatic':'Primary';if(a.primaryFlag.textContent!==text)a.primaryFlag.textContent=text;
  }else if(a.primaryFlag){a.primaryFlag.remove();a.primaryFlag=null;}
  if(a.config.show_home===false&&!a.config.show_controls&&a.style){const display=editing||a.worldState?.issue?'':'none';if(a.style.display!==display)a.style.display=display;}
 }
};
window.pixelCatPrimaryV1=catPrimary;
