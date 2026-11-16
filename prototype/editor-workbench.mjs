import {editorModes, validateEditorDraft, describeEditorDraft} from '../frame-studio/dist/editor-draft-model.js';

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
const key = /^qa-[a-z0-9-]{1,60}$/.test(params.get('draft') || '') ? params.get('draft') : 'editor-main';
const api = '/api/editor-drafts/' + key;
const localKey = 'pixel-cat-editor-workbench/v1/' + key;
const editor = $('#canvas pixel-cat-home-editor');
const shadow = editor.shadowRoot;
const editorStyle = '.workbench-tools{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0;font:inherit}.workbench-tools button{font:inherit;color:inherit;background:var(--card-background-color,#fff);border:1px solid #819b8b;border-radius:5px;padding:3px 7px;cursor:pointer}.workbench-tools button[draggable=true]{cursor:grab}.workbench-tools button[aria-pressed=true]{outline:2px solid #42906d}.workbench-item{position:relative}.workbench-tools button:focus-visible{outline:2px solid #42906d}.workbench-description{padding:0 16px;margin:8px 0}';
let draft, baseline, etag, canSave = false, saving = false, selected = 'content:overview';
let items = new Map(), undo = [], dragging;

const mode = () => editorModes.includes(editor.config.mode) ? editor.config.mode : 'companion';
const edits = () => draft.modes[mode()] ||= {items: {}, moves: []};
const status = message => { $('#status').textContent = message; };
const slug = label => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const labelFor = (element, fallback) => element?.getAttribute('aria-label') || fallback;
const node = (tag, value) => {
  const el = document.createElement(tag);
  if (value !== undefined) el.textContent = value;
  return el;
};

function persist() {
  try {
    localStorage.setItem(localKey, JSON.stringify({draft, etag}));
    if (!saving) status('Draft saved in this browser. Save for review when you’re ready.');
  } catch {
    status('Browser storage is unavailable. Use Export draft or Save for review.');
  }
}

function checkpoint() {
  undo.push(JSON.stringify(draft));
  if (undo.length > 60) undo.shift();
  $('#undo').disabled = false;
}

function remember(id) {
  const item = items.get(id);
  return edits().items[id] ||= {label: item.label, ...(item.title ? {beforeTitle: item.originalTitle} : {}),
    ...(item.help ? {beforeHelp: item.originalHelp} : {})};
}

function addItem(id, label, block, {title, help, movable, group, mount, input} = {}) {
  items.set(id, {id, label, block, title, help, movable, group, mount: mount || block, input,
    originalTitle: title?.textContent || '', originalHelp: help?.textContent || ''});
}

function collect() {
  items = new Map();
  addItem('content:overview', 'Whole editor', null);
  const welcome = shadow.querySelector('.welcome');
  if (welcome) {
    addItem('content:welcome', 'Welcome block', welcome, {movable: 'top'});
    const intro = welcome.querySelector('p'), cat = welcome.querySelector('.patient-cat');
    addItem('content:intro', 'Welcome message', intro, {help: intro, movable: 'welcome'});
    if (cat) addItem('content:animation', 'Animated cat preview', cat, {mount: welcome, movable: 'welcome'});
  }
  for (const section of shadow.querySelectorAll('details[data-group]')) {
    const summary = section.querySelector('summary'), fields = section.querySelector('.fields');
    const id = 'section:' + slug(section.dataset.group);
    let help = section.querySelector(':scope > p:not([role=status])');
    if (!help) {
      help = node('p');
      help.className = 'workbench-description';
      help.hidden = true;
      summary.after(help);
    }
    addItem(id, section.dataset.group, section, {title: summary, help, movable: 'top', mount: summary, group: fields || section});
    for (const row of section.querySelectorAll('label.field,label.purpose')) {
      const input = row.querySelector('input,select');
      const name = labelFor(input, row.textContent.trim());
      const fieldId = 'field:' + (input?.dataset.key || slug(name));
      const wrap = node('div');
      wrap.className = 'workbench-item';
      const swatches = row.nextElementSibling?.classList.contains('swatches') ? row.nextElementSibling : null;
      row.before(wrap);
      wrap.append(row);
      if (swatches) wrap.append(swatches);
      const title = row.querySelector('span'), hint = title?.querySelector('small');
      // Keep help and label independent, including the editor's ARIA references.
      const copy = title ? node('span', title.firstChild?.textContent || name) : node('span', row.firstChild?.textContent || name);
      (title || row).firstChild?.replaceWith(copy);
      addItem(fieldId, name, wrap, {title: copy, help: hint, input, movable: 'field'});
      if (swatches) addItem('content:' + (input.dataset.key || slug(name)) + '-swatches', name + ' swatches', swatches);
    }
    for (const button of section.querySelectorAll(':scope > button')) {
      addItem('content:' + slug(button.textContent), button.textContent, button, {mount: section, title: button});
    }
  }
  const footer = shadow.querySelector('.note');
  if (footer) addItem('content:save-message', 'Save message', footer, {help: footer, movable: 'top'});
}

