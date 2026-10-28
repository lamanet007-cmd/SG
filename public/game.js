// Stargate: Galaktické velení. Herní data jsou v data.json.
const $=s=>document.querySelector(s),fmt=n=>Math.floor(n).toLocaleString('cs-CZ');
let TY,TK,SYS,LORDS,B,G,R,UN,RACES;const GAL=[],ROLES=['inf','elite','ftr','crs','flg','col'],ATK=['inf','elite','ftr','crs','flg'];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildGalaxy(){const r=rng(2010);for(let s=0;s<12;s++)for(let i=0;i<5;i++){const ty=TK[Math.floor(r()*5)],p=Math.round(25*Math.pow(1+s,1.9)*(.6+r()*.8)*(1+i*.1));GAL.push({key:s*5+i,s,i,ty,npc:s>0&&r()<.25+s*.045,lord:LORDS[Math.floor(r()*LORDS.length)],p,loot:[Math.round(p*2.6),Math.round(p*1.8)],fl:14+Math.floor(r()*12)+({oce:2,jun:2,vol:-2}[ty]||0),name:SYS[s]+' '+'abcde'[i]})}Object.assign(GAL[2],{ty:'oce',npc:false,name:'Domovský svět',fl:18})}
// ---- stav ----
const home=()=>({b:{naq:1,tri:1,reak:1,def:0,shd:0},gar:0,name:''});
const fresh=()=>({race:null,cmd:'Velitel',n:500,t:300,pl:{2:home()},cur:2,g:{lab:0,han:0,kas:1,dip:0},r:{zbr:0,stit:0,poh:0,kol:0,ener:0,tez:0,zat:0,mat:0,obr:0,ter:0},u:{inf:8,elite:0,ftr:0,crs:0,flg:0,col:0},own:{},ai:{},fl:[],co:[],start:Date.now(),at:Date.now(),ca:Date.now()+150000,ts:Date.now()});
let S=JSON.parse(localStorage.getItem('sgc4')||'null')||fresh(),tab='over',vs=0,last=null;
const sum=o=>Object.values(o).reduce((a,v)=>a+v,0),maxPl=()=>2+S.r.kol,nPl=()=>Object.keys(S.pl).length,pn=k=>(S.pl[k]&&S.pl[k].name)||GAL[k].name,fields=g=>g.fl+2*S.r.ter;
const fn=f=>RACES[f]?RACES[f].n:f,fc=f=>RACES[f]?RACES[f].c[0]:`hsl(${LORDS.indexOf(f)*41+8},65%,52%)`,gr=f=>RACES[f]?RACES[f].gr:70,ex=f=>RACES[f]?RACES[f].ex:.8;
const eff=k=>{let m=RACES[S.race].eff[k]||1;S.co.forEach(a=>m*=RACES[a].ally[k]||1);return m};
const cost=(d,l,m)=>d.c.map(v=>Math.ceil(v*Math.pow(d.f,l)*(m||1))),ok=c=>S.n>=c[0]&&S.t>=c[1],pay=c=>{S.n-=c[0];S.t-=c[1]};
const reqOK=q=>!q||(Object.entries(q.g||{}).every(([k,v])=>S.g[k]>=v)&&Object.entries(q.r||{}).every(([k,v])=>S.r[k]>=v));
const reqTx=q=>[...Object.entries(q.g||{}).map(([k,v])=>G[k].n+' '+v),...Object.entries(q.r||{}).map(([k,v])=>R[k].n+' '+v)].join(', ');
const uName=r=>RACES[S.race].u[ROLES.indexOf(r)],uCost=r=>UN[r].c.map(v=>Math.ceil(v*(r=='inf'||r=='elite'?eff('ucost'):1)));
const pw=u=>ROLES.reduce((a,r)=>a+(u[r]||0)*UN[r].atk*(r=='inf'||r=='elite'?eff('inf'):1),0)*(1+.1*S.r.zbr)*eff('atk');
const myArmy=()=>{const u={};ATK.forEach(r=>u[r]=S.u[r]);return pw(u)},shield=()=>Math.max(.2,1-.08*S.r.stit);
const dfn=k=>{const p=S.pl[k];return(30+p.gar*12+p.b.def*25)*(1+.15*p.b.shd)*(1+.1*S.r.zbr)*(1+.1*S.r.stit)*(1+.1*S.r.obr)*eff('def')};
const cnt=f=>Object.values(S.own).filter(o=>o.f==f).length;
const dfO=k=>{const o=S.own[k],n=Math.max(1,cnt(o.f));return Math.round(Math.max(30,GAL[k].p)*(o.cap?3:1)*o.b*(1+S.ai[o.f].bld/n/10))};
function pr(k){const b=S.pl[k].b,m=TY[GAL[k].ty].m,prod=3*b.reak*Math.pow(1.1,b.reak)*(1+.1*S.r.ener),use=2*(b.naq+b.tri),e=use?Math.min(1,prod/use):1,f=eff('prod')*(1+.08*S.r.tez);return{e,n:1.4*b.naq*Math.pow(1.12,b.naq)*e*m[0]*f,t:.9*b.tri*Math.pow(1.12,b.tri)*e*m[1]*f}}
function rates(){let n=0,t=0;for(const k in S.pl){const p=pr(k);n+=p.n;t+=p.t}return{n,t}}
function log(m,c){const d=document.createElement('div');d.className=c||'';d.textContent=new Date().toLocaleTimeString('cs-CZ')+'  '+m;$('#log').prepend(d)}
const travel=k=>(8+6*Math.abs(GAL[k].s-GAL[S.cur].s))*Math.pow(.85,S.r.poh);
const fmtT=s=>{s=Math.ceil(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} h ${m} min`:m?`${m} min ${s%60} s`:`${s} s`};
function eta(c){const nn=Math.max(0,c[0]-S.n),nt=Math.max(0,c[1]-S.t);if(!nn&&!nt)return'✓ Dost surovin';const r=rates();if((nn&&r.n<=0)||(nt&&r.t<=0))return'Těžba je nulová';const s=Math.max(nn/r.n,nt/r.t);return'Dost surovin za '+fmtT(s)+(s<86400?' (v '+new Date(Date.now()+s*1000).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})+')':'')}
// ---- AI říše: rozvoj armády i planet ----
function initAI(){const r=rng(5),hk=[11,22,28,37,43,56],ids=Object.keys(RACES).filter(x=>x!=S.race);S.own={};S.ai={};
 GAL.forEach(g=>{if(g.npc)S.own[g.key]={f:g.lord,b:1}});
 ids.forEach((id,i)=>{const k=hk[i];S.own[k]={f:id,b:1,cap:1};const nb=GAL.find(x=>x.s==GAL[k].s&&x.key!=k&&!S.own[x.key]&&x.key!=2);if(nb)S.own[nb.key]={f:id,b:1};S.ai[id]={army:200+r()*150,bld:10,cs:GAL[k].s}});
 LORDS.forEach(l=>{const g=GAL.find(x=>x.npc&&x.lord==l);S.ai[l]={army:150+r()*200,bld:6,cs:g?g.s:5}});S.at=Date.now()}
function aiStep(){const now=Date.now(),st=Math.min(240,Math.floor((now-S.at)/30000));if(st<1)return;S.at+=st*30000;
 for(let i=0;i<st;i++){const c={};for(const k in S.own)c[S.own[k].f]=(c[S.own[k].f]||0)+1;
  for(const f in S.ai){const a=S.ai[f],n=c[f]||0;a.army+=n*gr(f)*30/3600;a.bld+=n*.8*30/3600;
   if(n&&n<8&&Math.random()<30*ex(f)/21600){const fl=GAL.filter(g=>!S.own[g.key]&&!S.pl[g.key]);const fr=fl.length<=8?null:fl.sort((x,y)=>Math.abs(x.s-a.cs)-Math.abs(y.s-a.cs)+(Math.random()-.5)*2)[0];if(fr){S.own[fr.key]={f,b:1};c[f]=n+1}}}}}
const fsc=f=>Math.round(cnt(f)*150+S.ai[f].bld*12+S.ai[f].army/4);
const myScore=()=>Math.round(nPl()*150+Object.values(S.pl).reduce((a,p)=>a+sum(p.b),0)*12+sum(S.g)*20+sum(S.r)*25+myArmy()/4);
const board=()=>[{n:S.cmd+' ('+RACES[S.race].n+')',s:myScore(),me:1,pl:nPl(),ar:myArmy()},...Object.keys(S.ai).map(f=>({n:fn(f)+(RACES[f]?' (AI)':''),f,s:fsc(f),pl:cnt(f),ar:S.ai[f].army,ally:S.co.includes(f),c:fc(f)}))].sort((a,b)=>b.s-a.s);
// ---- tick, flotily, bitvy ----
function tick(){if(!S.race)return;const now=Date.now(),dt=Math.min((now-S.ts)/1000,86400);S.ts=now;const r=rates();S.n+=r.n*dt;S.t+=r.t*dt;aiStep();
 S.fl=S.fl.filter(f=>{if(f.ph==0&&now>=f.arr){arrive(f);f.ph=1}if(f.ph==1&&now>=f.back){for(const k in f.u)S.u[k]+=f.u[k];log('Flotila se vrátila domů.');return false}return true});
 if(now>=S.ca)counter();draw();dyn()}
function launch(t,k){const g=GAL[k],o=S.own[k];let u={};
 if(t=='col'){if(S.u.col<1||o||S.pl[k]||nPl()+S.fl.filter(f=>f.t=='col').length>=maxPl())return;u={col:1}}
 else{if(!o||S.co.includes(o.f))return;ATK.forEach(r=>u[r]=S.u[r]);const a=pw(u);if(a<=0||(t=='occ'&&(a<dfO(k)*1.3||S.u.inf<10||nPl()>=maxPl())))return}
 for(const x in u)S.u[x]-=u[x];
 const T=travel(k)*1000,now=Date.now();S.fl.push({t,k,u,ph:0,go:now,arr:now+T,back:now+2*T});
 log(({col:'Kolonizační loď',atk:'Útočná flotila',occ:'Invazní flotila'})[t]+' míří na '+g.name+' (cesta '+Math.round(T/1000)+' s).');save();draw()}
function arrive(f){const g=GAL[f.k];
 if(f.t=='col'){if(S.pl[f.k]||S.own[f.k]||nPl()>=maxPl()){log('Kolonizace '+g.name+' selhala, planetu mezitím někdo obsadil. Loď se vrací.','l');return}S.pl[f.k]=home();f.u.col=0;log('Nová kolonie: '+g.name+'. Osadníci postavili základní doly.','w');return}
 const o=S.own[f.k];if(S.pl[f.k]||!o)return;if(S.co.includes(o.f)){log(g.name+' mezitím patří spojenci, útok zrušen.');return}
 const a=pw(f.u),d=dfO(f.k),win=a>=d,loss=win?Math.min(.9,.5*d/a*shield()):Math.min(.95,.8*shield()),ai=S.ai[o.f];
 for(const k in f.u)f.u[k]-=Math.round(f.u[k]*loss);
 let msg;
 if(win){S.n+=g.loot[0];S.t+=g.loot[1];ai.army*=.92;msg=`Vítězství nad říší ${fn(o.f)} na ${g.name}. Kořist ${fmt(g.loot[0])} naquadah, ${fmt(g.loot[1])} trinium. Ztráty ${Math.round(loss*100)} %.`;
  if(f.t=='occ'&&f.u.inf>0&&nPl()<maxPl()){const gar=Math.min(10,f.u.inf);f.u.inf-=gar;S.pl[f.k]={...home(),gar};delete S.own[f.k];msg+=` Planeta je obsazena, posádka ${gar}.`}else o.b*=1.1}
 else msg=`Porážka na ${g.name}. Síla ${fmt(a)} nestačila na obranu ${fmt(d)}. Ztráty ${Math.round(loss*100)} %.`;
 log(msg,win?'w':'l');report('Bitva o '+g.name,win,1-loss,win?0:Math.max(.1,1-.5*a/d),msg)}
function report(title,win,ae,de,msg){const o=$('#battle');if(!o.hidden)return;o.hidden=false;$('#b-title').textContent=title;$('#b-res').textContent=msg;$('#b-res').className=win?'w':'l';
 $('#b-a').style.width='100%';$('#b-d').style.width='100%';requestAnimationFrame(()=>requestAnimationFrame(()=>{$('#b-a').style.width=ae*100+'%';$('#b-d').style.width=de*100+'%'}));$('#b-close').focus()}
function counter(){S.ca=Date.now()+(90+Math.random()*110)*1000;const ks=Object.keys(S.pl).filter(k=>k!=2),at=Object.keys(S.ai).filter(f=>!S.co.includes(f));if(!ks.length||!at.length)return;
 let tot=at.reduce((a,f)=>a+S.ai[f].army,0),x=Math.random()*tot,f=at.find(q=>(x-=S.ai[q].army)<=0)||at[0];
 const k=ks[Math.floor(Math.random()*ks.length)],e=Math.max(20,S.ai[f].army*.2*(.6+Math.random()*.6)),df=dfn(k);
 if(df>=e){S.pl[k].gar=Math.round(S.pl[k].gar*.85);S.ai[f].army*=.92;log(`${fn(f)} zaútočili na ${pn(k)} silou ${fmt(e)}. Obrana vydržela.`,'w')}
 else{log(`${fn(f)} dobyli planetu ${pn(k)} (útok ${fmt(e)} proti obraně ${fmt(df)}). Zpět ji získáš útokem z Galaxie.`,'l');delete S.pl[k];S.own[k]={f,b:1};if(S.cur==k)S.cur=2}save()}
// ---- grafika ----
function mkDefs(){$('#defs').innerHTML=TK.map(t=>`<radialGradient id="g-${t}" cx=".35" cy=".3"><stop offset="0" stop-color="${TY[t].c[0]}"/><stop offset="1" stop-color="${TY[t].c[1]}"/></radialGradient>`).join('')+`<radialGradient id="shade" cx=".3" cy=".3" r=".85"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></radialGradient><radialGradient id="sun"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffb43c"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="nzA" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".03 .06" numOctaves="4" seed="4"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.8 -.6"/></filter><filter id="nzB" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.8 -.6"/></filter><filter id="neb" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008 .014" numOctaves="4" seed="12"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .45 0 0 0 0 .9 0 0 0 1.4 -.45"/></filter>`}
function art(g,ctx,x,y,Rd){const r=rng(g.key*7+3),id='cp'+ctx+g.key,rocky=g.ty=='des'||g.ty=='vol',c0=TY[g.ty].c[0];
 let o=`<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${Rd}"/></clipPath><circle cx="${x}" cy="${y}" r="${Rd+4}" fill="${c0}" opacity=".3" filter="url(#glow)"/><g clip-path="url(#${id})"><circle cx="${x}" cy="${y}" r="${Rd}" fill="url(#g-${g.ty})"/><rect x="${x-Rd}" y="${y-Rd}" width="${2*Rd}" height="${2*Rd}" filter="url(#${rocky?'nzB':'nzA'})" opacity=".5" style="mix-blend-mode:overlay"/>`;
 if(rocky)for(let i=0;i<5;i++)o+=`<circle cx="${x+(r()-.5)*Rd*1.6}" cy="${y+(r()-.5)*Rd*1.6}" r="${Rd*(.06+r()*.12)}" fill="#000" opacity=".2"/>`;
 else{o+='<g class="cl">';for(let i=0;i<4;i++)o+=`<ellipse cx="${x+(r()-.5)*Rd*1.4}" cy="${y+(r()-.5)*Rd*1.6}" rx="${Rd*(.3+r()*.4)}" ry="${Rd*.08}" fill="#fff" opacity=".4"/>`;o+='</g>'}
 if(g.ty=='vol')o+=`<path d="M${x-Rd} ${y+4}l${Rd*.7} -8l${Rd*.5} 10l${Rd*.8} -6" stroke="#ffb040" stroke-width="${Rd*.07}" fill="none" opacity=".85"/>`;
 return o+`<circle cx="${x}" cy="${y}" r="${Rd}" fill="url(#shade)"/></g><circle cx="${x}" cy="${y}" r="${Rd}" fill="none" stroke="#fff" stroke-opacity=".18"/>`}
const ic=k=>`<svg class="ic"><use href="#i-${k}"/></svg>`;
const col=k=>S.pl[k]?'#e8cf8a':S.own[k]?fc(S.own[k].f):'#6b7885';
const POS=s=>({x:62+(s%6)*100+(s<6?0:48),y:(s<6?58+(s*37)%34:172+(s*53)%34)});
function starmap(){let o=`<svg viewBox="0 0 640 250" class="smap" role="group" aria-label="Galaktická mapa"><rect width="640" height="250" filter="url(#neb)" opacity=".55"/>`;
 for(let s=0;s<11;s++){const a=POS(s),b=POS(s+1);o+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#4fb6ff" stroke-opacity=".25" stroke-dasharray="2 5"/>`}
 for(let s=0;s<12;s++){const p=POS(s),own=[0,1,2,3,4].map(i=>col(s*5+i)),mine=own.filter(c=>c=='#e8cf8a').length;
  o+=`<g data-v="${s}" tabindex="0" role="button" aria-label="Systém ${SYS[s]}" class="sy"><circle cx="${p.x}" cy="${p.y}" r="36" fill="transparent"/><circle cx="${p.x}" cy="${p.y}" r="24" fill="url(#sun)" opacity=".65"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff"/>${vs==s?`<circle cx="${p.x}" cy="${p.y}" r="31" fill="none" stroke="#fff" stroke-dasharray="4 4" class="sel"/>`:''}`+own.map((c,i)=>{const a=-Math.PI/2+i*Math.PI*2/5;return `<circle cx="${p.x+19*Math.cos(a)}" cy="${p.y+19*Math.sin(a)}" r="4.5" fill="${c}" stroke="#0b0e12" stroke-width="1.5"/>`}).join('')+`<text x="${p.x}" y="${p.y+46}">${s+1}. ${SYS[s]}</text></g>`}
 return o+'</svg>'}
function card(k){const g=GAL[k],m=S.pl[k],o=S.own[k],T=Math.round(travel(k)),cl=col(k),al=o&&S.co.includes(o.f),a=myArmy();let tg,bt;
 if(m){tg=`Posádka ${m.gar} · obrana ${fmt(dfn(k))} · zastavěno ${sum(m.b)}/${fields(g)}`;bt=`<button class="go" data-k="s:${k}">Spravovat</button><button class="go" data-k="n:${k}">Přejmenovat</button>`+(k!=2?`<button class="go" data-k="g:${k}" ${S.u.inf>=5?'':'disabled'}>Posílit +5</button>`:'')}
 else if(o){const d=dfO(k);tg=`Obrana ${fmt(d)} · kořist ${fmt(g.loot[0])} / ${fmt(g.loot[1])}${o.cap?' · hlavní město':''}`;bt=al?'<p>Spojenec, nelze napadnout.</p>':`<button class="go" data-k="m:${k}" ${a>0?'':'disabled'}>Zaútočit</button><button class="go" data-k="c:${k}" ${a>=d*1.3&&S.u.inf>=10&&nPl()<maxPl()?'':'disabled'}>Obsadit</button>`}
 else{tg='Volná planeta. Kolonizace spotřebuje 1 kolonizační loď (máš '+S.u.col+').';bt=`<button class="go" data-k="k:${k}" ${S.u.col>0&&nPl()+S.fl.filter(f=>f.t=='col').length<maxPl()?'':'disabled'}>Kolonizovat</button>`}
 const bd=m?'<span class="tag">tvoje</span>':o?`<span class="own" style="background:${cl}">${fn(o.f)}</span>`:'<span class="tag gr">volná</span>';
 return `<div class="pc" style="--c:${cl}"><svg class="pa" viewBox="0 0 64 64">${art(g,'c',32,32,26)}</svg><div class="pi"><h3>${pn(k)} ${bd}</h3><p>${TY[g.ty].n} · ${fields(g)} polí · cesta ${T} s</p><p class="tg">${tg}</p><div class="pb">${bt}</div></div></div>`}
// ---- záložky ----
function row(key,d,l,c,t,off,extra,req){const rq=reqOK(req),can=ok(c)&&!off&&rq,k=key.split(':')[1];return `<div class="row"><div class="rh">${ic(k)}<div><h3>${d.n}${l!==null?` <span class="lv">úr. ${l}</span>`:''}</h3><p>${d.d}</p><span class="cost"><i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}${extra||''}</span>${rq?(off?`<p class="bad">${off}</p>`:`<p class="eta" data-c="${c[0]},${c[1]}"></p>`):`<p class="bad">Vyžaduje: ${reqTx(req)}</p>`}</div></div><button class="go" data-k="${key}" ${can?'':'disabled'}>${t}</button></div>`}
function tOver(){const r=rates(),bd=board(),rank=bd.findIndex(x=>x.me)+1;
 return `<div class="stats"><div><small>Planety</small><b>${nPl()} / ${maxPl()}</b></div><div><small>Těžba</small><b>${r.n.toFixed(1)} / ${r.t.toFixed(1)} /s</b></div><div><small>Síla flotily</small><b>${fmt(myArmy())}</b></div><div><small>Pořadí</small><b>${rank}. z ${bd.length}</b></div></div><h2>Tvoje planety</h2>`+
 Object.keys(S.pl).map(k=>{const p=S.pl[k],q=pr(k),g=GAL[k],us=sum(p.b),fl=fields(g);return `<div class="card"><div class="ph"><svg class="pa s" viewBox="0 0 64 64">${art(g,'o',32,32,26)}</svg><div><h3>${pn(k)} ${k==2?'<span class="tag">hlavní</span>':''}</h3><p>${TY[g.ty].n} · ${SYS[g.s]}</p></div></div><p class="cost"><i class="gem n"></i>+${q.n.toFixed(1)}/s <i class="gem t"></i>+${q.t.toFixed(1)}/s · Obrana ${fmt(dfn(k))} · Posádka ${p.gar}</p><p>Doly ${p.b.naq}/${p.b.tri} · Reaktor ${p.b.reak} · Platforma ${p.b.def} · Štít ${p.b.shd}</p><div class="fbar"><i style="width:${Math.min(100,us/fl*100)}%"></i></div><p>Zastavěno ${us} / ${fl} polí</p>${q.e<1?`<p class="bad">Energie ${Math.round(q.e*100)} %</p>`:''}<button class="go" data-k="s:${k}">Spravovat</button><button class="go" data-k="n:${k}">Přejmenovat</button>${k!=2?`<button class="go" data-k="g:${k}" ${S.u.inf>=5?'':'disabled'}>Posílit +5</button>`:''}</div>`}).join('')}
function tBase(){const p=S.pl[S.cur],g=GAL[S.cur],pp=pr(S.cur),us=sum(p.b),fl=fields(g),full=us>=fl;
 return `<div class="strip">`+Object.keys(S.pl).map(k=>`<button class="chip ${k==S.cur?'act':''}" data-k="p:${k}">${pn(k)}</button>`).join('')+`</div><div class="card"><p>${TY[g.ty].n} planeta · těžba +${pp.n.toFixed(1)} naquadah/s, +${pp.t.toFixed(1)} trinium/s</p><p>Zastavěno <b>${us} / ${fl}</b> polí. Každá úroveň budovy zabere jedno pole, další pole přidá výzkum Terraformace.</p><div class="fbar"><i style="width:${Math.min(100,us/fl*100)}%"></i></div></div>`
 +Object.keys(B).map(k=>row('b:'+k,B[k],p.b[k],cost(B[k],p.b[k]),p.b[k]?'Vylepšit':'Postavit',full?'Planeta nemá volná pole':'','',B[k].req)).join('')+(pp.e<1?`<p class="bad">Nedostatek energie, těžba běží na ${Math.round(pp.e*100)} %. Vylepši reaktor.</p>`:'')
 +`<h2>Velitelství</h2>`+Object.keys(G).map(k=>row('q:'+k,G[k],S.g[k],cost(G[k],S.g[k]),S.g[k]?'Vylepšit':'Postavit')).join('')}
function tMap(){const sk=[0,1,2,3,4].map(i=>vs*5+i),mine=sk.filter(k=>S.pl[k]).length,free=sk.filter(k=>!S.pl[k]&&!S.own[k]).length,now=Date.now();
 return `<div class="legend"><span><i style="background:#e8cf8a"></i>tvoje</span><span><i style="background:#6b7885"></i>volná</span><span><i style="background:#e0705a"></i>cizí (barva = říše)</span></div><div class="mapbox">${starmap()}</div><p class="hint">Klepni na systém. Tečky kolem hvězdy jsou jeho 5 planet.</p>`+
 (S.fl.length?`<h2>Flotily na cestě</h2>`+S.fl.map(f=>{const s=f.ph?f.arr:f.go,e=f.ph?f.back:f.arr;return `<div class="fl"><b>${({col:'Kolonizace',atk:'Útok',occ:'Invaze'})[f.t]}</b> · ${GAL[f.k].name} · ${f.ph?'návrat':'let'} <span class="cd" data-t="${e}"></span><div class="pg"><i data-s="${s}" data-e="${e}"></i></div></div>`}).join(''):'')+
 `<h2>Systém ${vs+1}: ${SYS[vs]}</h2><p>${mine} tvoje · ${free} volné · ${5-mine-free} cizí. Tvoje síla útoku: <b>${fmt(myArmy())}</b></p>`+sk.map(card).join('')}
function tDip(){const n=S.co.length,c=[600*(n+1),400*(n+1)],bd=board(),me=bd.find(x=>x.me).s,tot=me+bd.filter(x=>x.ally).reduce((a,x)=>a+x.s,0);
 return `<h2>Koalice (${n} / ${Math.min(3,S.g.dip)})</h2><p>Spojence nelze napadnout a dávají bonus. S ostatními rasami můžeš válčit: stačí je napadnout v Galaxii (spojence nejdřív vyhoď z koalice). Skóre koalice: <b>${fmt(tot)}</b>.</p>`+Object.keys(RACES).filter(x=>x!=S.race).map(id=>{const r=RACES[id],in_=S.co.includes(id);return `<div class="row"><div><h3><span class="dot" style="background:linear-gradient(135deg,${r.c[0]},${r.c[1]})"></span> ${r.n} ${in_?'<span class="tag">spojenec</span>':'<span class="tag gr">neutrální</span>'}</h3><p>${r.d}</p><span class="cost">Bonus pro koalici: ${r.allyT}</span>${in_?'':`<p class="cost"><i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}</p><p class="eta" data-c="${c[0]},${c[1]}"></p>`}</div><button class="go" data-k="${in_?'l':'j'}:${id}" ${in_||(n<Math.min(3,S.g.dip)&&ok(c))?'':'disabled'}>${in_?'Opustit':'Přizvat'}</button></div>`}).join('')
 +`<h2>Žebříček říší</h2><ol class="board">`+bd.map(x=>`<li class="${x.me?'me':x.ally?'ally':''}"><span><i class="dot s" style="background:${x.c||'#e8cf8a'}"></i>${x.n}${x.ally?' · spojenec':''}<small>${x.pl} planet · armáda ${fmt(x.ar)}</small></span><b>${fmt(x.s)}</b></li>`).join('')+`</ol><p>Soupeři se rozvíjejí sami: staví, kolonizují volné planety a posilují armádu. Napadají i tebe.</p>`}
function build(){return ({over:tOver,base:tBase,lab:()=>Object.keys(R).map(k=>row('r:'+k,R[k],S.r[k],cost(R[k],S.r[k],eff('res')),'Zkoumat',0,'',R[k].req)).join(''),hangar:()=>Object.keys(UN).map(k=>row('u:'+k,{n:uName(k),d:UN[k].d},null,uCost(k),'Vyrobit',0,` · Máš: ${S.u[k]} · síla ${UN[k].atk}`,UN[k].req)).join(''),map:tMap,dip:tDip})[tab]()}
function render(){const h=build();if(h===last)return;last=h;$('#tab').innerHTML=h}
function dyn(){const now=Date.now();document.querySelectorAll('.eta').forEach(e=>{const [a,b]=e.dataset.c.split(',').map(Number),t=eta([a,b]);e.textContent=t;e.className='eta'+(t[0]=='✓'?' yes':'')});document.querySelectorAll('.cd').forEach(e=>e.textContent=fmtT(Math.max(0,(+e.dataset.t-now)/1000)));document.querySelectorAll('.pg i').forEach(e=>e.style.width=Math.min(100,Math.max(0,(now-e.dataset.s)/(e.dataset.e-e.dataset.s)*100))+'%')}
function draw(){const r=rates(),rk=board().findIndex(x=>x.me)+1;$('#r-n').textContent=fmt(S.n);$('#r-t').textContent=fmt(S.t);$('#p-n').textContent='+'+r.n.toFixed(1)+'/s';$('#p-t').textContent='+'+r.t.toFixed(1)+'/s';
 $('#r-p').textContent=nPl()+' / '+maxPl();$('#p-p').textContent='pořadí '+rk+'.';$('#gate').classList.toggle('open',S.fl.length>0);render()}
function setTab(t){tab=t;last=null;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('act',b.dataset.tab==t));render();dyn();scrollTo(0,0)}
function hud(){const r=RACES[S.race];$('#emb').style.background=`linear-gradient(135deg,${r.c[0]},${r.c[1]})`;$('#who').textContent=S.cmd+' · '+r.n}
function pick(id){S.race=id;S.cmd=($('#cmd').value||'Velitel').trim().slice(0,20);S.pl[2].name=RACES[id].home;S.ts=S.start=Date.now();initAI();hud();$('#pick').hidden=true;save();log('Vítej, '+S.cmd+'. Tvůj domovský svět: '+RACES[id].home+'.');setTab('over');tick()}
// ---- ovládání ----
document.addEventListener('click',e=>{
 const rc=e.target.closest('[data-race]');if(rc)return pick(rc.dataset.race);
 const n=e.target.closest('nav button');if(n)return setTab(n.dataset.tab);
 const v=e.target.closest('[data-v]');if(v){vs=+v.dataset.v;last=null;render();return dyn()}
 const b=e.target.closest('[data-k]');if(!b)return;const [t,k]=b.dataset.k.split(':');
 if(t=='m')return launch('atk',+k);if(t=='c')return launch('occ',+k);if(t=='k')return launch('col',+k);
 if(t=='p'){S.cur=+k;return render()}if(t=='s'){S.cur=+k;return setTab('base')}
 if(t=='n'){const nn=prompt('Nový název planety:',pn(k));if(nn&&nn.trim()){S.pl[k].name=nn.trim().slice(0,24);save();render()}return}
 if(t=='g'){if(S.u.inf>=5&&S.pl[k]){S.u.inf-=5;S.pl[k].gar+=5;log('Posádka '+pn(k)+' posílena o 5.');save();render()}return}
 if(t=='j'){const c=[600*(S.co.length+1),400*(S.co.length+1)];if(S.co.length<Math.min(3,S.g.dip)&&ok(c)&&!S.co.includes(k)){pay(c);S.co.push(k);log(RACES[k].n+' se přidali ke koalici.','w');save();draw()}return}
 if(t=='l'){S.co=S.co.filter(x=>x!=k);log(RACES[k].n+' opustili koalici. Teď je můžeš napadnout.');save();draw();return}
 if(t=='u'){const c=uCost(k);if(!ok(c)||!reqOK(UN[k].req))return;pay(c);S.u[k]++;log('Vyrobeno: '+uName(k))}
 else{const d=({b:B,q:G,r:R})[t][k],o=t=='b'?S.pl[S.cur].b:t=='q'?S.g:S.r,c=cost(d,o[k],t=='r'?eff('res'):1);if(!ok(c)||!reqOK(d.req)||(t=='b'&&sum(o)>=fields(GAL[S.cur])))return;pay(c);o[k]++;log(d.n+' na úrovni '+o[k]+'.')}
 save();draw();dyn()});
