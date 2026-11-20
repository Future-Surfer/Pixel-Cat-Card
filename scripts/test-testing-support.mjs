import assert from 'node:assert/strict';import vm from 'node:vm';
import fs from 'node:fs';import path from 'node:path';
import {testSeed,seededMath} from './testing/random.mjs';import {runOptions} from './testing/run-options.mjs';
import {runSuites} from './testing/runner.mjs';
const sequence=seed=>{const box={Math:seededMath(seed)};return vm.runInNewContext('Array.from({length:50},()=>Math.random())',box).join(',');};
assert.equal(sequence(42),sequence(42),'Independent runtime contexts replay the same seed');assert.notEqual(sequence(42),sequence(43));
for(const invalid of ['',-1,'NaN','1.5',4294967296])assert.throws(()=>testSeed(invalid));
assert.equal(testSeed(0),0);assert.equal(testSeed(4294967295),4294967295);
assert.deepEqual(runOptions(['--suite','a.mjs','--seeds','1,2,1'],['a.mjs','b.mjs']),{suites:['a.mjs'],seeds:[1,2]});
assert.throws(()=>runOptions(['--suite','../other.mjs'],['a.mjs']),/Unknown/);assert.throws(()=>runOptions(['--seeds'],['a.mjs']));
assert.throws(()=>runOptions(['--seeds','1,'],['a.mjs']));assert.throws(()=>runOptions(['--unexpected'],['a.mjs']));
const root=path.resolve('.test-artifacts');fs.mkdirSync(root,{recursive:true});const workspace=fs.mkdtempSync(path.join(root,'runner-probe-'));
try{
 fs.mkdirSync(path.join(workspace,'scripts'));fs.writeFileSync(path.join(workspace,'scripts/fail.mjs'),"console.log('fixture output');throw Error('expected runner probe');");fs.writeFileSync(path.join(workspace,'scripts/pass.mjs'),"console.log('seed='+process.env.PIXEL_CAT_TEST_SEED);");fs.writeFileSync(path.join(workspace,'scripts/hang.mjs'),'setInterval(()=>{},1000);');
 const directory=path.join(workspace,'artifacts'),report=runSuites({cwd:workspace,suites:['fail.mjs','pass.mjs'],seeds:[42],directory,quiet:true});
 assert.equal(report.failures,1);assert.equal(report.results[1].status,'passed','A failure cannot prevent later suites from running');
 assert.ok(fs.readFileSync(path.join(directory,'fail.seed-42.stderr.log'),'utf8').includes('expected runner probe'));assert.ok(fs.readFileSync(path.join(directory,'fail.seed-42.stdout.log'),'utf8').includes('fixture output'));
 assert.equal(JSON.parse(fs.readFileSync(path.join(directory,'results.json'))).results[0].replay,'node scripts/test-all.mjs --suite fail.mjs --seeds 42');
 const timed=runSuites({cwd:workspace,suites:['hang.mjs'],seeds:[19],directory,timeout:300,quiet:true});assert.equal(timed.failures,1);assert.ok(timed.results[0].error.includes('ETIMEDOUT'),'Hung suites produce replayable failure records');
}finally{assert.equal(path.dirname(workspace),root);assert.ok(path.basename(workspace).startsWith('runner-probe-'));fs.rmSync(workspace,{recursive:true});}
console.log('PASS: reproducible VM randomness, valid uint32 seeds and bounded replay selectors.');
