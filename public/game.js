// Stargate: Galaktické velení. Herní data jsou v data.json.
const $=s=>document.querySelector(s),fmt=n=>Math.floor(n).toLocaleString('cs-CZ');
let TY,TK,SYS,LORDS,B,G,R,UN,RACES,FAC=[];const GAL=[],ROLES=['inf','elite','ftr','crs','flg','col'],ATK=['inf','elite','ftr','crs','flg'];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildGalaxy(){const r=rng(2010);for(let s=0;s<12;s++)for(let i=0;i<5;i++){const p=Math.round(25*Math.pow(1+s,1.9)*(.6+r()*.8)*(1+i*.1));GAL.push({key:s*5+i,s,i,ty:TK[Math.floor(r()*5)],npc:s>0&&r()<.25+s*.045,lord:LORDS[Math.floor(r()*LORDS.length)],p,loot:[Math.round(p*2.6),Math.round(p*1.8)],name:SYS[s]+' '+'abcde'[i]})}Object.assign(GAL[2],{ty:'oce',npc:false,name:'Domovský svět'})}
// ---- stav ----
const home=()=>({b:{naq:1,tri:1,reak:1,def:0,shd:0},gar:0,name:''});
const fresh=()=>({race:null,cmd:'Velitel',n:500,t:300,pl:{2:home()},cur:2,g:{lab:0,han:0,kas:1,dip:0},r:{zbr:0,stit:0,poh:0,kol:0,ener:0,tez:0,zat:0,mat:0,obr:0},u:{inf:8,elite:0,ftr:0,crs:0,flg:0,col:0},npc:{},fl:[],co:[],start:Date.now(),ca:Date.now()+150000,ts:Date.now()});
let S=JSON.parse(localStorage.getItem('sgc3')||'null')||fresh(),tab='over',vs=0,sel=null,last=null;
const maxPl=()=>2+S.r.kol,nPl=()=>Object.keys(S.pl).length,pn=k=>(S.pl[k]&&S.pl[k].name)||GAL[k].name;
const eff=k=>{let m=RACES[S.race].eff[k]||1;S.co.forEach(a=>m*=RACES[a].ally[k]||1);return m};
const cost=(d,l,m)=>d.c.map(v=>Math.ceil(v*Math.pow(d.f,l)*(m||1))),ok=c=>S.n>=c[0]&&S.t>=c[1],pay=c=>{S.n-=c[0];S.t-=c[1]};
const reqOK=q=>!q||(Object.entries(q.g||{}).every(([k,v])=>S.g[k]>=v)&&Object.entries(q.r||{}).every(([k,v])=>S.r[k]>=v));
const reqTx=q=>[...Object.entries(q.g||{}).map(([k,v])=>G[k].n+' '+v),...Object.entries(q.r||{}).map(([k,v])=>R[k].n+' '+v)].join(', ');
const uName=r=>RACES[S.race].u[ROLES.indexOf(r)],uCost=r=>UN[r].c.map(v=>Math.ceil(v*(r=='inf'||r=='elite'?eff('ucost'):1)));
const pw=u=>ROLES.reduce((a,r)=>a+(u[r]||0)*UN[r].atk*(r=='inf'||r=='elite'?eff('inf'):1),0)*(1+.1*S.r.zbr)*eff('atk');
const shield=()=>Math.max(.2,1-.08*S.r.stit);
const dfn=k=>{const p=S.pl[k];return(30+p.gar*12+p.b.def*25)*(1+.15*p.b.shd)*(1+.1*S.r.zbr)*(1+.1*S.r.stit)*(1+.1*S.r.obr)*eff('def')};
function pr(k){const b=S.pl[k].b,m=TY[GAL[k].ty].m,prod=3*b.reak*Math.pow(1.1,b.reak)*(1+.1*S.r.ener),use=2*(b.naq+b.tri),e=use?Math.min(1,prod/use):1,f=eff('prod')*(1+.08*S.r.tez);return{e,n:1.4*b.naq*Math.pow(1.12,b.naq)*e*m[0]*f,t:.9*b.tri*Math.pow(1.12,b.tri)*e*m[1]*f}}
function rates(){let n=0,t=0;for(const k in S.pl){const p=pr(k);n+=p.n;t+=p.t}return{n,t}}
function log(m,c){const d=document.createElement('div');d.className=c||'';d.textContent=new Date().toLocaleTimeString('cs-CZ')+'  '+m;$('#log').prepend(d)}
const travel=k=>(8+6*Math.abs(GAL[k].s-GAL[S.cur].s))*Math.pow(.85,S.r.poh);
// ---- žebříček ----
function mkFac(){const r=rng(99);FAC=[...Object.keys(RACES).filter(x=>x!=S.race).map(id=>({id,n:RACES[id].n+' (AI)',k:'r',b:800+r()*700,g:60+r()*60})),...LORDS.map(n=>({id:n,n:n,k:'l',b:500+r()*600,g:30+r()*60}))]}
const hrs=()=>(Date.now()-S.start)/3.6e6;
const fs=f=>Math.round(f.b+f.g*hrs()+(f.k=='l'?GAL.filter(g=>g.npc&&g.lord==f.id&&!S.pl[g.key]).length*120:0));
const sum=o=>Object.values(o).reduce((a,v)=>a+v,0);
const myScore=()=>Math.round(nPl()*150+Object.values(S.pl).reduce((a,p)=>a+sum(p.b),0)*12+sum(S.g)*20+sum(S.r)*25+pw(S.u)/4);
const board=()=>[{n:S.cmd+' ('+RACES[S.race].n+')',s:myScore(),me:1},...FAC.map(f=>({n:f.n,s:fs(f),ally:f.k=='r'&&S.co.includes(f.id)}))].sort((a,b)=>b.s-a.s);
// ---- tick, flotily, bitvy ----
function tick(){if(!S.race)return;const now=Date.now(),dt=Math.min((now-S.ts)/1000,86400);S.ts=now;const r=rates();S.n+=r.n*dt;S.t+=r.t*dt;
 S.fl=S.fl.filter(f=>{if(f.ph==0&&now>=f.arr){arrive(f);f.ph=1}if(f.ph==1&&now>=f.back){for(const k in f.u)S.u[k]+=f.u[k];log('Flotila se vrátila domů.');return false}return true});
 if(now>=S.ca)counter();draw()}
