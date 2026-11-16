export const editorModes = ['companion', 'monitor', 'behaviour-lab'];
const idPattern = /^(section|field|content):[a-z0-9_-]{1,100}$/;
const hashPattern = /^[a-f0-9]{64}$/;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const text = (value, limit) => typeof value === 'string' && value.length <= limit;

export function validateEditorDraft(draft) {
  if (draft?.schema !== 'pixel-cat-editor-workbench/v1' || !text(draft.name, 100) ||
      !hashPattern.test(draft.base) || !object(draft.modes)) throw Error('Invalid editor draft.');
  for (const [mode, changes] of Object.entries(draft.modes)) {
    if (!editorModes.includes(mode) || !object(changes) || !object(changes.items) ||
        !Array.isArray(changes.moves) || changes.moves.length > 300 ||
        Object.keys(changes.items).length > 160) throw Error('Invalid editor layout.');
    for (const [id, item] of Object.entries(changes.items)) {
      if (!idPattern.test(id) || !object(item) || !text(item.label, 150) || Object.keys(item).some(key =>
        !['label', 'title', 'help', 'notes', 'beforeTitle', 'beforeHelp'].includes(key) ||
        !text(item[key], ['title', 'beforeTitle', 'label'].includes(key) ? 150 : key === 'notes' ? 4000 : 2000))) {
        throw Error('Invalid editor note or copy.');
      }
    }
    for (const move of changes.moves) {
      if (!object(move) || !idPattern.test(move.id) || !idPattern.test(move.target) || move.id === move.target ||
          !['before', 'after', 'inside'].includes(move.where)) throw Error('Invalid editor move.');
    }
  }
  return draft;
}

export function describeEditorDraft(draft) {
  const rows = [];
  for (const [mode, {items, moves}] of Object.entries(draft.modes)) {
    const label = id => items[id]?.label || id;
    for (const move of moves) rows.push([mode, label(move.id) + ' → ' + move.where + ' ' + label(move.target)]);
    for (const [id, item] of Object.entries(items)) {
      for (const [key, before] of [['title', 'beforeTitle'], ['help', 'beforeHelp']]) {
        if (item[key] !== undefined && item[key] !== item[before]) rows.push([mode, label(id) + ' · ' + (key === 'title' ? 'Label' : 'Description') + '\n“' + (item[before] || '') + '” → “' + item[key] + '”']);
      }
      if (item.notes) rows.push([mode, label(id) + ' · Note\n' + item.notes]);
    }
  }
  return rows;
}
