// Media-only beats; gait clocks and the physical pounce use release helpers.
export default {
 schema:1,id:'mouse-chase-draft-3',width:480,height:270,scale:4,ground:192,colour:'#ffffff',outline:'#111111',
 floor:{left:24,right:448},
 stages:[
  {id:'watch',label:'Time for a wash',ms:1800,cat:{kind:'pose',pose:'clean',x:40},mouse:{kind:'hidden'}},
  {id:'arrival',label:'A mouse ambles past',ms:6600,cat:{kind:'pose',pose:'clean',x:40},mouse:{kind:'move',x:-36,to:228}},
  {id:'notice',label:'Oh… what is that?',ms:1000,cat:{kind:'pose',pose:'sithead',x:40},mouse:{kind:'move',x:228,to:254}},
  {id:'rise',label:'Up on our feet',cat:{kind:'bridge',from:'sit',to:'walk',x:40},mouse:{kind:'move',x:254,to:260}},
  {id:'follow',label:'A quick little run',cat:{kind:'run',x:40,to:184,fps:18},mouse:{kind:'move',x:260,to:320}},
  {id:'lower',label:'Getting low',cat:{kind:'crouch',x:184},mouse:{kind:'move',x:320,to:330}},
  {id:'sneak',label:'Softly, softly…',cat:{kind:'sneak',x:184,to:248,variant:1},mouse:{kind:'move',x:330,to:382}},
  {id:'wiggle',label:'A little bum wiggle',ms:1200,cat:{kind:'pose',pose:'wiggle',x:248},mouse:{kind:'rest',x:382}},
  {id:'pounce',label:'Pounce!',cat:{kind:'pounce',x:248,to:320},mouse:{kind:'rest',x:382}},
  {id:'catch',label:'Caught you',ms:1000,cat:{kind:'pose',pose:'eat',x:320},mouse:{kind:'rest',x:382}},
  {id:'lift',label:'A small prize',ms:600,cat:{kind:'pose',pose:'sit',x:320},mouse:{kind:'held'}},
  {id:'turn-home',label:'Let’s take it home',cat:{kind:'turn',x:320,facing:1},mouse:{kind:'held'}},
  {id:'carry',label:'A happy walk home',cat:{kind:'walk',x:320,to:40,beatMs:100},mouse:{kind:'held',facing:-1}},
  {id:'put-down',label:'Set it down here',ms:1000,cat:{kind:'pose',pose:'eat',x:40,facing:-1},mouse:{kind:'rest',x:42,fromMouth:true,facing:-1}},
  {id:'sit',label:'Sit beside our prize',ms:2200,cat:{kind:'pose',pose:'sit',x:40,facing:-1},mouse:{kind:'rest',x:42,facing:-1}},
  {id:'bat',label:'One little bop',ms:2600,cat:{kind:'pose',pose:'bat',x:40,facing:-1},mouse:{kind:'strike',x:42,speed:-180,facing:-1}},
  {id:'pause',label:'Where did it go?',ms:1200,cat:{kind:'pose',pose:'sit',x:40,facing:-1},mouse:{kind:'hidden'}},
  {id:'turn-watch',label:'What next?',cat:{kind:'turn',x:40,facing:-1},mouse:{kind:'hidden'}},
  {id:'settle',label:'Back to watching',cat:{kind:'bridge',from:'walk',to:'sit',x:40},mouse:{kind:'hidden'}},
  {id:'reset',label:'Back to our wash',ms:1200,cat:{kind:'pose',pose:'clean',x:40,atMs:0},mouse:{kind:'hidden'}}
 ]
};
