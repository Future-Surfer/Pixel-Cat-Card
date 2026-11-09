// Outline exposed pixel edges only. Adjacent pixels share no interior stroke.
window.pixelCatOutlineV1={
 width:.36,
 colour(value){return value==='black'||value==='white'?value:'none';},
 path(rows,facing=1){
  const solid=(x,y)=>x>=0&&x<24&&!!rows[y]?.[x]&&rows[y][x]!=='.';
  let path='';
  for(let y=0;y<rows.length;y++)for(let x=0;x<24;x++){
   if(!solid(x,y))continue;
   const left=facing<0?23-x:x;
   if(!solid(x,y-1))path+=`M${left} ${y}h1`;
   if(!solid(x,y+1))path+=`M${left} ${y+1}h1`;
   if(!solid(x-1,y))path+=`M${left+(facing<0?1:0)} ${y}v1`;
   if(!solid(x+1,y))path+=`M${left+(facing<0?0:1)} ${y}v1`;
  }
  return path;
 },
 markup(rows,facing,value){
  const stroke=this.colour(value);
  return stroke==='none'?'':`<path d="${this.path(rows,facing)}" fill="none" stroke="${stroke}" stroke-width="${this.width}" stroke-linecap="round" shape-rendering="geometricPrecision"/>`;
 }
};
