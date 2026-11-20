import {testSeed} from './random.mjs';
export function runOptions(args,available){
 let suites=[...available],seeds=[testSeed()];
 for(let i=0;i<args.length;i++){
  if(args[i]==='--suite'){
   const name=args[++i];if(!available.includes(name))throw Error('Unknown test suite: '+name);suites=[name];
  }else if(args[i]==='--seeds'){
   const values=args[++i]?.split(',');if(!values?.length||values.length>32)throw Error('Provide 1–32 comma-separated seeds');seeds=[...new Set(values.map(testSeed))];
  }else throw Error('Unknown test option: '+args[i]);
 }
 return {suites,seeds};
}
