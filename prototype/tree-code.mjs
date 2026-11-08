// Versioned named assembly graphs; compact expressions are optional shorthand.
export const treeCodeLimits={characters:20000,parts:128,links:256};
export const treeSymbols={R:{id:'tree-spine-right',kind:'platform',label:'post with right shelf'},L:{id:'tree-spine-left',kind:'platform',label:'post with left shelf'},F:{id:'tree-base',kind:'base',label:'foundation'},I:{id:'tree-post',kind:'post',label:'post section'},T:{id:'tree-fork',kind:'platform',label:'two-way joint'},P:{id:'tree-platform',kind:'platform',label:'platform'},W:{id:'tree-wide',kind:'platform',label:'wide platform'},O:{id:'tree-house',kind:'house',label:'enclosed pod / house'},B:{id:'tree-bed',kind:'bed',label:'bed'},Y:{id:'tree-toy',kind:'toy',label:'hanging toy'}};
export function parseTreeCode(source){
 if(typeof source!=='string'||source.length>treeCodeLimits.characters)throw Error('Tree code must be at most 20,000 characters.');if(/^\s*tree\b/i.test(source))return parseAssemblyCode(source);let at=0,nodes=0;const ws=()=>{while(/\s/.test(source[at]||'')&&at<source.length)at++;},error=message=>{throw Error('Tree code at character '+(at+1)+': '+message);};
 ws();if(source.slice(at,at+3).toLowerCase()==='v1:')at+=3;
 const starts=()=>{ws();return source[at]==='.'||Object.hasOwn(treeSymbols,(source[at]||'').toUpperCase());};
 function node(depth=0){ws();if(depth>24||++nodes>128)error('limit of 24 nested levels / 128 code nodes exceeded.');if(source[at]==='.'){at++;return null;}
  const symbol=(source[at++]||'').toUpperCase();if(!treeSymbols[symbol])error('expected I, T, O, B, P, W, Y, R, L, F or an empty branch (.).');ws();let count=1,componentId=null;
  if(/\d/.test(source[at]||'')){const n=/^\d+/.exec(source.slice(at))[0];at+=n.length;count=Number(n);if(symbol!=='I'||count<1||count>16)error('only posts repeat: I2 through I16.');}
  ws();if(source[at]==='{'){const end=source.indexOf('}',at);if(end<0)error('missing } after component ID.');componentId=source.slice(at+1,end);if(!/^[a-zA-Z0-9_-]{1,80}$/.test(componentId))error('invalid component ID.');at=end+1;}
  const children=[];ws();
  if(source[at]==='('){at++;ws();if(source[at]!==')')for(;;){ws();let port=null;const named=/^([a-zA-Z][a-zA-Z0-9_-]*)\s*:/.exec(source.slice(at));if(named){port=named[1];at+=named[0].length;}children.push({port,node:node(depth+1)});ws();if(source[at]!==',')break;at++;}if(source[at]!==')')error('expected a comma or closing ).');at++;}
  else if(symbol==='T'){children.push({port:null,node:node(depth+1)},{port:null,node:node(depth+1)});}
  else if(symbol==='I'&&starts())children.push({port:null,node:node(depth+1)});
  if(symbol==='T'&&children.length!==2)error('T needs two branches: T(O,O). Use . for an empty branch.');if(symbol==='I'&&children.length>1)error('I has one continuation; use T to split.');
  return {symbol,count,componentId,children};
 }
 if(!source.trim())error('enter a recipe, for example I T(O,O).');const result=node();ws();if(at!==source.length)error('unexpected extra parts; put separate branches in T(...) or F(...).');return result;
}
export function resolveTreeSymbol(workspace,node){
 const spec=treeSymbols[node.symbol],id=node.componentId||spec?.id,c=workspace.components.find(c=>c.id===id);
 if(!c)throw Error('Missing component '+(id||node.symbol)+'. Use “Add missing draft components” or import the exact component; no substitute is selected.');
 if(spec&&c.kind!==spec.kind)throw Error(node.symbol+' requires a '+spec.kind+' component.');
 if(!c.rows.some(r=>[...r].some(t=>t!=='.')))throw Error(c.name+' has no painted cells.');return c;
}
export function treeComponentToken(component){return Object.entries(treeSymbols).find(([,s])=>s.id===component.id)?.[0]||'part{'+component.id+'}';}
function parseAssemblyCode(source){
 const statements=source.split(/\r?\n/).flatMap(line=>line.replace(/#.*$/,'').split(';')).map((text,index)=>({text:text.trim(),line:index+1})).filter(s=>s.text);
 const error=(line,message)=>{throw Error('Tree code statement '+line+': '+message);};
 if(statements[0]?.text!=='tree 2')error(1,'unsupported format; expected tree 2.');
 const nodes=[],joins=[],names=new Set();let level=0;
 const name='[A-Za-z][A-Za-z0-9_-]{0,63}',port='[A-Za-z0-9_-]{1,80}',endpoint='('+name+')\\.('+port+')';
 const declaration=new RegExp('^('+name+')\\s*=\\s*([A-Za-z]+)(?:\\{([A-Za-z0-9_-]{1,80})\\})?(?:\\s+on\\s+'+endpoint+'(?:\\s+via\\s+('+port+'))?)?$');
 const connection=new RegExp('^join\\s+'+endpoint+'\\s*->\\s*'+endpoint+'$');
 for(const {text,line}of statements.slice(1)){
  const group=/^level (\d+)$/.exec(text);if(group){level=Number(group[1]);if(!Number.isSafeInteger(level)||level>999)error(line,'level must be 0–999.');continue;}
  const join=connection.exec(text);if(join){joins.push({parent:join[1],socket:join[2],child:join[3],input:join[4],line});if(joins.length>treeCodeLimits.links)error(line,'too many connections.');continue;}
  const m=declaration.exec(text);if(!m)error(line,'expected name = TYPE on parent.socket [via input], level N, or join a.socket -> b.input.');
  const symbol=m[2]==='part'?'part':m[2].toUpperCase();if(!treeSymbols[symbol]&&symbol!=='part')error(line,'unknown type '+m[2]+'. Use part{component-id} for custom components.');if(symbol==='part'&&!m[3])error(line,'part needs an exact component ID.');
  if(names.has(m[1]))error(line,'duplicate part name '+m[1]);names.add(m[1]);nodes.push({id:m[1],symbol,componentId:m[3]||null,parent:m[4]||null,socket:m[5]||null,input:m[6]||null,level,line});if(nodes.length>treeCodeLimits.parts)error(line,'limit of 128 parts exceeded.');
 }
 if(!nodes.length)error(1,'declare one foundation and its attached parts.');return {format:'graph',version:2,nodes,joins};
}
export function encodeTreeCode(tree,workspace){
 if(!tree.instances.length)return '';const roots=tree.instances.filter(n=>!n.parent);if(roots.length!==1||roots[0].kind!=='base')throw Error('Code needs one foundation root.');const defs=new Map(workspace.components.map(c=>[c.id,c])),names=new Map(),levels=new Map(),lines=['tree 2'];let currentLevel=-1;
 if(tree.instances.length>treeCodeLimits.parts||tree.links.length>treeCodeLimits.links)throw Error('Assembly exceeds code limits.');
 for(const n of tree.instances){const name=n.name||n.id;if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(name))throw Error('Invalid part name '+name);if(names.has(n.id)||[...names.values()].includes(name))throw Error('Cannot encode duplicate part names.');names.set(n.id,name);}
 if(tree.links.some(l=>!names.has(l.parent)||!names.has(l.child)))throw Error('Cannot encode a dangling connection.');
 const pending=new Set(tree.instances.map(n=>n.id)),ordered=[];while(pending.size){const ready=tree.instances.filter(n=>pending.has(n.id)&&tree.links.filter(l=>l.child===n.id).every(l=>!pending.has(l.parent))).sort((a,b)=>names.get(a.id).localeCompare(names.get(b.id)));if(!ready.length)throw Error('Cannot encode cyclic support connections.');for(const n of ready){pending.delete(n.id);ordered.push(n);}}
 for(const n of ordered){const incoming=tree.links.find(l=>l.child===n.id&&!l.secondary),level=n.level??(incoming?(levels.get(incoming.parent)??0)+1:0);levels.set(n.id,level);if(level!==currentLevel){lines.push('level '+level);currentLevel=level;}
  const c=defs.get(n.componentId);if(!c)throw Error('Missing component '+n.componentId);lines.push(names.get(n.id)+' = '+treeComponentToken(c)+(incoming?' on '+names.get(incoming.parent)+'.'+incoming.socket+' via '+incoming.input:''));
 }
 for(const l of tree.links.filter(l=>l.secondary).sort((a,b)=>(names.get(a.child)+a.input).localeCompare(names.get(b.child)+b.input)))lines.push('join '+names.get(l.parent)+'.'+l.socket+' -> '+names.get(l.child)+'.'+l.input);
 const result=lines.join('\n');if(result.length>treeCodeLimits.characters)throw Error('Encoded code exceeds 20,000 characters.');return result;
}

// Validate topology before placement; secondary supports constrain, never reposition, a part.
export function planTreeGraph(document,workspace){
 const nodes=document.nodes.map(n=>({...n,component:resolveTreeSymbol(workspace,n)})),byName=new Map(nodes.map(n=>[n.id,n])),roots=nodes.filter(n=>!n.parent);
 if(roots.length!==1||roots[0].component.kind!=='base')throw Error('Exactly one foundation root is required.');
 if(nodes.some(n=>n!==roots[0]&&n.component.kind==='base'))throw Error('Only the root may be a foundation.');
 const links=[],outputs=new Set(),inputs=new Set();
 function connect(link){const a=byName.get(link.parent),b=byName.get(link.child);if(!a||!b)throw Error('Unknown part in connection '+link.parent+' -> '+link.child);if(a===b)throw Error('A part cannot support itself.');
  const output=a.component.sockets.find(s=>s.id===link.socket),input=b.component.sockets.find(s=>s.id===link.input);
  if(!output||output.direction!=='out'||!input||input.direction!=='in'||output.type!==input.type||!output.accepts.includes(b.component.kind))throw Error('Incompatible or missing sockets: '+a.id+'.'+link.socket+' -> '+b.id+'.'+link.input);
  const out=a.id+'.'+output.id,into=b.id+'.'+input.id;if(outputs.has(out)||inputs.has(into))throw Error('Socket already occupied: '+out+' -> '+into);outputs.add(out);inputs.add(into);links.push(link);if(links.length>treeCodeLimits.links)throw Error('Limit of 256 connections exceeded.');
 }
 for(const n of nodes.filter(n=>n.parent)){const incoming=n.component.sockets.filter(s=>s.direction==='in');if(!n.input&&incoming.length!==1)throw Error(n.id+': choose an input with via for a multi-support component.');connect({parent:n.parent,socket:n.socket,child:n.id,input:n.input||incoming[0].id,secondary:false});}
 for(const l of document.joins)connect({...l,secondary:true});
 for(const n of nodes)for(const input of n.component.sockets.filter(s=>s.direction==='in'))if(!inputs.has(n.id+'.'+input.id))throw Error('Unconnected required input '+n.id+'.'+input.id);
 const degree=new Map(nodes.map(n=>[n.id,0]));for(const l of links)degree.set(l.child,degree.get(l.child)+1);const queue=nodes.filter(n=>degree.get(n.id)===0),order=[];
 for(let i=0;i<queue.length;i++){const n=queue[i];order.push(n);for(const l of links.filter(l=>l.parent===n.id)){degree.set(l.child,degree.get(l.child)-1);if(degree.get(l.child)===0)queue.push(byName.get(l.child));}}
 if(order.length!==nodes.length)throw Error('Cyclic support connections are not allowed.');return {root:roots[0],order,links};
}
