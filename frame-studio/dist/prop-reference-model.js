// Sequence-relative authoring context; never part of a frame's pixel grid.
export function validatePropReference(ref){
 if(ref==null)return ref;
 if(typeof ref!=='object'||Array.isArray(ref)||typeof ref.assetId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(ref.assetId)||!Number.isInteger(ref.x)||!Number.isInteger(ref.y)||Math.abs(ref.x)>96||Math.abs(ref.y)>96||typeof ref.visible!=='boolean'||typeof ref.flip!=='boolean'||typeof ref.foreground!=='boolean'||!Number.isFinite(ref.opacity)||ref.opacity<0||ref.opacity>1)throw Error('Invalid sequence prop reference.');
 return ref;
}
export function referencePixels(asset,ref){
 validatePropReference(ref);if(!asset||!ref?.visible)return [];
 return asset.pixels.flatMap((row,y)=>row.flatMap((colour,x)=>colour?[{x:ref.x+(ref.flip?asset.width-1-x:x),y:ref.y+y,colour}]:[]));
}
export function drawPropReference(ctx,asset,ref,scale=1,left=0,top=0){
 if(!asset||!ref?.visible)return;ctx.save();ctx.globalAlpha=ref.opacity;
 for(const p of referencePixels(asset,ref)){ctx.fillStyle=p.colour;ctx.fillRect(left+p.x*scale,top+p.y*scale,scale,scale);}ctx.restore();
}