function launch(t,k){const g=GAL[k];let u={};
 if(t=='col'){if(S.u.col<1||nPl()+S.fl.filter(f=>f.t=='col').length>=maxPl())return;u={col:1}}
 else{ATK.forEach(r=>u[r]=S.u[r]);const a=pw(u);if(a<=0||(t=='occ'&&(a<g.p*(S.npc[k]||1)*1.3||S.u.inf<10||nPl()>=maxPl())))return}
 for(const x in u)S.u[x]-=u[x];
 const T=travel(k)*1000,now=Date.now();S.fl.push({t,k,u,ph:0,arr:now+T,back:now+2*T});
 log(({col:'Kolonizační loď',atk:'Útočná flotila',occ:'Invazní flotila'})[t]+' míří na '+g.name+' (cesta '+Math.round(T/1000)+' s).');save();draw()}
function arrive(f){const g=GAL[f.k];
 if(f.t=='col'){if(S.pl[f.k]||nPl()>=maxPl()){log('Kolonizace '+g.name+' selhala, loď se vrací.','l');return}S.pl[f.k]=home();f.u.col=0;log('Nová kolonie: '+g.name+'. Osadníci postavili základní doly.','w');return}
 if(S.pl[f.k])return;
 const a=pw(f.u),d=g.p*(S.npc[f.k]||1),win=a>=d,loss=win?Math.min(.9,.5*d/a*shield()):Math.min(.95,.8*shield());
 for(const k in f.u)f.u[k]-=Math.round(f.u[k]*loss);
 let msg;
 if(win){S.n+=g.loot[0];S.t+=g.loot[1];msg=`Vítězství nad ${g.lord} na ${g.name}. Kořist ${fmt(g.loot[0])} naquadah, ${fmt(g.loot[1])} trinium. Ztráty ${Math.round(loss*100)} %.`;
  if(f.t=='occ'&&f.u.inf>0&&nPl()<maxPl()){const gar=Math.min(10,f.u.inf);f.u.inf-=gar;S.pl[f.k]={...home(),gar};msg+=` Planeta je obsazena, posádka ${gar}.`}else S.npc[f.k]=(S.npc[f.k]||1)*1.1}
 else msg=`Porážka na ${g.name}. Síla ${fmt(a)} nestačila na obranu ${fmt(d)}. Ztráty ${Math.round(loss*100)} %.`;
 log(msg,win?'w':'l');report('Bitva o '+g.name,win,1-loss,win?0:Math.max(.1,1-.5*a/d),msg)}
