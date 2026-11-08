import {withStorageLock} from './storage-lock.js';
import {readBoundedText} from './request-body.js';
import {recordAssetChange,listAssetChanges,getAssetChange,handleChangeApi} from './changes.js';
import {validatePropWorkspace} from '../dist/props-model.js';
import {validateProject} from '../dist/model.js';
import {validateQueue,savedOutput} from '../dist/queue.js';
const jsonResponse=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...extra}});
const validProjectId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);
async function readSavedProject(bucket,id){if(!validProjectId(id))throw Error('Invalid project ID.');const object=await bucket.get('projects/'+id+'.json');return object?{record:await object.json(),etag:object.httpEtag}:null;}
async function listSavedProjects(bucket,cursor){const page=await bucket.list({prefix:'projects/',limit:100,include:['customMetadata'],...(cursor?{cursor}:{})});return {projects:page.objects.map(o=>({projectId:o.customMetadata.projectId,name:o.customMetadata.name,savedAt:o.customMetadata.savedAt,deletedAt:o.customMetadata.deletedAt||null,ready:Number(o.customMetadata.ready||0)})),cursor:page.truncated?page.cursor:null};}
export async function handleStudioApi(request,env){
 try{const path=new URL(request.url).pathname;return await (env.BUCKET&&request.method==='PUT'&&(/^\/api\/projects\//.test(path)||path==='/api/props-workspace')?withStorageLock(env.BUCKET,path,()=>studioApi(request,env)):studioApi(request,env));}catch(e){if(e.status===413)return jsonResponse({error:e.message},413);throw e;}
}
async function studioApi(request,env){
 const url=new URL(request.url),bucket=env.BUCKET;if(!bucket)return jsonResponse({error:'Shared storage is unavailable. Download a local backup.'},503);
 if(request.method!=='GET'&&request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return jsonResponse({error:'Use the editor on this Site to save.'},403);
 if(url.pathname.startsWith('/api/changes'))return handleChangeApi(request,bucket,jsonResponse);
 if(url.pathname==='/mcp')return studioMcp(request,bucket);
 if(url.pathname.startsWith('/api/props-recoveries'))return handlePropsRecoveries(request,bucket);
 if(url.pathname==='/api/props-workspace')return handlePropsWorkspace(request,bucket);
 if(url.pathname==='/api/projects'&&request.method==='GET')return jsonResponse(await listSavedProjects(bucket,url.searchParams.get('cursor')));
 const match=/^\/api\/projects\/([a-zA-Z0-9_-]{1,100})$/.exec(url.pathname);if(!match)return jsonResponse({error:'Not found.'},404);const projectId=match[1];
 if(request.method==='GET'){const result=await readSavedProject(bucket,projectId);return result?jsonResponse(result.record,200,{ETag:result.etag}):jsonResponse({error:'Saved project not found.'},404);}
 if(request.method!=='PUT')return jsonResponse({error:'Method not allowed.'},405);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return jsonResponse({error:'Save a JSON project.'},415);
 const text=await readBoundedText(request,3000000,'Project is too large; keep fewer saved versions.');
 let project;try{project=JSON.parse(text);validateProject(project);validateQueue(project);if(project.projectId!==projectId||!project.workQueue)throw Error('Project ID and pose queue are required.');}catch(e){return jsonResponse({error:e.message},400);}
 const etag=request.headers.get('if-match'),isNew=request.headers.get('if-none-match')==='*';if(!etag&&!isNew)return jsonResponse({error:'Load the current saved version before replacing it.'},428);
 const previous=await readSavedProject(bucket,projectId);
 if(etag&&previous?.etag!==etag||isNew&&previous)return jsonResponse({error:'A newer saved version exists. Keep your local copy and load that version before replacing it.'},409);
 const savedAt=new Date().toISOString(),record={projectId,savedAt,project};
 await recordAssetChange(bucket,'sequence',projectId,project.name,project,previous?.record.project||null,savedAt);
 const result=await bucket.put('projects/'+projectId+'.json',JSON.stringify(record),{onlyIf:new Headers(etag?{'If-Match':etag}:{'If-None-Match':'*'}),httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'},customMetadata:{projectId,name:project.name,savedAt,deletedAt:project.deletedAt||'',ready:String(project.workQueue.tasks.filter(t=>t.status==='ready').length)}});
 return result?jsonResponse({projectId,savedAt},200,{ETag:result.httpEtag}):jsonResponse({error:'A newer saved version exists. Keep your local copy and load that version before replacing it.'},409);
}
async function handlePropsRecoveries(request,bucket){
 const url=new URL(request.url),match=/^\/api\/props-recoveries\/([a-zA-Z0-9_-]+)$/.exec(url.pathname);
 if(request.method==='GET'&&match){const object=await bucket.get('props-recoveries/'+match[1]+'.json');return object?jsonResponse(await object.json()):jsonResponse({error:'Recovery not found.'},404);}
 if(request.method!=='POST'||url.pathname!=='/api/props-recoveries')return jsonResponse({error:'Method not allowed.'},405);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return jsonResponse({error:'Use JSON.'},415);
 const text=await readBoundedText(request,3000000,'Recovery exceeds 3 MB. Export both copies before continuing.');
 let copies;try{copies=JSON.parse(text);validatePropWorkspace(copies.browser);validatePropWorkspace(copies.saved);}catch(e){return jsonResponse({error:e.message},400);}
 const id='recovery-'+Date.now()+'-'+crypto.randomUUID(),savedAt=new Date().toISOString();await bucket.put('props-recoveries/'+id+'.json',JSON.stringify({id,savedAt,browser:copies.browser,saved:copies.saved}),{httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});return jsonResponse({id,savedAt},201);
}
async function handlePropsWorkspace(request,bucket){
 const key='props/workspace.json';
 if(request.method==='GET'){const object=await bucket.get(key);return object?jsonResponse(await object.json(),200,{ETag:object.httpEtag}):jsonResponse({error:'No saved props workspace yet.'},404);}
 if(request.method!=='PUT')return jsonResponse({error:'Method not allowed.'},405);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return jsonResponse({error:'Use JSON.'},415);
 const text=await readBoundedText(request,3000000,'Workspace exceeds 3 MB.');
 let workspace;try{workspace=JSON.parse(text);validatePropWorkspace(workspace);}catch(e){return jsonResponse({error:e.message},400);}
 const etag=request.headers.get('if-match'),isNew=request.headers.get('if-none-match')==='*';if(!etag&&!isNew)return jsonResponse({error:'Load the saved workspace before replacing it.'},428);
 const previousObject=await bucket.get(key),previous=previousObject?await previousObject.json():null;
 if(etag&&previousObject?.httpEtag!==etag||isNew&&previousObject)return jsonResponse({error:'A newer workspace exists. Browser draft retained.'},409);
 const savedAt=new Date().toISOString();
 for(const a of workspace.assets){const old=previous?.workspace.assets.find(p=>p.id===a.id);if(!old&&a.id.startsWith('original-'))continue;await recordAssetChange(bucket,'prop',a.id,a.name,a,old||null,savedAt);}
 const result=await bucket.put(key,JSON.stringify({savedAt,workspace}),{onlyIf:new Headers(etag?{'If-Match':etag}:{'If-None-Match':'*'}),httpMetadata:{contentType:'application/json',cacheControl:'private, no-store'}});
 return result?jsonResponse({savedAt},200,{ETag:result.httpEtag}):jsonResponse({error:'A newer workspace exists. Browser draft retained.'},409);
}
const studioReadTools=[
 {name:'list_cat_asset_changes',description:'List pending, completed and deferred exact asset versions. Completion applies only to that version; future edits become new pending changes.',inputSchema:{type:'object',properties:{cursor:{type:'string'}},additionalProperties:false}},
 {name:'get_cat_asset_change',description:'Read an immutable asset change, exact before/after snapshots, hash and integration receipt.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}},
 {name:'get_saved_cat_props',description:'Read the saved props catalogue and canvas draft, including exact colours, stable asset IDs, revisions, provenance and reference-cat placement. Assets are candidates for later integration, not installed card assets.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'list_saved_cat_projects',description:'List private Stick-Pet-Card Frame Studio projects, save dates and counts of ready pose outputs.',inputSchema:{type:'object',properties:{cursor:{type:'string'}},additionalProperties:false}},
 {name:'get_saved_cat_project',description:'Read a saved project with its human pose queue, linked frames, provenance and exact ready outputs. Ready is a handoff, not approval or installation.',inputSchema:{type:'object',properties:{projectId:{type:'string'}},required:['projectId'],additionalProperties:false}},
 {name:'get_saved_cat_pose_output',description:'Read one exact saved pose output associated with a project and task. Preserve its frame origin and review status.',inputSchema:{type:'object',properties:{projectId:{type:'string'},taskId:{type:'string'},outputId:{type:'string'}},required:['projectId','taskId'],additionalProperties:false}}
].map(t=>({...t,annotations:{readOnlyHint:true,destructiveHint:false}}));
async function studioMcp(request,bucket){
 if(request.method!=='POST')return jsonResponse({error:'Use JSON-RPC POST.'},405);let rpc;try{rpc=JSON.parse(await readBoundedText(request,64000,'MCP request exceeds 64 KB.'));}catch(e){if(e.status===413)throw e;return jsonResponse({error:'Invalid JSON-RPC.'},400);}let result;
 try{if(rpc.method==='server/discover')result={supportedVersions:['2026-07-28'],capabilities:{tools:{}}};else if(rpc.method==='initialize')result={protocolVersion:'2026-07-28',capabilities:{tools:{}},serverInfo:{name:'cat-frame-studio',version:'1.0.0'}};else if(rpc.method==='notifications/initialized')return new Response(null,{status:202});else if(rpc.method==='tools/list')result={tools:studioReadTools};else if(rpc.method==='tools/call'){const name=rpc.params?.name,input=rpc.params?.arguments||{};let value;if(name==='list_cat_asset_changes')value=await listAssetChanges(bucket,input.cursor);else if(name==='get_cat_asset_change')value=await getAssetChange(bucket,input.id);else if(name==='get_saved_cat_props'){const object=await bucket.get('props/workspace.json');if(!object)throw Error('No saved props workspace yet.');value=await object.json();}else if(name==='list_saved_cat_projects')value=await listSavedProjects(bucket,input.cursor);else if(name==='get_saved_cat_project'||name==='get_saved_cat_pose_output'){const saved=await readSavedProject(bucket,input.projectId);if(!saved)throw Error('Saved project not found.');value=name==='get_saved_cat_project'?saved.record:savedOutput(saved.record.project,input.taskId,input.outputId);}else throw Error('Unknown read-only tool.');result={content:[{type:'text',text:JSON.stringify(value)}]};}else return jsonResponse({jsonrpc:'2.0',id:rpc.id??null,error:{code:-32601,message:'Unknown method.'}});
 }catch(e){result={isError:true,content:[{type:'text',text:e.message}]};}return jsonResponse({jsonrpc:'2.0',id:rpc.id??null,result});
}