function canMove(source, target, where) {
  if (!source || !target || source === target) return false;
  return where === 'inside' ? source.movable === 'field' && !!target.group :
    !!source.movable && source.movable === target.movable;
}

function place({id, target, where}) {
  const source = items.get(id), destination = items.get(target);
  if (!canMove(source, destination, where)) return false;
  if (where === 'inside') destination.group.append(source.block);
  else destination.block[where](source.block);
  return true;
}

function move(id, target, where) {
  const operation = {id, target, where};
  if (!canMove(items.get(id), items.get(target), where) || edits().moves.length >= 300) return;
  checkpoint();
  remember(id);
  remember(target);
  edits().moves.push(operation);
  selected = id;
  decorateAgain();
  persist();
}

function applyCopy(item) {
  const copy = edits().items[item.id];
  if (!copy) return;
  if (item.title) {
    if (item.title.firstChild?.nodeType === Node.TEXT_NODE) item.title.firstChild.nodeValue = copy.title ?? item.originalTitle;
    else item.title.prepend(document.createTextNode(copy.title ?? item.originalTitle));
    if (item.input) item.input.setAttribute('aria-label', copy.title || item.originalTitle);
  }
  if (item.help) {
    item.help.textContent = copy.help ?? item.originalHelp;
    if (item.help.classList.contains('workbench-description')) item.help.hidden = !item.help.textContent;
  }
}

function tools(item) {
  if (!item.mount) return;
  const bar = node('span');
  bar.className = 'workbench-tools';
  const button = node('button', (item.movable ? '↕ ' : '') + (item.id.startsWith('content:') ? item.label : 'Edit / note'));
  button.type = 'button';
  button.dataset.workbenchId = item.id;
  button.setAttribute('aria-label', 'Edit or note ' + item.label);
  button.setAttribute('aria-pressed', String(selected === item.id));
  button.onclick = event => { event.preventDefault(); event.stopPropagation(); choose(item.id); };
  button.draggable = !!item.movable;
  if (item.id === 'content:animation' || item.id === 'content:intro') item.block.onclick = () => choose(item.id);
  button.ondragstart = event => {
    dragging = item.id;
    event.dataTransfer.setData('text/plain', item.id);
    event.dataTransfer.effectAllowed = 'move';
  };
  button.ondragend = () => { dragging = null; };
  bar.ondragover = event => {
    if (dragging && ['before', 'inside'].some(where => canMove(items.get(dragging), item, where))) event.preventDefault();
  };
  bar.ondrop = event => {
    event.preventDefault();
    event.stopPropagation();
    if (!dragging) return;
    const source = items.get(dragging);
    const where = canMove(source, item, 'inside') ? 'inside' :
      event.clientY > bar.getBoundingClientRect().top + bar.offsetHeight / 2 ? 'after' : 'before';
    move(dragging, item.id, where);
    dragging = null;
  };
  bar.append(button);
  // Void SVG and buttons cannot contain controls.
  if (item.id.startsWith('section:')) item.mount.append(bar);
  else if (item.mount === item.help || item.mount === item.title) item.mount.after(bar);
  else if (item.mount === item.block && item.movable) item.mount.prepend(bar);
  else item.mount.append(bar);
}

function renderChanges() {
  const rows = describeEditorDraft(draft);
  $('#count').textContent = rows.length ? '(' + rows.length + ')' : '';
  $('#changes').replaceChildren(...rows.map(([purpose, text]) => node('li', purpose + ' · ' + text)));
}

function choose(id) {
  selected = items.has(id) ? id : 'content:overview';
  const item = items.get(selected), copy = edits().items[selected] || {};
  $('#selected').textContent = item.label;
  $('#jump').value = selected;
  $('#inspector-form').hidden = false;
  $('#title-row').hidden = !item.title;
  $('#help-row').hidden = !item.help;
  $('#title').value = copy.title ?? item.originalTitle;
  $('#help').value = copy.help ?? item.originalHelp;
  $('#notes').value = copy.notes || '';
  const peers = [...items.values()].filter(other => ['before', 'inside'].some(where => canMove(item, other, where)));
  $('#move-controls').hidden = !peers.length;
  $('#target').replaceChildren(...peers.map(peer => new Option(peer.label, peer.id)));
  $('#target').onchange();
  for (const button of shadow.querySelectorAll('[data-workbench-id]')) button.setAttribute('aria-pressed', String(button.dataset.workbenchId === selected));
}

const observer = new MutationObserver(() => decorate());
function decorate() {
  observer.disconnect();
  collect();
  for (const entry of edits().moves) place(entry);
  const style = node('style', editorStyle);
  shadow.append(style);
  for (const item of items.values()) {
    applyCopy(item);
    if (!$('#preview').checked) tools(item);
  }
  if (!$('#preview').checked) {
    const overview = node('div');
    shadow.prepend(overview);
    const target = items.get('content:overview');
    target.mount = overview;
    tools(target);
  }
  observer.observe(shadow, {childList: true});
  $('#jump').replaceChildren(...[...items.values()].map(item => new Option(item.label, item.id)));
  choose(selected);
  renderChanges();
}

function decorateAgain() {
  observer.disconnect();
  editor.render();
  decorate();
}

