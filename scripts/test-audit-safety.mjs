import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';
import {newPropWorkspace,captureProp} from '../frame-studio/dist/props-model.js';
import {readBoundedText} from '../frame-studio/worker/request-body.js';
import {handleStudioApi} from '../frame-studio/worker/api.js';import {newFrame} from '../frame-studio/dist/model.js';import {ensureQueue} from '../frame-studio/dist/queue.js';
import {LocalBucket} from '../frame-studio/scripts/local-bucket.mjs';import {createPreviewServer} from '../frame-studio/scripts/preview.mjs';import {createLabServer,labAssets} from './serve-gaze-lab.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'cat-audit-')),bucket=new LocalBucket(root);let failing=true;
const guarded={root,get:(...args)=>bucket.get(...args),list:(...args)=>bucket.list(...args),put:(key,...args)=>{if(failing&&key.startsWith('changes/'))throw Error('Journal unavailable');return bucket.put(key,...args);}};
const project={schemaVersion:1,width:24,height:24,name:'Audit fixture',frames:[newFrame()]};ensureQueue(project);
const save=(p,headers)=>handleStudioApi(new Request('http://127.0.0.1:8767/api/projects/'+p.projectId,{method:'PUT',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(p)}),{BUCKET:guarded});
try{
 await assert.rejects(()=>save(project,{'If-None-Match':'*'}),/Journal unavailable/);assert.equal(await bucket.get('projects/'+project.projectId+'.json'),null,'Failed journal cannot publish current artwork');
 failing=false;const first=await save(project,{'If-None-Match':'*'});assert.equal(first.status,200);const etag=first.headers.get('etag');
 failing=true;await assert.rejects(()=>save({...project,name:'New edit'},{'If-Match':etag}),/Journal unavailable/);assert.equal((await bucket.get('projects/'+project.projectId+'.json')).httpEtag,etag);
 failing=false;const races=await Promise.all(['A','B'].map(name=>save({...project,name},{'If-Match':etag})));assert.deepEqual(races.map(r=>r.status).sort(),[200,409]);assert.equal((await bucket.list({prefix:'changes/'})).objects.length,2,'Stale same-process saves must not create journal candidates');
 let cancelled=false,index=0;const stream=new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(4));if(++index===3)controller.close();},cancel(){cancelled=true;}});
 await assert.rejects(()=>readBoundedText(new Request('http://test/',{method:'POST',body:stream,duplex:'half'}),5),e=>e.status===413);assert.ok(cancelled,'Stop reading oversized chunked bodies');
 assert.equal(await readBoundedText(new Request('http://test/',{method:'POST',body:'猫'}),3),'猫');await assert.rejects(()=>readBoundedText(new Request('http://test/',{method:'POST',body:'猫'}),2),e=>e.status===413);
 const props=newPropWorkspace();props.scratch[0][0]='#123456';captureProp(props,{x:0,y:0,width:1,height:1},{name:'Audit prop'});
 const saveProps=()=>handleStudioApi(new Request('http://test/api/props-workspace',{method:'PUT',headers:{'Content-Type':'application/json','If-None-Match':'*'},body:JSON.stringify(props)}),{BUCKET:guarded});
 failing=true;await assert.rejects(saveProps,/Journal unavailable/);assert.equal(await bucket.get('props/workspace.json'),null);failing=false;assert.equal((await saveProps()).status,200);
 const rpc=await handleStudioApi(new Request('http://test/mcp',{method:'POST',body:' '.repeat(64001)}),{BUCKET:bucket});assert.equal(rpc.status,413);
 const records=Array.from({length:101},(_,i)=>({projectId:'page-fixture-'+i,savedAt:new Date().toISOString(),project:{...project,projectId:'page-fixture-'+i,name:'Page fixture '+i}}));let pages=0;
 const source={async list({cursor}){pages++;const start=Number(cursor)||0;return {objects:records.slice(start,start+100).map(r=>({key:r.projectId})),truncated:start===0,cursor:'100'};},async get(key){return {json:async()=>records.find(r=>r.projectId===key)};}};
 const assets=await labAssets(source);assert.equal(pages,2);assert.equal(assets.projects.filter(p=>p.projectId.startsWith('page-fixture-')).length,101);
 const probe=(server,host,method='GET')=>new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port:server.address().port,path:'/',method,headers:{Host:host}},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));});req.on('error',reject);req.end();});
 for(const [server,port]of [[createPreviewServer({port:8768,worker:{fetch:async()=>new Response('<body>Test</body>',{headers:{'Content-Type':'text/html'}})},bucket}),8768],[createLabServer({storage:bucket}),8769]]){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{assert.equal(await probe(server,'attacker.test:'+port),403);assert.equal(await probe(server,'attacker.test:'+port,'PUT'),403);assert.equal(await probe(server,'127.0.0.1:'+port),200);assert.equal(await probe(server,'localhost:'+port),200);assert.equal(await probe(server,'127.0.0.1:1'),403);}finally{await new Promise(resolve=>server.close(resolve));}
 }
 const ui=fs.readFileSync('frame-studio/dist/changes-ui.js','utf8');assert.equal((ui.match(/api\('\/bootstrap'/g)||[]).length,1);assert.ok(ui.includes("$('#changes-repair').onclick"));assert.ok(!ui.slice(ui.indexOf('async function refresh'),ui.indexOf('function render')).includes('/bootstrap'));
 console.log('PASS: journal failure/retry and concurrent saves, streamed UTF-8 byte limits/cancellation, bounded MCP, 101-project pagination, real HTTP hostname rejection and explicit-only journal repair.');
}finally{assert.equal(path.dirname(root),os.tmpdir());assert.ok(path.basename(root).startsWith('cat-audit-'));fs.rmSync(root,{recursive:true});}
