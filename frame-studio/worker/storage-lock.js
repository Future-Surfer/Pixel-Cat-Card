const localStorageLocks=new Map(),objectStorageLocks=new WeakMap();
// Serialise local read/journal/publish sequences; conditional writes remain
// authoritative across processes and hosted isolates.
export async function withStorageLock(bucket,key,run){
 let locks;if(bucket.root)locks=localStorageLocks;else{locks=objectStorageLocks.get(bucket);if(!locks){locks=new Map();objectStorageLocks.set(bucket,locks);}}
 const id=bucket.root?bucket.root+':'+key:key,prior=locks.get(id)||Promise.resolve();let unlock;
 const next=new Promise(resolve=>{unlock=resolve;});locks.set(id,next);await prior;
 try{return await run();}finally{unlock();if(locks.get(id)===next)locks.delete(id);}
}
