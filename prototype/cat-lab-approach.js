window.pixelCatLabApproachV1 = (climb,a,report,mode) => {
  const g=climb.reconcile(a),from=a.support,world=window.pixelCatSurfaceWorldV1;
  if(!g?.tops.length)return false;
  if(from.bed&&a.home){
   a.route=[a.home];a.labRoute=a.route;report('Repositioning');return true;
  }
  const owners=new Set(g.faces.map(f=>g.byOwner.get(f.panelId)));
  const nearest=s=>Math.hypot(Math.max(s.min-a.x,0,a.x-s.max),from.top-s.top);
  const starts=a.surfaces.filter(s=>!s.narrow&&!s.bed&&!s.tree&&owners.has(climb.sourceCard(a,s))).sort((x,y)=>nearest(x)-nearest(y)).slice(0,3);
  for(const start of starts){
   const owner=climb.sourceCard(a,start),steps=world.route(a,start,from);
   if(!steps||steps.length>2||!world.route(a,a.home,start))continue;
   const targets=g.tops.filter(s=>g.byOwner.get(s.panelId)!==owner).sort((x,y)=>Math.abs(x.top-start.top)-Math.abs(y.top-start.top)).slice(0,6);
   for(const top of targets){
    const target=a.surfaces.find(s=>s.id===top.sourceId);
    if(!target||target.el===owner||!world.route(a,a.home,target))continue;
    const x=Math.max(start.min,Math.min(start.max,(target.min+target.max)/2));
    if(start===from&&Math.abs(x-a.x)<4*a.scale||!climb.route(a,target,start,false,mode,x))continue;
    const approach=window.pixelCatPointRoutesV1?.plan(a,start,x);
    if(!approach?.length)continue;
    a.route=approach;a.labRoute=approach;report('Repositioning');return true;
   }
  }
  return false;
};
