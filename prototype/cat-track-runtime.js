const catCompiledTracks=new WeakMap(),catTrackMetadata=new WeakMap();
window.pixelCatTrackRuntimeV1={
 definition(clip){const d=clip.animationTracks,t=d?.tracks.find(t=>t.id==='tail');if(clip.sequenceId!=='proposal-scratching-post-tracks'||t?.mask.length!==49||!t.mask.every(c=>c%24>=2&&c%24<=8&&Math.floor(c/24)>=7&&Math.floor(c/24)<=13))return d;
  // The pilot extraction omitted row 6 and the far-left tip on row 10.
  // Both must follow the tail clock to keep the driver from leaving stray pixels.
  return {...d,tracks:d.tracks.map(v=>v===t?{...v,mask:[...v.mask,...Array.from({length:7},(_,x)=>6*24+x+2),10*24+1]}:v)};
 },
 sample(clip,frame,elapsed,config){if(clip.alertParts){const result=window.pixelCatAlertV1.sample(clip,frame,elapsed,config);catTrackMetadata.set(result.rows,result);return result;}if(!clip.animationTracks)return null;let compiled=catCompiledTracks.get(clip);if(!compiled){const frames=clip.frames.map((rows,i)=>({id:clip.frameIds[i],rows,origin:clip.origins[i],durationMs:clip.durations[i],role:clip.roles[i],gaze:clip.gazes?.[i]}));compiled=compileAnimationTracks({frames,animationTracks:this.definition(clip)});catCompiledTracks.set(clip,compiled);}
  const result=sampleAnimationTracks(compiled,frame,elapsed,{seed:config.track_seed??config.cat_id??config.name??0});if(result.rows!==clip.frames[frame])catTrackMetadata.set(result.rows,result);return{rows:result.rows,frame,anchor:clip.anchors[frame],origin:result.origin};
 },
 metadata(rows){return catTrackMetadata.get(rows);},
 report(clip){const c=catCompiledTracks.get(clip);return c?{cachedCombinations:c.cache.size,tracks:c.tracks.map(t=>t.id)}:null;}
};
