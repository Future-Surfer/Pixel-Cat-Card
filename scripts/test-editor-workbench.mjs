import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describeEditorDraft, validateEditorDraft} from '../frame-studio/dist/editor-draft-model.js';
import {LocalBucket} from '../frame-studio/scripts/local-bucket.mjs';
import {getAssetChange} from '../frame-studio/worker/changes.js';
import {handleEditorDraftApi} from './editor-draft-storage.mjs';

const dir = await mkdtemp(join(tmpdir(), 'pixel-cat-editor-'));
try {
  const bucket = new LocalBucket(dir);
  const url = 'http://localhost/api/editor-drafts/editor-main';
  const draft = {schema: 'pixel-cat-editor-workbench/v1', name: 'Editor layout', base: 'a'.repeat(64), modes: {
    companion: {moves: [{id: 'field:full_pixel_scratch_debris', target: 'section:make-them-at-home', where: 'inside'}], items: {
      'content:animation': {label: 'Animated cat preview', notes: 'Yawn sooner.'},
      'field:full_pixel_scratch_debris': {label: 'Full-pixel scratching debris', beforeTitle: 'Full-pixel scratching debris', title: 'Scratching debris', notes: 'Three options.'}
    }}
  }};
  const save = (body, headers) => handleEditorDraftApi(new Request(url, {
    method: 'PUT', body: JSON.stringify(body), headers: {'Content-Type': 'application/json', ...headers}
  }), bucket);
  const original = await save(draft, {'If-None-Match': '*'});
  assert.equal(original.status, 200);
  const record = await original.json();
  assert.equal((await save(draft, {'If-None-Match': '*'})).status, 409);
  const entry = await getAssetChange(bucket, record.changeId);
  assert.equal(entry.kind, 'editor-layout');
  assert.deepEqual(entry.summary, {items: 2, moves: 1});
  assert.deepEqual(entry.snapshot, draft);
  assert.match(describeEditorDraft(entry.snapshot).flat().join(' '), /Animated cat preview.*Yawn sooner/s);
  const updated = structuredClone(draft);
  updated.modes.companion.items['content:animation'].notes = 'Try a stretch.';
  assert.equal((await save(updated, {'If-Match': original.headers.get('etag')})).status, 200);
  const version = await (await handleEditorDraftApi(new Request(url + '/versions/' + record.versionHash), bucket)).json();
  assert.deepEqual(version.snapshot, draft, 'Review links retain the exact older version');
  updated.modes.companion.moves[0].where = 'replace';
  assert.throws(() => validateEditorDraft(updated), /Invalid editor move/);
} finally {
  await rm(dir, {recursive: true, force: true});
}
console.log('PASS: contextual editor notes, copy and order diffs, exact immutable review and stale-save rejection.');
