import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
import {buildCard} from './build-card.mjs';import {runtimeFiles} from './build-release.mjs';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'pixel-cat-package-'));
try{
 const first=buildCard({outDir:temp}),second=buildCard({outDir:temp});assert.deepEqual(second,first);
 const code=fs.readFileSync(path.join(temp,'pixel-cat-card.js'),'utf8');assert.equal(crypto.createHash('sha256').update(code).digest('hex'),first.artifact.sha256);assert.ok(!/^\s*(?:import |export )/m.test(code));
 const make=()=>{const registry=new Map(),warnings=[];return {registry,warnings,window:{},HTMLElement:class{},customElements:{get:k=>registry.get(k),define:(k,v)=>{assert.ok(!registry.has(k));registry.set(k,v);},whenDefined:()=>Promise.resolve()},console:{info(){},warn:m=>warnings.push(m)}};};
 const installed=make();vm.runInNewContext(code,installed,{timeout:10000});assert.equal(installed.window.pixelCatCardRelease.version,first.version);
 const cardTypes=['pixel-cat-behaviour-lab','pixel-cat-home','pixel-cat-home-editor','pixel-cat-monitor'];
 assert.deepEqual([...installed.registry.keys()].sort(),cardTypes,'Only supported modern elements may register');
 assert.deepEqual(Array.from(installed.window.customCards,card=>card.type).sort(),['pixel-cat-behaviour-lab','pixel-cat-home'],'Only intended modern cards appear in the picker');
 assert.equal(fs.readFileSync('dist/pixel-cat-card.js','utf8'),code,'The committed Marketplace bundle must match the audited build');
 const Home=installed.registry.get('pixel-cat-home');vm.runInNewContext(code,installed,{timeout:10000});assert.equal(installed.registry.get('pixel-cat-home'),Home,'Repeated resources do not replace registered classes');
 const original=make();for(const file of runtimeFiles)vm.runInNewContext(fs.readFileSync(file,'utf8'),original,{timeout:10000});for(const key of ['pixelCatRoamingArtV2','pixelCatRoamingExtrasV1'])assert.equal(JSON.stringify(installed.window[key]),JSON.stringify(original.window[key]),'Bundling preserves decoded artwork/metadata exactly');
 const manual=make();for(const file of runtimeFiles)vm.runInNewContext(fs.readFileSync(file,'utf8'),manual,{timeout:10000});const oldArt=manual.window.pixelCatRoamingArtV2;vm.runInNewContext(code,manual,{timeout:10000});assert.equal(manual.window.pixelCatRoamingArtV2,oldArt);assert.equal(manual.window.pixelCatCardRelease,undefined);assert.ok(manual.warnings.some(m=>m.includes('separate roaming runtime')),'Mixed installs are detected without replacing the existing runtime');
 assert.deepEqual(first.modules.map(({file})=>file),runtimeFiles,'The package contains only the modern runtime modules');
 assert.equal(JSON.parse(fs.readFileSync('hacs.json','utf8')).filename,first.artifact.file);
 console.log('PASS: deterministic single-file package, modern elements only, repeat-load safety, mixed-resource detection, exact decoded artwork and manifest entrypoint.');
}finally{assert.equal(path.dirname(temp),os.tmpdir());assert.ok(path.basename(temp).startsWith('pixel-cat-package-'));fs.rmSync(temp,{recursive:true});}
