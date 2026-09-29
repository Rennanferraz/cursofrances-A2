/* Atelier français A2 — U19 pilot. Vanilla JS; no runtime dependency.
   Content, answers and portable progress are separate. Imported text is never executed. */
(() => {
'use strict';
const D=JSON.parse(document.getElementById('pilot-data').textContent),U=D.unit,UID=D.pilotId;
const KEY='atelier-francais-a2:pilot-u19:progress:v2',OLD_KEY='atelier-francais-a2:progress:v1';
const Q=new Map(D.questions.map(q=>[q.id,q])),UNIT=new Map(D.units.map(u=>[u.id,u]));
const MAIN=document.getElementById('main'),MODAL=document.getElementById('modal');
const STEPS=[
 {id:'learn',title:'Comprendre',desc:'10 fiches & repères',icon:'book'},
 {id:'media',title:'Voir & écouter',desc:'Vidéo & phonétique',icon:'headphones'},
 {id:'context',title:'En contexte',desc:'Dialogue & lecture',icon:'message'},
 {id:'exercises',title:'S’exercer',desc:'20 choix expliqués',icon:'checklist'},
 {id:'drills',title:'Automatiser',desc:'Séries de 6 questions',icon:'bolt'},
 {id:'application',title:'Mettre en pratique',desc:'6 situations guidées',icon:'flag'}
];
const ICONS={
 arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',back:'<path d="M19 12H5m5-5-5 5 5 5"/>',chevron:'<path d="m6 9 6 6 6-6"/>',
 book:'<path d="M3 4h6a4 4 0 0 1 3 1.5A4 4 0 0 1 15 4h6v15h-6a4 4 0 0 0-3 1.5A4 4 0 0 0 9 19H3zM12 6v14"/>',
 headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 13H3v7h4v-7zm16 0h1v7h-4v-7z"/>',
 message:'<path d="M20 4H4a1 1 0 0 0-1 1v12h5l4 4v-4h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zM7 9h10M7 13h6"/>',
 checklist:'<path d="M9 6h12M9 12h12M9 18h12m-19-13 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>',flag:'<path d="M5 22V3m0 0c5-4 8 4 14 0v11c-6 4-9-4-14 0"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',check:'<path d="m5 12 4 4L19 6"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 save:'<path d="M4 3h13l4 4v14H3V3zM7 3v6h10V3M7 21v-8h10v8"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
 upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
 speaker:'<path d="M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 play:'<path d="m9 5 11 7-11 7z"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
 external:'<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/>',focus:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 14-1l1 2M4 16l1 2a8 8 0 0 0 14-1"/>'
};
const ic=(n,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||ICONS.info}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=s=>String(s??'').split(/(`[^`]+`)/g).map(x=>x.startsWith('`')&&x.endsWith('`')?`<code lang="fr">${esc(x.slice(1,-1))}</code>`:esc(x)).join('');
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
const iso=s=>typeof s==='string'&&s.length<=40&&Number.isFinite(Date.parse(s));
const now=()=>new Date().toISOString();
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const btn=(label,action,cls='button-outline',attrs='')=>`<button type="button" class="button ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const pct=(n,t)=>t?Math.round(100*n/t):0;
const fresh=()=>({schemaVersion:2,appId:D.appId,contentVersion:D.version,createdAt:now(),updatedAt:now(),started:false,
 resume:{step:'learn',topic:0},contextTab:'dialogue',marks:{},bookmarks:{},answers:{},sessions:{},drillRuns:0,
 prefs:{largeText:false,focus:false},listeningMode:'text',legacy:null});
function optionExists(id,oid){return Q.has(id)&&Q.get(id).options.some(o=>o.id===oid);}
function correct(id,oid){return Q.get(id)?.correctOptionId===oid;}
function allowedSession(key){return /^(bank|dialogue|reading|listening|phonetic|application|drill|review|cp[0-9])$/.test(key);}
function sessionAllowedIds(key){
 if(/^cp\d$/.test(key))return [U.sections[Number(key.slice(2))].checkpointId];
 if(key==='bank'||key==='drill')return D.groups.bank;
 if(key==='dialogue')return U.dialogue.questionIds;
 if(key==='reading')return U.reading.questionIds;
 if(key==='listening')return D.groups.sound.slice(0,1);
 if(key==='phonetic')return D.groups.sound.slice(1);
 if(key==='application')return D.groups.application;
 return [...Q.keys()];
}
function cleanLegacy(raw){
 if(!plain(raw)||raw.schemaVersion!==1||typeof raw.contentVersion!=='string'||!/^0\.2\./.test(raw.contentVersion)||!plain(raw.history)||!plain(raw.marks)||!plain(raw.drafts))throw Error('Ce fichier ne correspond pas à une sauvegarde de la version 0.2.');
 const out={schemaVersion:1,contentVersion:raw.contentVersion,theme:['light','dark'].includes(raw.theme)?raw.theme:null,history:{},marks:{},drafts:{}};
 const bids=new Set([...UNIT.keys(),'diagnostic',...Array.from({length:7},(_,i)=>'revision-0'+(i+1))]);
 for(const [bid,h] of Object.entries(raw.history)){
  if(!bids.has(bid)||!plain(h)||!int(h.attempts,1,10000000))throw Error('Historique ancien invalide.');
  for(const k of ['last','best'])if(!plain(h[k])||!int(h[k].total,1,1000)||!int(h[k].score,0,h[k].total))throw Error('Résultat ancien invalide.');
  out.history[bid]={attempts:h.attempts,last:{score:h.last.score,total:h.last.total},best:{score:h.best.score,total:h.best.total}};
 }
 const safeOldKey=k=>/^(u\d{2}|passe-compose-imparfait|revision-0[1-7]|diagnostic)([\/-][a-zA-Z0-9\/-]+)?$/.test(k)&&k.length<200;
 for(const [k,v] of Object.entries(raw.marks)){if(!safeOldKey(k)||typeof v!=='boolean')throw Error('Marque ancienne invalide.');out.marks[k]=v;}
 for(const [k,v] of Object.entries(raw.drafts)){if(!safeOldKey(k)||typeof v!=='string'||v.length>20000)throw Error('Brouillon ancien invalide.');out.drafts[k]=v;}
 return out;
}
function validate(raw){
 if(!plain(raw)||raw.schemaVersion!==2||raw.appId!==D.appId||raw.contentVersion!==D.version)throw Error('Version incompatible. Utilisez une sauvegarde du pilote U19 (0.3.0) ou de la base 0.2.');
 const out=fresh();
 if(!iso(raw.createdAt)||!iso(raw.updatedAt)||typeof raw.started!=='boolean')throw Error('Informations de progression invalides.');
 out.createdAt=raw.createdAt;out.updatedAt=raw.updatedAt;out.started=raw.started;
 if(!plain(raw.resume)||!STEPS.some(s=>s.id===raw.resume.step)||!int(raw.resume.topic,0,9))throw Error('Position de reprise invalide.');
 out.resume={step:raw.resume.step,topic:raw.resume.topic};
 if(!['dialogue','reading','vocab'].includes(raw.contextTab))throw Error('Onglet de reprise invalide.');out.contextTab=raw.contextTab;
 for(const k of ['marks','bookmarks']){
  if(!plain(raw[k]))throw Error('Repères de lecture invalides.');
  for(const [id,v] of Object.entries(raw[k])){if(!U.sections.some(s=>s.id===id)||typeof v!=='boolean')throw Error('Fiche inconnue dans la sauvegarde.');out[k][id]=v;}
 }
 if(!plain(raw.answers))throw Error('Réponses manquantes.');
 for(const [id,a] of Object.entries(raw.answers)){
  if(!Q.has(id)||!plain(a)||!optionExists(id,a.firstOptionId)||!optionExists(id,a.lastOptionId)||!int(a.attempts,1,10000000)||!iso(a.firstAt)||!iso(a.lastAt))throw Error('Réponse inconnue ou invalide. Aucun remplacement effectué.');
  out.answers[id]={firstOptionId:a.firstOptionId,lastOptionId:a.lastOptionId,attempts:a.attempts,firstAt:a.firstAt,lastAt:a.lastAt};
 }
 if(!plain(raw.sessions))throw Error('Séries de questions invalides.');
 for(const [key,s] of Object.entries(raw.sessions)){
  if(!allowedSession(key)||!plain(s)||!Array.isArray(s.ids)||s.ids.length<1||s.ids.length>46||new Set(s.ids).size!==s.ids.length||!s.ids.every(id=>sessionAllowedIds(key).includes(id))||!int(s.index,0,s.ids.length)||!int(s.seed,1,2147483646)||!plain(s.selected)||!plain(s.submitted)||typeof s.counted!=='boolean')throw Error('Série de questions incompatible.');
  if(s.finishedAt!==null&&!iso(s.finishedAt))throw Error('Fin de série invalide.');
  if((s.finishedAt!==null)!==(s.index===s.ids.length))throw Error('Position de série incohérente.');
  const item={ids:[...s.ids],index:s.index,seed:s.seed,selected:{},submitted:{},finishedAt:s.finishedAt,counted:s.counted};
  for(const k of ['selected','submitted'])for(const [id,oid] of Object.entries(s[k])){
   if(!s.ids.includes(id)||!optionExists(id,oid))throw Error('Alternative invalide dans une série.');item[k][id]=oid;
  }
  if(s.ids.slice(0,s.index).some(id=>!item.submitted[id]))throw Error('Questions sautées dans la sauvegarde.');
  out.sessions[key]=item;
 }
 if(!int(raw.drillRuns,0,10000000))throw Error('Nombre de séries invalide.');out.drillRuns=raw.drillRuns;
 if(!plain(raw.prefs)||typeof raw.prefs.largeText!=='boolean'||typeof raw.prefs.focus!=='boolean')throw Error('Préférences invalides.');
 out.prefs={largeText:raw.prefs.largeText,focus:raw.prefs.focus};
 if(!['text','synthesis'].includes(raw.listeningMode))throw Error('Mode d’écoute invalide.');out.listeningMode=raw.listeningMode;
 out.legacy=raw.legacy===null?null:cleanLegacy(raw.legacy);
 return out;
}
let storageOK=true,storageIssue='',legacyDetected=false;
function load(){
 try{
  legacyDetected=!!localStorage.getItem(OLD_KEY);
  const s=localStorage.getItem(KEY);if(!s)return fresh();return validate(JSON.parse(s));
 }catch(e){storageOK=false;storageIssue='Le stockage est indisponible ou contient un fichier incompatible. Cette visite continue en mémoire ; exportez votre progression avant de fermer.';return fresh();}
}
let state=load(),route={view:'parcours',step:'learn',topic:0},searchText='',pendingImport=null,modalFocus=null,returnStep=null,toastTimer=null;
let speechToken=0,utterances=[];
function storageUI(){
 const x=document.getElementById('save-state');x.classList.toggle('memory',!storageOK);x.innerHTML=`<span></span>${storageOK?'Enregistré ici':'Mémoire temporaire'}`;
 const w=document.getElementById('storage-warning');w.hidden=!storageIssue;w.textContent=storageIssue;
}
function save(){
 state.updatedAt=now();
 if(storageOK)try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;storageIssue='Le navigateur ne peut plus enregistrer votre progression. Les réponses restent dans cette visite : exportez une sauvegarde avant de fermer.';}
 storageUI();
}
function announce(s){document.getElementById('live').textContent=s;}
function toast(s){const t=document.getElementById('toast');clearTimeout(toastTimer);t.textContent=s;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,4500);announce(s);}
const answered=ids=>ids.filter(id=>!!state.answers[id]).length;
const lastCorrect=ids=>ids.filter(id=>state.answers[id]&&correct(id,state.answers[id].lastOptionId)).length;
const wrongIds=()=>D.questions.filter(q=>state.answers[q.id]&&!correct(q.id,state.answers[q.id].lastOptionId)).map(q=>q.id);
function stepStats(){return [
 {n:U.sections.filter(s=>state.marks[s.id]).length+answered(D.groups.checkpoint),t:20,note:'10 lectures déclarées + 10 checkpoints répondus'},
 {n:answered(D.groups.sound),t:4,note:'4 questions · vidéo facultative'},
 {n:answered(D.groups.context),t:6,note:'3 questions de dialogue + 3 de lecture'},
 {n:answered(D.groups.bank),t:20,note:'20 questions de la banque principale'},
 {n:state.drillRuns>0?1:0,t:1,note:'Au moins une série de 6 terminée'},
 {n:answered(D.groups.application),t:6,note:'6 choix guidés de mise en pratique'}
 ];}
function metrics(){const s=stepStats();return {progress:Math.round(s.reduce((n,x)=>n+x.n/x.t,0)/6*100),steps:s.filter(x=>x.n===x.t).length,answered:Object.keys(state.answers).length,correct:lastCorrect([...Q.keys()]),first:[...Q.keys()].filter(id=>state.answers[id]&&correct(id,state.answers[id].firstOptionId)).length};}
function updateChrome(){
 document.body.classList.toggle('large-text',state.prefs.largeText);
 document.body.classList.toggle('focus-mode',state.prefs.focus&&route.view==='unite');
 document.querySelectorAll('[data-nav]').forEach(a=>{const on=a.dataset.nav===route.view;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const n=wrongIds().length,r=document.getElementById('review-count');r.hidden=!n;r.textContent=n;
 storageUI();
}
function bar(n,t,green=false){return `<div class="bar ${green?'green':''}" role="progressbar" aria-valuemin="0" aria-valuemax="${t}" aria-valuenow="${n}" aria-label="Avancement"><span style="width:${pct(n,t)}%"></span></div>`;}
function go(view,step='learn',topic=0){const hash=view==='unite'?`unite/${step}/${topic}`:view;if(location.hash==='#'+hash){parseRoute();render();}else location.hash=hash;}
function resume(){state.started=true;save();go('unite',state.resume.step,state.resume.topic);}
function parseRoute(){
 const h=location.hash.slice(1).split('/');
 if(h[0]==='main')return;
 route={view:['parcours','unite','revisions','progres'].includes(h[0])?h[0]:'parcours',step:STEPS.some(s=>s.id===h[1])?h[1]:'learn',topic:int(Number(h[2]),0,9)?Number(h[2]):0};
 if(route.view==='unite'){state.started=true;state.resume={step:route.step,topic:route.topic};save();}
}
function render(preserve=false){
 const y=window.scrollY;updateChrome();
 MAIN.innerHTML=route.view==='unite'?renderLesson():route.view==='revisions'?renderRevisions():route.view==='progres'?renderProgress():renderHome();
 document.title=route.view==='unite'?`U19 · ${STEPS.find(s=>s.id===route.step).title} — Atelier français A2`:'Atelier français · Votre parcours A2';
 if(preserve){window.scrollTo(0,y);}else{window.scrollTo(0,0);requestAnimationFrame(()=>MAIN.querySelector('h1')?.focus({preventScroll:true}));}
 if(route.view==='parcours')document.getElementById('unit-search').value=searchText;
}
function renderHome(){
 const m=metrics(),has=state.started,word=m.steps===6?'Revoir l’unité 19':has?'Reprendre l’unité 19':'Commencer l’unité 19';
 return `<div class="page home-page">
  <div class="page-heading"><div><span class="eyebrow">VOTRE PARCOURS · NIVEAU A2</span><h1 tabindex="-1">Un pas de plus en français.</h1><p class="lead" lang="pt-BR">Veja o caminho completo. Estude uma ideia de cada vez, no seu ritmo.</p></div><span class="tag tag-neutral pill unit-counter">36 unités repérées · 1 unité pilote</span></div>
  <div class="home-top"><section class="welcome-card card"><div class="welcome-copy"><div class="flex items-center gap-2"><span class="tag tag-white">UNITÉ 19</span><span class="tag tag-white pill">${has?'Votre point de reprise':'À découvrir dans ce pilote'}</span></div><h2>Passé composé<br>ou imparfait ?</h2><p lang="pt-BR">Aprenda a contar o que aconteceu e a descrever o que estava acontecendo. O contexto faz a diferença.</p>${btn(word+' '+ic('arrow',17),'resume','button-white')}</div><div class="hero-motif" aria-hidden="true"><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="line"></span><span class="dot"></span></div></section>
  <section class="card home-summary"><div class="summary-title">${ic('target',16)}Votre unité pilote</div><div class="summary-primary"><div class="summary-large">${m.steps}<span> / 6 étapes</span></div>${bar(m.progress,100)}<div class="micro muted">${m.progress}% du parcours de l’unité</div></div><div class="summary-secondary"><div class="summary-divider"></div><div class="stat-pair"><span>Questions explorées</span><b>${m.answered} / 46</b></div><div class="stat-pair"><span>À retravailler</span><b>${wrongIds().length}</b></div><button class="text-button" data-action="go" data-view="progres">Voir ma progression ${ic('arrow',14)}</button></div></section></div>
  <div class="home-map-layout"><section aria-labelledby="map-title"><div class="section-heading"><h2 id="map-title">Le fil de votre parcours</h2><label class="search-box">${ic('search',16)}<input id="unit-search" type="search" aria-label="Rechercher une unité" placeholder="Rechercher une unité…" autocomplete="off"></label></div><div class="legend"><span><i class="blue"></i>Unité pilote disponible</span><span><i></i>À intégrer au nouveau format</span>${m.steps===6?'<span><i class="green"></i>Unité parcourue</span>':''}</div><div id="path-blocks">${renderPath()}</div><p class="prototype-note" lang="pt-BR">Este mapa mantém as 36 unidades da base recebida. Apenas a U19 está implementada nesta nova interface. Os blocos agrupam visualmente a sequência; não representam conclusão das unidades anteriores.</p></section>
  <aside class="map-aside"><section class="card mini-map"><h3>Tout le parcours, en un regard</h3><p class="micro muted" lang="pt-BR">Toque em um número para se localizar.</p><div class="number-grid">${D.units.map(u=>`<button class="map-number ${u.id===UID?(m.steps===6?'done':'active'):''}" data-action="locate" data-unit="${u.id}" title="Unité ${u.order} · ${esc(u.titleFr)}" aria-label="Localiser l’unité ${u.order} : ${esc(u.titleFr)}">${String(u.order).padStart(2,'0')}</button>`).join('')}</div><div class="flex items-center justify-between gap-2"><span class="tag ${m.steps===6?'tag-green':''}">U19 · ${m.steps===6?'Parcourue':has?'En cours':'Pilote'}</span><span class="micro muted">${m.steps} / 6 étapes</span></div></section>
  <section class="tip-card">${ic('save',23)}<h3>Votre progrès vous suit.</h3><p lang="pt-BR">Vai trocar de navegador ou computador? Exporte seu progresso e importe a cópia no próximo acesso.</p><button class="text-button" data-action="backup">Gérer ma sauvegarde ${ic('arrow',14)}</button></section></aside></div>
 </div>`;
}
function renderPath(){
 const n=norm(searchText),m=metrics();let count=0;
 const html=D.blocks.map((b,bi)=>{
  const units=D.units.filter(u=>u.order>=b.range[0]&&u.order<=b.range[1]&&(!n||norm(u.titleFr+' '+u.order+' '+u.objectivesFr.join(' ')).includes(n)));
  if(!units.length)return '';count+=units.length;
  const active=b.range[0]<=19&&b.range[1]>=19;
  return `<details class="path-block ${active?'current':''}" id="block-${bi}" ${active||n?'open':''}><summary><span class="block-index">${String(bi+1).padStart(2,'0')}</span><span><strong>${esc(b.nameFr)}</strong><small lang="pt-BR">${esc(b.subtitlePt)}</small></span><span class="block-meta">${active?'<span class="tag">Votre repère</span>':''}<span>U${String(b.range[0]).padStart(2,'0')}${b.range[1]!==b.range[0]?'–'+String(b.range[1]).padStart(2,'0'):''}</span><span class="chevron">${ic('chevron',15)}</span></span></summary><ol class="timeline">${units.map(u=>{
   const pilot=u.id===UID,status=pilot?(m.steps===6?'Parcourue · révision libre':state.started?'En cours · reprendre ici':'Disponible dans le pilote'):'Aperçu · nouveau format à venir';
   return `<li class="${pilot?'active-node':''} ${pilot&&m.steps===6?'done-node':''}" id="unit-${u.id}"><span class="node-number" aria-hidden="true">${pilot&&m.steps===6?'✓':String(u.order).padStart(2,'0')}</span><button class="unit-row" data-action="${pilot?'resume':'preview'}" data-unit="${u.id}" ${pilot?'aria-current="location"':''}><span><span class="unit-title">${esc(u.titleFr)}</span><small>${status}</small></span>${pilot?'<span class="tag '+(m.steps===6?'tag-green':'')+'">U19</span>':'<span class="unit-row-arrow">'+ic('chevron',14)+'</span>'}</button></li>`;
  }).join('')}</ol></details>`;
 }).join('');
 return count?html:`<div class="no-results" lang="pt-BR">Nenhuma unidade encontrada. Tente uma palavra do título ou um número de 1 a 36.</div>`;
}
function locate(id){
 searchText='';if(route.view!=='parcours'){go('parcours');setTimeout(()=>locate(id),70);return;}
 document.getElementById('unit-search').value='';document.getElementById('path-blocks').innerHTML=renderPath();
 const u=UNIT.get(id),bi=D.blocks.findIndex(b=>u.order>=b.range[0]&&u.order<=b.range[1]);
 const d=document.getElementById('block-'+bi);d.open=true;
 const el=document.getElementById('unit-'+id);el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
 el.querySelector('button').focus({preventScroll:true});
}
function renderLesson(){
 const m=metrics(),stats=stepStats(),which=STEPS.findIndex(s=>s.id===route.step);
 let content=route.step==='learn'?renderLearn():route.step==='media'?renderMedia():route.step==='context'?renderContext():route.step==='exercises'?renderExercises():route.step==='drills'?renderDrills():renderApplication();
 return `<div class="page lesson-page"><div class="breadcrumb"><a href="#parcours">Mon parcours</a>${ic('chevron',12)}<span>Raconter le passé</span>${ic('chevron',12)}<span>Unité 19</span></div><div class="lesson-heading"><div><div class="unit-label"><span class="tag">UNITÉ 19</span><span class="tag tag-neutral">A2 · Conjugaison</span><span class="tag tag-neutral">Version pilote</span></div><h1 tabindex="-1">Le passé composé <span class="muted">vs</span> l’imparfait</h1><p class="lead" lang="pt-BR">Duas perspectivas para contar uma história: os acontecimentos e o contexto em que eles se passam.</p></div><div class="lesson-tools"><button class="icon-button" data-action="font" aria-label="${state.prefs.largeText?'Réduire':'Agrandir'} les textes" aria-pressed="${state.prefs.largeText}" title="Taille de lecture">A${state.prefs.largeText?'−':'+'}</button><button class="button button-outline button-compact" data-action="focus" aria-pressed="${state.prefs.focus}">${ic('focus',15)}${state.prefs.focus?'Quitter le focus':'Mode focus'}</button></div></div>
 <div class="lesson-layout"><aside class="lesson-sidebar"><div class="sidebar-label">DANS CETTE UNITÉ</div><nav class="step-nav" aria-label="Étapes de l’unité">${STEPS.map((s,i)=>`<a class="step-link ${s.id===route.step?'active':''}" href="#unite/${s.id}/${s.id==='learn'?state.resume.topic:0}" ${s.id===route.step?'aria-current="step"':''}><span class="step-icon">${ic(s.icon,22)}</span><span><span class="step-name">${s.title}</span><span class="step-desc">${s.desc}</span></span>${stats[i].n===stats[i].t?'<span class="step-tick" aria-label="Étape parcourue">✓</span>':''}</a>`).join('')}</nav><div class="sidebar-progress"><div class="flex items-center justify-between"><span class="small muted">Votre avancée</span><b>${m.steps} / 6</b></div>${bar(m.progress,100)}<p class="micro muted" lang="pt-BR">Etapas percorridas, não uma certificação de domínio.</p><a class="text-button" href="#progres">Voir les détails ${ic('arrow',13)}</a></div><a class="sidebar-back text-button" href="#parcours">${ic('back',14)}Revenir au parcours</a><p class="mobile-step-label">Étape ${which+1} / 6 · ${m.progress}% parcouru dans le pilote</p></aside>
 <article class="lesson-content">${returnStep&&route.step==='learn'?`<div class="return-quiz">${btn(ic('back',14)+' Revenir à mon exercice','return-quiz','button-soft button-compact')}</div>`:''}${content}<div class="section-next">${which>0?btn(ic('back',15)+' Étape précédente','step','button-outline',`data-step="${STEPS[which-1].id}"`):'<a class="text-button" href="#parcours">'+ic('back',14)+'Le parcours complet</a>'}${which<5?btn('Continuer · '+STEPS[which+1].title+' '+ic('arrow',15),'step','button-primary',`data-step="${STEPS[which+1].id}"`):btn('Voir mon bilan '+ic('arrow',15),'go','button-primary','data-view="progres"')}</div><p class="focus-note" hidden lang="pt-BR">Modo foco ativo. Use “Continuar” para navegar entre as etapas ou “Quitter le focus” para recuperar o menu.</p></article></div></div>`;
}
function intro(label,title,pt){return `<div class="section-intro"><span class="eyebrow">${label}</span><h2>${title}</h2><p lang="pt-BR">${pt}</p></div>`;}
function renderLearn(){
 const i=route.topic,s=U.sections[i],examples=U.examples.filter(e=>e.topicIds.includes(s.topicId));ensureSession('cp'+i,[s.checkpointId]);
 return intro('01 · COMPRENDRE','Deux regards sur le passé','Comece pelo essencial. Os dez pontos abaixo retomam as formas, os usos e as nuances do material original.')+
 `<div class="contrast"><section class="contrast-panel"><span class="eyebrow">LE CONTEXTE · O CENÁRIO</span><h3>Imparfait</h3><p lang="pt-BR">Como era a situação? O que estava em curso ou fazia parte da rotina?</p><div class="contrast-example" lang="fr">Je préparais le dîner.<small lang="pt-BR">Eu estava preparando o jantar.</small></div></section><section class="contrast-panel pc"><span class="eyebrow">L’ÉVÉNEMENT · O ACONTECIMENTO</span><h3>Passé composé</h3><p lang="pt-BR">O que aconteceu? Qual episódio ou conjunto é visto como um todo?</p><div class="contrast-example" lang="fr">Ana est arrivée.<small lang="pt-BR">Ana chegou.</small></div></section></div>
 <div class="topic-pager"><span class="topic-count">FICHE ${String(i+1).padStart(2,'0')} / 10</span><select class="topic-select" id="topic-select" aria-label="Choisir une fiche théorique">${U.sections.map((x,n)=>`<option value="${n}" ${i===n?'selected':''}>${String(n+1).padStart(2,'0')} · ${esc(x.titleFr)}</option>`).join('')}</select></div><div class="topic-dots" aria-label="Sommaire des dix fiches">${U.sections.map((x,n)=>`<button class="topic-dot ${state.marks[x.id]?'read':''} ${i===n?'current':''}" data-action="topic" data-topic="${n}" aria-label="Fiche ${n+1} : ${esc(x.titleFr)}${state.marks[x.id]?', lecture déclarée':''}" ${i===n?'aria-current="page"':''}>${n+1}</button>`).join('')}</div>
 <section class="card theory-card" id="current-fiche"><div class="card-header"><div><span class="eyebrow">L’ESSENTIEL · ENTENDA O CONCEITO</span><h2>${esc(s.titleFr)}</h2></div><button class="icon-button ${state.bookmarks[s.id]?'bookmarked':''}" data-action="bookmark" data-topic="${i}" aria-label="${state.bookmarks[s.id]?'Retirer':'Ajouter'} cette fiche aux révisions" aria-pressed="${!!state.bookmarks[s.id]}" title="Garder cette fiche pour réviser">${ic('star',18)}</button></div>
 ${s.essentialPt.map((t,j)=>`<div class="concept-rule"><span class="rule-number" aria-hidden="true">${j+1}</span><p lang="pt-BR">${rich(t)}</p></div>`).join('')}
 <div class="example-stack">${examples.map(e=>`<div class="example-card"><div class="flex items-start justify-between gap-3"><p class="example-fr" lang="fr">${esc(e.fr)}</p><button class="icon-button" data-action="speak-example" data-example="${e.id}" aria-label="Écouter cet exemple" title="Voix de synthèse, si disponible">${ic('speaker',15)}</button></div><p class="example-pt" lang="pt-BR">${esc(e.pt)}</p><p class="example-note" lang="pt-BR">${esc(e.notePt)}</p></div>`).join('')}</div>
 <div class="callout"><div class="callout-title">${ic('info',15)}LE DÉTAIL QUI COMPTE</div><p lang="pt-BR">${rich(s.tipPt)}</p></div>
 <details class="expand"><summary>Aller plus loin <span class="muted" lang="pt-BR">Saiba mais · explicação completa</span></summary><div class="expand-body" lang="pt-BR">${s.paragraphsPt.map(p=>`<p>${rich(p)}</p>`).join('')}</div></details>
 <div class="theory-foot"><label class="mark-read"><input type="checkbox" data-read="${s.id}" ${state.marks[s.id]?'checked':''}><span>J’ai étudié cette fiche</span></label>${i<9?btn('Fiche suivante '+ic('arrow',14),'topic','button-outline button-compact',`data-topic="${i+1}"`):btn('Revoir le tableau comparatif','table','button-outline button-compact')}</div></section>
 ${quiz('cp'+i,true)}<p class="audio-status" id="audio-status" role="status"></p>
 <details class="expand"><summary>Tableau de référence · les deux temps en un regard</summary><div class="expand-body">${comparisonTable()}</div></details>`;
}
function comparisonTable(){const t=U.tables[0];return `<div class="table-wrap"><table class="full-table"><caption class="sr-only">${esc(t.titleFr)}</caption><thead><tr>${t.headersFr.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((v,i)=>i===0?`<th scope="row">${esc(v)}</th>`:`<td lang="pt-BR">${rich(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function seedShuffle(arr,seed){const a=[...arr];let n=seed;for(let i=a.length-1;i>0;i--){n=(n*48271)%2147483647;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return (n>>>0)%2147483646+1;}
function newSession(key,ids){state.sessions[key]={ids:[...ids],index:0,seed:Math.floor(Math.random()*2147483645)+1,selected:{},submitted:{},finishedAt:null,counted:false};save();}
function ensureSession(key,ids){if(!state.sessions[key])newSession(key,ids);return state.sessions[key];}
function quiz(key,inline=false){
 const s=state.sessions[key];if(!s)return '';
 if(s.finishedAt)return summaryQuiz(key);
 const id=s.ids[s.index],q=Q.get(id),submitted=s.submitted[id],selection=s.selected[id],order=seedShuffle(q.options,s.seed%2147483646+hash(id)%999983);
 return `<div class="quiz-shell" data-session="${key}"><section class="card quiz-card ${inline?'inline':''}" aria-label="${inline?'Checkpoint':'Exercice à choix multiple'}"><div class="quiz-overline"><span>${inline?'VÉRIFIEZ VOTRE COMPRÉHENSION':'QUESTION '+(s.index+1)+' / '+s.ids.length}</span><span class="tag tag-neutral">4 choix · 1 réponse</span></div>${!inline?bar(s.index,s.ids.length):''}
 <fieldset class="quiz-prompt" ${submitted?'disabled':''}><legend tabindex="-1">${esc(q.instructionFr)}</legend>${q.sentenceFr?`<p class="quiz-sentence" lang="fr">${esc(q.sentenceFr).replace(/____/g,'<span class="blank" aria-label="espace à compléter">…</span>')}</p>`:''}<div class="option-list">${order.map((o,i)=>{
  const ok=submitted&&o.id===q.correctOptionId,bad=submitted&&o.id===submitted&&!ok;
  return `<label class="option ${ok?'correct':''} ${bad?'incorrect':''}"><input type="radio" name="option-${key}" value="${o.id}" data-quiz="${key}" ${selection===o.id?'checked':''} ${submitted?'disabled':''}><span class="option-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span class="option-text" lang="fr">${esc(o.textFr)}</span>${ok?'<span class="option-status">✓ Correct</span>':bad?'<span class="option-status">× À revoir</span>':''}</label>`;
 }).join('')}</div></fieldset>
 ${submitted?`<div class="feedback ${correct(id,submitted)?'':'error'}" tabindex="-1"><h4>${correct(id,submitted)?ic('check',18)+'Bien vu !':'À revoir, et c’est utile.'}</h4><p lang="pt-BR">${rich(q.explanationPt)}</p>${!correct(id,submitted)?`<p class="correct-answer"><strong>Réponse attendue :</strong> <span lang="fr">${esc(q.options.find(o=>o.id===q.correctOptionId).textFr)}</span></p>`:''}${q.completedSentenceFr?`<p class="correct-answer" lang="fr">${esc(q.completedSentenceFr)}</p>`:''}${!inline?`<button class="text-button" data-action="help" data-topic="${q.helpIndex}" data-from="${route.view==='revisions'?'revisions':route.step}">${ic('book',14)}Revoir le concept</button>`:''}</div><div class="quiz-actions"><p class="micro" lang="pt-BR">${inline?'A resposta foi registrada. Releia a explicação e avance quando estiver confortável.':'O progresso registra as respostas, não apenas a abertura da página.'}</p>${inline?btn(ic('refresh',14)+' Réessayer','restart','button-outline button-compact',`data-key="${key}"`):btn((s.index<s.ids.length-1?'Question suivante':'Voir le résultat')+' '+ic('arrow',15),'next','button-primary',`data-key="${key}"`)}</div>`:
 `<div class="quiz-actions"><p class="micro" lang="pt-BR">Escolha uma alternativa. O comentário explica a resposta depois da verificação.</p>${btn('Vérifier ma réponse '+ic('check',15),'check','button-primary',`data-key="${key}" ${selection?'':'disabled'}`)}</div>`}</section></div>`;
}
function summaryQuiz(key){const s=state.sessions[key],score=s.ids.filter(id=>correct(id,s.submitted[id])).length,wrong=s.ids.filter(id=>!correct(id,s.submitted[id]));return `<div class="quiz-shell" data-session="${key}"><section class="card session-end"><div class="result-ring">${score}<span class="sr-only"> bonnes réponses sur </span><small>/ ${s.ids.length}</small></div><span class="eyebrow">SÉRIE TERMINÉE</span><h3>${score===s.ids.length?'Une belle étape de franchie.':'Chaque réponse vous fait avancer.'}</h3><p lang="pt-BR">${score===s.ids.length?'Você acertou todas as questões desta série. Volte aos conceitos sempre que precisar.':`Você acertou ${score} de ${s.ids.length} questões nesta série. Revise os comentários antes de uma nova tentativa.`} Este resultado não é uma certificação de domínio do A2.</p><div class="result-actions">${btn(ic('refresh',15)+' Refaire cette série','restart','button-outline',`data-key="${key}"`)}${wrong.length?btn('Revoir mes erreurs '+ic('arrow',15),'go','button-primary','data-view="revisions"'):btn('Voir ma progression '+ic('arrow',15),'go','button-primary','data-view="progres"')}</div></section></div>`;}
function recordAnswer(key){
 const s=state.sessions[key];if(!s||s.finishedAt)return;const id=s.ids[s.index],oid=s.selected[id];if(!oid||s.submitted[id]||!optionExists(id,oid))return;
 const prev=state.answers[id],t=now();state.answers[id]={firstOptionId:prev?.firstOptionId||oid,lastOptionId:oid,attempts:(prev?.attempts||0)+1,firstAt:prev?.firstAt||t,lastAt:t};s.submitted[id]=oid;save();
 render(true);const f=MAIN.querySelector(`[data-session="${key}"] .feedback`);f?.focus({preventScroll:true});announce(correct(id,oid)?'Bonne réponse. Une explication est disponible.':'Réponse à revoir. Le corrigé est affiché.');
}
function nextQuestion(key){const s=state.sessions[key];if(!s||s.finishedAt||!s.submitted[s.ids[s.index]])return;s.index++;if(s.index===s.ids.length){s.finishedAt=now();if(key==='drill'&&!s.counted){state.drillRuns++;s.counted=true;}}save();render(true);MAIN.querySelector(`[data-session="${key}"] legend`)?.focus({preventScroll:true});}
function renderContext(){
 const tab=state.contextTab;
 const tabs=`<div class="context-tabs" role="group" aria-label="Ressource à étudier">${[['dialogue','Le dialogue'],['reading','La lecture'],['vocab','Le vocabulaire']].map(([k,l])=>`<button class="${tab===k?'active':''}" data-action="context-tab" data-tab="${k}" aria-pressed="${tab===k}">${l}</button>`).join('')}</div>`;
 let body='';
 if(tab==='dialogue'){
  ensureSession('dialogue',U.dialogue.questionIds);
  body=`<section class="card context-card"><h3>${esc(U.dialogue.titleFr)}</h3><p class="context-meta" lang="fr">${esc(U.dialogue.contextFr)}</p><div class="reader-toolbar">${btn(ic('speaker',15)+' Écouter le dialogue','speak-dialogue','button-soft button-compact')}${btn(ic('stop',13)+' Arrêter','stop-audio','button-outline button-compact')}${btn('Afficher / masquer les traductions','translations','button-outline button-compact')}</div><div class="dialogue-transcript">${U.dialogue.turns.map(t=>`<div class="dialogue-turn"><span class="avatar" aria-hidden="true">${esc(t.speaker[0])}</span><div class="turn-body"><strong>${esc(t.speaker)}</strong><p class="fr-line" lang="fr">${esc(t.fr)}</p><p class="pt-line" lang="pt-BR" hidden>${esc(t.pt)}</p></div></div>`).join('')}</div><details class="expand"><summary>Observer les temps dans le dialogue</summary><div class="expand-body" lang="pt-BR">${rich(U.dialogue.commentaryPt)}</div></details><p class="audio-status" id="audio-status" role="status"></p></section>${quiz('dialogue')}`;
 }else if(tab==='reading'){
  ensureSession('reading',U.reading.questionIds);
  body=`<section class="card context-card"><span class="eyebrow">UN RÉCIT À OBSERVER</span><h3>${esc(U.reading.titleFr)}</h3><div class="reader-toolbar">${btn(ic('speaker',15)+' Écouter le texte','speak-reading','button-soft button-compact')}${btn(ic('stop',13)+' Arrêter','stop-audio','button-outline button-compact')}</div><div class="reader" lang="fr">${U.reading.paragraphsFr.map(p=>`<p>${esc(p)}</p>`).join('')}</div><details class="expand"><summary>Traduction en portugais</summary><div class="expand-body" lang="pt-BR">${U.reading.paragraphsPt.map(p=>`<p>${esc(p)}</p>`).join('')}</div></details><details class="expand"><summary>Ce que les temps nous apprennent</summary><div class="expand-body" lang="pt-BR">${rich(U.reading.commentaryPt)}</div></details><p class="audio-status" id="audio-status" role="status"></p></section>${quiz('reading')}`;
 }else body=`<div class="vocab-grid">${U.vocabulary.map(v=>`<section class="vocab-item"><h4 lang="fr">${esc(v.fr)}</h4><p class="muted" lang="pt-BR">${esc(v.pt)}</p><p lang="fr">${esc(v.exampleFr)}</p>${v.usagePt?`<p class="muted" lang="pt-BR">${esc(v.usagePt)}</p>`:''}</section>`).join('')}</div>`;
 return intro('03 · EN CONTEXTE','Le français dans une histoire','Observe como os tempos organizam o diálogo e o relato. Depois, escolha as respostas de acordo com o que os textos realmente dizem.')+tabs+body;
}
function audioControls(action,label){return `<div class="audio-player">${btn(ic('play',17)+' '+label,action,'button-primary button-compact')}${btn(ic('stop',14),'stop-audio','button-outline button-compact','aria-label="Arrêter la lecture"')}<div class="audio-wave" aria-hidden="true">${'<span></span>'.repeat(18)}</div><span class="audio-meta">Voix de synthèse<br>Français · 0,9×</span></div>`;}
function renderMedia(){
 const v=D.videos[0];ensureSession('listening',D.groups.sound.slice(0,1));ensureSession('phonetic',D.groups.sound.slice(1));
 return intro('02 · VOIR & ÉCOUTER','Entendre les formes, comprendre le sens','O vídeo é complementar. O texto e as questões continuam disponíveis sem internet; a voz francesa depende dos recursos do navegador.')+
 `<section class="card video-card"><div class="video-cover" id="video-container"><button class="play-button" data-action="load-video" aria-label="Charger le lecteur YouTube">${ic('play',29)}</button><span>Deux temps.<br>Deux perspectives.<small>Capsule externe · connexion internet</small></span></div><div class="video-description"><span class="tag tag-neutral">VIDÉO PROVISOIRE · FRANÇAIS AUTHENTIQUE</span><h3>${esc(v.title)}</h3><p lang="pt-BR">${esc(v.notePt)}</p><div class="video-links"><button class="text-button" data-action="load-video">${ic('play',14)}Charger la vidéo</button><a class="text-button" href="${esc(v.watchUrl)}" target="_blank" rel="noopener noreferrer">Ouvrir sur YouTube ${ic('external',13)}</a></div><div class="video-note" lang="pt-BR">Ao carregar, você se conecta ao YouTube. Se o player não funcionar neste arquivo local, use “Ouvrir sur YouTube”. Assistir ao vídeo não é requisito para concluir a etapa.</div></div></section>
 <section class="card sound-card"><span class="eyebrow">UNE MÊME ATTENTE, DEUX REGARDS</span><h3>J’attendais… / J’ai attendu…</h3><p lang="fr">${esc(U.listening.goalFr)}</p>${audioControls('speak-listening','Écouter le message')}<p class="audio-status" id="audio-status" role="status">La voix est générée par le navigateur ; aucun microphone n’est utilisé. Certaines voix nécessitent internet.</p><details class="expand" id="listening-transcript"><summary>Transcription · lecture de secours</summary><div class="expand-body"><p lang="fr">${esc(U.listening.stimulusFr)}</p><p lang="pt-BR" class="muted">${esc(U.listening.translationPt)}</p></div></details><p class="micro muted" style="margin-top:12px" lang="pt-BR">Sem voz francesa disponível, abra a transcrição. Nesse caso, faça a atividade como compreensão de leitura.</p></section>${quiz('listening')}
 <section class="card sound-card"><span class="eyebrow">PHONÉTIQUE · REPÉRER LA STRUCTURE</span><h3>${esc(U.pronunciation.titleFr)}</h3><p lang="pt-BR">${esc(U.pronunciation.explanationPt)}</p><div class="samples">${U.pronunciation.samplesFr.map((s,i)=>`<button class="sample-button" data-action="speak-sample" data-sample="${i}" aria-label="Écouter : ${esc(s)}"><span lang="fr">${esc(s)}</span>${ic('speaker',16)}</button>`).join('')}</div><div class="callout info"><div class="callout-title">${ic('info',15)}ÉCOUTEZ AUSSI L’AUXILIAIRE</div><p lang="pt-BR">${esc(U.pronunciation.feedbackPt)}</p></div></section>${quiz('phonetic')}`;
}
function renderExercises(){ensureSession('bank',D.groups.bank);return intro('04 · S’EXERCER','Choisir, vérifier, comprendre.','Estas 20 questões retomam os dez conceitos. Leia a perspectiva indicada no enunciado antes de escolher o tempo verbal.')+`<div class="callout info" style="margin:0 0 19px"><div class="callout-title">${ic('target',16)}VOTRE OBJECTIF</div><p lang="pt-BR">Distinguir o uso do tempo e sua formação. A posição das alternativas muda, mas a explicação sempre se refere ao mesmo conceito.</p></div>${quiz('bank')}`;}
const DRILLS=[{name:'Formes & construction',pt:'Auxiliaires, terminaisons et vérification de la forme.',topics:[0,1,8],icon:'checklist'}, {name:'Cadre & événements',pt:'Cenário, atividade em curso e duração.',topics:[2,4,5],icon:'message'}, {name:'Nuances & récit',pt:'Rotina, balanço, mudança de sentido e relato.',topics:[3,6,7,9],icon:'flag'}];
function renderDrills(){return intro('05 · AUTOMATISER','Un repère. Six occasions de l’utiliser.','Escolha um foco e repita a análise em seis questões. Sem cronômetro, sem penalidade por erro e sem substituir a compreensão pela velocidade.')+`<div class="drill-grid">${DRILLS.map((x,i)=>`<section class="card drill-card"><span class="drill-symbol">${ic(x.icon,21)}</span><h3>${x.name}</h3><p lang="${i===0?'fr':'pt-BR'}">${esc(x.pt)}</p>${btn('Lancer 6 questions '+ic('arrow',14),'drill','button-outline',`data-drill="${i}"`)}</section>`).join('')}</div>${state.sessions.drill?quiz('drill'):`<div class="card empty-state"><span class="empty-icon">${ic('bolt',26)}</span><h3>Choisissez votre terrain d’entraînement.</h3><p lang="pt-BR">As séries usam as questões do banco principal, reunidas por foco. O histórico continua preservado entre as tentativas.</p></div>`}<p class="prototype-note" lang="pt-BR">Concluir uma série conta como prática realizada; não exige acertar tudo. Os erros permanecem acessíveis em “Mes révisions”.</p>`;}
function renderApplication(){
 ensureSession('application',D.groups.application);
 return intro('06 · METTRE EN PRATIQUE','Construire le sens, sans correction externe.','No lugar de redação ou resposta oral avaliada, você vai escolher elementos de uma narrativa e identificar a síntese mais fiel ao texto.')+
 `<div class="application-model"><section class="card context-card"><span class="eyebrow">MODÈLES À CONSULTER</span><h3>Du contexte au résultat</h3><p class="small muted" lang="pt-BR" style="margin-top:11px">Leia os modelos antes de responder. A aplicação mantém as situações da unidade original: o jantar com Ana e Malik, a mudança de local e a queda de luz.</p>${U.applicationModels.map((m,i)=>`<details class="expand" ${i===0?'open':''}><summary>${i+1}. ${esc(m.titleFr)}</summary><div class="expand-body"><p class="reader" lang="fr">${esc(m.modelFr)}</p><details class="expand"><summary>Traduction en portugais</summary><div class="expand-body" lang="pt-BR">${esc(m.modelPt)}</div></details></div></details>`).join('')}<details class="expand"><summary>3. Rappel · le texte sur la panne de lumière</summary><div class="expand-body" lang="fr">${U.reading.paragraphsFr.map(p=>`<p>${esc(p)}</p>`).join('')}</div></details></section></div>${quiz('application')}`;
}
function renderRevisions(){
 const errors=wrongIds(),bookmarks=U.sections.filter(s=>state.bookmarks[s.id]);
 return `<div class="page"><div class="page-heading"><div><span class="eyebrow">MES RÉVISIONS</span><h1 tabindex="-1">Revenir pour mieux comprendre.</h1><p class="lead" lang="pt-BR">Seus últimos erros e as fichas que você marcou para revisar, no mesmo lugar.</p></div>${errors.length?btn('Reprendre '+errors.length+' question'+(errors.length>1?'s':'')+' '+ic('arrow',15),'review-errors','button-primary'):''}</div>
 ${errors.length?`<section class="card">${errors.map(id=>{const q=Q.get(id);return `<div class="error-item"><span class="tag tag-red">Dernier essai · à revoir</span><h4 style="margin-top:10px" lang="fr">${esc(q.instructionFr)}</h4>${q.sentenceFr?`<p lang="fr">${esc(q.sentenceFr)}</p>`:''}<p lang="pt-BR">${rich(q.explanationPt)}</p><button class="text-button" data-action="help" data-topic="${q.helpIndex}" data-from="revisions">${ic('book',14)}Revoir : ${esc(U.sections[q.helpIndex].titleFr)}</button></div>`;}).join('')}</section>`:`<section class="card empty-state"><span class="empty-icon">${ic('check',28)}</span><h3>${metrics().answered?'Aucune erreur en attente.':'Votre carnet de révision est prêt.'}</h3><p lang="pt-BR">${metrics().answered?'As últimas respostas registradas estão corretas. Você ainda pode revisar as fichas marcadas ou iniciar outra série.':'Depois de responder, as questões que precisam de revisão aparecerão aqui. Não é necessário cadastrar uma conta.'}</p>${btn('Aller aux exercices '+ic('arrow',15),'step','button-primary','data-step="exercises"')}</section>`}
 ${state.sessions.review?quiz('review'):''}
 <div style="margin-top:30px"><h2 style="font-size:23px">Mes fiches à revoir <span class="muted">· ${bookmarks.length}</span></h2>${bookmarks.length?`<div class="bookmark-list">${bookmarks.map(s=>`<div class="bookmark-item"><div class="flex items-center gap-3">${ic('star',17)}<h4>${esc(s.titleFr)}</h4></div>${btn('Ouvrir '+ic('arrow',13),'topic','button-outline button-compact',`data-topic="${U.sections.indexOf(s)}"`)}</div>`).join('')}</div>`:'<p class="small muted" style="margin-top:12px" lang="pt-BR">Use a estrela no topo de uma ficha para guardá-la aqui. A marcação é independente do acerto nos exercícios.</p>'}</div></div>`;
}
function renderProgress(){
 const m=metrics(),s=stepStats();
 return `<div class="page"><div class="page-heading"><div><span class="eyebrow">MA PROGRESSION · UNITÉ 19</span><h1 tabindex="-1">Votre chemin devient visible.</h1><p class="lead" lang="pt-BR">Avanço de estudo e resultados são medidas diferentes. Aqui você acompanha os dois.</p></div>${btn('Reprendre l’unité '+ic('arrow',15),'resume','button-primary')}</div>
 <div class="metric-grid"><section class="card metric-card"><span class="small muted">Étapes parcourues</span><div class="metric-value">${m.steps}<small> / 6</small></div><p lang="pt-BR">${m.progress}% do percurso desta unidade.</p></section><section class="card metric-card"><span class="small muted">Questions explorées</span><div class="metric-value">${m.answered}<small> / 46</small></div><p lang="pt-BR">Questões distintas já verificadas.</p></section><section class="card metric-card"><span class="small muted">Réponses justes · dernier essai</span><div class="metric-value">${m.correct}<small> / ${m.answered}</small></div><p lang="pt-BR">Primeiro ensaio: ${m.first} / ${m.answered}. Repetições não somam novas questões.</p></section></div>
 ${m.steps===6?`<div class="callout check-callout" style="margin:0 0 22px"><strong>Unité parcourue · les six étapes sont réalisées.</strong><p lang="pt-BR">${wrongIds().length?`Ainda há ${wrongIds().length} questões para revisar. `:''}A conclusão indica o percurso realizado, não aprovação oficial ou certificação.</p></div>`:''}
 <section class="card" aria-label="Détail des étapes">${STEPS.map((step,i)=>`<div class="progress-step"><div><h4>${s[i].n===s[i].t?'✓ ':''}${step.title}</h4><small>${esc(s[i].note.replace('banco','banque'))}</small></div>${bar(s[i].n,s[i].t,s[i].n===s[i].t)}<span class="step-value">${s[i].n} / ${s[i].t}</span></div>`).join('')}<p class="progress-footer" lang="pt-BR">Cada uma das seis etapas tem o mesmo peso no percentual. A primeira reúne dez leituras declaradas e dez checkpoints respondidos. Vídeo, áudio sintético e acerto integral não são requisitos de conclusão. Os exercícios de escuta podem ser realizados pela transcrição quando não há voz francesa disponível.</p></section>
 <div class="backup-strip"><div><h3>Changer de navigateur sans recommencer.</h3><p lang="pt-BR">Exporte o arquivo JSON, guarde-o em um local seguro e importe-o no outro navegador. A transferência é manual, não uma sincronização em nuvem.</p></div>${btn(ic('save',18)+' Gérer ma sauvegarde','backup','button-primary')}</div>
 ${state.legacy?`<section class="old-progress-note"><strong>Historique 0.2 conservé séparément</strong><p lang="pt-BR">${Object.keys(state.legacy.history).length} bancos com resultados da base anterior e ${Object.keys(state.legacy.drafts).length} rascunhos foram preservados no backup. Eles não são convertidos em respostas individuais ou conclusão fictícia das etapas novas.</p>${state.legacy.history[UID]?`<p>U19 · ancien dernier résultat : <b>${state.legacy.history[UID].last.score} / ${state.legacy.history[UID].last.total}</b> · ${state.legacy.history[UID].attempts} tentative(s).</p>`:''}</section>`:''}
 <div style="margin-top:23px" class="flex items-center justify-between gap-4"><a class="text-button" href="#parcours">${ic('back',14)}Voir toutes les unités</a><button class="text-button" data-action="reset-dialog">Réinitialiser ce pilote</button></div></div>`;
}
function openModal(html){modalFocus=document.activeElement;document.getElementById('modal-content').innerHTML=html;if(!MODAL.open)MODAL.showModal();}
function closeModal(){MODAL.close();pendingImport=null;modalFocus?.focus?.({preventScroll:true});}
function previewUnit(id){const u=UNIT.get(id);if(!u)return;openModal(`<span class="tag tag-neutral">APERÇU · UNITÉ ${u.order}</span><h2 id="modal-title" style="margin-top:15px">${esc(u.titleFr)}</h2><p lang="pt-BR">Esta unidade existe na base recebida, mas ainda não foi integrada ao novo formato. O piloto interativo desta entrega é a U19.</p><h3>Objectifs de la base</h3><ul class="modal-list">${u.objectivesFr.map(t=>`<li lang="fr">${esc(t)}</li>`).join('')}</ul><div class="callout info"><p lang="pt-BR">A sequência do mapa é a original. O ajuste de nível dos conteúdos fora da U19 será tratado na expansão, conforme o esquema do coordenador.</p></div><div class="dialog-actions">${btn('Fermer','close-modal','button-outline')}${btn('Ouvrir le pilote U19 '+ic('arrow',14),'modal-resume','button-primary')}</div>`);}
function backupModal(){openModal(`<h2 id="modal-title">Votre progrès, avec vous.</h2><p lang="pt-BR">O navegador salva o progresso quando o armazenamento está disponível. A cópia JSON permite continuar em outro navegador ou computador.</p><div class="backup-option"><div><h3>Exporter ma progression</h3><p lang="pt-BR">Inclui respostas, fichas, séries em andamento e posição de retomada.</p></div>${btn(ic('download',16)+' Exporter','export','button-primary')}</div><div class="backup-option"><div><h3>Importer une sauvegarde</h3><p lang="pt-BR">Selecione uma cópia JSON. Você verá um resumo antes de confirmar a substituição.</p></div>${btn(ic('upload',16)+' Importer','import','button-outline')}</div>${legacyDetected&&!state.legacy?`<div class="backup-option"><div><h3>Historique 0.2 détecté ici</h3><p lang="pt-BR">Preserve os dados antigos separadamente. Eles não concluem as novas etapas.</p></div>${btn('Examiner','legacy-local','button-outline')}</div>`:''}<div class="callout"><div class="callout-title">${ic('shield',15)}UNE COPIE PERSONNELLE</div><p lang="pt-BR">Guarde a cópia fora da pasta de downloads temporários. Limpar os dados do navegador, usar navegação anônima ou mudar o caminho deste HTML pode afetar o salvamento local. A transferência entre navegadores não é automática.</p></div><p class="small muted" lang="pt-BR" style="margin-top:15px">Compatibilidade: backups deste piloto e da base 0.2. O arquivo de conteúdo do curso não é uma cópia de progresso. Backups antigos podem conter rascunhos pessoais.</p><div class="dialog-actions">${btn('Fermer','close-modal','button-outline')}</div>`);}
function exportProgress(){
 const out={format:'atelier-francais-a2-progress',appId:D.appId,schemaVersion:2,exportedAt:now(),state:state};
 download(`Atelier_A2_progresso_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(out,null,2));toast('Copie JSON préparée. Conservez le fichier pour le prochain navigateur.');
}
function download(name,body){const blob=new Blob([body],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function importRaw(raw){
 if(plain(raw)&&raw.schemaVersion===1){pendingImport={kind:'legacy',data:cleanLegacy(raw)};}
 else{
  if(!plain(raw)||raw.format!=='atelier-francais-a2-progress'||raw.appId!==D.appId||raw.schemaVersion!==2||!iso(raw.exportedAt))throw Error('Ce fichier n’est pas une sauvegarde de progression reconnue. Le contenu du cours et les propositions MCQ ne peuvent pas être importés ici.');
  pendingImport={kind:'pilot',data:validate(raw.state),exportedAt:raw.exportedAt};
 }
 const p=pendingImport,legacy=p.kind==='legacy',count=legacy?Object.keys(p.data.history).length:Object.keys(p.data.answers).length;
 openModal(`<span class="tag ${legacy?'tag-neutral':''}">SAUVEGARDE VALIDÉE · ${legacy?'BASE 0.2':'PILOTE U19'}</span><h2 id="modal-title" style="margin-top:14px">${legacy?'Conserver votre ancien historique ?':'Reprendre depuis cette copie ?'}</h2><div class="import-summary"><div class="import-metric"><b>${count}</b><small>${legacy?'banques avec résultats':'questions explorées'}</small></div><div class="import-metric"><b>${legacy?Object.keys(p.data.drafts).length:U.sections.filter(s=>p.data.marks[s.id]).length}</b><small>${legacy?'brouillons conservés':'fiches étudiées'}</small></div></div><p lang="pt-BR">${legacy?'Os resultados e rascunhos da versão 0.2 serão preservados separadamente. Suas respostas atuais do piloto não serão substituídas. O arquivo original também permanece intacto.':'Ao confirmar, o progresso atual deste piloto será substituído pela cópia selecionada, inclusive a série em andamento. Exporte o estado atual antes de continuar para manter as duas versões.'}</p><div class="dialog-actions">${btn('Annuler','close-modal','button-outline')}${btn('Exporter l’état actuel','export','button-outline')}${btn(legacy?'Conserver l’historique':'Remplacer ma progression','confirm-import','button-primary')}</div>`);
}
function confirmImport(){if(!pendingImport)return;const p=pendingImport;if(p.kind==='legacy')state.legacy=p.data;else state=p.data;stopAudio(false);storageOK=true;storageIssue='';save();const step=state.resume.step,topic=state.resume.topic;closeModal();go(p.kind==='legacy'?'progres':'unite',step,topic);toast(storageOK?'Sauvegarde importée. Votre progression a été restaurée.':'Importée en mémoire. Exportez avant de fermer : stockage indisponible.');}
function about(){openModal(`<h2 id="modal-title">Un guide pour comprendre.</h2><p lang="pt-BR">Piloto funcional da U19 do Atelier français A2 / Projet Renan. O conteúdo deriva da unidade recebida, com reorganização visual e conversões editoriais para múltipla escolha. A revisão pedagógica final do coordenador permanece necessária.</p><h3>Dans cette version</h3><ul class="modal-list"><li>36 unités dans le sommaire ; seule l’unité 19 est interactive dans le nouveau format.</li><li>10 fiches, 16 exemples, 46 questions distinctes, drills et sauvegarde portable.</li><li>Aucun compte, aucune correction par IA ou tuteur, aucune note de prononciation.</li></ul><h3>Documents de référence</h3><p class="small" lang="pt-BR">A2.zip · U19 (19.json) et propositions MCQ_001 ; PROJET RENAN ; SCHÉMA D’APPRENTISSAGE PAR NIVEAUX ; STRUCTURE TYPE D’UNE UNITÉ PÉDAGOGIQUE.</p><h3>Ressources liées à la base</h3>${D.references.map(r=>`<div class="reference"><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)} ${ic('external',11)}</a><small>${esc(r.institution)} · référence héritée de la base, non revalidée dans ce pilote.</small></div>`).join('')}<h3>Vidéo provisoire</h3><div class="reference"><a href="${esc(D.videos[0].sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(D.videos[0].channel)} · ${esc(D.videos[0].title)}</a><small>Source repérée le 28/09/2026. La lecture et l’autorisation d’intégration dépendent de YouTube et du contexte d’ouverture.</small></div><h3>Fonctionnement & confidentialité</h3><p class="small" lang="pt-BR">HTML + Tailwind CSS compilado + JavaScript. O progresso fica no navegador, sem envio para servidor. O Google Fonts fornece a Inter quando há internet; offline, usa-se uma fonte sem serifa do sistema. O YouTube só é conectado quando você carrega o player ou abre o link. A síntese vocal usa as vozes disponíveis no navegador.</p><p class="small muted" style="margin-top:13px">Version ${esc(D.version)} · 28/09/2026.</p><div class="dialog-actions">${btn('Fermer','close-modal','button-outline')}</div>`);}
function stopAudio(show=true){speechToken++;try{window.speechSynthesis?.cancel();}catch(e){}utterances=[];if(show)audioStatus('Lecture arrêtée.');}
function audioStatus(t){const e=document.getElementById('audio-status');if(e)e.textContent=t;else toast(t);announce(t);}
function speak(text,listening=false){
 stopAudio(false);const synth=window.speechSynthesis;
 if(!synth||typeof window.SpeechSynthesisUtterance==='undefined'){audioStatus('Synthèse vocale indisponible. Utilisez le texte comme lecture de secours.');document.getElementById('listening-transcript')?.setAttribute('open','');return;}
 let voices=[];try{voices=synth.getVoices().filter(v=>/^fr([_-]|$)/i.test(v.lang));}catch(e){}
 if(!navigator.onLine)voices=voices.filter(v=>v.localService);
 const v=voices.find(v=>v.localService&&/^fr[-_]FR$/i.test(v.lang))||voices.find(v=>v.localService)||voices.find(v=>/^fr[-_]FR$/i.test(v.lang))||voices[0];
 if(!v){audioStatus('Aucune voix française disponible. Ouvrez la transcription pour travailler en lecture ; vous pouvez réessayer si les voix se chargent.');document.getElementById('listening-transcript')?.setAttribute('open','');return;}
 const token=speechToken;const chunks=(String(text).match(/[^.!?…]+[.!?…]*\s*/g)||[String(text)]).flatMap(x=>x.length<240?[x]:(x.match(/.{1,220}(?:\s|$)|\S+$/g)||[x]));
 utterances=chunks.map(t=>{const u=new SpeechSynthesisUtterance(t);u.voice=v;u.lang=v.lang;u.rate=.9;return u;});
 function play(i){if(token!==speechToken)return;if(i>=utterances.length){audioStatus('Lecture terminée · voix de synthèse.');utterances=[];return;}const u=utterances[i];u.onend=()=>play(i+1);u.onerror=()=>{if(token===speechToken){audioStatus('Lecture audio impossible. Le texte reste disponible.');if(listening){state.listeningMode='text';save();}}};try{synth.speak(u);}catch(e){audioStatus('Lecture impossible. Utilisez le texte.');}}
 if(listening){state.listeningMode='synthesis';save();}audioStatus('Lecture en cours · '+v.name+(v.localService?' · voix locale.':' · voix pouvant nécessiter internet.'));play(0);
}
function loadVideo(){const c=document.getElementById('video-container');if(!c)return;c.className='';c.innerHTML=`<iframe title="${esc(D.videos[0].title)}" src="https://www.youtube-nocookie.com/embed/${D.videos[0].id}?rel=0" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;announce('Lecteur YouTube chargé. Le lien Ouvrir sur YouTube reste disponible si la lecture est bloquée.');}
// All interactive state changes go through user actions and canonical content IDs.
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;
 if(a==='resume')resume();
 else if(a==='go')go(b.dataset.view);
 else if(a==='step')go('unite',b.dataset.step,0);
 else if(a==='topic')go('unite','learn',Number(b.dataset.topic));
 else if(a==='locate')locate(b.dataset.unit);
 else if(a==='preview')previewUnit(b.dataset.unit);
 else if(a==='font'){state.prefs.largeText=!state.prefs.largeText;save();render(true);}
 else if(a==='focus'){state.prefs.focus=!state.prefs.focus;save();render(true);}
 else if(a==='bookmark'){const s=U.sections[Number(b.dataset.topic)];state.bookmarks[s.id]=!state.bookmarks[s.id];save();render(true);toast(state.bookmarks[s.id]?'Fiche ajoutée aux révisions.':'Fiche retirée des révisions.');}
 else if(a==='check')recordAnswer(b.dataset.key);
 else if(a==='next')nextQuestion(b.dataset.key);
 else if(a==='restart'){const key=b.dataset.key,s=state.sessions[key];if(s){newSession(key,s.ids);render(true);MAIN.querySelector(`[data-session="${key}"] legend`)?.focus({preventScroll:true});}}
 else if(a==='help'){returnStep=b.dataset.from||'exercises';go('unite','learn',Number(b.dataset.topic));}
 else if(a==='return-quiz'){const step=returnStep||'exercises';returnStep=null;if(step==='revisions')go('revisions');else go('unite',step,0);}
 else if(a==='context-tab'){stopAudio(false);state.contextTab=b.dataset.tab;save();render(true);}
 else if(a==='translations'){document.querySelectorAll('.pt-line').forEach(p=>p.hidden=!p.hidden);}
 else if(a==='drill'){
  const def=DRILLS[Number(b.dataset.drill)];if(!def)return;
  const pool=D.groups.bank.filter(id=>def.topics.includes(Q.get(id).helpIndex));
  if(pool.length<6){toast('Cette série ne dispose pas encore de six questions.');return;}
  newSession('drill',seedShuffle(pool,Math.floor(Math.random()*2147483645)+1).slice(0,6));render(true);MAIN.querySelector('[data-session="drill"]').scrollIntoView({block:'start',behavior:'smooth'});
 }
 else if(a==='review-errors'){const ids=wrongIds();if(!ids.length)return;newSession('review',ids);render(true);MAIN.querySelector('[data-session="review"]').scrollIntoView({block:'start',behavior:'smooth'});}
 else if(a==='backup')backupModal();
 else if(a==='close-modal')closeModal();
 else if(a==='modal-resume'){closeModal();resume();}
 else if(a==='export')exportProgress();
 else if(a==='import'){const f=document.getElementById('import-file');f.value='';f.click();}
 else if(a==='confirm-import')confirmImport();
 else if(a==='legacy-local'){try{importRaw(JSON.parse(localStorage.getItem(OLD_KEY)));}catch(err){toast(err.message||'Ancienne sauvegarde illisible.');}}
 else if(a==='reset-dialog')openModal(`<h2 id="modal-title">Réinitialiser ce pilote ?</h2><p lang="pt-BR">Esta ação apaga apenas o progresso deste piloto U19 neste navegador, incluindo o histórico antigo anexado à sua cópia. Não altera o arquivo do curso nem o armazenamento original da versão 0.2. Exporte uma cópia antes de confirmar.</p><div class="dialog-actions">${btn('Annuler','close-modal','button-outline')}${btn('Exporter d’abord','export','button-outline')}${btn('Effacer le progrès du pilote','reset-confirm','button-danger')}</div>`);
 else if(a==='reset-confirm'){stopAudio(false);state=fresh();storageOK=true;storageIssue='';save();closeModal();go('parcours');toast('Progression du pilote réinitialisée.');}
 else if(a==='about')about();
 else if(a==='table')openModal(`<h2 id="modal-title">Deux temps, deux perspectives</h2>${comparisonTable()}<div class="dialog-actions">${btn('Fermer','close-modal','button-outline')}</div>`);
 else if(a==='load-video')loadVideo();
 else if(a==='speak-listening')speak(U.listening.stimulusFr,true);
 else if(a==='speak-dialogue')speak(U.dialogue.turns.map(x=>x.fr).join(' '));
 else if(a==='speak-reading')speak(U.reading.paragraphsFr.join(' '));
 else if(a==='speak-example'){const ex=U.examples.find(x=>x.id===b.dataset.example);if(ex)speak(ex.fr);}
 else if(a==='speak-sample')speak(U.pronunciation.samplesFr[Number(b.dataset.sample)]);
 else if(a==='stop-audio')stopAudio();
});
document.addEventListener('input',e=>{if(e.target.id==='unit-search'){searchText=e.target.value;document.getElementById('path-blocks').innerHTML=renderPath();}});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.quiz){const key=t.dataset.quiz,s=state.sessions[key];if(!s||s.finishedAt)return;const id=s.ids[s.index];if(s.submitted[id]||!optionExists(id,t.value))return;s.selected[id]=t.value;save();const check=document.querySelector(`[data-action="check"][data-key="${key}"]`);if(check)check.disabled=false;}
 else if(t.dataset.read){if(!U.sections.some(s=>s.id===t.dataset.read))return;state.marks[t.dataset.read]=t.checked;save();render(true);announce(t.checked?'Lecture de la fiche enregistrée.':'Déclaration de lecture retirée.');}
 else if(t.id==='topic-select')go('unite','learn',Number(t.value));
});
document.getElementById('import-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(f.size>3_000_000){toast('Fichier trop volumineux. Limite : 3 Mo. Aucun changement effectué.');return;}try{const text=await f.text();importRaw(JSON.parse(text));}catch(err){pendingImport=null;toast(err instanceof SyntaxError?'Ce fichier ne contient pas un JSON valide. Aucun changement effectué.':(err.message||'Sauvegarde invalide. Aucun changement effectué.'));}});
MODAL.addEventListener('click',e=>{if(e.target===MODAL){const r=MODAL.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
MODAL.addEventListener('cancel',()=>{pendingImport=null;});
window.addEventListener('hashchange',()=>{if(location.hash==='#main'){MAIN.focus();return;}stopAudio(false);parseRoute();render();});
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){storageOK=false;storageIssue='La progression a changé dans un autre onglet. Exportez cette visite avant de recharger pour éviter de remplacer les modifications de l’autre onglet.';storageUI();}});
window.addEventListener('pagehide',()=>stopAudio(false));
// Progressive enhancement only: file:// works without fetch or a server.
parseRoute();render();storageUI();
})();