function report(title,win,ae,de,msg){const o=$('#battle');if(!o.hidden)return;o.hidden=false;$('#b-title').textContent=title;$('#b-res').textContent=msg;$('#b-res').className=win?'w':'l';
 $('#b-a').style.width='100%';$('#b-d').style.width='100%';requestAnimationFrame(()=>requestAnimationFrame(()=>{$('#b-a').style.width=ae*100+'%';$('#b-d').style.width=de*100+'%'}));$('#b-close').focus()}
function counter(){S.ca=Date.now()+(120+Math.random()*90)*1000;const ks=Object.keys(S.pl).filter(k=>k!=2);if(!ks.length)return;
 const k=ks[Math.floor(Math.random()*ks.length)],p=S.pl[k],e=Math.max(20,GAL[k].p*.25)*(S.npc[k]||1),df=dfn(k);
 if(df>=e){p.gar=Math.round(p.gar*.85);log(`Goa'uldi zaútočili na ${pn(k)} silou ${fmt(e)}. Obrana vydržela.`,'w')}
 else{log(`Planeta ${pn(k)} padla (útok ${fmt(e)} proti obraně ${fmt(df)}). Posil obranu nebo štít.`,'l');delete S.pl[k];if(S.cur==k)S.cur=2}save()}
// ---- vykreslení ----
function row(key,d,l,c,t,off,extra,req){const rq=reqOK(req),can=ok(c)&&!off&&rq;return `<div class="row"><div><h3>${d.n}${l!==null?` <span class="lv">úr. ${l}</span>`:''}</h3><p>${d.d}</p><span class="cost"><i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}${extra||''}</span>${rq?'':`<p class="bad">Vyžaduje: ${reqTx(req)}</p>`}</div><button class="go" data-k="${key}" ${can?'':'disabled'}>${t}</button></div>`}
function art(g,x,Rd){const r=rng(g.key*7+3);let o=`<clipPath id="cp${g.key}"><circle cx="${x}" cy="90" r="${Rd}"/></clipPath><g clip-path="url(#cp${g.key})"><circle cx="${x}" cy="90" r="${Rd}" fill="url(#g-${g.ty})"/>`;
 for(let i=0;i<5;i++){const cx=x+(r()-.5)*Rd*1.6,cy=90+(r()-.5)*Rd*1.6;o+=g.ty=='des'||g.ty=='vol'?`<circle cx="${cx}" cy="${cy}" r="${3+r()*6}" fill="#000" opacity=".18"/>`:`<ellipse cx="${cx}" cy="${cy}" rx="${8+r()*12}" ry="${2+r()*3}" fill="#fff" opacity=".3"/>`}
 if(g.ty=='vol')o+=`<path d="M${x-Rd} 94l${Rd*.7} -8l${Rd*.5} 10l${Rd*.8} -6" stroke="#ffb040" stroke-width="2" fill="none" opacity=".8"/>`;
 return o+`<circle cx="${x}" cy="90" r="${Rd}" fill="url(#shade)"/></g><circle cx="${x}" cy="90" r="${Rd+3}" fill="none" stroke="${TY[g.ty].c[0]}" stroke-opacity=".35" stroke-width="3"/>`}
