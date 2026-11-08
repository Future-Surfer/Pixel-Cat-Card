import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
const tests=fs.readdirSync(new URL('./',import.meta.url)).filter(name=>name!=='test-all.mjs'&&/^test-.+\.mjs$/.test(name)).sort();
let failures=0;
for(const name of tests){
 const result=spawnSync(process.execPath,['scripts/'+name],{cwd,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)failures++;
}
console.log(`${tests.length-failures}/${tests.length} suites passed.`);
process.exitCode=failures?1:0;
