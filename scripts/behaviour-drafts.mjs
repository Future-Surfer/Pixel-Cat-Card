import fs from 'node:fs';
import {validateProject} from '../frame-studio/dist/model.js';
const root=new URL('../frame-studio/user-sequences/behaviour-drafts-2026-10-15/',import.meta.url);
export const behaviourDraftManifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root),'utf8'));
export const behaviourDrafts=behaviourDraftManifest.projects.map(entry=>{
 const project=JSON.parse(fs.readFileSync(new URL(entry.file,root),'utf8'));validateProject(project);
 if(project.projectId!==entry.projectId)throw Error('Draft ID does not match manifest');
 return project;
});
