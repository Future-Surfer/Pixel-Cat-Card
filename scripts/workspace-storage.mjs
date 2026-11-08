import {readBoundedText} from '../frame-studio/worker/request-body.js';
import {withStorageLock} from '../frame-studio/worker/storage-lock.js';
import {recordAssetChange,changeDigest,getAssetChange} from '../frame-studio/worker/changes.js';
const workspaceJson=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export function workspaceApi({kind,route,main,history,title,validate,messages}){
 const pattern=new RegExp('^/api/'+route+'/('+main+'|qa-[a-z0-9-]{1,60})(?:/(history|versions/([a-f0-9]{64})))?$');
 return async(request,bucket)=>{
  const url=new URL(request.url),match=pattern.exec(url.pathname);if(!match)return workspaceJson({error:messages.unknown},404);
  const id=match[1],key=route+'/'+id+'.json',prefix=history+'/'+id+'/';
  if(request.method==='GET'){
   if(match[2]==='history'){const page=await bucket.list({prefix,limit:100,...(url.searchParams.get('cursor')?{cursor:url.searchParams.get('cursor')}:{})});return workspaceJson({versions:(await Promise.all(page.objects.map(async o=>(await bucket.get(o.key)).json()))).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)),cursor:page.truncated?page.cursor:null});}
   if(match[3]){const pointer=await bucket.get(prefix+match[3]+'.json');return pointer?workspaceJson(await getAssetChange(bucket,(await pointer.json()).changeId)):workspaceJson({error:'Version not found.'},404);}
   const object=await bucket.get(key);return object?workspaceJson(await object.json(),200,{ETag:object.httpEtag}):workspaceJson({error:messages.empty},404);
  }
  if(request.method!=='PUT'||match[2])return workspaceJson({error:'Method not allowed.'},405);
  if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return workspaceJson({error:'Save from this lab origin.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return workspaceJson({error:'Use JSON.'},415);
  let draft;try{draft=validate(JSON.parse(await readBoundedText(request,500000,messages.large)));}catch(e){return workspaceJson({error:e.message},e.status||400);}
  const etag=request.headers.get('if-match'),create=request.headers.get('if-none-match')==='*';if(!etag&&!create)return workspaceJson({error:messages.load},428);
  return withStorageLock(bucket,key,async()=>{
   const object=await bucket.get(key),old=object?await object.json():null;
   if(etag&&object?.httpEtag!==etag||create&&object)return workspaceJson({error:messages.conflict},409);
   const versionHash=await changeDigest(draft);if(old?.versionHash===versionHash)return workspaceJson(old,200,{ETag:object.httpEtag});
   const savedAt=new Date().toISOString(),entry=await recordAssetChange(bucket,kind,id,title+draft.name,draft,old?.draft||null,savedAt),record={projectId:id,savedAt,versionHash,changeId:entry.id,draft};
   await bucket.put(prefix+versionHash+'.json',JSON.stringify({versionHash,changeId:entry.id,savedAt,summary:entry.summary}),{onlyIf:new Headers({'If-None-Match':'*'})});
   const saved=await bucket.put(key,JSON.stringify(record),{onlyIf:new Headers(etag?{'If-Match':etag}:{'If-None-Match':'*'})});
   return saved?workspaceJson(record,200,{ETag:saved.httpEtag}):workspaceJson({error:messages.failed},409);
  });
 };
}
