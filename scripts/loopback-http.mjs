import {readBoundedText} from '../frame-studio/worker/request-body.js';
// Host is supplied by the peer, never an authority for local save permissions.
export function loopbackOrigin(host,port){
 if(!new Set(['127.0.0.1:'+port,'localhost:'+port]).has(host?.toLowerCase()))return null;
 return 'http://'+host.toLowerCase();
}
export async function forwardLocalRequest(req,res,origin,limit,handle){
 const request=new Request(origin+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:req,duplex:'half'}:{})});
 // Limit Node requests before dispatch too, so every local endpoint is bounded.
 let body;try{body=await readBoundedText(request,limit);}catch(e){if(e.status!==413)throw e;res.writeHead(413);res.end(e.message);return;}
 const response=await handle(new Request(request.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body}:{})}));
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}
