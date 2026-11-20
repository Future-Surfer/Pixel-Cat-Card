import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(import.meta.dirname,'../..');
export function browserServer(port){
 const files=new Map([['/','tests/browser/fixture.html'],['/away','tests/browser/fixture.html'],['/fixture.mjs','tests/browser/fixture.mjs'],['/dist/pixel-cat-card.js','dist/pixel-cat-card.js']]);
 const server=http.createServer((req,res)=>{
  const activePort=port||server.address()?.port;
  if(!['127.0.0.1:'+activePort,'localhost:'+activePort].includes(req.headers.host)){res.writeHead(403);res.end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const url=new URL(req.url,'http://127.0.0.1:'+port);
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(url.pathname==='/health'){res.writeHead(200);res.end('ready');return;}
  const file=files.get(url.pathname);if(!file){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?null:fs.readFileSync(path.join(root,file)));
 });
 return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PIXEL_CAT_BROWSER_PORT||8774);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid browser-test port');
 browserServer(port).listen(port,'127.0.0.1',()=>console.log('Isolated bundle fixture http://127.0.0.1:'+port));
}
