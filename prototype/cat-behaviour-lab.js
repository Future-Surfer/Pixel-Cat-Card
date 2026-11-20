(() => {
  const views = new WeakMap();
  const scenarios = {
    climb: {
      label: 'Climb and leap',
      counters: ['No usable wall','No safe route','Current card has no usable face','No destination card','No way home','Repositioning','Attempted','Completed'],
      enabled: a => !!a.config.card_climbing,
      offer(a, t, report, mode='card-ascent') {
        const climb = window.pixelCatCardClimbV1;
        if (!climb?.reconcile(a)?.faces.length) return report('No usable wall');
        return climb.ascent(a, t, false, report, mode) || window.pixelCatLabApproachV1(climb, a, report, mode);
      }
    },
    yawn: {
      label: 'Yawn',
      counters: ['Yawns chosen'],
      offer(a, t, report) {
        if (a.idle?.pose === 'yawn' || a.support.narrow ||
            a.support.poses?.length && !a.support.poses.includes('yawn')) return false;
        a.labPose = 'yawn';
        a.deadline = t + 4000;
        if (a.idle) a.idle.poseUntil = t;
        report('Yawns chosen');
        return true;
      }
    }
  };
  scenarios.wallJump = {
    ...scenarios.climb, label: 'Wall jump',
    offer(a,t,report) { return scenarios.climb.offer(a,t,report,'card-wall-jump'); }
  };
  scenarios.chase={label:'Chase across cards',counters:['Running on','Following','Pounced','Turned to watch','Crossings','No safe route']};
  scenarios.edgeScratch={
    label:'Scratch card edges',
    counters:['No usable edge','No safe stance or route','Declined','Attempted','Completed','Interrupted'],
    enabled:a=>window.pixelCatLabScratchV1.enabled(a),
    ready:a=>window.pixelCatLabScratchV1.ready(a),
    offer:(a,t,report)=>window.pixelCatLabScratchV1.offer(a,t,report)
  };
  window.pixelCatBehaviourLabV1 = {
    tick(a,t,art) {
      const v=views.get(a.root), focus=v&&v.path===location.pathname?v.focus:'';
      if(window.pixelCatLabScratchV1?.tick(a,t,focus))return 1;
      if(focus==='chase')return window.pixelCatDashboardChaseV1?.focus(a,t,v)||0;
      if (!focus) {
        if(a.labFocus){if(a.route===a.labRoute)a.route=[];a.labRoute=null;a.labFocus='';a.labPose=null;a.deadline=t;}
        return 0;
      }
      if(a.command||a.goal||a.previewPose)return 0;
      if(a.climb)return window.pixelCatClimbV1.tick(a,t,art)?2:1;
      if(a.motion||a.mouthAction)return a.mouthAction?0:1;
      if(a.labFocus!==focus){
        if(a.route===a.labRoute)a.route=[];
        a.labRoute=null;
        a.labFocus=focus;
        window.pixelCatSettlingV1?.wake(a,t);
        if(a.idle)a.idle.poseUntil=t;
      }
      if(a.route?.length && a.labRoute===a.route)return 1;
      if(a.route?.length)a.route=[];
      if(a.play||a.toyHunt)a.cancelPlay(t);
      if(a.social?.episode)a.social.finish('behaviour focus');
      a.labPose=focus==='yawn'?'stand':null;
      a.deadline=t+4000;
      if(scenarios[focus].enabled?.(a)!==false && a.bedInside && a.bedInside.config.bed_style!=='simple'){
        window.pixelCatBedEntryV1?.exit(a,'stand',t,art);
      } else {
        this.offer(a,t);
      }
      a.propScene?.tick(t,a);
      return a.climb?2:1;
    },
    offer(a, t) {
      const view = views.get(a.root), scenario = scenarios[view?.focus];
      if (!scenario || view.path !== location.pathname || !a.support || scenario.enabled?.(a) === false ||
          !(scenario.ready?scenario.ready(a):window.pixelCatClimbV1.ready(a)) || a.idle?.pose === 'sleep' && t < a.idle.poseUntil) return false;
      if (t < (view.next.get(a) || 0)) return false;
      if(t<(view.probeAt||0))return false;
      view.probeAt=t+100;
      view.next.set(a, t + 2000 + a.ensureMood().random() * 2000);
      const counts = view.counts;
      const report = label => { counts[label] = (counts[label] || 0) + 1; };
      const accepted=scenario.offer(a,t,report)===true;
      if(accepted&&a.labScratch){a.labScratch.labView=view;(view.scratchCats||=new Set()).add(a);}
      return accepted;
    }
  };
  if (typeof HTMLElement === 'undefined' || customElements.get('pixel-cat-behaviour-lab')) return;
  class BehaviourLab extends HTMLElement {
    setConfig() {}
    getCardSize() { return 2; }
    connectedCallback() {
      let root = this;
      while (root && !root.matches?.('[data-cat-world],hui-sections-view,hui-masonry-view')) {
        root = root.parentElement || root.getRootNode()?.host;
      }
      if (!root) return;
      let view = views.get(root);
      if (!view || view.path !== location.pathname) {
        view = {path:location.pathname, focus:'', cards:0, next:new WeakMap(), counts:{}};
        views.set(root, view);
      }
      view.cards++;
      this.cleanup = () => { if (!--view.cards && views.get(root) === view) {window.pixelCatDashboardChaseV1?.resetFocus(view);window.pixelCatLabScratchV1?.reset(view);views.delete(root);} };
      const shadow = this.shadowRoot || this.attachShadow({mode:'open'});
      shadow.innerHTML = '<ha-card header="Behaviour Lab"><div class="card-content"><label>Focus <select><option value="">Natural behaviour</option></select></label><p></p></div></ha-card>';
      const select = shadow.querySelector('select'), status = shadow.querySelector('p');
      for (const [id, scenario] of Object.entries(scenarios)) select.add(new Option(scenario.label,id));
      select.onchange = () => {
        window.pixelCatDashboardChaseV1?.resetFocus(view);
        window.pixelCatLabScratchV1?.reset(view);
        view.focus = select.value;
        view.counts = {};
        view.next = new WeakMap();
        view.probeAt = 0;
        refresh();
      };
      const refresh = () => {
        select.value = view.focus;
        const cats = (window.pixelCatPrimaryV1?.current() || []).filter(a => a.root === root);
        const ready=scenarios[view.focus]?.ready||(a=>window.pixelCatClimbV1?.ready(a));
        const busy = cats.filter(a => !ready(a) || a.idle?.pose === 'sleep').length;
        status.textContent = view.focus
          ? [`${cats.length} cats (${busy} busy)`, ...scenarios[view.focus].counters.map(k => `${k}: ${view.counts[k] || 0}`)].join(' · ')
          : 'Choose a focus for the cats on this view until you reload.';
      };
      refresh();
      this.timer = setInterval(refresh, 1000);
    }
    disconnectedCallback() { clearInterval(this.timer); this.cleanup?.(); this.cleanup = null; }
  }
  customElements.define('pixel-cat-behaviour-lab', BehaviourLab);
  (window.customCards ||= []).push({type:'pixel-cat-behaviour-lab',name:'Pixel Cat Behaviour Lab',description:'Temporarily favour a behaviour on this view.'});
})();
