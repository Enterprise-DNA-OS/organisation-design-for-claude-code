import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
const fields=['code','title','department','parent_code','fte','annual_rate','currency','occupancy'];
export const reports={
 'positions':'select code,title,department,parent_code,fte,annual_rate,currency,occupancy from positions where scenario_id=$1 order by code',
 'costs':'select currency,count(*)::int positions,sum(fte) fte,sum(annual_cost_amount) annual_cost_amount from position_costs where scenario_id=$1 group by currency order by currency',
 'departments':'select department,currency,positions,fte,vacant_fte,annual_cost_amount from department_costs where scenario_id=$1 order by department,currency',
 'vacancies':"select code,title,department,fte,currency,annual_cost_amount from position_costs where scenario_id=$1 and occupancy='vacant' order by code",
 'spans':'select code,title,direct_reports,report_fte from manager_spans where scenario_id=$1 and direct_reports>0 order by direct_reports desc,code',
 'layers':'select code,title,layer,path from position_layers where scenario_id=$1 order by path',
 'compliance':'select rule,finding from review_findings where scenario_id=$1 order by rule,finding',
 'actions':'select code,title,owner,due_on,closed_on,evidence from actions where scenario_id=$1 order by due_on,code',
 'activity':'select actor,action,detail,created_at from events where scenario_id=$1 order by created_at,id'
};
const writeCommands=['create','clone','add','change','review','submit','approve','reopen','add-action','close-action','log','import'];
export const commands=['help','list','show',...Object.keys(reports),'attention','compare','changes','weekly-review','export','draft-review','draft-action',...writeCommands];
const allow=['json','scenario','ref','code','name','owner','purpose','source-as-of','review-on','retention-review-on','actor','reason','title','department','parent','fte','rate','currency','occupancy','evidence','due-on','note','file','map','dry-run','kind'];
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Missing --${k}`);return o[k].trim();};
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Invalid date: ${s}`);return s;}
function decimal(s,places,max){if(!new RegExp(`^\\d+(?:\\.\\d{1,${places}})?$`).test(String(s))||Number(s)>max)throw Error(`Invalid decimal: ${s}`);return String(s);}
function position(v){for(const k of fields.filter(x=>x!=='parent_code'))if(v[k]===undefined||String(v[k]).trim()==='')throw Error(`Missing position ${k}`);
 const p=Object.fromEntries(fields.map(k=>[k,v[k]===null?null:String(v[k]??'').trim()]));
 if(!/^[A-Za-z0-9_.-]+$/.test(p.code))throw Error('Position code must use letters, digits, dot, underscore or hyphen');
 p.parent_code=p.parent_code||null;p.fte=decimal(p.fte,3,1);if(Number(p.fte)===0)throw Error('FTE must be positive');p.annual_rate=decimal(p.annual_rate,2,99999999999999);
 if(!/^[A-Z]{3}$/.test(p.currency))throw Error('Currency must be three uppercase letters');if(!['filled','vacant'].includes(p.occupancy))throw Error('Occupancy must be filled or vacant');return p;
}
function validateTree(rows){const m=new Map(rows.map(p=>[p.code,p]));if(m.size!==rows.length)throw Error('Duplicate position code');for(const p of rows){let c=p;const seen=new Set();while(c){if(seen.has(c.code))throw Error(`Hierarchy cycle at ${c.code}`);seen.add(c.code);if(c.parent_code&&!m.has(c.parent_code))throw Error(`Missing parent ${c.parent_code}`);c=m.get(c.parent_code);}}}
async function resolve(db,kind,ref){const rows=await db.query(`select * from ${kind} order by code`);const name=kind==='scenarios'?'name':'title';const lower=String(ref??'').toLowerCase();const exact=rows.filter(r=>r.code.toLowerCase()===lower||r.id===ref);if(exact.length===1)return exact[0];const matches=rows.filter(r=>lower&&(r.id.startsWith(lower)||r[name].toLowerCase().includes(lower)));if(matches.length===1)return matches[0];throw Error(`${matches.length?'Ambiguous':'No '+kind+' matching'} ${ref}. Candidates: ${(matches.length?matches:rows).map(r=>r.code+' '+r[name]).join('; ')}`);}
async function event(db,s,actor,action,detail){await db.query('insert into events(scenario_id,actor,action,detail) values($1,$2,$3,$4)',[s?.id??null,actor,action,JSON.stringify(detail)]);}
async function rows(db,s){return db.query('select * from positions where scenario_id=$1 order by code',[s.id]);}
function comparable(p){return Object.fromEntries(fields.map(k=>[k,['fte','annual_rate'].includes(k)?Number(p[k]):p[k]??null]));}
function scaled(value,places){const [whole,fraction='']=String(value).split('.');return BigInt(whole)*10n**BigInt(places)+BigInt(fraction.padEnd(places,'0'));}
function moneyText(cents){const sign=cents<0n?'-':'';const n=cents<0n?-cents:cents;return sign+(n/100n)+'.'+String(n%100n).padStart(2,'0');}
function totals(list){const m={};for(const p of list){const x=m[p.currency]??={positions:0,fte:0n,cost:0n};const fte=scaled(p.fte,3);x.positions++;x.fte+=fte;x.cost+=(scaled(p.annual_rate,2)*fte+500n)/1000n;}return m;}
function outputFile(file,text){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,text,{flag:'wx',mode:0o600});return [{file}];}
export async function run(db,cmd,o={},args=[]){
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}`);
 for(const k of Object.keys(o))if(!allow.includes(k))throw Error(`Unknown option --${k}`);
 if(args.length && !(cmd==='import'&&args.length===1&&args[0]==='orgvue'))throw Error('Unexpected argument; import requires orgvue');
 if(cmd==='help')return commands.map(command=>({command}));
 if(cmd==='list')return db.query('select code,name,status,owner,source_as_of,review_on from scenarios order by code');
 if(cmd==='attention')return db.query('select s.code,s.name,f.rule,f.finding from review_findings f join scenarios s on s.id=f.scenario_id order by s.code,f.rule,f.finding');
 if(writeCommands.includes(cmd)){
  const actor=required(o,'actor');await db.exec('BEGIN');
  try{const result=await mutate(db,cmd,o,args,actor);await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}
 }
 const s=await resolve(db,'scenarios',o.scenario||'CURRENT');
 if(cmd==='show')return [s];
 if(reports[cmd])return db.query(reports[cmd],[s.id]);
 if(cmd==='changes'||cmd==='compare'){
  if(!s.baseline_snapshot)throw Error('Scenario has no frozen baseline; clone a scenario first');
  const current=await rows(db,s),base=s.baseline_snapshot;
  if(cmd==='changes'){const old=new Map(base.map(p=>[p.code,p])),now=new Map(current.map(p=>[p.code,p]));return [...new Set([...old.keys(),...now.keys()])].sort().flatMap(code=>{const a=old.get(code),b=now.get(code);if(a&&b&&JSON.stringify(comparable(a))===JSON.stringify(comparable(b)))return [];return [{code,change:!a?'added':!b?'removed':'changed',before:a?comparable(a):null,after:b?comparable(b):null}];});}
  const a=totals(base),b=totals(current);return [...new Set([...Object.keys(a),...Object.keys(b)])].sort().map(currency=>({currency,baseline_fte:Number(a[currency]?.fte||0n)/1000,scenario_fte:Number(b[currency]?.fte||0n)/1000,baseline_annual_cost_amount:moneyText(a[currency]?.cost||0n),scenario_annual_cost_amount:moneyText(b[currency]?.cost||0n),difference_amount:moneyText((b[currency]?.cost||0n)-(a[currency]?.cost||0n))}));
 }
 if(cmd==='weekly-review'){const result={scenario:[{code:s.code,name:s.name,status:s.status,source_as_of:s.source_as_of}]};for(const c of ['costs','spans','compliance','actions'])result[c]=await run(db,c,o);if(s.baseline_snapshot)result.compare=await run(db,'compare',o);return result;}
 if(cmd==='export'){
  const file=path.resolve(required(o,'file'));const all=await rows(db,s);
  if(file.toLowerCase().endsWith('.csv')){const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';return outputFile(file,fields.join(',')+'\n'+all.map(p=>fields.map(k=>cell(p[k])).join(',')).join('\n')+'\n');}
  const data={version:1,scenario:s,positions:all,actions:await db.query('select * from actions where scenario_id=$1',[s.id]),events:await db.query('select * from events where scenario_id=$1',[s.id]),imports:await db.query('select * from imports where scenario_id=$1',[s.id])};return outputFile(file,JSON.stringify(data,null,2)+'\n');
 }
 if(cmd==='draft-review'||cmd==='draft-action'){
  let body;if(cmd==='draft-review')body=render(await run(db,'weekly-review',o));else{const a=await resolve(db,'actions',required(o,'ref'));if(a.scenario_id!==s.id)throw Error('Action belongs to another scenario');body=`${a.code}: ${a.title}\nOwner: ${a.owner}\nDue: ${a.due_on}\nEvidence: ${a.evidence||'Not recorded'}`;}
  return outputFile(path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`${cmd}-${s.code}-${randomUUID()}.md`),`# Draft for human review\n\n${body}\n\nThis is a planning record. No employment change is authorised by this draft.\n`);
 }
 throw Error('Unhandled command');
}
async function mutate(db,cmd,o,args,actor){
 if(cmd==='create'){
  const code=required(o,'code').toUpperCase();const s=(await db.query('insert into scenarios(code,name,owner,purpose,source_as_of,review_on,retention_review_on) values($1,$2,$3,$4,$5,$6,$7) returning *',[code,required(o,'name'),required(o,'owner'),required(o,'purpose'),date(required(o,'source-as-of')),date(required(o,'review-on')),date(required(o,'retention-review-on'))]))[0];
  if(s.source_as_of>new Date().toISOString().slice(0,10))throw Error('Source date cannot be in the future');await event(db,s,actor,cmd,{code});return [{code:s.code,status:s.status}];
 }
 const s=await resolve(db,'scenarios',required(o,'scenario'));await db.query('select id from scenarios where id=$1 for update',[s.id]);
 // Read again after taking the lock so concurrent approval cannot be bypassed.
 Object.assign(s,(await db.query('select * from scenarios where id=$1',[s.id]))[0]);
 if(cmd==='clone'){
  const base=await rows(db,s);if(!base.length)throw Error('Cannot clone an empty scenario');const code=required(o,'code').toUpperCase();
  const n=(await db.query('insert into scenarios(code,name,baseline_id,baseline_snapshot,owner,purpose,source_as_of,review_on,retention_review_on) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *',[code,required(o,'name'),s.id,JSON.stringify(base),required(o,'owner'),required(o,'purpose'),s.source_as_of,date(required(o,'review-on')),date(required(o,'retention-review-on'))]))[0];
  for(const p of base)await insertPosition(db,n,p);await event(db,n,actor,cmd,{baseline:s.code,positions:base.length});return [{code:n.code,positions:base.length}];
 }
 if(cmd==='reopen'){
  if(s.status==='draft')throw Error('Scenario is already draft');const reason=required(o,'reason');await db.query("update scenarios set status='draft',submitted_by=null,approved_by=null,approval_evidence=null where id=$1",[s.id]);await event(db,s,actor,cmd,{reason,previous_status:s.status,previous_approval:s.approval_evidence,previous_approver:s.approved_by});return [{code:s.code,status:'draft'}];
 }
 if(cmd==='approve'){
  if(s.status!=='submitted')throw Error('Scenario must be submitted first');if(actor.toLowerCase()===s.submitted_by.toLowerCase())throw Error('Approver must differ from submitter');const evidence=required(o,'evidence');await gate(db,s);
  await db.query("update scenarios set status='approved',approved_by=$2,approval_evidence=$3 where id=$1",[s.id,actor,evidence]);await event(db,s,actor,cmd,{evidence});return [{code:s.code,status:'approved'}];
 }
 if(cmd==='log'){const note=required(o,'note');await event(db,s,actor,cmd,{note});return [{code:s.code,note}];}
 if(s.status!=='draft')throw Error('Scenario is locked; reopen with a reason before changing it');
 if(cmd==='review'){
  const source=date(required(o,'source-as-of'));if(source>new Date().toISOString().slice(0,10))throw Error('Source date cannot be in the future');
  const evidence=required(o,'evidence');await db.query('update scenarios set source_as_of=$2,review_on=$3,retention_review_on=$4,purpose=$5 where id=$1',[s.id,source,date(required(o,'review-on')),date(required(o,'retention-review-on')),required(o,'purpose')]);await event(db,s,actor,cmd,{evidence,before:{source_as_of:s.source_as_of,review_on:s.review_on,retention_review_on:s.retention_review_on,purpose:s.purpose}});return [{code:s.code,reviewed:true}];
 }
 if(cmd==='submit'){await gate(db,s);await db.query("update scenarios set status='submitted',submitted_by=$2 where id=$1",[s.id,actor]);await event(db,s,actor,cmd,{evidence:required(o,'evidence')});return [{code:s.code,status:'submitted'}];}
 if(cmd==='add'||cmd==='change'){
  const all=await rows(db,s);let before=null;
  if(cmd==='change'){const ref=required(o,'ref').toLowerCase();let candidates=all.filter(p=>p.code.toLowerCase()===ref||p.id===ref);if(!candidates.length)candidates=all.filter(p=>p.id.startsWith(ref)||p.title.toLowerCase().includes(ref));if(candidates.length!==1)throw Error(`Ambiguous or missing position. Candidates: ${(candidates.length?candidates:all).map(p=>p.code+' '+p.title).join('; ')}`);before=candidates[0];}
  const v=before?{...before}:{};for(const [opt,col] of Object.entries({code:'code',title:'title',department:'department',parent:'parent_code',fte:'fte',rate:'annual_rate',currency:'currency',occupancy:'occupancy'}))if(o[opt]!==undefined)v[col]=o[opt];
  if(before&&v.code!==before.code)throw Error('Position code is stable; change its title instead');const p=position(v);validateTree([...all.filter(x=>x.id!==before?.id),p]);const reason=required(o,'reason');
  if(before)await db.query('update positions set title=$2,department=$3,parent_code=$4,fte=$5,annual_rate=$6,currency=$7,occupancy=$8 where id=$1',[before.id,...fields.slice(1).map(k=>p[k])]);else await insertPosition(db,s,p);
  await event(db,s,actor,cmd,{before:before?comparable(before):null,after:p,reason});return [p];
 }
 if(cmd==='add-action'){const a=(await db.query('insert into actions(code,scenario_id,title,owner,due_on) values($1,$2,$3,$4,$5) returning code,title,owner,due_on',[required(o,'code'),s.id,required(o,'title'),required(o,'owner'),date(required(o,'due-on'))]))[0];await event(db,s,actor,cmd,a);return [a];}
 if(cmd==='close-action'){const a=await resolve(db,'actions',required(o,'ref'));if(a.scenario_id!==s.id)throw Error('Action belongs to another scenario');if(a.closed_on)throw Error('Action is already closed');const evidence=required(o,'evidence');await db.query('update actions set closed_on=current_date,evidence=$2 where id=$1',[a.id,evidence]);await event(db,s,actor,cmd,{code:a.code,evidence});return [{code:a.code,closed:true}];}
 if(cmd==='import'){
  if(args[0]!=='orgvue')throw Error('Use import orgvue');const content=fs.readFileSync(required(o,'file'),'utf8');const map=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):Object.fromEntries(fields.map(k=>[k,k]));
  if(fields.some(k=>typeof map[k]!=='string'||!map[k]))throw Error('Mapping must name all eight position columns');
  const source=parseCsv(content);if(!source.length)throw Error('Empty CSV');for(const h of Object.values(map))if(!Object.hasOwn(source[0],h))throw Error(`Mapped column missing: ${h}`);
  const imported=source.map(r=>position(Object.fromEntries(fields.map(k=>[k,r[map[k]]]))));validateTree(imported);
  const digest=createHash('sha256').update(JSON.stringify({content,map})).digest('hex');const prior=(await db.query('select * from imports where scenario_id=$1',[s.id]))[0];
  if(prior?.digest===digest)return [{code:s.code,status:'unchanged',rows:prior.rows}];if((await rows(db,s)).length)throw Error('Import requires an empty draft scenario; create a new snapshot for a revised export');
  for(const p of imported)await insertPosition(db,s,p);await db.query('insert into imports(scenario_id,digest,rows,mapping) values($1,$2,$3,$4)',[s.id,digest,imported.length,JSON.stringify(map)]);await event(db,s,actor,cmd,{digest,rows:imported.length,mapping:map});return [{code:s.code,status:o['dry-run']?'validated':'imported',rows:imported.length}];
 }
 throw Error('Unhandled write');
}
async function gate(db,s){const r=await rows(db,s);if(!r.length)throw Error('Empty scenario');validateTree(r);const findings=await db.query('select * from review_findings where scenario_id=$1',[s.id]);const open=await db.query('select code from actions where scenario_id=$1 and closed_on is null',[s.id]);if(findings.length||open.length)throw Error(`Review blocked: ${findings.map(x=>x.rule).join(', ')}; open actions: ${open.map(x=>x.code).join(', ')}`);}
async function insertPosition(db,s,p){return db.query('insert into positions(scenario_id,code,title,department,parent_code,fte,annual_rate,currency,occupancy) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[s.id,...fields.map(k=>p[k])]);}
export function render(data){if(Array.isArray(data)){if(!data.length)return '(none)';const normalized=data.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v&&typeof v==='object'?JSON.stringify(v):v])));return table(normalized,Object.keys(normalized[0]).map(key=>({key,label:key})));}return Object.entries(data).map(([k,v])=>k+'\n'+render(v)).join('\n\n');}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{const [cmd='help',...rest]=process.argv.slice(2),o={},args=[];for(const a of rest){if(a.startsWith('--')){const i=a.indexOf('=');const key=a.slice(2,i<0?undefined:i);if(Object.hasOwn(o,key))throw Error(`Duplicate option ${key}`);o[key]=i<0?true:a.slice(i+1);}else args.push(a);}db=await getDb();const result=await run(db,cmd,o,args);console.log(o.json?JSON.stringify(result,null,2):render(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