$('#jump').onchange = event => {
  choose(event.target.value);
  const block = items.get(selected).block;
  const section = block?.closest('details');
  if (section && block !== section) section.open = true;
};
$('#target').onchange = () => {
  for (const button of document.querySelectorAll('[data-move]')) {
    button.disabled = !canMove(items.get(selected), items.get($('#target').value), button.dataset.move);
  }
};
for (const button of document.querySelectorAll('[data-move]')) {
  button.onclick = () => move(selected, $('#target').value, button.dataset.move);
}
for (const field of ['title', 'help', 'notes']) {
  $('#' + field).onfocus = checkpoint;
  $('#' + field).oninput = event => {
    const item = remember(selected);
    item[field] = event.target.value;
    applyCopy(items.get(selected));
    renderChanges();
    persist();
  };
}
$('#inspector-form').onsubmit = event => event.preventDefault();
$('#preview').onchange = decorateAgain;
$('#narrow').onchange = event => $('#canvas').classList.toggle('narrow', event.target.checked);
$('#undo').onclick = () => {
  if (!undo.length) return;
  draft = JSON.parse(undo.pop());
  $('#undo').disabled = !undo.length;
  decorateAgain();
  persist();
};
$('#purpose').onchange = event => {
  if (!draft) return;
  selected = 'content:overview';
  editor.setConfig({...editor.config, mode: event.target.value});
};
editor.addEventListener('config-changed', () => { $('#purpose').value = mode(); });

function reviewLink(version) {
  const url = new URL(location.href);
  url.searchParams.set('version', version);
  $('#review').href = url.href;
  $('#review').hidden = false;
}

$('#save').onclick = async () => {
  if (!canSave || saving) return;
  try {
    saving = true;
    $('#save').disabled = true;
    const submitted = JSON.stringify(validateEditorDraft(draft));
    const headers = {'Content-Type': 'application/json', ...(etag ? {'If-Match': etag} : {'If-None-Match': '*'})};
    const response = await fetch(api, {method: 'PUT', headers, body: submitted});
    const result = await response.json();
    if (!response.ok) throw Error(result.error || 'Save failed.');
    etag = response.headers.get('etag');
    reviewLink(result.versionHash);
    persist();
    status('Saved for review · ' + result.versionHash.slice(0, 12) +
      (submitted === JSON.stringify(draft) ? '' : ' · More edits are still in this browser.'));
  } catch (error) { status(error.message + ' Your browser draft is still available.'); }
  finally { saving = false; $('#save').disabled = !canSave; }
};

$('#export').onclick = () => {
  if (!draft) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], {type: 'application/json'}));
  const link = node('a');
  link.href = url;
  link.download = 'pixel-cat-editor-draft.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

async function load() {
  const version = params.get('version');
  if (version) {
    document.body.classList.add('reviewing');
    if (!/^[a-f0-9]{64}$/.test(version)) throw Error('Invalid review link.');
    const response = await fetch(api + '/versions/' + version);
    if (!response.ok) throw Error('Saved review version not found.');
    const result = await response.json();
    const saved = validateEditorDraft(result.snapshot);
    $('#saved-review').hidden = false;
    $('#version').textContent = 'Version ' + result.versionHash + ' · Editor build ' + saved.base.slice(0, 12);
    $('#review-items').replaceChildren(...describeEditorDraft(saved).map(([purpose, text]) => node('li', purpose + ' · ' + text)));
    status('This review shows the exact version that was saved.');
    return;
  }

  const manifest = await fetch('../dist/pixel-cat-card.manifest.json').then(response => response.json());
  baseline = manifest.artifact.sha256;
  draft = {schema: 'pixel-cat-editor-workbench/v1', name: 'Editor layout and copy', base: baseline, modes: {}};
  let local;
  try { local = JSON.parse(localStorage.getItem(localKey)); if (local) validateEditorDraft(local.draft); }
  catch { local = null; }
  let message = 'Select any item to edit its copy or leave a note.';
  try {
    const response = await fetch(api);
    if (response.ok) {
      const record = await response.json();
      draft = validateEditorDraft(record.draft);
      etag = response.headers.get('etag');
      reviewLink(record.versionHash);
    } else if (response.status !== 404) throw Error('Durable storage is unavailable.');
    canSave = true;
    if (local?.draft) {
      const matches = local.etag === etag || !local.etag && !etag;
      const identical = JSON.stringify(local.draft) === JSON.stringify(draft);
      if (!matches && !identical) {
        canSave = false;
        message = 'The saved review changed elsewhere. Your browser draft is open. Export it to preserve your edits before resolving the conflict.';
      }
      draft = local.draft;
    }
  } catch (error) {
    if (local?.draft) draft = local.draft;
    message = error.message + ' You can still export your draft.';
  }
  if (draft.base !== baseline) message += ' This draft was started on another editor build. Check its moves against the current layout before applying it.';
  $('#save').disabled = !canSave;
  editor.setConfig({mode: 'companion', name: 'Miso', color: '#b97546', settling_mode: 'custom'});
  decorate();
  status(message);
}

load().catch(error => status(error.message));
