const $=s=>document.querySelector(s),fmt=n=>Math.floor(n).toLocaleString('cs-CZ');
// Hra Stargate: Galaktické velení. Herní data jsou v data.json.
let TY,TK,SYS,LORDS,B,G,R,U;const GAL=[];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildGalaxy(){const R0=rng(2010);
for(let s=0;s<12;s++)for(let i=0;i<5;i++){const p=Math.round(25*Math.pow(1+s,1.9)*(.6+R0()*.8)*(1+i*.1));GAL.push({key:s*5+i,s,i,ty:TK[Math.floor(R0()*5)],npc:s>0&&R0()<.25+s*.045,lord:LORDS[Math.floor(R0()*LORDS.length)],p,loot:[Math.round(p*2.6),Math.round(p*1.8)],name:SYS[s]+' '+'abcde'[i]})}
Object.assign(GAL[2],{ty:'oce',npc:false,name:'Země'})}
// ---- stav ----
const home=()=>({b:{naq:1,tri:1,reak:1},gar:0});
const fresh=()=>({n:400,t:250,pl:{2:home()},cur:2,g:{lab:0,han:0},r:{zbr:0,stit:0,poh:0,kol:0},u:{sg:8,f302:0,dae:0,tel:0},npc:{},fl:[],ca:Date.now()+150000,ts:Date.now()});
let S=JSON.parse(localStorage.getItem('sgc2')||'null')||fresh();
let tab='base',vs=0,sel=null;
const maxPl=()=>2+S.r.kol,nPl=()=>Object.keys(S.pl).length;
const cost=(d,l)=>d.c.map(v=>Math.ceil(v*Math.pow(d.f,l))),ok=c=>S.n>=c[0]&&S.t>=c[1],pay=c=>{S.n-=c[0];S.t-=c[1]};
const pw=u=>Object.keys(u).reduce((a,k)=>a+u[k]*U[k].atk,0)*(1+.1*S.r.zbr);
const shield=()=>Math.max(.2,1-.08*S.r.stit);
function pr(k){const b=S.pl[k].b,m=TY[GAL[k].ty].m,prod=3*b.reak*Math.pow(1.1,b.reak),use=2*(b.naq+b.tri),e=use?Math.min(1,prod/use):1;return{e,n:1.4*b.naq*Math.pow(1.12,b.naq)*e*m[0],t:.9*b.tri*Math.pow(1.12,b.tri)*e*m[1]}}
function rates(){let n=0,t=0;for(const k in S.pl){const p=pr(k);n+=p.n;t+=p.t}return{n,t}}
function log(m,c){const d=document.createElement('div');d.className=c||'';d.textContent=new Date().toLocaleTimeString('cs-CZ')+'  '+m;$('#log').prepend(d)}
const travel=k=>(8+6*Math.abs(GAL[k].s-GAL[S.cur].s))*Math.pow(.85,S.r.poh);
// ---- hlavní smyčka ----
function tick(){const now=Date.now(),dt=Math.min((now-S.ts)/1000,86400);S.ts=now;const r=rates();S.n+=r.n*dt;S.t+=r.t*dt;
 S.fl=S.fl.filter(f=>{if(f.ph==0&&now>=f.arr){arrive(f);f.ph=1}if(f.ph==1&&now>=f.back){for(const k in f.u)S.u[k]+=f.u[k];log('Flotila se vrátila domů.');return false}return true});
 if(now>=S.ca)counter();draw()}
function launch(t,k){
 const g=GAL[k];let u;
 if(t=='col'){if(S.u.tel<1||nPl()+S.fl.filter(f=>f.t=='col').length>=maxPl())return;u={tel:1}}
 else{const a=pw(S.u);if(a<=0||(t=='occ'&&(a<g.p*(S.npc[k]||1)*1.3||S.u.sg<10||nPl()>=maxPl())))return;u={sg:S.u.sg,f302:S.u.f302,dae:S.u.dae}}
 for(const x in u)S.u[x]-=u[x];
 const T=travel(k)*1000,now=Date.now();S.fl.push({t,k,u,ph:0,arr:now+T,back:now+2*T});
 log(({col:'Kolonizační loď',atk:'Útočná flotila',occ:'Invazní flotila'})[t]+' míří na '+g.name+' (cesta '+Math.round(T/1000)+' s).');save();draw()}
