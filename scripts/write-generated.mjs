import fs from 'node:fs';
// Avoid touching identical outputs: stable mtimes, less sync churn and fewer file locks.
export function writeGenerated(file,body){const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);if(fs.existsSync(file)&&fs.readFileSync(file).equals(bytes))return false;fs.writeFileSync(file,bytes);return true;}
