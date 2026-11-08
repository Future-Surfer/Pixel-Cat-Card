import {freshTreeWorkspace} from './tree-components.mjs';
import {clone,validateTreeWorkspace} from './tree-model.mjs';
import {preserveDraft} from './climb-draft-safety.mjs';
// Every tab has its own recoverable outbox; only acknowledged clean versions
// update the shared browser cache. A stale tab never adopts a new write base.
export class TreeWorkspaceClient{
 constructor({storage,session,fetcher=(...args)=>fetch(...args),id='tree-main',notify=()=>{}}){this.storage=storage;this.fetcher=fetcher;this.id=id;this.notify=notify;this.key='pixel-cat-tree/v1/'+id;const prior=session.getItem(this.key+'/tab'),tab=crypto.randomUUID();this.outbox=this.key+'/outbox/'+tab;this.previousOutbox=prior?this.key+'/outbox/'+prior:null;this.previousRaw=this.previousOutbox?storage.getItem(this.previousOutbox):null;if(this.previousRaw)storage.setItem(this.outbox,this.previousRaw);session.setItem(this.key+'/tab',tab);this.etag=null;this.known=false;this.conflict=false;this.dirty=false;this.versionHash=null;this.draft=freshTreeWorkspace();}
 report(message){this.message=message;this.notify(message);}
 local(){const record={draft:this.draft,etag:this.etag,dirty:this.dirty,versionHash:this.versionHash};this.storage.setItem(this.outbox,JSON.stringify(record));if(this.storage.getItem(this.outbox)!==JSON.stringify(record))throw Error('Browser storage did not retain this edit. Export your draft.');if(this.previousRaw&&!JSON.parse(this.previousRaw).dirty&&this.storage.getItem(this.previousOutbox)===this.previousRaw)this.storage.removeItem?.(this.previousOutbox);this.previousRaw=null;}
 async read(){const r=await this.fetcher('/api/tree-workspaces/'+this.id,{signal:AbortSignal.timeout(8000)});if(!r.ok&&r.status!==404)throw Error('Cannot load durable workspace ('+r.status+').');return r.status===404?null:{record:await r.json(),etag:r.headers.get('etag')};}
 async load(){
  const raw=this.storage.getItem(this.outbox)||this.storage.getItem(this.key);let local;
  if(raw){try{local=JSON.parse(raw);validateTreeWorkspace(local.draft);this.draft=local.draft;this.etag=local.etag;this.dirty=!!local.dirty;this.versionHash=local.versionHash;}catch(e){this.report('Local recovery data is invalid; retained unchanged. '+e.message);this.conflict=true;return this.draft;}}
  try{const remote=await this.read();this.known=true;
   if(local?.dirty&&(remote?.etag??null)!==this.etag){this.conflict=true;this.report('Conflict: newer server version; local edits retained. Export, or load saved version with a recovery copy.');}
   else if(remote&&!local?.dirty){validateTreeWorkspace(remote.record.draft);this.draft=remote.record.draft;this.etag=remote.etag;this.versionHash=remote.record.versionHash;this.dirty=false;this.local();this.report('Loaded saved version '+this.versionHash.slice(0,12));}
   else this.report(local?.dirty?'Recovered local edits; save pending.':'New draft components; not yet saved to disk.');
  }catch(e){this.report(e.message+' Local editing/export remain available.');}
  return this.draft;
 }
 update(draft){validateTreeWorkspace(draft);this.draft=clone(draft);this.dirty=true;this.local();this.report(this.conflict?'Conflict: edits saved in this tab’s browser outbox.':'Saved in this tab’s browser outbox; disk save pending.');}
 async save(){
  if(this.saving)return;if(this.conflict){this.report('Conflict: export local work or load saved version; no overwrite sent.');return false;}
  this.saving=true;const exact=JSON.stringify(this.draft);
  try{if(!this.known){const remote=await this.read();if((remote?.etag??null)!==this.etag){this.conflict=true;throw Error('A server workspace exists with a different base. Local edits retained.');}this.known=true;}
   const r=await this.fetcher('/api/tree-workspaces/'+this.id,{method:'PUT',signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json',...(this.etag?{'If-Match':this.etag}:{'If-None-Match':'*'})},body:exact});
   if(r.status===409){this.conflict=true;throw Error('Save conflict: newer disk version; local edits retained.');}if(!r.ok)throw Error((await r.json()).error||'Disk save failed.');
   const record=await r.json();this.etag=r.headers.get('etag');this.versionHash=record.versionHash;this.dirty=JSON.stringify(this.draft)!==exact;
   this.storage.setItem(this.key,JSON.stringify({draft:record.draft,etag:this.etag,versionHash:this.versionHash,dirty:false}));this.local();this.report((this.dirty?'Newer edit pending. Last saved ':'Saved to disk · ')+this.versionHash.slice(0,12));return true;
  }catch(e){this.report(e.message+' Browser draft retained; export is available.');return false;}finally{this.saving=false;}
 }
 async loadSaved(){if(this.saving)throw Error('Wait for the current disk save to finish. Your draft is kept.');preserveDraft(this.storage,this.key,this.draft,'Before loading saved tree workspace');const remote=await this.read();if(!remote)throw Error('No saved workspace exists. Current draft kept.');validateTreeWorkspace(remote.record.draft);this.draft=remote.record.draft;this.etag=remote.etag;this.versionHash=remote.record.versionHash;this.known=true;this.conflict=false;this.dirty=false;this.local();this.report('Loaded saved version; previous draft is in recovery copies.');return this.draft;}
 replace(draft){validateTreeWorkspace(draft);preserveDraft(this.storage,this.key,this.draft,'Before importing tree workspace');const previous=this.draft;try{this.update(draft);}catch(e){this.draft=previous;throw e;}}
}