function arrive(f){const g=GAL[f.k];
 if(f.t=='col'){if(S.pl[f.k]||nPl()>=maxPl()){log('Kolonizace '+g.name+' selhala, loď se vrací.','l');return}
  S.pl[f.k]=home();f.u.tel=0;log('Nová kolonie: '+g.name+'. Osadníci postavili základní doly.','w');return}
 if(S.pl[f.k])return;
 const a=pw(f.u),d=g.p*(S.npc[f.k]||1),win=a>=d,sh=shield(),loss=win?Math.min(.9,.5*d/a*sh):Math.min(.95,.8*sh);
 for(const k in f.u)f.u[k]-=Math.round(f.u[k]*loss);
 let msg;
 if(win){S.n+=g.loot[0];S.t+=g.loot[1];msg=`Vítězství nad ${g.lord}em na ${g.name}. Kořist ${fmt(g.loot[0])} naquadah, ${fmt(g.loot[1])} trinium. Ztráty ${Math.round(loss*100)} %.`;
  if(f.t=='occ'&&f.u.sg>0&&nPl()<maxPl()){const gar=Math.min(10,f.u.sg);f.u.sg-=gar;S.pl[f.k]={...home(),gar};msg+=` Planeta je obsazena, posádka ${gar} SG.`}else S.npc[f.k]=(S.npc[f.k]||1)*1.1}
 else msg=`Porážka na ${g.name}. Síla ${fmt(a)} nestačila na obranu ${fmt(d)}. Ztráty ${Math.round(loss*100)} %.`;
 log(msg,win?'w':'l');report('Bitva o '+g.name,win,1-loss,win?0:Math.max(.1,1-.5*a/d),msg)}
function report(title,win,ae,de,msg){const o=$('#battle');if(!o.hidden)return;o.hidden=false;$('#b-title').textContent=title;$('#b-res').textContent=msg;$('#b-res').className=win?'w':'l';
 $('#b-a').style.width='100%';$('#b-d').style.width='100%';requestAnimationFrame(()=>requestAnimationFrame(()=>{$('#b-a').style.width=ae*100+'%';$('#b-d').style.width=de*100+'%'}));$('#b-close').focus()}
function counter(){S.ca=Date.now()+(120+Math.random()*90)*1000;const ks=Object.keys(S.pl).filter(k=>k!=2);if(!ks.length)return;
 const k=ks[Math.floor(Math.random()*ks.length)],pl=S.pl[k],g=GAL[k],e=Math.max(20,g.p*.25)*(S.npc[k]||1),df=(30+pl.gar*12)*(1+.1*S.r.zbr)*(1+.1*S.r.stit);
 if(df>=e){pl.gar=Math.round(pl.gar*.85);log(`Goa'uldi zaútočili na ${g.name} silou ${fmt(e)}. Obrana vydržela.`,'w')}
 else{delete S.pl[k];if(S.cur==k)S.cur=2;log(`Planeta ${g.name} padla (síla útoku ${fmt(e)}). Příště pošli větší posádku.`,'l')}save()}
