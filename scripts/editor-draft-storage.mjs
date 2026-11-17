import {validateEditorDraft} from '../frame-studio/dist/editor-draft-model.js';
import {workspaceApi} from './workspace-storage.mjs';

export const handleEditorDraftApi = workspaceApi({
  kind: 'editor-layout', route: 'editor-drafts', main: 'editor-main',
  history: 'editor-history', title: 'Editor Workbench · ', validate: validateEditorDraft,
  messages: {
    unknown: 'Unknown editor draft.', empty: 'No durable editor draft yet.',
    large: 'Editor draft exceeds 500 KB.', load: 'Load the current draft before saving.',
    conflict: 'A newer review version exists.', failed: 'Could not save this review version.'
  }
});
