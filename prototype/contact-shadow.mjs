export function contactRow(rows){
 const marked=rows.findLastIndex(row=>row.includes('R'));
 return marked>=0?marked:rows.findLastIndex(row=>/[^.]/.test(row));
}

export function contactShadows({rows,x,top,facing,surfaces,split},scale,reach){
 const bottom=split?rows.length-1:contactRow(rows),receivers=new Map();
 const ordered=[...surfaces].sort((a,b)=>b.top-a.top);
 const heights=Array.from({length:bottom+1},(_,y)=>top+(y+1)*scale);
 const weights=heights.map((_,y)=>Math.exp(-y/reach));
 for(let column=0;column<24;column++){
  const source=facing<0?23-column:column,center=x+(column+.5)*scale;
  const below=ordered.filter(surface=>center>=surface.left&&center<surface.right);
  let level=-1,point=null;
  for(let y=bottom;y>=0;y--){
   if(rows[y][source]==='.')continue;
   // Assign a pixel that straddles an edge by its centre.
   let next=level;
   while(below[next+1]&&below[next+1].top>=heights[y]-scale/2)next++;
   if(next<0)continue;
   if(next!==level){
    level=next;
    const surface=below[level];
    if(!receivers.has(surface))receivers.set(surface,[]);
    point={center,nearest:y,lift:Math.max(0,(surface.top-heights[y])/scale),density:0};
    receivers.get(surface).push(point);
   }
   point.density+=weights[point.nearest-y];
  }
 }
 return receivers;
}