// ---- vykreslení ----
function row(k,d,l,c,t,off,extra){return `<div class="row"><div><h2>${d.n}${l!==null?' (úroveň '+l+')':''}</h2><p>${d.d}</p><span class="cost">Cena: ${fmt(c[0])} naquadah, ${fmt(c[1])} trinium${extra||''}</span></div><button class="go" data-k="${k}" ${ok(c)&&!off?'':'disabled'}>${t}</button></div>`}
function planetSVG(){let o=`<svg viewBox="0 0 620 190" class="map" role="group" aria-label="Systém ${SYS[vs]}"><defs>`+TK.map(t=>`<radialGradient id="g-${t}" cx=".35" cy=".3"><stop offset="0" stop-color="${TY[t].c[0]}"/><stop offset="1" stop-color="${TY[t].c[1]}"/></radialGradient>`).join('')+`<radialGradient id="sun"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffb43c"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient></defs><circle cx="10" cy="90" r="80" fill="url(#sun)"/><line x1="40" y1="90" x2="610" y2="90" stroke="#3b4652" stroke-dasharray="3 7"/>`;
 for(let i=0;i<5;i++){const g=GAL[vs*5+i],x=135+i*108,mine=S.pl[g.key],st=mine?'#c9a24b':g.npc?'#d9604a':'none';
  o+=`<g class="pl" data-pl="${g.key}" tabindex="0" role="button" aria-label="${g.name}"><circle cx="${x}" cy="90" r="42" fill="transparent"/><circle cx="${x}" cy="90" r="27" fill="url(#g-${g.ty})" stroke="${st}" stroke-width="3" class="${g.npc&&!mine?'npc':''}"/><circle cx="${x+9}" cy="99" r="27" fill="#000" opacity=".0"/>${sel==g.key?`<circle cx="${x}" cy="90" r="36" fill="none" stroke="#fff" stroke-dasharray="4 4"/>`:''}<text x="${x}" y="143">${g.name}</text><text x="${x}" y="160" style="fill:${mine?'#e8cf8a':g.npc?'#ff9a85':'#8b98a5'}">${mine?'tvoje':g.npc?g.lord:'volná'}</text></g>`}
 return o+'</svg>'}
function selHTML(){if(sel==null)return '<p>Klepni na planetu v mapě.</p>';
 const k=sel,g=GAL[k],mine=S.pl[k],t=TY[g.ty],T=Math.round(travel(k));
 let h=`<h2>${g.name} ${mine?'<span class="tag">tvoje</span>':''}</h2><p>${t.n} planeta. Těžba: naquadah ×${t.m[0]}, trinium ×${t.m[1]}. Cesta z aktuální planety: ${T} s.</p>`;
 if(mine){h+=`<p>Posádka: ${mine.gar} SG.</p><button class="go" data-k="s:${k}">Spravovat</button>`+(k!=2?`<button class="go" data-k="g:${k}" ${S.u.sg>=5?'':'disabled'}>Posílit +5 SG</button>`:'')}
 else if(g.npc){const d=Math.round(g.p*(S.npc[k]||1)),a=pw(S.u);h+=`<p>Pod vládou System Lorda <b>${g.lord}a</b>. Obrana ${fmt(d)}, kořist ${fmt(g.loot[0])} naquadah a ${fmt(g.loot[1])} trinium. Tvoje síla ${fmt(a)}.</p><button class="go" data-k="m:${k}" ${a>0?'':'disabled'}>Zaútočit</button><button class="go" data-k="c:${k}" ${a>=d*1.3&&S.u.sg>=10&&nPl()<maxPl()?'':'disabled'}>Obsadit</button><p>Obsazení: síla alespoň 130 % obrany, 10 týmů SG jako posádka a volné místo pro kolonii (${nPl()}/${maxPl()}).</p>`}
 else h+=`<p>Volná planeta. Kolonizace spotřebuje jednu loď Tel'tak (máš ${S.u.tel}). Kolonie ${nPl()}/${maxPl()}.</p><button class="go" data-k="k:${k}" ${S.u.tel>0&&nPl()+S.fl.filter(f=>f.t=='col').length<maxPl()?'':'disabled'}>Kolonizovat</button>`;
 return h}
