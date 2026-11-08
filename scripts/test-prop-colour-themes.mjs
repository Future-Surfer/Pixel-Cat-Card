import assert from 'node:assert/strict';import fs from 'node:fs';
import {colourProposals,PROP_COLOUR_THEMES} from '../frame-studio/dist/prop-colour-themes.js';
const assets=JSON.parse(fs.readFileSync('frame-studio/user-sequences/review-2026-10-17/colour-proposals.json'));
assert.equal(assets.length,43);assert.equal(new Set(assets.map(a=>a.assetId)).size,43);
for(const a of assets){const p=a.colourVariants;assert.equal(p.origin,'ai');assert.equal(p.review,'candidate');assert.equal(p.themes.length,6);for(const t of p.themes){assert.ok(PROP_COLOUR_THEMES.some(s=>s.id===t.id));assert.equal(t.variants.length,2);for(const v of t.variants)for(const [from,to]of Object.entries(v.colours))assert.ok(/^#[a-f\d]{6}$/i.test(from)&&/^#[a-f\d]{6}$/i.test(to));}}
const a={revision:1,pixels:[[null,'#111111','#ffffff','#cc8822','#774422']]},before=JSON.stringify(a),proposals=colourProposals(a);assert.equal(JSON.stringify(a),before);for(const t of proposals.themes)for(const v of t.variants){assert.equal(v.colours['#111111'],'#111111');assert.equal(v.colours['#ffffff'],'#ffffff');assert.ok(!('null'in v.colours));assert.notEqual(v.colours['#cc8822'],v.colours['#774422'],'Shading retains at least two values');}
assert.deepEqual(colourProposals(a),proposals,'Palette proposals are deterministic across family states and sessions');
console.log('PASS: all 43 exact prop identities have six AI draft theme pairs, deterministic valid maps, preserved originals/transparency/outlines/highlights and tonal separation.');
