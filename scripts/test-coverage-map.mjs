import fs from 'node:fs';import assert from 'node:assert/strict';
const map=JSON.parse(fs.readFileSync('scripts/testing/coverage-map.json')),browser=fs.readFileSync('tests/browser/card.spec.mjs','utf8');
const suites=fs.readdirSync('scripts').filter(n=>/^test-.+\.mjs$/.test(n)&&n!=='test-all.mjs');
assert.equal(map.schema,1);assert.equal(new Set(map.groups.map(g=>g.id)).size,map.groups.length);
for(const title of Object.values(map.browserChecks))assert.ok(browser.includes("test('"+title+"'"),'Mapped browser check must exist: '+title);
for(const group of map.groups){assert.ok(suites.some(s=>new RegExp(group.suitePattern).test(s)),group.id+' has executable Node evidence');assert.ok(group.openChecks.length);for(const id of group.browser)assert.ok(id in map.browserChecks);}
const unmapped=suites.filter(s=>!map.groups.some(g=>new RegExp(g.suitePattern).test(s)));assert.deepEqual(unmapped,[],'New test families need a coverage owner; this does not claim exhaustive coverage');
console.log(`PASS: ${suites.length} Node suites mapped across ${map.groups.length} feature groups; ${Object.keys(map.browserChecks).length} real-browser journeys and remaining gaps identified.`);