function build(){let h='';
 if(tab=='base'){const p=S.pl[S.cur],g=GAL[S.cur],pp=pr(S.cur);
  h=`<div class="strip">`+Object.keys(S.pl).map(k=>`<button class="chip ${k==S.cur?'act':''}" data-k="p:${k}">${GAL[k].name}</button>`).join('')+`</div><p>${TY[g.ty].n} planeta, těžba +${pp.n.toFixed(1)} naquadah/s a +${pp.t.toFixed(1)} trinium/s.</p>`
   +Object.keys(B).map(k=>row('b:'+k,B[k],p.b[k],cost(B[k],p.b[k]),p.b[k]?'Vylepšit':'Postavit')).join('')+(pp.e<1?`<p class="bad">Nedostatek energie, těžba běží na ${Math.round(pp.e*100)} %. Vylepši reaktor.</p>`:'')
   +`<h2 style="margin-top:14px">Velitelství</h2>`+Object.keys(G).map(k=>row('q:'+k,G[k],S.g[k],cost(G[k],S.g[k]),S.g[k]?'Vylepšit':'Postavit')).join('')}
 else if(tab=='lab')h=S.g.lab?Object.keys(R).map(k=>row('r:'+k,R[k],S.r[k],cost(R[k],S.r[k]),'Zkoumat')).join(''):'<p>Nejdřív postav Laboratoř na záložce Základna.</p>';
 else if(tab=='hangar')h=Object.keys(U).map(k=>row('u:'+k,U[k],null,U[k].c,S.g.han<U[k].need?'Hangár '+U[k].need:'Vyrobit',S.g.han<U[k].need,` · Máš: ${S.u[k]}`)).join('');
 else{const now=Date.now();
  h=`<div class="strip"><button class="chip" data-v="${(vs+11)%12}" aria-label="Předchozí systém">‹</button><b>Systém ${SYS[vs]}</b><button class="chip" data-v="${(vs+1)%12}" aria-label="Další systém">›</button>`+SYS.map((s,i)=>`<button class="chip ${i==vs?'act':''}" data-v="${i}">${i+1}</button>`).join('')+`</div>`+`<div class="mapwrap">${planetSVG()}</div><div class="strip">`+[0,1,2,3,4].map(i=>{const g=GAL[vs*5+i];return `<button class="chip ${sel==g.key?'act':''}" data-pl="${g.key}">${g.name}</button>`}).join('')+`</div><div id="sel">${selHTML()}</div>`
   +(S.fl.length?`<h2 style="margin-top:12px">Flotily na cestě</h2>`+S.fl.map(f=>`<p>${({col:'Kolonizační loď',atk:'Útok',occ:'Invaze'})[f.t]} na ${GAL[f.k].name}: ${f.ph?'návrat':'let'} ještě ${Math.max(0,Math.ceil(((f.ph?f.back:f.arr)-now)/1000))} s</p>`).join(''):'')}return h}
let last=null;
function render(){const h=build();if(h===last)return;last=h;const el=$('#tab'),w=el.querySelector('.mapwrap'),x=w?w.scrollLeft:0;el.innerHTML=h;const w2=el.querySelector('.mapwrap');if(w2)w2.scrollLeft=x}
function draw(){const r=rates();$('#r-n').textContent=fmt(S.n);$('#r-t').textContent=fmt(S.t);$('#p-n').textContent='+'+r.n.toFixed(1)+'/s';$('#p-t').textContent='+'+r.t.toFixed(1)+'/s';
 $('#r-p').textContent=nPl()+' / '+maxPl();$('#p-p').textContent='flotily: '+S.fl.length;$('#gate').classList.toggle('open',S.fl.length>0);
 render()}