function planetSVG(){let o=`<svg viewBox="0 0 620 190" class="map" role="group" aria-label="Systém ${SYS[vs]}"><defs>`+TK.map(t=>`<radialGradient id="g-${t}" cx=".35" cy=".3"><stop offset="0" stop-color="${TY[t].c[0]}"/><stop offset="1" stop-color="${TY[t].c[1]}"/></radialGradient>`).join('')+`<radialGradient id="shade" cx=".3" cy=".3" r=".85"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient><radialGradient id="sun"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffb43c"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient></defs><circle cx="10" cy="90" r="85" fill="url(#sun)"/><line x1="40" y1="90" x2="610" y2="90" stroke="#3b4652" stroke-dasharray="3 7"/>`;
 for(let i=0;i<5;i++){const g=GAL[vs*5+i],x=135+i*108,mine=S.pl[g.key],st=mine?'#e8cf8a':g.npc?'#d9604a':'none';
  o+=`<g class="pl" data-pl="${g.key}" tabindex="0" role="button" aria-label="${pn(g.key)}"><circle cx="${x}" cy="90" r="42" fill="transparent"/>${art(g,x,27)}<circle cx="${x}" cy="90" r="33" fill="none" stroke="${st}" stroke-width="2.5" class="${g.npc&&!mine?'npc':''}"/>${sel==g.key?`<circle cx="${x}" cy="90" r="40" fill="none" stroke="#fff" stroke-dasharray="4 4"/>`:''}<text x="${x}" y="143">${pn(g.key)}</text><text x="${x}" y="160" style="fill:${mine?'#e8cf8a':g.npc?'#ff9a85':'#8b98a5'}">${mine?'tvoje':g.npc?g.lord:'volná'}</text></g>`}
 return o+'</svg>'}
function selHTML(){if(sel==null)return '<p>Klepni na planetu v mapě.</p>';
 const k=sel,g=GAL[k],mine=S.pl[k],t=TY[g.ty],T=Math.round(travel(k));
 let h=`<h3>${pn(k)} ${mine?'<span class="tag">tvoje</span>':''}</h3><p>${t.n} planeta. Těžba: naquadah ×${t.m[0]}, trinium ×${t.m[1]}. Cesta z aktuální planety ${T} s.</p>`;
 if(mine)h+=`<p>Posádka ${mine.gar}, obrana ${fmt(dfn(k))}.</p><button class="go" data-k="s:${k}">Spravovat</button><button class="go" data-k="n:${k}">Přejmenovat</button>`+(k!=2?`<button class="go" data-k="g:${k}" ${S.u.inf>=5?'':'disabled'}>Posílit +5</button>`:'');
 else if(g.npc){const d=Math.round(g.p*(S.npc[k]||1)),u={};ATK.forEach(r=>u[r]=S.u[r]);const a=pw(u);h+=`<p>Vládne tu <b>${g.lord}</b>. Obrana ${fmt(d)}, kořist ${fmt(g.loot[0])} naquadah a ${fmt(g.loot[1])} trinium. Tvoje síla ${fmt(a)}.</p><button class="go" data-k="m:${k}" ${a>0?'':'disabled'}>Zaútočit</button><button class="go" data-k="c:${k}" ${a>=d*1.3&&S.u.inf>=10&&nPl()<maxPl()?'':'disabled'}>Obsadit</button><p>Obsazení: síla ≥ 130 % obrany, 10 kusů pěchoty jako posádka a volné místo pro kolonii (${nPl()}/${maxPl()}).</p>`}
 else h+=`<p>Volná planeta. Kolonizace spotřebuje jednu loď „${uName('col')}“ (máš ${S.u.col}). Kolonie ${nPl()}/${maxPl()}.</p><button class="go" data-k="k:${k}" ${S.u.col>0&&nPl()+S.fl.filter(f=>f.t=='col').length<maxPl()?'':'disabled'}>Kolonizovat</button>`;
 return h}
