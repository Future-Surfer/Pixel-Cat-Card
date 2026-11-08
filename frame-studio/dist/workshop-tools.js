// Navigation inventory only. Editors and fixtures keep their own stores/routes.
export const workshopGroups=[
 {id:'create',label:'Create',description:'Draw frames, props and motion drafts.'},
 {id:'behaviours',label:'Behaviours',description:'Inspect choices, perception and quiet reactions.'},
 {id:'simulate',label:'Simulate',description:'Exercise movement, contacts and complete scenes.'},
 {id:'diagnose',label:'Diagnose',description:'Check layout, lifecycle, performance and ownership.'},
 {id:'review',label:'Review',description:'Compare exact saved versions and integration status.'}
];
const entries=[
 ['sequences','create','Sequences','Draw pixels, timing, gaze, contacts and independent tracks.','studio','sequences','animation frames editor export json png sprite sheet spritesheet'],
 ['props','create','Props','Draw furniture and toys; inspect colours, families and variants.','studio','props','post bed mouse catalogue export json'],
 ['climb','create','Climb workshop','Edit upright poses, grip contacts and per-frame height gain.','lab','prototype/climb-lab.html','wall jump motion climbing ai draft'],
 ['trees','create','Cat-tree workshop','Generate seeded trees and edit component pixels, sockets, standing spans and depth guides.','lab','prototype/tree-lab.html','cat tree generator furniture components props editor platforms houses beds'],
 ['vertical-surfaces','simulate','Vertical surfaces & transfers','Inspect visible face confidence, grip room and checked wall-jump or climbing transfers.','lab','prototype/vertical-surfaces-lab.html','wall jump climb grip face geometry detection'],
 ['commands','diagnose','On-card commands','Wake settled cats and check nearest-wall invitations with safe landings.','lab','prototype/command-controls-lab.html','startle all wall jump buttons settled pause'],
 ['climb-runtime','simulate','Live climbing','Real post fit, kitten fallback routes, interruptions and landings.','lab','prototype/climb-runtime-lab.html','wall climb background kitten runtime grips landing'],
 ['kitten-climb-stress','diagnose','Kitten climbing stress','Observe grip waits, route outcomes, decal eviction and contact scale with two clocks.','lab','prototype/kitten-climb-stress-lab.html','kitten climb wall marks decals stress grip idle'],
 ['map','behaviours','Behaviour map','Explore sequence neighbours and advisory transition preferences.','studio','map','relationships transitions'],
 ['gaze','behaviours','Gaze & awareness','Inspect gaze directions, perception and noticed stimuli.','lab','','vision senses'],
 ['social','behaviours','Mood & social','Observe independent moods, encounters and optional reactions.','lab','prototype/social-lab.html','multi cat interaction personality'],
 ['settling','behaviours','Settled rest','Inspect five-minute eligibility, prolonged rest and startle interruptions.','lab','prototype/settling-lab.html','sleep loaf timer decisions performance'],
 ['waking','behaviours','Independent waking','Check post-rest and post-meal choices and quiet alternatives.','lab','prototype/post-rest.html','sleep loaf recovery'],
 ['exploring','behaviours','Exploring & gaits','Inspect local wandering, pace and movement choices.','lab','prototype/leisure-lab.html','walk trot gallop sneak speed'],
 ['movement','simulate','Movement & jumps','Controlled walking and jumping fixture.','lab','prototype/index.html','flight leap contact'],
 ['routes','simulate','Route quality','Inspect takeoff points, chosen endpoints and route costs.','lab','prototype/route-quality-lab.html','path navigation distance'],
 ['carry','simulate','Carrying & handoffs','Sweep mouth attachment through clips and live pose transitions.','lab','prototype/carry-lab.html','mouse toy alert loaf'],
 ['refinement','simulate','Props & refinements','Check depth, particles, surfaces, scratching and movement cadence.','lab','prototype/refinement-lab.html','post bed fur effects tracks'],
 ['scratch','simulate','Scratching & actions','Exercise scratching contacts and other action refinements.','lab','prototype/behaviour-refinements.html','post particles'],
 ['beds','simulate','Bed visits','Check entry, settling and departure.','lab','prototype/bed-visits.html','igloo simple bed'],
 ['ages','simulate','Life-stage preview','Compare kitten, adult and senior appearance; size-only preview.','lab','prototype/life-stage-preview-lab.html','age scale body'],
 ['playground','simulate','Roaming playground','Explore surfaces and movement in a mixed fixture.','lab','prototype/playground.html','dashboard'],
 ['cards','simulate','Standard card surfaces','Inspect mocked dashboard card geometry and editor presentation.','lab','prototype/standard-cards.html','card lab mock'],
 ['multi','simulate','Multiple cats','Observe several independent residents together.','lab','prototype/multi-cat.html','social scene'],
 ['endurance','diagnose','Endurance & stress','Compare resident counts, timing and sustained scene behaviour.','lab','prototype/endurance-lab.html','performance fps monitor'],
 ['startup','diagnose','Initial load','Measure first placement, delayed homes and startup work.','lab','prototype/initial-load-lab.html','refresh spawn loading'],
 ['lifecycle','diagnose','Layout & lifecycle','Exercise scrolling, removals, reflow, dialogs and remounts.','lab','prototype/lifecycle-lab.html','pause resize carrying cleanup'],
 ['authority','diagnose','World authority','Inspect ownership, conflicts and reversible migration plans.','lab','prototype/world-authority-lab.html','home residents persistence'],
 ['changes','review','Asset changes','Review exact versions, provenance, diffs and integration receipts.','studio','changes','journal pending completed history']
];
export function resolveWorkshopTools(studio,lab){return entries.map(([id,group,label,description,kind,path,tags])=>({id,group,label,description,kind,tags,url:kind==='studio'?studio+'#'+path:lab+path}));}
export function currentWorkshopTool(tools,url,isStudio){const here=new URL(url);return tools.find(t=>{const u=new URL(t.url);return isStudio?t.kind==='studio'&&(u.hash===(['#props','#map','#changes'].includes(here.hash)?here.hash:'#sequences')):t.kind==='lab'&&(u.pathname===here.pathname||u.pathname==='/'&&here.pathname==='/prototype/gaze-lab.html');});}
export function matchesWorkshopTool(tool,query){const text=[tool.label,tool.description,tool.tags,tool.group].join(' ').toLowerCase();return query.toLowerCase().trim().split(/\s+/).every(word=>text.includes(word));}
