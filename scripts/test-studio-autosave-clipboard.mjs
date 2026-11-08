import assert from 'node:assert/strict';
import {createAutosaver} from '../frame-studio/dist/autosave.js';
import {copyFrame,pasteFrame} from '../frame-studio/dist/frame-clipboard.js';
import {newFrame,applyPixels} from '../frame-studio/dist/model.js';
let jobs=[],stored=[],events=[],writes=[];
const options={setTimer:fn=>{jobs.push(fn);return jobs.length;},clearTimer:()=>{},persist:p=>stored=structuredClone(p),changed:(id,state)=>events.push([id,state])};
// A typing/painting burst persists its latest outbox immediately but creates
// only one workspace version after the idle window; explicit flush bypasses it.
let clock=0,nextTimer=0;const timers=new Map(),burstWrites=[];let burstOutbox=[];
const burst=createAutosaver({write:async p=>burstWrites.push(p),persist:p=>burstOutbox=p,setTimer:(fn,delay)=>{const id=++nextTimer;timers.set(id,{fn,at:clock+delay});return id;},clearTimer:id=>timers.delete(id)});
for(let i=0;i<20;i++){burst.queue({projectId:'typing',name:'Edit '+i});clock+=100;}
assert.equal(burstWrites.length,0);assert.equal(burstOutbox[0].name,'Edit 19');assert.equal(timers.size,1);
const idle=[...timers.values()][0];assert.equal(idle.at,3900);clock=idle.at;await idle.fn();assert.equal(burstWrites.length,1);assert.equal(burstWrites[0].name,'Edit 19');
burst.queue({projectId:'typing',name:'Final before switching'});await burst.flush();assert.equal(burstWrites.length,2);assert.equal(burstOutbox.length,0);
let release;const save=createAutosaver({...options,write:async p=>{writes.push(structuredClone(p));if(writes.length===1)await new Promise(r=>release=r);}});
const a={projectId:'stable-a',name:'Before',frames:[]},b={projectId:'stable-b',name:'Other',frames:[]};
save.queue(a);const first=save.flush();save.queue({...a,name:'Renamed'});save.queue(b);assert.equal(stored.length,2);release();await first;await save.flush();
assert.equal(writes[0].name,'Before');assert.equal(writes[1].name,'Renamed');assert.equal(writes[1].projectId,'stable-a');assert.equal(writes[2].projectId,'stable-b');assert.equal(stored.length,0);
const conflict=createAutosaver({...options,write:async()=>{const e=Error('Newer remote version');e.status=409;throw e;}});conflict.queue(a);await conflict.flush();assert.equal(conflict.pending().length,1);assert.ok(events.some(e=>e[1]==='conflict'));const count=events.length;await conflict.flush();assert.equal(events.length,count,'Conflict must not repeatedly overwrite/retry');
let connected=false;const offline=createAutosaver({...options,write:async()=>{if(!connected)throw Error('Network down');}});offline.queue(a);await offline.flush();assert.equal(stored.length,1);connected=true;await offline.flush();assert.equal(stored.length,0);
const source={schemaVersion:1,width:24,height:24,projectId:'source',name:'Renamable source',frames:[newFrame('AI pose',undefined,'ai')]};applyPixels(source,source.frames[0].id,[{x:4,y:4,token:'#'}],'ai');source.frames[0].role='exit';source.frames[0].anchor={x:4,y:4};source.frames[0].locked=true;
const clip=copyFrame(source,source.frames[0]);const destination={schemaVersion:1,width:24,height:24,projectId:'dest',name:'Destination',frames:[newFrame()]};const pasted=pasteFrame(destination,clip,destination.frames[0].id);
assert.deepEqual(pasted.rows,source.frames[0].rows);assert.deepEqual(pasted.anchor,{x:4,y:4});assert.equal(pasted.role,'exit');assert.equal(pasted.origin,'ai');assert.notEqual(pasted.id,source.frames[0].id);assert.equal(pasted.review,'candidate');assert.equal(pasted.locked,false);assert.equal(pasted.copiedFrom.sequenceId,'source');
applyPixels(destination,pasted.id,[{x:5,y:4,token:'#'}],'human');assert.equal(pasted.origin,'mixed');assert.equal(source.frames[0].rows[4][5],'.');assert.throws(()=>pasteFrame(destination,{...clip,frame:{...clip.frame,rows:[]}},destination.frames[0].id));
console.log('PASS: per-ID autosave coalescing, edits during writes, offline outbox, conflict retention, stable renaming and independent provenance-preserving clipboard copies.');

// Redo can equal the last acknowledged version while Undo is still queued.
const undoWrites=[];let holdUndo;const undoSaver=createAutosaver({...options,write:async p=>{undoWrites.push(p.name);if(p.name==='Undo in flight')await new Promise(r=>holdUndo=r);}});
undoSaver.queue(a);await undoSaver.flush();undoSaver.queue({...a,name:'Undo queued'});undoSaver.queue(a);await undoSaver.flush();assert.deepEqual(undoWrites,['Before','Before']);assert.equal(undoSaver.hasPending(a.projectId),false);
undoSaver.queue({...a,name:'Undo in flight'});const writingUndo=undoSaver.flush();undoSaver.queue(a);holdUndo();await writingUndo;await undoSaver.flush();assert.equal(undoWrites.at(-1),'Before');assert.equal(undoSaver.hasPending(a.projectId),false);
console.log('PASS: undo/redo back to an acknowledged version replaces a queued or in-flight older snapshot.');
