import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {loopbackOrigin} from './loopback-http.mjs';
const root=path.resolve(import.meta.dirname,'..'),port=8770;
const routes=new Map([['/','prototype/release-showcase.html'],['/prototype/release-showcase.html','prototype/release-showcase.html'],['/dist/pixel-cat-card.js','dist/pixel-cat-card.js']]);
http.createServer((req,res)=>{
 if(!loopbackOrigin(req.headers.host,port)){res.writeHead(403);res.end('Use the loopback demonstration hostname.');return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const file=routes.get(new URL(req.url,'http://127.0.0.1:'+port).pathname);if(!file){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':(file.endsWith('.js')?'text/javascript':'text/html')+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:fs.readFileSync(path.join(root,file)));
}).listen(port,'127.0.0.1',()=>console.log('Release demonstration: http://127.0.0.1:'+port+'/'));