function tOver(){const r=rates(),bd=board(),rank=bd.findIndex(x=>x.me)+1,u={};ATK.forEach(x=>u[x]=S.u[x]);
 return `<div class="stats"><div><small>Planety</small><b>${nPl()} / ${maxPl()}</b></div><div><small>Těžba</small><b>${r.n.toFixed(1)} / ${r.t.toFixed(1)} /s</b></div><div><small>Síla flotily</small><b>${fmt(pw(u))}</b></div><div><small>Pořadí</small><b>${rank}. z ${bd.length}</b></div></div><h2>Tvoje planety</h2>`+
 Object.keys(S.pl).map(k=>{const p=S.pl[k],q=pr(k),g=GAL[k];return `<div class="card"><div class="ph"><span class="dot" style="background:radial-gradient(circle at 35% 30%,${TY[g.ty].c[0]},${TY[g.ty].c[1]})"></span><div><h3>${pn(k)} ${k==2?'<span class="tag">hlavní</span>':''}</h3><p>${TY[g.ty].n} · ${SYS[g.s]}</p></div></div><p class="cost"><i class="gem n"></i>+${q.n.toFixed(1)}/s <i class="gem t"></i>+${q.t.toFixed(1)}/s · Obrana ${fmt(dfn(k))} · Posádka ${p.gar}</p><p>Doly ${p.b.naq}/${p.b.tri} · Reaktor ${p.b.reak} · Platforma ${p.b.def} · Štít ${p.b.shd}</p>${q.e<1?`<p class="bad">Energie ${Math.round(q.e*100)} %</p>`:''}<button class="go" data-k="s:${k}">Spravovat</button><button class="go" data-k="n:${k}">Přejmenovat</button>${k!=2?`<button class="go" data-k="g:${k}" ${S.u.inf>=5?'':'disabled'}>Posílit +5</button>`:''}</div>`}).join('')}
function tBase(){const p=S.pl[S.cur],g=GAL[S.cur],pp=pr(S.cur);
 return `<div class="strip">`+Object.keys(S.pl).map(k=>`<button class="chip ${k==S.cur?'act':''}" data-k="p:${k}">${pn(k)}</button>`).join('')+`</div><p>${TY[g.ty].n} planeta, těžba +${pp.n.toFixed(1)} naquadah/s a +${pp.t.toFixed(1)} trinium/s.</p>`
 +Object.keys(B).map(k=>row('b:'+k,B[k],p.b[k],cost(B[k],p.b[k]),p.b[k]?'Vylepšit':'Postavit',0,'',B[k].req)).join('')+(pp.e<1?`<p class="bad">Nedostatek energie, těžba běží na ${Math.round(pp.e*100)} %. Vylepši reaktor.</p>`:'')
 +`<h2>Velitelství</h2>`+Object.keys(G).map(k=>row('q:'+k,G[k],S.g[k],cost(G[k],S.g[k]),S.g[k]?'Vylepšit':'Postavit')).join('')}
function tHangar(){return Object.keys(UN).map(k=>{const d={n:uName(k),d:UN[k].d};return row('u:'+k,d,null,uCost(k),'Vyrobit',0,` · Máš: ${S.u[k]} · síla ${UN[k].atk}`,UN[k].req)}).join('')}
function tMap(){const now=Date.now();return `<div class="strip"><button class="chip" data-v="${(vs+11)%12}" aria-label="Předchozí systém">‹</button><b>Systém ${SYS[vs]}</b><button class="chip" data-v="${(vs+1)%12}" aria-label="Další systém">›</button>`+SYS.map((s,i)=>`<button class="chip ${i==vs?'act':''}" data-v="${i}">${i+1}</button>`).join('')+`</div><div class="mapwrap">${planetSVG()}</div><div class="strip">`+[0,1,2,3,4].map(i=>{const g=GAL[vs*5+i];return `<button class="chip ${sel==g.key?'act':''}" data-pl="${g.key}">${pn(g.key)}</button>`}).join('')+`</div><div id="sel" class="card">${selHTML()}</div>`
 +(S.fl.length?`<h2>Flotily na cestě</h2>`+S.fl.map(f=>`<p>${({col:'Kolonizace',atk:'Útok',occ:'Invaze'})[f.t]} · ${GAL[f.k].name}: ${f.ph?'návrat':'let'} ještě ${Math.max(0,Math.ceil(((f.ph?f.back:f.arr)-now)/1000))} s</p>`).join(''):'')}
