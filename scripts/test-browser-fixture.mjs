import assert from 'node:assert/strict';import {browserServer} from './browser/server.mjs';
import http from 'node:http';
const server=browserServer(0);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
try{
 assert.equal((await fetch(origin+'/health')).status,200);assert.ok((await(await fetch(origin+'/')).text()).includes('Synthetic local dashboard'));
 assert.equal((await fetch(origin+'/dist/pixel-cat-card.js')).status,200);
 for(const file of ['/.studio-data/props','/.git/config','/.release/manifest.json','/unknown','/api/changes'])assert.equal((await fetch(origin+file)).status,404,'Browser fixture exposes only whitelisted synthetic files');
 assert.equal((await fetch(origin+'/',{method:'POST',body:'no writes'})).status,405);
 const spoofed=await new Promise((resolve,reject)=>http.get(origin+'/health',{headers:{Host:'evil.test'}},response=>{response.resume();resolve(response.statusCode);}).on('error',reject));assert.equal(spoofed,403);
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
console.log('PASS: browser fixture serves the real bundle with loopback host/method restrictions and no private-store endpoints.');
