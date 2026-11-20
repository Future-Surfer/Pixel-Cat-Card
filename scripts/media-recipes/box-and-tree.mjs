export default {
 schema:1,id:'box-and-tree-draft-3',title:'Box and tree · a smaller perch',description:'A compact tree, a satisfying scratch, and a sleepy neighbour with paws in the air.',
 width:480,height:270,scale:3,ground:232,durationMs:40000,floor:{left:24,right:456},
 furniture:[{asset:'tree',x:288,top:92,scale:2},{asset:'box',x:60,top:201}],
 tracks:[
  {id:'Box cat',colour:'#526b87',stages:[
   {id:'hide',label:'Tucked in the box',ms:2400,cat:{kind:'box',phase:'peek',boxX:60,facing:-1}},
   {id:'out',label:'Hop out',ms:640,cat:{kind:'box',phase:'exit',boxX:60,facing:1}},
   {id:'approach',label:'Over to the scratching post',cat:{kind:'walk',x:123,to:294,beatMs:100}},
   {id:'scratch',label:'A satisfying scratch',ms:6200,cat:{kind:'pose',pose:'postScratch',x:294,contactX:321}},
   {id:'turn',label:'Back to the box',cat:{kind:'turn',x:294}},
   {id:'return',label:'A quiet walk home',cat:{kind:'walk',x:285,to:123,beatMs:110}},
   {id:'in',label:'Hop inside',ms:800,cat:{kind:'box',phase:'entry',boxX:60,facing:-1}},
   {id:'rest',label:'Hidden and content',until:{sceneEndOffsetMs:-800},cat:{kind:'box',phase:'peek',boxX:60,facing:-1}},
   {id:'loop',label:'Tucked in the box',ms:800,cat:{kind:'box',phase:'peek',boxX:60,facing:-1,atMs:0}}
  ]},
  {id:'Tree cat',colour:'#92739d',ground:170,stages:[
   {id:'asleep',label:'Fast asleep on the perch',until:{track:'Box cat',stage:'scratch',offsetMs:1100},cat:{kind:'pose',pose:'sleep',x:333,facing:-1,cycleOnly:true,atMs:0}},
   {id:'stir',label:'What was that?',ms:1800,cat:{kind:'pose',pose:'alertLying',x:324,facing:-1}},
   {id:'wake',label:'A sleepy pause',ms:800,cat:{kind:'pose',pose:'loaf',x:333,facing:-1,cycleOnly:true}},
   {id:'paws-up',label:'A lazy roll onto our back',ms:16000,cat:{kind:'pose',pose:'backRoll',x:333,facing:-1}},
   {id:'settle',label:'Curling up again',ms:800,cat:{kind:'pose',pose:'loaf',x:333,facing:-1,cycleOnly:true}},
   {id:'sleep-again',label:'Back to sleep',until:{sceneEndOffsetMs:-600},cat:{kind:'pose',pose:'sleep',x:333,facing:-1}},
   {id:'loop',label:'Fast asleep on the perch',ms:600,cat:{kind:'pose',pose:'sleep',x:333,facing:-1,cycleOnly:true,atMs:0}}
  ]}
 ]
};
