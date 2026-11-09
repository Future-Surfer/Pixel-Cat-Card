// Outline exposed pixel edges only. Adjacent pixels share no interior stroke.
const catOutlineByConfig=new WeakMap();
window.pixelCatOutlineV1={
 width:.30,
 luminance([r,g,b]){
  const linear=byte=>{const c=byte/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
  return .2126*linear(r)+.7152*linear(g)+.0722*linear(b);
 },
 rgb(value){
  const hex=/^#([\da-f]{3}|[\da-f]{6})$/i.exec(value||'')?.[1];
  if(hex)return (hex.length===3?[...hex].map(c=>c+c):hex.match(/../g)).map(c=>parseInt(c,16));
  const canvas=typeof document==='undefined'?null:document.createElement('canvas'),ctx=canvas?.getContext?.('2d');
  if(!ctx)return null;
  ctx.fillStyle='transparent';ctx.fillStyle=value||'transparent';ctx.fillRect(0,0,1,1);
  const [r,g,b,a]=ctx.getImageData(0,0,1,1).data;
  return a===255?[r,g,b]:null;
 },
 darkTheme(){
  const doc=typeof document==='undefined'?null:document,app=doc?.querySelector?.('home-assistant');
  if(typeof app?.hass?.themes?.darkMode==='boolean')return app.hass.themes.darkMode;
  if(doc?.documentElement&&typeof getComputedStyle==='function'){
   const style=getComputedStyle(app||doc.body||doc.documentElement);
   const rgb=this.rgb(style.getPropertyValue('--primary-background-color').trim()||style.getPropertyValue('--ha-card-background').trim());
   if(rgb)return this.luminance(rgb)<.18;
  }
  return typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches;
 },
 colour(config){
  if(['black','white','none'].includes(config.outline))return config.outline;
  if(catOutlineByConfig.has(config))return catOutlineByConfig.get(config);
  const rgb=this.rgb(config.color||'#222'),light=rgb?this.luminance(rgb):.5;
  const outline=light<=.03?'white':light>=.8&&!this.darkTheme()?'black':'none';
  catOutlineByConfig.set(config,outline);
  return outline;
 },
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
 markup(rows,facing,config){
  const stroke=this.colour(config);
  return stroke==='none'?'':`<path d="${this.path(rows,facing)}" fill="none" stroke="${stroke}" stroke-width="${this.width}" stroke-linecap="round" shape-rendering="geometricPrecision"/>`;
 }
};
