import {editable} from './model.js';

// Validate the entire selection before touching it: callers get one undo/save.
export function applyFrameTiming(project, from, through, durationMs){
  if(!Number.isInteger(from)||!Number.isInteger(through)||from<1||through<from||through>project.frames.length)throw Error('Choose a valid frame range, starting at 1.');
  if(!Number.isFinite(durationMs)||durationMs<50||durationMs>5000)throw Error('Frame holds must be 50–5000 ms.');
  const frames=project.frames.slice(from-1,through);
  for(const frame of frames)editable(frame);
  for(const frame of frames)frame.durationMs=durationMs;
  return frames.length;
}
