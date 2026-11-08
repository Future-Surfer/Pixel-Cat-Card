// Code-authored draft pixel assets. Separate from saved Studio props and sequences.
export const treePalette={a:'#c58d4b',b:'#ab7135',c:'#754726',r:'#d7c490',s:'#ad9969',t:'#e5d6ab',f:'#9c5061',g:'#713b4b',o:'#24333c'};
const grid=(w,h)=>Array.from({length:h},()=>Array(w).fill('.'));
const box=(p,x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(p[j]?.[i]!==undefined)p[j][i]=c;};
const socket=(id,x,y,direction,type,accepts=[])=>({id,x,y,direction,type,accepts});
function part(id,name,kind,w,h,draw,sockets,supports=[],grips=[],entrance=null){const p=grid(w,h);draw(p);return{id,name,kind,width:w,height:h,rows:p.map(r=>r.join('')),origin:'ai',review:'draft',revision:1,notes:'AI-authored lab draft; inspect pixels and geometry before runtime integration.',sockets,supports,grips,entrance,near:[],far:[]};}
function spineShelf(left=false){const x=left?28:0,axis=x+3;
 return part(left?'tree-spine-left':'tree-spine-right',left?'Central post · left shelf':'Central post · right shelf','platform',34,12,p=>{box(p,x,0,6,12,'s');box(p,x+1,0,4,12,'r');for(let y=1;y<12;y+=3)box(p,x+1,y,4,1,'t');box(p,0,6,34,3,'b');box(p,0,5,34,1,'a');box(p,1,9,32,1,'c');},[socket('foot',axis,12,'in','pillar'),socket('head',axis,0,'out','pillar',['post','platform','house','bed'])],[{id:'shelf',x1:left?0:6,x2:left?28:34,y:5}],[{id:'rope',x1:x,x2:x+6,y1:0,y2:12,material:'rope',sides:['left','right']}]);
}
function enclosure(id,name,w,h,opening){
 const {shape,x1,x2,y1,y2}=opening,cx=(x1+x2)/2,cy=(y1+y2)/2,rx=(x2-x1)/2,ry=(y2-y1)/2;
 const c=part(id,name,'house',w,h,p=>{box(p,1,2,w-2,h-3,'b');box(p,0,1,w,2,'a');box(p,0,h-2,w,2,'c');box(p,2,3,2,h-5,'c');box(p,w-4,3,2,h-5,'a');
  for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry,archY=y1+rx;
   if(shape==='square'||shape==='round'&&dx*dx+dy*dy<=1||shape==='arch'&&(y+.5>=archY||dx*dx+((y+.5-archY)/rx)**2<=1))p[y][x]='o';}
 },[socket('foot',w/2,h,'in','pillar'),socket('roof',w/2,1,'out','pillar',['post'])],[{id:'roof',x1:1,x2:w-1,y:1},{id:'inside',x1:3,x2:w-3,y:h-2,interior:true}],[],{...opening,token:'o'});
 c.family='enclosure';c.variantOf='tree-house';c.notes+=' '+shape+' aperture; its painted cavity pixels define the opening inside the entrance bounds. Interior span is behind the front shell. Native '+w+'×'+h+' cells; real cat/pose fit and doorway masking remain unverified.';return c;
}
function simpleBed(){
 const c=part('tree-bed','Simple bed · shallow cushion','bed',21,7,()=>{},[socket('foot',10,6,'in','pillar')],[{id:'lining',x1:1,x2:20,y:3,interior:true}]);
 const sourceRows=['.....................','..ABCCDDDDDDDDDCCBA..','.BBBCDDDDDDDDDDDCBBB.','.BBBCCDDDDDDDDDCCBBB.','.AABBBBBBBBBBBBBBBAA.','..AAAAAAAAAAAAAAAAA..','.....................'],materials={A:'c',B:'b',C:'g',D:'f'};c.rows=sourceRows.map(row=>[...row].map(t=>materials[t]||'.').join(''));
 c.origin='mixed';c.revision=2;c.source={kind:'prop',id:'24954751-801d-4dad-a083-e30b715a63f6',name:'Simple Bed',versionHash:'539f371d48beff7e7bbf0f59532113e117b9e1a22acf099a31be98c403356921',revision:4,origin:'human'};c.notes='Adapted from the human-authored default Simple Bed: exact 21×7 silhouette, dark rounded rim and inset cushion; colours mapped to tree material roles. Source pixels are preserved in the original prop snapshot. AI-authored mounting/support metadata is a lab draft; actual pose fit and foreground rim behaviour remain unverified.';return c;
}
export function draftComponents(){return[
 part('tree-base','Foundation','base',32,5,p=>{box(p,0,1,32,3,'b');box(p,1,0,30,1,'a');box(p,1,4,30,1,'c');},[socket('left',8,1,'out','pillar',['post']),socket('right',24,1,'out','pillar',['post'])],[{id:'floor',x1:0,x2:32,y:1}]),
 part('tree-post','Rope post · repeatable','post',6,12,p=>{box(p,0,0,6,12,'s');box(p,1,0,4,12,'r');for(let y=1;y<12;y+=3)box(p,1,y,4,1,'t');},[socket('foot',3,12,'in','pillar'),socket('head',3,0,'out','pillar',['post','platform','house','bed'])],[],[{id:'rope',x1:0,x2:6,y1:0,y2:12,material:'rope',sides:['left','right']}]),
 part('tree-fork','Two-way T joint','platform',48,5,p=>{box(p,0,1,48,3,'b');box(p,1,0,46,1,'a');box(p,1,4,46,1,'c');},[socket('foot',24,5,'in','pillar'),socket('left',10,0,'out','pillar',['post','platform','house','bed']),socket('right',38,0,'out','pillar',['post','platform','house','bed'])],[{id:'top',x1:1,x2:47,y:0}]),
 part('tree-platform','Flat platform','platform',26,5,p=>{box(p,0,1,26,3,'b');box(p,1,0,24,1,'a');box(p,1,4,24,1,'c');},[socket('foot',13,5,'in','pillar'),socket('left',6,0,'out','pillar',['post']),socket('right',20,0,'out','pillar',['post']),socket('toy',3,5,'out','toy',['toy'])],[{id:'top',x1:1,x2:25,y:0}]),
 part('tree-wide','Bridge platform','platform',38,5,p=>{box(p,0,1,38,3,'b');box(p,1,0,36,1,'a');box(p,1,4,36,1,'c');},[socket('foot',19,5,'in','pillar'),socket('left',9,0,'out','pillar',['post']),socket('right',29,0,'out','pillar',['post']),socket('toy',4,5,'out','toy',['toy'])],[{id:'top',x1:1,x2:37,y:0}]),
 part('tree-house','House with doorway','house',26,23,p=>{box(p,1,2,24,20,'b');box(p,0,1,26,2,'a');box(p,0,21,26,2,'c');box(p,2,3,2,18,'c');box(p,22,3,2,18,'a');box(p,8,9,10,12,'o');box(p,9,7,8,2,'o');box(p,11,6,4,1,'o');box(p,9,20,8,1,'g');},[socket('foot',13,23,'in','pillar'),socket('roof',13,1,'out','pillar',['post'])],[{id:'roof',x1:1,x2:25,y:1},{id:'inside',x1:8,x2:18,y:21,interior:true}],[],{x1:8,x2:18,y1:6,y2:21,token:'o'}),
 enclosure('tree-house-round','Box · round opening',26,23,{shape:'round',x1:6,x2:20,y1:5,y2:19}),
 enclosure('tree-house-small-round','Small box · round opening',20,18,{shape:'round',x1:5,x2:15,y1:4,y2:14}),
 enclosure('tree-house-small-arch','Small box · arched opening',18,17,{shape:'arch',x1:5,x2:13,y1:4,y2:15}),
 enclosure('tree-house-square','Box · square opening',24,20,{shape:'square',x1:6,x2:18,y1:6,y2:18}),
 simpleBed(),
 part('tree-bridge','Bridge deck · two supports','platform',32,5,p=>{box(p,0,1,32,3,'b');box(p,1,0,30,1,'a');box(p,1,4,30,1,'c');},[socket('foot',8,5,'in','pillar'),socket('brace',24,5,'in','pillar'),socket('toy',16,5,'out','toy',['toy'])],[{id:'top',x1:1,x2:31,y:0}]),
 spineShelf(false),spineShelf(true),
 part('tree-toy','Hanging toy · static draft','toy',7,14,p=>{box(p,3,0,1,8,'s');box(p,1,9,5,4,'a');box(p,0,10,7,2,'b');box(p,2,8,3,1,'a');box(p,2,13,3,1,'c');},[socket('tie',3,0,'in','toy')])
];}
export const treeDefaults={mode:'random',recipe:'tree 2\nlevel 0\nbase = F\nlevel 1\nstem = I on base.left\nlevel 2\nsplit = T on stem.head\nlevel 3\nleft = O on split.left\nright = O on split.right',seed:'window-perch',width:64,height:72,levels:3,branches:2,minPost:1,maxPost:3,houseChance:.35,bedChance:.45,toyChance:.3};
export function freshTreeWorkspace(){return{schema:'pixel-cat-tree-workspace/v1',name:'Cat-tree workshop',paletteOrigin:'ai',palette:{...treePalette},components:draftComponents(),parameters:{...treeDefaults}};}