function tDip(){const n=S.co.length,c=[600*(n+1),400*(n+1)],bd=board(),me=bd.find(x=>x.me).s,tot=me+bd.filter(x=>x.ally).reduce((a,x)=>a+x.s,0);
 return `<h2>Koalice (${n} / ${Math.min(3,S.g.dip)})</h2><p>Spojenci se přidají k tvé koalici a dají jí bonus. Počet míst určuje Diplomatická kancelář (úr. ${S.g.dip}). Celkové skóre koalice: <b>${fmt(tot)}</b>.</p>`+Object.keys(RACES).filter(x=>x!=S.race).map(id=>{const r=RACES[id],in_=S.co.includes(id);return `<div class="row"><div><h3><span class="dot" style="background:linear-gradient(135deg,${r.c[0]},${r.c[1]})"></span> ${r.n} ${in_?'<span class="tag">spojenec</span>':''}</h3><p>${r.d}</p><span class="cost">Bonus pro koalici: ${r.allyT}${in_?'':` · Cena: <i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}`}</span></div><button class="go" data-k="${in_?'l':'j'}:${id}" ${in_||(n<Math.min(3,S.g.dip)&&ok(c))?'':'disabled'}>${in_?'Opustit':'Přizvat'}</button></div>`}).join('')
 +`<h2>Žebříček</h2><ol class="board">`+bd.map(x=>`<li class="${x.me?'me':x.ally?'ally':''}"><span>${x.n}${x.ally?' · spojenec':''}</span><b>${fmt(x.s)}</b></li>`).join('')+`</ol><p>Skóre: planety, budovy, výzkum a síla flotily. Soupeři jsou řízeni počítačem.</p>`}
function build(){return ({over:tOver,base:tBase,lab:()=>Object.keys(R).map(k=>row('r:'+k,R[k],S.r[k],cost(R[k],S.r[k],eff('res')),'Zkoumat',0,'',R[k].req)).join(''),hangar:tHangar,map:tMap,dip:tDip})[tab]()}
function render(){const h=build();if(h===last)return;last=h;const el=$('#tab'),w=el.querySelector('.mapwrap'),x=w?w.scrollLeft:0;el.innerHTML=h;const w2=el.querySelector('.mapwrap');if(w2)w2.scrollLeft=x}
function draw(){const r=rates(),rk=board().findIndex(x=>x.me)+1;$('#r-n').textContent=fmt(S.n);$('#r-t').textContent=fmt(S.t);$('#p-n').textContent='+'+r.n.toFixed(1)+'/s';$('#p-t').textContent='+'+r.t.toFixed(1)+'/s';
 $('#r-p').textContent=nPl()+' / '+maxPl();$('#p-p').textContent='pořadí '+rk+'.';$('#gate').classList.toggle('open',S.fl.length>0);render()}
function setTab(t){tab=t;last=null;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('act',b.dataset.tab==t));render();scrollTo(0,0)}
function hud(){const r=RACES[S.race];$('#emb').style.background=`linear-gradient(135deg,${r.c[0]},${r.c[1]})`;$('#who').textContent=S.cmd+' · '+r.n}
function pick(id){S.race=id;S.cmd=($('#cmd').value||'Velitel').trim().slice(0,20);S.pl[2].name=RACES[id].home;S.ts=S.start=Date.now();mkFac();hud();$('#pick').hidden=true;save();log('Vítej, '+S.cmd+'. Tvůj domovský svět: '+RACES[id].home+'.');setTab('over');tick()}
// ---- ovládání ----
document.addEventListener('click',e=>{
 const rc=e.target.closest('[data-race]');if(rc)return pick(rc.dataset.race);
 const n=e.target.closest('nav button');if(n)return setTab(n.dataset.tab);
 const v=e.target.closest('[data-v]');if(v){vs=+v.dataset.v;return render()}
 const p=e.target.closest('[data-pl]');if(p){sel=+p.dataset.pl;return render()}
 const b=e.target.closest('[data-k]');if(!b)return;const [t,k]=b.dataset.k.split(':');
 if(t=='m')return launch('atk',+k);if(t=='c')return launch('occ',+k);if(t=='k')return launch('col',+k);
 if(t=='p'){S.cur=+k;return render()}if(t=='s'){S.cur=+k;return setTab('base')}
 if(t=='n'){const nn=prompt('Nový název planety:',pn(k));if(nn&&nn.trim()){S.pl[k].name=nn.trim().slice(0,24);save();render()}return}
 if(t=='g'){if(S.u.inf>=5&&S.pl[k]){S.u.inf-=5;S.pl[k].gar+=5;log('Posádka '+pn(k)+' posílena o 5.');save();render()}return}
 if(t=='j'){const c=[600*(S.co.length+1),400*(S.co.length+1)];if(S.co.length<Math.min(3,S.g.dip)&&ok(c)&&!S.co.includes(k)){pay(c);S.co.push(k);log(RACES[k].n+' se přidali ke koalici.','w');save();draw()}return}
 if(t=='l'){S.co=S.co.filter(x=>x!=k);log(RACES[k].n+' opustili koalici.');save();draw();return}
 if(t=='u'){const c=uCost(k);if(!ok(c)||!reqOK(UN[k].req))return;pay(c);S.u[k]++;log('Vyrobeno: '+uName(k))}
 else{const d=({b:B,q:G,r:R})[t][k],o=t=='b'?S.pl[S.cur].b:t=='q'?S.g:S.r,c=cost(d,o[k],t=='r'?eff('res'):1);if(!ok(c)||!reqOK(d.req))return;pay(c);o[k]++;log(d.n+' na úrovni '+o[k]+'.')}
 save();draw()});
