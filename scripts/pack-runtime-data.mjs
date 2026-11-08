// Lossless synchronous string interning. Only generated packaging changes.
export function packedAssignment(name,input){
 const value=JSON.parse(JSON.stringify(input)),counts=new Map();
 function visit(v){if(typeof v==='string'){if(v.length>=12)counts.set(v,(counts.get(v)||0)+1);}else if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')Object.values(v).forEach(visit);}
 visit(value);const dictionary=[...counts].filter(([s,n])=>n>1&&(s.length-5)*(n-1)>s.length+4).map(([s])=>s),ids=new Map(dictionary.map((s,i)=>[s,i.toString(36)]));
 function encode(v){if(typeof v==='string')return ids.has(v)?'~'+ids.get(v):v.startsWith('~')?'~'+v:v;if(Array.isArray(v))return v.map(encode);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)]));return v;}
 return name+'=(()=>{const d='+JSON.stringify(dictionary)+';const decode=v=>typeof v==="string"?(v[0]!=="~"?v:v[1]==="~"?v.slice(1):d[parseInt(v.slice(1),36)]):Array.isArray(v)?v.map(decode):v&&typeof v==="object"?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,decode(x)])):v;return decode('+JSON.stringify(encode(value))+');})();\n';
}
