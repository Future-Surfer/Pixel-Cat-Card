import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {loopbackOrigin} from './loopback-http.mjs';
import {readmeAssets} from './readme-assets.mjs';
const root=path.resolve(import.meta.dirname,'..'),port=Number(process.env.PORT||8770);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid preview port');
const routes=new Map([['/','prototype/release-showcase.html'],['/prototype/release-showcase.html','prototype/release-showcase.html'],['/dist/pixel-cat-card.js','dist/pixel-cat-card.js']]);
routes.set('/routine','prototype/readme-routine.html');routes.set('/prototype/readme-routine.mjs','prototype/readme-routine.mjs');
const assets=JSON.stringify(readmeAssets());
http.createServer((req,res)=>{
 if(!loopbackOrigin(req.headers.host,port)){res.writeHead(403);res.end('Use the loopback demonstration hostname.');return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;
 if(pathname==='/readme-assets.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:assets);return;}
 const file=routes.get(pathname);if(!file){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':(/\.m?js$/.test(file)?'text/javascript':'text/html')+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?null:fs.readFileSync(path.join(root,file)));
}).listen(port,'127.0.0.1',()=>console.log('Release demonstration: http://127.0.0.1:'+port+'/'));