document.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target.matches&&e.target.matches('.pl')){e.preventDefault();sel=+e.target.dataset.pl;render()}});
$('#b-close').onclick=()=>{$('#battle').hidden=true};
$('#reset').onclick=()=>{if(confirm('Opravdu smazat veškerý postup?')){localStorage.removeItem('sgc3');location.reload()}};
function save(){try{localStorage.setItem('sgc3',JSON.stringify(S))}catch(e){}}
// ---- grafika: brána a hvězdy ----
(()=>{let g='';for(let i=0;i<39;i++){const a=i/39*2*Math.PI,s=Math.sin(a),c=Math.cos(a);g+=`<path d="M${200+147*s} ${200-147*c}L${200+176*s} ${200-176*c}"/><circle cx="${200+162*s}" cy="${200-162*c}" r="3" fill="#c9a24b" stroke="none"/>`}$('#glyphs').innerHTML=g;
 let c='';for(let i=0;i<9;i++){const a=(i*40+200)*Math.PI/180;c+=`<g transform="translate(${200+183*Math.sin(a)} ${200-183*Math.cos(a)}) rotate(${i*40+200})"><path class="chev" d="M-17 -15L17 -15L10 15L-10 15Z"/></g>`}$('#chevs').innerHTML=c;
 const cv=$('#stars'),x=cv.getContext('2d');function paint(){cv.width=innerWidth;cv.height=innerHeight;const r=rng(7);
  [[.2,.15,'#1d3a5c'],[.8,.7,'#3a2a14'],[.55,.4,'#1a2a3a']].forEach(([a,b,col])=>{const gr=x.createRadialGradient(a*cv.width,b*cv.height,0,a*cv.width,b*cv.height,Math.max(cv.width,cv.height)*.45);gr.addColorStop(0,col+'aa');gr.addColorStop(1,'#0b0e1200');x.fillStyle=gr;x.fillRect(0,0,cv.width,cv.height)});
  for(let i=0;i<300;i++){x.fillStyle=`rgba(255,255,255,${.2+r()*.7})`;x.fillRect(r()*cv.width,r()*cv.height,r()<.1?2:1,r()<.1?2:1)}}
 paint();addEventListener('resize',paint)})();
async function boot(){
 try{const r=await fetch('data.json');if(!r.ok)throw new Error(r.status);({TY,SYS,LORDS,B,G,R,UN,RACES}=await r.json())}
 catch(e){$('#tab').textContent='Nepodařilo se načíst data.json. Hru spusť přes server (npm start), ne otevřením souboru.';return}
 TK=Object.keys(TY);buildGalaxy();
 if(!S.race||!RACES[S.race]){S=fresh();$('#cards').innerHTML=Object.keys(RACES).map(id=>{const r=RACES[id];return `<button class="rc" data-race="${id}" style="--a:${r.c[0]};--b:${r.c[1]}"><span class="emb"></span><h3>${r.n}</h3><p>${r.d}</p><small>${r.bonus}</small></button>`}).join('');$('#pick').hidden=false;setInterval(tick,1000);setInterval(save,5000);return}
 mkFac();hud();tick();setInterval(tick,1000);setInterval(save,5000)}
boot();
