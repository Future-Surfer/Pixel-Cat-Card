window.pixelCatCardTravelV1={
 destinationWeight(a,target){
  const rise=(a.support.top-target.top)/a.scale;
  return rise>48?.25:rise>16?.55:1;
 },
 prefer(a,target){
  const t=performance.now(),from=a.support,climb=window.pixelCatCardClimbV1;
  if(!climb||!a.config.card_climbing||!from||!target||target.tree||target.home||t<(a.wallRetry||0))return null;
  const rise=(from.top-target.top)/a.scale;
  if(rise<24&&rise>-32)return null;
  a.wallRetry=t+12000;
  const world=window.pixelCatSurfaceWorldV1;
  if(!world.route(a,a.home,target))return null;
  const roll=a.ensureMood().random();
  if(rise<=-32)return roll<.65?climb.route(a,target,from,false,'card-drop'):null;
  if(roll>=.75)return null;
  const quick=roll<.15&&climb.route(a,target,from,false,roll<.025?'card-cross-wall-jump':'card-wall-jump');
  return quick||climb.route(a,target,from,false,'card-rise');
 },
};
