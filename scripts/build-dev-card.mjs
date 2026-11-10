import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import { runtimeFiles } from './build-release.mjs';
import { writeGenerated } from './write-generated.mjs';

// Keep the dev runtime's globals private and give browser-facing names a
// separate prefix. The normal release build and legacy cards are untouched.
const modules = runtimeFiles.map(file => {
  const source = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  return `// Module: ${file}\n(() => {\n${source
    .replace(/\bwindow\.pixelCat/g, 'runtime.pixelCat')
    .replace(/\bpixel-cat-(?!dev-)/g, 'pixel-cat-dev-')
    .replace(/(\.dataset\.)pixelCat/g, '$1pixelCatDev')}\n})();`;
}).join('\n');
const build = createHash('sha256').update(modules).digest('hex').slice(0, 16);
const code = `// Pixel Cat Card development build ${build} | MIT
(() => {
  'use strict';
  if (customElements.get('pixel-cat-dev-home')) return;
  const runtime = Object.create(null);
  ${modules}
  const card = window.customCards.find(entry => entry.type === 'pixel-cat-dev-home');
  card.name = 'Pixel Cat Card (Dev)';
  window.pixelCatCardDev = Object.freeze({ build: '${build}' });
})();
`;

const elements = new Map([['pixel-cat-home', class ReleaseHome {}]]);
const release = Object.freeze({ version: 'release-test' });
const window = { pixelCatCardRelease: release, customCards: [{ type: 'pixel-cat-home' }] };
const box = {
  window,
  HTMLElement: class {},
  customElements: {
    get: name => elements.get(name),
    define(name, constructor) {
      if (elements.has(name)) throw new Error('Duplicate element: ' + name);
      elements.set(name, constructor);
    }
  }
};
runInNewContext(code, box, { timeout: 10000 });
for (const name of ['pixel-cat-dev-home', 'pixel-cat-dev-home-editor', 'pixel-cat-dev-monitor']) {
  if (!elements.has(name)) throw new Error('Missing dev element: ' + name);
}
if (elements.size !== 4 || window.pixelCatCardRelease !== release
    || window.customCards.length !== 2 || window.pixelCatRoamingArtV2 !== undefined) {
  throw new Error('Dev build affected the release namespace');
}

const sha256 = createHash('sha256').update(code).digest('hex');
const file = path.join('.release', 'dev', sha256.slice(0, 16), 'pixel-cat-card-dev.js');
mkdirSync(path.dirname(file), { recursive: true });
writeGenerated(file, code);
console.log(JSON.stringify({ file, sha256, build }));
