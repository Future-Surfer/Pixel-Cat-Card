import assert from 'node:assert/strict';
import {installFrameCanvas,frameCell,strokeRows,onionLayers,drawOnionSkin} from '../frame-studio/dist/frame-canvas.js';
class Canvas{
 listeners=new Map();captures=new Set();
 getBoundingClientRect(){return {left:10,top:20,width:240,height:240};}
 addEventListener(type,fn){this.listeners.set(type,[...(this.listeners.get(type)||[]),fn]);}
 removeEventListener(type,fn){this.listeners.set(type,this.listeners.get(type).filter(f=>f!==fn));}
 setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}
 releasePointerCapture(id){this.captures.delete(id);this.fire('lostpointercapture',0,0,{pointerId:id});}
 fire(type,x,y,extra={}){const e={clientX:10+x*10+5,clientY:20+y*10+5,button:0,pointerId:1,isPrimary:true,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};for(const fn of this.listeners.get(type)||[]){fn(e);if(e.stopped)break;}return e;}
}
for(const host of ['sequence','climb']){
 const canvas=new Canvas();let frame={rows:Array(24).fill('.'.repeat(24))},tool='pencil',token='R',preview=null,commits=0,cancels=0,blocked=false;
 const original=JSON.stringify(frame);
 const painter=installFrameCanvas(canvas,{getTool:()=>tool,getToken:()=>token,getIdentity:()=>frame,onBegin:()=>!blocked,onPreview:s=>preview=s,onCommit:edits=>{commits++;frame.rows=strokeRows(frame.rows,{cells:new Map(edits.map(p=>[p.x+','+p.y,p]))});},onCancel:()=>cancels++});
 canvas.fire('pointerdown',0,0);canvas.fire('pointermove',5,0);assert.equal(JSON.stringify(frame),original,host+': preview never mutates artwork');assert.equal(strokeRows(frame.rows,preview,frame)[0].slice(0,6),'RRRRRR');canvas.fire('pointerup',7,0);assert.equal(commits,1);assert.equal(frame.rows[0].slice(0,8),'RRRRRRRR');assert.equal(canvas.captures.size,0);
 canvas.fire('pointerdown',1,0,{button:2});canvas.fire('pointermove',3,0);canvas.fire('pointerup',4,0,{button:2});assert.equal(frame.rows[0].slice(0,8),'R....RRR');assert.equal(tool,'pencil');assert.equal(token,'R');assert.equal(commits,2);
 const saved=JSON.stringify(frame);canvas.fire('pointerdown',3,3);canvas.fire('pointermove',9,9,{pointerId:2});assert.equal(preview.cells.size,1);canvas.fire('pointercancel',3,3,{pointerId:2});assert.ok(preview);canvas.fire('pointercancel',3,3);assert.equal(JSON.stringify(frame),saved);assert.equal(preview,null);assert.equal(cancels,1);assert.equal(commits,2);
 canvas.fire('pointerdown',0,1);const previous=frame;frame={rows:frame.rows};assert.equal(strokeRows(frame.rows,preview,frame),frame.rows);canvas.fire('pointerup',3,1);assert.equal(JSON.stringify(frame),JSON.stringify(previous));assert.equal(commits,2);
 tool='line';canvas.fire('pointerdown',0,2);canvas.fire('pointermove',3,5);canvas.fire('pointerup',4,6);assert.equal(commits,3);assert.equal(frame.rows[6][4],'R');
 tool='rect';canvas.fire('pointerdown',10,10);canvas.fire('pointerup',13,13);assert.equal(frame.rows[10].slice(10,14),'RRRR');assert.equal(frame.rows[11][11],'.');
 const rect=canvas.getBoundingClientRect;tool='pencil';canvas.fire('pointerdown',20,20);canvas.getBoundingClientRect=()=>({left:0,top:0,width:400,height:400});canvas.fire('pointerup',20,20);assert.equal(frame.rows[20][20],'R','A canvas relayout must not turn a click into a streak');canvas.getBoundingClientRect=rect;
 const count=commits;canvas.fire('pointerdown',1,1,{button:1});canvas.fire('pointerdown',1,1,{isPrimary:false});assert.equal(preview,null);assert.equal(commits,count);
 blocked=true;canvas.fire('pointerdown',0,0);assert.equal(preview,null);assert.equal(canvas.captures.size,0);blocked=false;
 canvas.fire('pointerdown',0,0);canvas.fire('lostpointercapture',0,0);assert.equal(preview,null);assert.equal(commits,count);
 assert.equal(canvas.fire('contextmenu',0,0).prevented,true);assert.deepEqual(frameCell(canvas,{clientX:-50,clientY:500}),{x:0,y:23});
 painter.destroy();assert.equal([...canvas.listeners.values()].flat().length,0);
}
// Existing right-click gaze/POI actions stay with their context adapter.
const special=new Canvas();installFrameCanvas(special,{getTool:()=> 'gaze',getToken:()=> '#',shouldHandle:(e,t)=>!(e.button===2&&t==='gaze')});assert.equal(special.fire('pointerdown',1,1,{button:2}).stopped,undefined);
const reference={rows:Array(24).fill('#'.repeat(24)),anchor:{x:2,y:3}},before=JSON.stringify(reference),calls=[];const ctx={save(){},restore(){},fillRect(...p){calls.push(p);}};const skin=onionLayers([reference],0,{reference,mirror:true,align:'anchor'})[0];drawOnionSkin(ctx,skin,{cell:2,opacity:.4});assert.equal(calls.length,576);assert.equal(ctx.globalAlpha,.4);assert.equal(JSON.stringify(reference),before);
console.log('PASS: both canvas hosts share buffered left paint/right erase, sparse-drag interpolation, one commit per stroke, line/rectangle, pointer capture/cancel/loss, identity/lock/multitouch guards, special-tool delegation and immutable onion rendering.');

// Rectangular tree components reuse exactly the same interaction core.
{const canvas=new Canvas();canvas.getBoundingClientRect=()=>({left:10,top:20,width:320,height:80});let rows=Array(8).fill('.'.repeat(32)),commits=0;
 installFrameCanvas(canvas,{getSize:()=>({width:32,height:8}),getTool:()=> 'pencil',getToken:()=> 'a',onCommit:(cells,stroke)=>{rows=strokeRows(rows,stroke);commits++;}});
 canvas.fire('pointerdown',30,6);canvas.fire('pointerup',31,7);assert.equal(rows[7][31],'a');assert.equal(rows[6][30],'a');canvas.fire('pointerdown',31,7,{button:2});canvas.fire('pointerup',31,7,{button:2});assert.equal(rows[7][31],'.');assert.equal(commits,2);assert.deepEqual(frameCell(canvas,{clientX:999,clientY:999},{width:32,height:8}),{x:31,y:7});
}
