import http from 'node:http';import path from 'node:path';import {pathToFileURL} from 'node:url';import {LocalBucket} from './local-bucket.mjs';
import {loopbackOrigin,forwardLocalRequest} from '../../scripts/loopback-http.mjs';
const root=path.resolve(import.meta.dirname,'..');
export function createPreviewServer({port=8767,worker,bucket}){
 return http.createServer(async(req,res)=>{try{
  const origin=loopbackOrigin(req.headers.host,port);if(!origin){res.writeHead(403);res.end('Use the loopback Studio hostname.');return;}
  await forwardLocalRequest(req,res,origin,3000000,async request=>{
   const response=await worker.fetch(request,{BUCKET:bucket});
   if(port===8767||!response.headers.get('content-type')?.includes('text/html')||req.method==='HEAD')return response;
   const body=(await response.text()).replace(/(<body\b[^>]*>)/,'$1<aside role="note" style="padding:12px;background:#fff2cc;color:#332600;border:3px solid #a76b00;font:16px system-ui"><strong>ISOLATED TEST WORKSHOP · PORT '+port+'</strong> — separate test storage and reference catalogue. Your saved artwork/gaze is in <a href="http://127.0.0.1:8767">Studio 8767</a>.</aside>');
   return new Response(body,{status:response.status,headers:response.headers});
  });
 }catch{res.writeHead(500);res.end('Preview request failed');}});
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
 const args=Object.fromEntries(process.argv.slice(2).map(v=>v.replace(/^--/,'').split(/=(.*)/s).slice(0,2))),port=Number(args.port||8767),data=args.data?path.resolve(args.data):path.join(root,'../.studio-data');
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Use a loopback port from 1024 to 65535.');
 const worker=(await import(pathToFileURL(path.join(root,'dist/server/index.js')).href)).default;
 createPreviewServer({port,worker,bucket:new LocalBucket(data)}).listen(port,'127.0.0.1',()=>console.log('Frame Studio shared-save preview: http://127.0.0.1:'+port+' · storage '+data));
}
