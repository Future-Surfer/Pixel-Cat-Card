import crypto from 'node:crypto';
import {newFrame,validateRows} from '../frame-studio/dist/model.js';
// Editor-native AI pixel proposals. These are deliberately reviewable drafts,
// drawn from an empty token grid rather than relabelled copies of human art.
function draft(name,marks,description,category,anchor=null){
 const grid=Array.from({length:24},()=>Array(24).fill('.'));
 for(const [x,y,row] of marks)for(const [dx,v] of [...row].entries()){
  if(x+dx<0||x+dx>=24||y<0||y>=24)throw Error('Draft cell outside 24x24');
  if(v!=='.')grid[y][x+dx]=v;
 }
 const f=newFrame(name,validateRows(grid.map(r=>r.join(''))),'ai');f.id='draft-'+crypto.createHash('sha256').update(name+'\0'+f.rows.join('')).digest('hex').slice(0,20);
 return {...f,role:'cycle',anchor,metadata:{category,tags:['ai-draft','needs-refinement'],description},operations:[{actor:'ai',kind:'pixel-proposal',at:'2026-10-14',method:'Native 24x24 token-grid authoring from blank'}]};
}
export function draftPoses(){
 const up=draft('Straight-up airborne · AI draft',[
  [14,2,'#..#'],[14,3,'####'],[13,4,'######'],[13,5,'#######'],[13,6,'#######'],[12,7,'#######'],
  [11,8,'#######'],[10,9,'#######'],[9,10,'########'],[8,11,'#########'],[7,12,'##########'],
  [7,13,'##########'],[7,14,'##########'],[7,15,'#########'],[8,16,'########'],[8,17,'#######'],
  [9,18,'###.###'],[9,19,'##...##'],[9,20,'##...##'],[9,21,'###..###'],
  [5,10,'#'],[4,11,'##'],[4,12,'##'],[4,13,'##'],[4,14,'###'],[5,15,'###']
 ],'Compact vertical takeoff draft: right-facing head, gathered legs beneath the body, airborne with no planted anchors.','jump');
 const down=draft('Straight-down airborne · AI draft',[
  [15,6,'#..#'],[15,7,'####'],[14,8,'######'],[14,9,'#######'],[14,10,'#######'],[13,11,'#######'],
  [7,10,'######'],[6,11,'########'],[6,12,'##########'],[6,13,'###########'],[6,14,'###########'],
  [6,15,'##########'],[7,16,'#########'],[7,17,'###...###'],[7,18,'##....###'],[7,19,'##.....##'],
  [7,20,'##.....##'],[7,21,'###....###'],[4,7,'#'],[3,8,'##'],[3,9,'##'],[3,10,'###'],[4,11,'###']
 ],'Right-facing vertical drop proposal, legs beneath the body prepared for a four-foot landing. Test facing and body mass against existing drops.','jump');
 const body=[[8,14,'########'],[7,15,'#########'],[7,16,'#########'],[7,17,'#########'],[7,18,'#########'],[7,19,'#########'],[7,20,'#########'],[7,21,'#########'],[7,22,'##########'],[7,23,'##R###R#####'],[17,21,'#'],[17,22,'##']];
 const look=draft('Look down from perch · AI draft',[
  ...body,[10,10,'#####'],[11,11,'######'],[12,12,'#######'],[13,13,'#######'],[14,14,'######'],[15,15,'#####'],[16,16,'###'],[14,11,'#..#']
 ],'Lowered head at the edge of a perch. Bearing paw cells stay at (9,23) and (13,23); refine head shape without moving the stance.','idle',{x:13,y:23});
 const glance=draft('Sitting head glance · AI draft',[
  ...body,[10,6,'#..#'],[10,7,'####'],[9,8,'######'],[9,9,'#######'],[9,10,'#######'],[10,11,'######'],[11,12,'#####'],[11,13,'#####']
 ],'Small sideways head turn with the seated body and stance unchanged. This is a starting silhouette, not an approved pose.','idle',{x:13,y:23});
 return {up,down,look,glance};
}
