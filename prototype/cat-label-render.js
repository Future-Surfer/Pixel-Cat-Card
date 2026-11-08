// Mood labels and optional glow; DOM work stays cached and throttled.
window.pixelCatLabelsV1.render=function(t){
 if(typeof document==='undefined')return;
    if(!this.config.debug_mood&&this.config.debug_labels===false){this.moodHalo?.remove();this.moodHalo=null;}else if(this.svg&&this.layer){
      if(!this.moodHalo){const halo=document.createElement('div');halo.dataset.moodActor=this.ownerKey;halo.style.cssText=`position:absolute;left:0;top:0;width:${36*this.scale}px;height:${36*this.scale}px;pointer-events:none;border-radius:50%;`;this.layer.insertBefore(halo,this.svg);this.moodHalo=halo;}
      this.moodHalo.style.transform=this.svg.style.transform+` translate(${-6*this.scale}px,${-6*this.scale}px)`;
      window.pixelCatLabelsV1?.place(this);
    }
    if(!this.mood&&!this.config.debug_mood&&this.config.debug_labels===false)return;if(t<(this.moodDebugAt||0))return;this.moodDebugAt=t+200;
    const m=this.ensureMood().view(),text=`${m.label} · P ${m.values.playfulness.toFixed(2)} S ${m.values.sleepiness.toFixed(2)} A ${m.values.alertness.toFixed(2)} · ${m.held?'held':'drifting'}`;
    if(this.moodHalo){const background=this.config.debug_mood?`radial-gradient(ellipse,rgba(${m.color},${m.strength}) 0%,rgba(${m.color},0) 70%)`:'none';if(this.moodHalo.style.background!==background)this.moodHalo.style.background=background;window.pixelCatLabelsV1?.update(this,m);}
    this.setAttribute('data-mood',JSON.stringify(m));const readout=this.shadowRoot?.querySelector('.mood-readout');if(readout&&window.pixelCatLabelsV1?.visible(readout)){readout.textContent=text+' · seed '+m.seed+' · '+m.lastEvent;for(const input of this.shadowRoot.querySelectorAll('[data-mood]'))if(input!==document.activeElement)input.value=m.values[input.dataset.mood];}
    const decisions=this.shadowRoot?.querySelector('.decision-readout');if(decisions&&window.pixelCatLabelsV1?.visible(decisions))decisions.textContent=(this.getAttribute('data-encounters')||'')+'\n'+(this.social?.trace||[]).slice(0,5).map(e=>JSON.stringify(e)).join('\n');
  };
