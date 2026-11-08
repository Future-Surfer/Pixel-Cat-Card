import fs from 'node:fs';
import {validateProject} from '../frame-studio/dist/model.js';
const base=new URL('../frame-studio/user-sequences/refinements-2026-10-14/',import.meta.url);
export const refinementManifest=JSON.parse(fs.readFileSync(new URL('manifest.json',base),'utf8'));
export const savedRefinements=new Map(refinementManifest.records.map(item=>{
 const wrapper=JSON.parse(fs.readFileSync(new URL(item.snapshot,base),'utf8')),record=JSON.parse(wrapper.body);
 validateProject(record.project);if(record.projectId!==item.projectId)throw Error('Saved sequence identity mismatch.');
 return [item.projectId,{...item,project:record.project}];
}));
export const savedProject=id=>savedRefinements.get(id)?.project;
export const groundVariantId='46edfa22-baf5-45b3-a8a6-26fc004059de';