document.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target.dataset&&e.target.dataset.v!==undefined){e.preventDefault();vs=+e.target.dataset.v;last=null;render();dyn()}});
$('#b-close').onclick=()=>{$('#battle').hidden=true};
$('#reset').onclick=()=>{if(confirm('Opravdu smazat veškerý postup?')){localStorage.removeItem('sgc4');location.reload()}};
function save(){try{localStorage.setItem('sgc4',JSON.stringify(S))}catch(e){}}
(()=>{let g='';for(let i=0;i<39;i++){const a=i/39*2*Math.PI,s=Math.sin(a),c=Math.cos(a);g+=`<path d="M${200+147*s} ${200-147*c}L${200+176*s} ${200-176*c}"/><circle cx="${200+162*s}" cy="${200-162*c}" r="3" fill="#c9a24b" stroke="none"/>`}$('#glyphs').innerHTML=g;
 let c='';for(let i=0;i<9;i++){const a=(i*40+200)*Math.PI/180;c+=`<g transform="translate(${200+183*Math.sin(a)} ${200-183*Math.cos(a)}) rotate(${i*40+200})"><path class="chev" d="M-17 -15L17 -15L10 15L-10 15Z"/></g>`}$('#chevs').innerHTML=c;
 [['l1',90,1],['l2',60,1.4],['l3',35,2]].forEach(([id,n,sz],j)=>{const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d'),r=rng(7+j);for(let i=0;i<n;i++){x.fillStyle=`rgba(${j==2?'255,230,190':'255,255,255'},${.35+r()*.65})`;x.fillRect(Math.floor(r()*512),Math.floor(r()*512),sz,sz)}$('#'+id).style.backgroundImage=`url(${cv.toDataURL()})`})})();
async function boot(){
 try{const r=await fetch('data.json');if(!r.ok)throw new Error(r.status);({TY,SYS,LORDS,B,G,R,UN,RACES}=await r.json())}
 catch(e){$('#tab').textContent='Nepodařilo se načíst data.json. Hru spusť přes server (npm start), ne otevřením souboru.';return}
 TK=Object.keys(TY);buildGalaxy();mkDefs();
 if(!S.race||!RACES[S.race]){S=fresh();$('#cards').innerHTML=Object.keys(RACES).map(id=>{const r=RACES[id];return `<button class="rc" data-race="${id}" style="--a:${r.c[0]};--b:${r.c[1]}"><span class="emb"></span><h3>${r.n}</h3><p>${r.d}</p><small>${r.bonus}</small></button>`}).join('');$('#pick').hidden=false;setInterval(tick,1000);setInterval(save,5000);return}
 hud();tick();setInterval(tick,1000);setInterval(save,5000)}
boot();
