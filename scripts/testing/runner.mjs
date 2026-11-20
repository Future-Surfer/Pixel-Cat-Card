import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
export function runSuites({cwd,suites,seeds,directory,timeout=120000,quiet=false}){
 fs.mkdirSync(directory,{recursive:true});let failures=0;const results=[];
 for(const seed of seeds)for(const name of suites){
  if(!quiet)console.log(`RUN ${name} seed=${seed}`);
  const started=Date.now(),result=spawnSync(process.execPath,['scripts/'+name],{cwd,encoding:'utf8',env:{...process.env,PIXEL_CAT_TEST_SEED:String(seed)},timeout,maxBuffer:16*1024*1024});
  if(!quiet){process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');}
  const failed=result.status!==0||!!result.error;if(failed)failures++;
  const record={suite:name,seed,status:failed?'failed':'passed',exitCode:result.status,signal:result.signal,durationMs:Date.now()-started,error:result.error?.message};
  if(failed){
   const stem=name.replace(/\.mjs$/,'')+'.seed-'+seed;
   fs.writeFileSync(path.join(directory,stem+'.stdout.log'),result.stdout||'');fs.writeFileSync(path.join(directory,stem+'.stderr.log'),(result.stderr||'')+(result.error?.message||''));
   record.replay=`node scripts/test-all.mjs --suite ${name} --seeds ${seed}`;
   if(!quiet)console.error(`FAIL ${name} seed=${seed}; replay: ${record.replay}`);
  }
  results.push(record);fs.writeFileSync(path.join(directory,'results.json'),JSON.stringify({schema:1,commit:process.env.GITHUB_SHA||null,results},null,2)+'\n');
 }
 return {failures,results};
}
