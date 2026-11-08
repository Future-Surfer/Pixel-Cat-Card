// Local recovery is mandatory before replacing a draft, independent of server availability.
export function recoveryCopies(storage,key){try{const copies=JSON.parse(storage.getItem(key+'/recoveries')||'[]');return Array.isArray(copies)?copies.filter(c=>c?.draft&&c.savedAt):[];}catch{return [];}}
export function preserveDraft(storage,key,draft,reason='Replace draft'){
 const exact=JSON.stringify(draft),copies=recoveryCopies(storage,key).filter(c=>JSON.stringify(c.draft)!==exact),record={savedAt:new Date().toISOString(),reason,draft:JSON.parse(exact)};
 storage.setItem(key+'/recoveries',JSON.stringify([record,...copies].slice(0,20)));
 storage.setItem(key+'/previous',exact);
 if(storage.getItem(key+'/previous')!==exact||JSON.stringify(recoveryCopies(storage,key)[0]?.draft)!==exact)throw Error('Recovery backup could not be verified. Current frames have been kept.');
 return record;
}

// A shared bare hash cannot establish which server version a particular draft edits.
export function workingBase(storage,key,draft){try{const pair=JSON.parse(storage.getItem(key+'/working-base'));return pair?.draft===JSON.stringify(draft)&&typeof pair.hash==='string'?pair.hash:null;}catch{return null;}}
export function rememberWorkingBase(storage,key,draft,hash){const exact=JSON.stringify(draft);if(storage.getItem(key)===exact)storage.setItem(key+'/working-base',JSON.stringify({draft:exact,hash}));}
