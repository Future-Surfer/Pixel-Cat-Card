import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
// Durable local preview storage only; hosted persistence uses the private R2 binding.
export class LocalBucket {
 constructor(root){this.root=path.resolve(root);fs.mkdirSync(this.root,{recursive:true});}
 file(key){const target=path.resolve(this.root,key);if(!target.startsWith(this.root+path.sep))throw Error('Invalid local object key');return target;}
 async get(key){const file=this.file(key);if(!fs.existsSync(file))return null;const item=JSON.parse(fs.readFileSync(file,'utf8'));return {etag:item.etag,httpEtag:'"'+item.etag+'"',customMetadata:item.customMetadata||{},json:async()=>JSON.parse(item.body)};}
 async put(key,body,options={}){const file=this.file(key),old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null,condition=options.onlyIf;const match=condition?.get('If-Match'),none=condition?.get('If-None-Match');if(match&&(!old||match!=='"'+old.etag+'"')||none==='*'&&old)return null;const etag=createHash('sha256').update(body).digest('hex');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify({body,etag,customMetadata:options.customMetadata||{}}));fs.renameSync(file+'.tmp',file);return {etag,httpEtag:'"'+etag+'"'};}
 async list({prefix='',limit=100,cursor='0'}={}){const folder=this.file(prefix||'projects/');const files=fs.existsSync(folder)?fs.readdirSync(folder).filter(f=>f.endsWith('.json')).sort():[],start=Number(cursor)||0,objects=[];for(const file of files.slice(start,start+limit)){const key=prefix+file,object=await this.get(key);objects.push({key,customMetadata:object.customMetadata});}return {objects,truncated:start+limit<files.length,cursor:String(start+limit)};}
}
