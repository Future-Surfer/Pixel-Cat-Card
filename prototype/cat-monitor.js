// One browser-frame sampler shared by all monitor cards, independent of actors.
// RAF measures foreground scheduling intervals, not CPU usage or GPU render time.
const catMonitorHub={
 listeners:new Set(),samples:[],history:[],last:null,published:null,raf:null,owners:()=>new Map(),
 reset(){this.samples=[];this.history=[];this.last=null;this.published=null;this.warmStarted=null;this.warmLast=null;this.quietUntil=0;this.readyProbeAt=0;this.readySignature=null;this.collecting=false;this.warmRemaining=8000;this.warmReason='Loading dashboard';},
 startup(t){
  if(this.collecting)return true;
  this.warmStarted??=t;
  if(this.warmLast!==null&&t-this.warmLast>100)this.quietUntil=t+2000;
  this.warmLast=t;
  if(t>=this.readyProbeAt){
   this.readyProbeAt=t+250;
   const cats=[...this.owners()].map(([a])=>a).filter(a=>a.active&&a.isConnected&&a.href===location.pathname);
   const ready=(!document.readyState||document.readyState==='complete')&&document.fonts?.status!=='loading'&&cats.every(a=>a.homeArtReady&&a.support&&!a.needsMeasure&&!a.waitingForSurface);
   const signature=cats.map(a=>a.ownerKey).sort().join('|');
   if(!ready||signature!==this.readySignature)this.quietUntil=t+2000;
   this.readySignature=signature;this.startupReady=ready;
  }
  this.warmRemaining=Math.max(0,this.warmStarted+8000-t,this.quietUntil-t,this.startupReady?0:1000);
  this.warmReason=this.startupReady?'Waiting for smooth frames':'Loading dashboard / cat surfaces';
  if(this.warmRemaining)return false;
  this.collecting=true;this.last=null;this.warmReason='';return true;
 },
 stats(){const n=this.samples.length,mean=n?this.samples.reduce((a,b)=>a+b,0)/n:0,sorted=[...this.samples].sort((a,b)=>a-b);return {mean,p95:n?sorted[Math.ceil(n*.95)-1]:0,fps:mean?1000/mean:0,long:this.samples.filter(v=>v>50).length,n};},
 frame(t){
  if(!document.hidden){
   const wasWarming=!this.collecting;this.startup(t);
   if(!this.warmRemaining&&this.last!==null&&t>this.last){this.diagnostics.gap(t,t-this.last);this.samples.push(t-this.last);if(this.samples.length>600)this.samples.shift();}
   this.last=this.warmRemaining?null:t;
   if(this.published===null||t-this.published>=1000||wasWarming&&!this.warmRemaining){this.published=t;const stats={...this.stats(),warmupMs:this.warmRemaining,warmupReason:this.warmReason};if(!this.warmRemaining)this.diagnostics.tick(t,stats);if(stats.n){this.history.push(stats);if(this.history.length>60)this.history.shift();}for(const fn of this.listeners)fn(stats,this.history);}
  }else this.last=null;
  this.raf=this.listeners.size&&!document.hidden?requestAnimationFrame(t=>this.frame(t)):null;
 },
 visibility(){catMonitorHub.last=null;if(!catMonitorHub.collecting){catMonitorHub.warmLast=null;catMonitorHub.quietUntil=0;catMonitorHub.readyProbeAt=0;catMonitorHub.readySignature=null;}if(document.hidden){if(catMonitorHub.raf!==null)cancelAnimationFrame(catMonitorHub.raf);catMonitorHub.raf=null;}else if(catMonitorHub.listeners.size&&catMonitorHub.raf===null)catMonitorHub.raf=requestAnimationFrame(t=>catMonitorHub.frame(t));},
 subscribe(fn){
  this.listeners.add(fn);
  if(this.listeners.size===1){this.reset();this.diagnostics.start();document.addEventListener('visibilitychange',this.visibility);this.visibility();}
  return ()=>{this.listeners.delete(fn);if(!this.listeners.size){if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;this.diagnostics.stop();document.removeEventListener('visibilitychange',this.visibility);this.reset();}};
 }
};
catMonitorHub.diagnostics=createCatDiagnostics(catMonitorHub);
window.pixelCatMonitorV1=catMonitorHub;
const catMonitorWorld=el=>{while(el){if(el.matches?.('[data-cat-world],hui-sections-view,hui-masonry-view'))return el;el=el.parentElement||el.getRootNode?.()?.host;}return null;};
// Frame-budget reference bands; no new sampling, only the existing 1s render.
function catMonitorChart(history){
 const max=Math.max(50,...history.map(s=>s.p95)),y=ms=>76-Math.min(max,ms)/max*68;
 const bands=[[0,16.7,'#43a047'],[16.7,33.3,'#f9a825'],[33.3,max,'#e53935']].map(([lo,hi,c])=>'<rect x="38" width="300" y="'+y(hi)+'" height="'+(y(lo)-y(hi))+'" fill="'+c+'" opacity=".13"/>').join('');
 const ticks=[max,33.3,16.7,0].filter(v=>v===max||v===0||y(v)>19&&y(v)<65).map(v=>'<line x1="38" x2="338" y1="'+y(v)+'" y2="'+y(v)+'" stroke="currentColor" opacity=".18"/><text x="34" y="'+(y(v)+3)+'" text-anchor="end" fill="currentColor" font-size="9">'+(v===max?Math.ceil(v):v)+'</text>').join('');
 return {max,background:bands+ticks,points:key=>history.map((s,i)=>(338-(history.length-1-i)*300/59)+','+y(s[key])).join(' ')};
}
class PixelCatMonitor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});}
 setConfig(config){this.config={...config};this.render();if(this.isConnected)this.start();}
 set hass(value){} // HA state updates do not rebuild this card.
 getCardSize(){return 4;}
 getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
 static getStubConfig(){return {title:'Cat performance'};}
 connectedCallback(){if(this.config)this.start();}
 disconnectedCallback(){this.unsubscribe?.();this.unsubscribe=null;}
 start(){if(this.unsubscribe)return;for(let el=this;el;el=el.parentElement||el.getRootNode?.()?.host)if(['hui-card-preview','hui-card-picker','hui-dialog-edit-card','hui-dialog-edit-dashboard','hui-card-element-editor'].includes(el.localName)){this.shadowRoot.querySelector('.summary').textContent='Preview · monitoring starts on the dashboard';return;}this.unsubscribe=catMonitorHub.subscribe((stats,history)=>this.update(stats,history));}
 render(){
  if(!this.shadowRoot.querySelector('ha-card')){
   this.shadowRoot.innerHTML=`<style>
    :host{display:block}ha-card{padding:16px;box-sizing:border-box}h2{font-size:18px;margin:0 0 10px}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.metric{min-width:0}strong{display:block;font-size:22px;font-variant-numeric:tabular-nums}.metric span,small{color:var(--secondary-text-color,#777);font-size:12px}.summary{margin:10px 0;font-size:13px;min-height:34px}svg{display:block;width:100%;height:90px;background:var(--secondary-background-color,#8881);border-radius:5px}.mean{stroke:var(--primary-color,#03a9f4)}.p95{stroke:#e6a73e}polyline{fill:none;stroke-width:1.8;vector-effect:non-scaling-stroke}.legend{display:flex;justify-content:space-between;gap:6px;margin:5px 0}.note{display:block;line-height:1.4;margin-top:8px}button{font:inherit;color:var(--primary-text-color);background:var(--secondary-background-color,#8882);border:1px solid var(--divider-color,#8885);padding:5px 9px;border-radius:6px;cursor:pointer}.diagnostics{margin-top:10px;font-size:13px;position:relative}.diagnostics[open]{z-index:100}.diagnostic-body{position:absolute;left:0;right:0;top:100%;max-height:min(65vh,440px);overflow:auto;box-sizing:border-box;padding:10px;background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,#aaa);border-radius:6px;box-shadow:0 5px 18px #0003}.diagnostics summary{cursor:pointer}.diagnostics label,.capture-status{display:block;margin:8px 0}.report-buttons{display:flex;gap:6px;flex-wrap:wrap}.report-buttons button{font-size:12px}textarea{box-sizing:border-box;width:100%;margin-top:8px;font:11px monospace;resize:vertical}.footer{display:flex;align-items:center;justify-content:space-between;gap:8px}
   </style><ha-card><h2></h2><div class="metrics"><div class="metric"><strong class="fps">—</strong><span>Browser FPS</span></div><div class="metric"><strong class="mean-time">—</strong><span>Mean frame ms</span></div><div class="metric"><strong class="p95-time">—</strong><span>p95 frame ms</span></div></div><div class="summary" aria-live="off">Collecting foreground frames…</div><svg viewBox="0 0 340 90" preserveAspectRatio="none" role="img" aria-label="Frame timing in milliseconds: mean blue, p95 amber; green up to 16.7 ms, amber to 33.3 ms, red above"><g class="chart-background"></g><polyline class="mean"></polyline><polyline class="p95"></polyline></svg><div class="legend"><small>Mean / p95 · last minute · ms</small><small class="chart-scale">0–50 ms</small></div><div class="footer"><small>One shared sampler · 1s updates</small><button>Reset history</button></div><small class="note">Foreground browser timing includes this page’s workload. It is not CPU/GPU usage. Bands: green ≤16.7 ms (~60 FPS), amber ≤33.3 ms (~30 FPS), red above. Reference budgets, not device pass/fail. Long frames: &gt;50 ms. Individual cat profiling is optional.</small><details class="diagnostics"><summary>Diagnostics &amp; report</summary><div class="diagnostic-body"><label><input class="capture" type="checkbox" checked> Capture diagnostic evidence</label><small class="capture-status"></small><div class="report-buttons"><button class="report-refresh">Show / refresh report</button><button class="report-download">Download JSON</button><button class="report-clear">Clear log</button></div><textarea class="diagnostic-report" aria-label="Performance diagnostic report" readonly hidden rows="8" spellcheck="false"></textarea><small class="note">Kept in this browser only, saved about every 30 seconds. Report includes nearby activity and slow measured operations; these are clues, not proof of cause. Reset history does not clear this log.</small></div></details></ha-card>`;
   this.nodes=Object.fromEntries(['fps','mean-time','p95-time','summary','chart-scale','mean','p95','chart-background'].map(k=>[k,this.shadowRoot.querySelector('.'+k)]));
   const d=catMonitorHub.diagnostics,report=this.shadowRoot.querySelector('.diagnostic-report');
   this.shadowRoot.querySelector('.capture').onchange=e=>d.setEnabled(e.target.checked);
   this.shadowRoot.querySelector('.report-refresh').onclick=()=>{report.hidden=false;report.value=JSON.stringify(d.report(),null,2);};
   this.shadowRoot.querySelector('.report-download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(d.report(),null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='cat-performance-report.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
   this.shadowRoot.querySelector('.report-clear').onclick=()=>{d.records=[];d.incidents=[];d.tasks=[];d.operations=[];d.bucket={};d.counters={};d.previous=null;d.lastIncident=-Infinity;d.persist();report.value='';report.hidden=true;};
   this.shadowRoot.querySelector('.footer button').onclick=()=>{catMonitorHub.reset();for(const fn of catMonitorHub.listeners)fn(catMonitorHub.stats(),catMonitorHub.history);};
  }
  this.shadowRoot.querySelector('h2').textContent=this.config.title||'Cat performance';
 }
 update(stats,history){
  const d=catMonitorHub.diagnostics,panel=this.shadowRoot?.querySelector('.diagnostics');if(panel?.open){this.shadowRoot.querySelector('.capture').checked=d.enabled;this.shadowRoot.querySelector('.capture-status').textContent=`${d.enabled?'Recording':'Paused'} · ${d.incidents.length} gaps ≥100 ms · ${d.tasks.length} browser long frames/tasks · ${d.operations.length} slow operations · ${d.mode} · ${d.storage}`;}
  const n=this.nodes,fmt=v=>stats.n?v.toFixed(1):'—';n.fps.textContent=fmt(stats.fps);n['mean-time'].textContent=fmt(stats.mean);n['p95-time'].textContent=fmt(stats.p95);
  const root=catMonitorWorld(this),cats=[...catMonitorHub.owners()].filter(([a,e])=>a.active&&a.isConnected&&e.root===root),running=cats.filter(([a])=>!a.paused&&!a.suspended&&!a.stranded).length,profiled=cats.filter(([a])=>a.config.debug_performance).length;
  n.summary.textContent=stats.warmupMs?`${stats.warmupReason||'Waiting for dashboard to settle'} · ${Math.ceil(stats.warmupMs/1000)}s · ${running}/${cats.length} cats running`:`${running}/${cats.length} cats running · ${stats.long}/${stats.n} frames >50 ms · ${profiled} individually profiled`;
  const chart=catMonitorChart(history);n['chart-scale'].textContent=`0–${Math.ceil(chart.max)} ms`;n['chart-background'].innerHTML=chart.background;
  for(const key of ['mean','p95'])n[key].setAttribute('points',chart.points(key));
 }
}
if(!customElements.get('pixel-cat-monitor'))customElements.define('pixel-cat-monitor',PixelCatMonitor);
// Compatibility type; select Performance monitor in the Pixel Cat editor.
