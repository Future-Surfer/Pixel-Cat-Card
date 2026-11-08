import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{}};vm.runInNewContext(fs.readFileSync('prototype/cat-mood.js','utf8')+'\n'+fs.readFileSync('prototype/cat-post-rest.js','utf8')+'\nglobalThis.Mood=CatMood;',box);
const rest=box.window.pixelCatPostRestV1;
function actor(id='cat'){const mood=new box.Mood(id);return {active:true,config:{},idle:{pose:'sleep'},attrs:{},ensureMood:()=>mood,setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}};}
function advance(a,ms){for(let t=0;t<ms;t+=250)rest.step(a,Math.min(250,ms-t));}
const a=actor();advance(a,20000);assert.equal(rest.strength(a),1);
const since=a.postRest.since;a.idle={pose:'loaf'};advance(a,1000);assert.equal(a.postRest.since,since,'Sleep/loaf frame or clip changes remain one rest episode');
a.idle={pose:'stand'};advance(a,250);const until=a.postRest.until;assert.ok(until>a.postRest.clock);assert.equal(a.postRest.source,'sleep');
assert.ok(rest.poseWeight(a,'yawn')>rest.poseWeight(a,'stand'));assert.ok(rest.poseWeight(a,'stand')>0);assert.ok(rest.choiceWeight(a,'chase')>0&&rest.choiceWeight(a,'chase')<1,'Play is less likely, not forbidden');
rest.departure(a,'walk',null);assert.equal(a.postRest.until,until,'No new wake interval for every action');
const clock=a.postRest.clock;a.paused=true;advance(a,5000);assert.equal(a.postRest.clock,clock);a.paused=false;a.userHeld=true;advance(a,5000);assert.equal(a.postRest.clock,clock);a.userHeld=false;
a.motion={kind:'walk'};advance(a,16000);assert.equal(rest.strength(a),0,'Ordinary walking restores normal activation');
const durations=new Set(),pauses=new Set();
for(let i=0;i<40;i++){const c=actor('wake-'+i);advance(c,20000);pauses.add(rest.beforePlan(c,1000,false));durations.add(Math.round(c.postRest.duration));assert.ok(c.postRest.duration>=5000&&c.postRest.duration<=15000);}
assert.ok(durations.size>30);assert.equal(pauses.size,2,'Independent cats may pause or just begin walking');
const short=actor('short');advance(short,2000);assert.equal(rest.beforePlan(short,1000,false),false);assert.equal(rest.strength(short),0);
const preview=actor('preview');preview.previewPose='sleep';advance(preview,20000);assert.equal(rest.strength(preview),0,'Forced previews do not manufacture sleep episodes');
const command=actor('command');advance(command,20000);assert.equal(rest.beforePlan(command,1000,true),false);assert.equal(rest.strength(command),0);command.urgency='prompted';rest.departure(command,'walk',null);assert.equal(command.urgency,'prompted');
const startled=actor('startled');advance(startled,20000);rest.leave(startled);rest.interrupt(startled);assert.equal(rest.strength(startled),0,'Successful startle/explicit interaction can override grogginess immediately');
const disabled=actor('disabled');disabled.config.post_rest_behaviour=false;advance(disabled,20000);assert.equal(rest.strength(disabled),0);
const loaf=actor('loaf');loaf.idle.pose='loaf';advance(loaf,20000);rest.leave(loaf);assert.ok(loaf.postRest.initial<1);assert.ok(loaf.postRest.duration<=7500);
console.log('PASS: sustained rest episodes, independent 40-cat wake timings/optional pauses, smooth walking recovery, previews/commands/startles, paused/held clocks, weaker loaf bias and soft compatible choices.');

const meal=actor('meal');meal.idle={pose:'stand'};rest.afterMeal(meal);assert.equal(meal.postRest.source,'meal');assert.ok(rest.poseWeight(meal,'clean')>rest.poseWeight(meal,'yawn'));assert.ok(rest.choiceWeight(meal,'explore')<1);assert.ok(rest.choiceWeight(meal,'ambush')>0);advance(meal,15000);assert.equal(rest.strength(meal),0);
