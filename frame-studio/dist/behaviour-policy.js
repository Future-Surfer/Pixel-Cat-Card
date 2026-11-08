export const STUDIO_LIFE_STAGES=['kitten','adult','senior'];
export function validateBehaviourPolicy(project){
 const b=project.behaviourPolicy;if(b===undefined)return;
 if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!['tags','lifeStages'].includes(k)))throw Error('Invalid sequence behaviour metadata.');
 if(b.tags!==undefined&&(!Array.isArray(b.tags)||b.tags.length>20||new Set(b.tags).size!==b.tags.length||b.tags.some(t=>typeof t!=='string'||!/^[a-z][a-z0-9-]{0,39}$/.test(t))))throw Error('Behaviour tags need unique lower-case slugs (maximum 20).');
 if(b.lifeStages!==undefined&&(!Array.isArray(b.lifeStages)||new Set(b.lifeStages).size!==b.lifeStages.length||b.lifeStages.some(s=>!STUDIO_LIFE_STAGES.includes(s))))throw Error('Invalid sequence life stages.');
}
export function compileBehaviour(project={},fallback={}){
 validateBehaviourPolicy(project);const b=project.behaviourPolicy||{};
 return {category:fallback.category||(['walk','jump'].includes(project.category)?'locomotion':project.category||'other'),tags:[...(b.tags??fallback.tags??[])],lifeStages:[...(b.lifeStages??STUDIO_LIFE_STAGES)]};
}