function setTab(t){tab=t;last=null;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('act',b.dataset.tab==t));render()}
// ---- ovládání ----
document.addEventListener('click',e=>{
 const n=e.target.closest('nav button');if(n)return setTab(n.dataset.tab);
 const v=e.target.closest('[data-v]');if(v){vs=+v.dataset.v;return render()}
 const p=e.target.closest('[data-pl]');if(p){sel=+p.dataset.pl;return render()}
 const b=e.target.closest('[data-k]');if(!b)return;const [t,k]=b.dataset.k.split(':');
 if(t=='m')return launch('atk',+k);if(t=='c')return launch('occ',+k);if(t=='k')return launch('col',+k);
 if(t=='p'){S.cur=+k;return render()}if(t=='s'){S.cur=+k;return setTab('base')}
 if(t=='g'){if(S.u.sg>=5&&S.pl[k]){S.u.sg-=5;S.pl[k].gar+=5;log('Posádka '+GAL[k].name+' posílena o 5 SG.');save();render()}return}
 if(t=='u'){const d=U[k];if(!ok(d.c)||S.g.han<d.need)return;pay(d.c);S.u[k]++;log('Vyrobeno: '+d.n)}
 else{const o=t=='b'?S.pl[S.cur].b:t=='q'?S.g:S.r,d=({b:B,q:G,r:R})[t][k],c=cost(d,o[k]);if(!ok(c))return;pay(c);o[k]++;log(d.n+' na úrovni '+o[k]+'.')}
 save();draw()});
document.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target.matches&&e.target.matches('.pl')){e.preventDefault();sel=+e.target.dataset.pl;render()}});
$('#b-close').onclick=()=>{$('#battle').hidden=true};
$('#reset').onclick=()=>{if(confirm('Opravdu smazat veškerý postup?')){S=fresh();sel=null;save();$('#log').innerHTML='';draw()}};
function save(){try{localStorage.setItem('sgc2',JSON.stringify(S))}catch(e){}}
// ---- grafika: brána a hvězdy ----
(()=>{let g='';for(let i=0;i<39;i++){const a=i/39*2*Math.PI,s=Math.sin(a),c=Math.cos(a);g+=`<path d="M${200+147*s} ${200-147*c}L${200+176*s} ${200-176*c}"/><circle cx="${200+162*s}" cy="${200-162*c}" r="3" fill="#c9a24b" stroke="none"/>`}$('#glyphs').innerHTML=g;
 let c='';for(let i=0;i<9;i++){const a=(i*40+200)*Math.PI/180;c+=`<g transform="translate(${200+183*Math.sin(a)} ${200-183*Math.cos(a)}) rotate(${i*40+200})"><path class="chev" d="M-17 -15L17 -15L10 15L-10 15Z"/></g>`}$('#chevs').innerHTML=c;
 const cv=$('#stars'),x=cv.getContext('2d');function paint(){cv.width=innerWidth;cv.height=innerHeight;const r=rng(7);
  [[.2,.15,'#1d3a5c'],[.8,.7,'#3a2a14'],[.55,.4,'#1a2a3a']].forEach(([a,b,col])=>{const gr=x.createRadialGradient(a*cv.width,b*cv.height,0,a*cv.width,b*cv.height,Math.max(cv.width,cv.height)*.45);gr.addColorStop(0,col+'aa');gr.addColorStop(1,'#0b0e1200');x.fillStyle=gr;x.fillRect(0,0,cv.width,cv.height)});
  for(let i=0;i<260;i++){x.fillStyle=`rgba(255,255,255,${.2+r()*.7})`;x.fillRect(r()*cv.width,r()*cv.height,r()<.1?2:1,r()<.1?2:1)}}
 paint();addEventListener('resize',paint)})();
async function boot(){
 try{const r=await fetch('data.json');if(!r.ok)throw new Error(r.status);({TY,SYS,LORDS,B,G,R,U}=await r.json())}
 catch(e){$('#tab').textContent='Nepodařilo se načíst data.json. Hru spusť přes server (npm start), ne otevřením souboru.';return}
 TK=Object.keys(TY);buildGalaxy();tick();setInterval(tick,1000);setInterval(save,5000);
}
boot();
