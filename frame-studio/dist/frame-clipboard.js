import {clone,id,validateProject} from './model.js';
export const FRAME_CLIPBOARD_KEY='cat-frame-studio.clipboard.v1';
export function copyFrame(project,frame){
 validateProject({schemaVersion:1,width:24,height:24,name:'Clipboard',frames:[frame]});
 return {format:'cat-studio-frame',version:1,source:{sequenceId:project.projectId,sequenceName:project.name,frameId:frame.id},frame:clone(frame)};
}
export function pasteFrame(project,clip,afterId,actor='human'){
 if(clip?.format!=='cat-studio-frame'||clip.version!==1||!clip.source?.frameId)throw Error('Copy a Studio frame first.');
 validateProject({schemaVersion:1,width:24,height:24,name:'Clipboard',frames:[clip.frame]});
 if(project.frames.length>=96)throw Error('Maximum 96 frames.');
 const frame={...clone(clip.frame),id:id(),parentId:clip.source.frameId,locked:false,review:'candidate',copiedFrom:clone(clip.source),operations:[...(clip.frame.operations||[]),{actor,kind:'paste-frame',at:new Date().toISOString(),sourceSequenceId:clip.source.sequenceId,sourceFrameId:clip.source.frameId}]};
 const after=project.frames.findIndex(f=>f.id===afterId);if(after<0)throw Error('Destination frame not found.');
 project.frames.splice(after+1,0,frame);return frame;
}
