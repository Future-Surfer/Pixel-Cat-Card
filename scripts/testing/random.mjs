export function testSeed(value=process.env.PIXEL_CAT_TEST_SEED??'20261120'){
 const seed=Number(value);
 if(!/^\d+$/.test(String(value))||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw Error('Test seed must be a uint32 integer');
 return seed;
}
export function seededMath(seed){
 let state=testSeed(seed);const math=Object.create(Math);
 math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 return math;
}
