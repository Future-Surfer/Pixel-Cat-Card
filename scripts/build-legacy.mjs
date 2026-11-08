import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
// Compatibility sources stay under src; root copies are ignored intermediates
// for the existing test/lab tooling and never become separate install assets.
for(const name of ['stick-pet-card.js','pixel-pet-card.js']){
 fs.copyFileSync(path.join(root,'src/legacy',name),path.join(root,name));
}
console.log('Prepared legacy compatibility intermediates.');
