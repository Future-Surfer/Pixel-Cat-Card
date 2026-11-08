import fs from 'node:fs';
// Palette-constrained, AI-authored grids: proposals, never runtime replacements.
const palette={'.':null,o:'#19222b',b:'#438dd9',h:'#a4dbff',r:'#db6a68',p:'#eab7a7',g:'#72a65a',y:'#e4b65d',w:'#d5e9ed',c:'#865c46'};
const assets=[];
function add(family,state,kind,name,rows){const width=Math.max(...rows.map(r=>r.length)),pixels=rows.map(r=>[...r.padEnd(width,'.')].map(c=>palette[c]));assets.push({id:'draft-prop-'+family+'-'+state,name,description:'AI-authored small-prop proposal. Refine against the reference cat before integration. Related states share a family; state changes are not yet runtime behaviours.',tags:['ai-draft','small-prop',family],familyId:family,stateKey:state,stateKind:kind,width,height:rows.length,pixels,origin:'ai',review:'candidate',revision:1,source:{proposal:'small-props-2026-10-15'},operations:[{actor:'ai',kind:'candidate',at:'2026-10-15T12:00:00.000Z'}]});}
add('blue-ball','new','condition','Blue ball · new',['..ooo..','.ohbbo.','ohbbbbo','obbbbbo','.obbbo.','..ooo..']);
add('blue-ball','scuffed','condition','Blue ball · scuffed',['..ooo..','.ohbbo.','ohbobbo','obbohbo','.obbbo.','..ooo..']);
add('toy-mouse','intact','condition','Toy mouse · intact',['...pp......','..oooo.....','.opccco....','occcoccoyyy','.oooooo....']);
add('toy-mouse','frayed','condition','Toy mouse · frayed',['...pp......','..oooo.....','.opccco....','occcocco.y.y','.ooco.o....','..c.c......']);
add('toy-fish','intact','condition','Toy fish · intact',['...oooo....o','..obbbbbo.oo','.obhbbobbboo','..obbbbbo.oo','...oooo....o']);
add('toy-fish','torn','condition','Toy fish · torn',['...oooo....o','..obbbbbo.oo','.obhb.ob.boo','..ob.ybbo.oo','...o.yo....o']);
add('yarn','wound','condition','Yarn ball · wound',['..oooo....','.orrrro...','orrorro...','orrorroy..','.orrro..y.','..ooo....yy']);
add('yarn','unwound','condition','Yarn ball · unraveled',['..........','..ooo.....','.orrrro...','.orroroy..','..orro..y.','yy.oo.yy.yy']);
add('feather','rest','pose','Loose feather · resting',['......b..','....bbbo.','...bbbo..','..ggbo...','.ggbo....','..o......','.o.......']);
add('feather','lifted','pose','Loose feather · lifted',['..bb.....','.bbbo....','.gbbo....','..gbo....','..go.....','..o......','.o.......']);
for(const [state,level]of [['full',1],['half',4],['empty',7]]){const rows=['owwwwo',...Array.from({length:6},(_,i)=>'o'+(i+1>=level?'bbbb':'....')+'o'),'oooooo'];add('water-glass',state,'fill','Water glass · '+state,rows);}
add('scratch-pad','new','condition','Scratch pad · new',['.oooooooooo.','occcccccccco','ocycycycycco','occcccccccco','.oooooooooo.']);
add('scratch-pad','used','condition','Scratch pad · scratched',['.oooooooooo.','occwccwcccco','ocywcywcycco','occwccwcccco','.oooooooooo.']);
add('crinkle-ball','round','condition','Crinkle ball · round',['..oyo..','.oyryo.','oyhryro','.oryyo.','..oyo..']);
add('crinkle-ball','squashed','condition','Crinkle ball · squashed',['.......','...yo..','.oyryo.','oyhryro','.oryyoo']);
add('treat','whole','condition','Tiny treat · whole',['.ooo.','oyyyo','oyhyo','.ooo.']);
add('treat','crumbs','condition','Tiny treat · crumbs',['.....','..oy.','.yo..','o..yo']);
fs.writeFileSync('frame-studio/user-sequences/small-prop-drafts-2026-10-15.json',JSON.stringify({schemaVersion:1,assets},null,2)+'\n');console.log('Proposed',assets.length,'small prop states in',new Set(assets.map(a=>a.familyId)).size,'families.');
