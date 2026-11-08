import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
for(const script of ['scripts/build-legacy.mjs','scripts/build-studio-library.mjs','scripts/build-roaming.mjs','scripts/build-card.mjs','frame-studio/scripts/build.mjs']){
 const result=spawnSync(process.execPath,[script],{cwd,stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
