import mouse from './mouse-chase.mjs';
import boxAndTree from './box-and-tree.mjs';
export const mediaRecipes={'mouse':mouse,'box-and-tree':boxAndTree};
export function mediaRecipe(id='mouse'){
 const recipe=Object.hasOwn(mediaRecipes,id)&&mediaRecipes[id];
 if(!recipe)throw Error('Unknown media scene: '+id);
 return recipe;
}
