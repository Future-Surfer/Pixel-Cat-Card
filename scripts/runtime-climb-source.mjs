import fs from 'node:fs';import crypto from 'node:crypto';
import {validateDraft,defaults} from '../prototype/climb-model.mjs';
import {packedAssignment} from './pack-runtime-data.mjs';
export function runtimeClimbSource(){
 const record=JSON.parse(fs.readFileSync('frame-studio/user-sequences/climb-runtime-2026-10-20/snapshot.json','utf8'));
 if(crypto.createHash('sha256').update(JSON.stringify(record.draft)).digest('hex')!==record.versionHash)throw Error('Climb snapshot hash mismatch');
 const draft=validateDraft(record.draft),assets={schema:draft.schema,sourceVersion:record.versionHash,frames:draft.frames,centred:draft.centred,rotations:draft.rotations};
 const source=fs.readFileSync('prototype/climb-model.mjs','utf8'),rotation=fs.readFileSync('prototype/climb-rotation.mjs','utf8').split('function narrow')[0];
 const contacts=fs.readFileSync('prototype/climb-contact-particles.mjs','utf8'),styles=contacts.slice(contacts.indexOf('export function scratchColour'),contacts.indexOf('export function sampleClimbDecals')).replace(/^export /gm,'');
 const shared=source.slice(source.indexOf('const ease='),source.indexOf('export function contactWarnings')).replace(/^export /gm,'').replace(/^[ \t]*\/\/[^\r\n]*\r?\n/gm,'');
 return {versionHash:record.versionHash,source:packedAssignment('window.pixelCatClimbAssetsV1',assets)+'\n(()=>{'+rotation.replace(/^export /gm,'')+'\nconst defaults='+JSON.stringify(defaults)+',validateDraft=d=>d,sceneFor=()=>{throw Error("Explicit runtime grip geometry required");};\n'+shared+'\n'+styles+'\nwindow.pixelCatClimbModelV1={defaults,planClimb,samplePlan,runtimeProbe,framePlacement,inkCentre,scratchColour,scratchStyle};})();\n'};
}
