// Stargate: Galaktické velení. Herní data jsou v data.json.
const $=s=>document.querySelector(s),fmt=n=>Math.floor(n).toLocaleString('cs-CZ');
let TY,TK,SYS,GOA,B,G,R,UN,RACES,HEROES,HT,SK=[];const GAL=[],ROLES=['inf','elite','ftr','crs','flg','col'],ATK=['inf','elite','ftr','crs','flg'];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SOL=[['Merkur','des',12,'Nejmenší planeta, nejblíže ke hvězdě.'],['Venuše','vol',14,'Žhavá planeta ukrytá pod hustými mraky.'],['Země','oce',20,'Modrá planeta, domov lidstva.'],['Mars','des',16,'Rudá planeta s vyschlými řečišti.'],['Jupiter','gas',8,'Největší plynný obr, s bouří velkou jako celá planeta.'],['Saturn','gas',8,'Plynný obr s nápadným prstencem.'],['Uran','ice',10,'Ledový obr, který se valí po boku.'],['Neptun','ice',10,'Vzdálený ledový obr s ledovými bouřemi.']];
function buildGalaxy(){const r=rng(2010);let key=0;
 for(let s=0;s<12;s++){SK[s]=[];for(let i=0;i<(s?5:8);i++){const p=Math.round(25*Math.pow(1+s,1.9)*(.6+r()*.8)*(1+i*.1)),ty=TK[Math.floor(r()*TK.length)],npc=s>0&&r()<.1+s*.03,fl=ty=='gas'?8+Math.floor(r()*4):14+Math.floor(r()*12)+({oce:2,jun:2,vol:-2}[ty]||0),g={key,s,i,ty,npc,p,loot:[Math.round(p*2.6),Math.round(p*1.8)],fl,name:SYS[s]+' '+'abcde'[i]};
  if(!s)Object.assign(g,{name:SOL[i][0],ty:SOL[i][1],fl:SOL[i][2],npc:false,desc:SOL[i][3]});
  GAL.push(g);SK[s].push(key++)}}
 [...Object.values(RACES),GOA].forEach(h=>Object.assign(GAL[SK[h.hk[0]][h.hk[1]]],{name:h.home,ty:h.ht,fl:20,npc:false}))}
const HK=id=>{const h=(id=='goauld'?GOA:RACES[id]).hk;return SK[h[0]][h[1]]};
// ---- stav ----
const home=()=>({b:{naq:1,tri:1,reak:1,def:0,shd:0},gar:0,name:''});
const fresh=()=>({race:null,cmd:'Velitel',n:500,t:300,pl:{},cur:0,home:0,hero:{},g:{lab:0,han:0,kas:1,dip:0},r:{zbr:0,stit:0,poh:0,kol:0,ener:0,tez:0,zat:0,mat:0,obr:0,ter:0},u:{inf:8,elite:0,ftr:0,crs:0,flg:0,col:0},own:{},ai:{},news:[],hist:[],fl:[],co:[],start:Date.now(),at:Date.now(),ca:Date.now()+150000,ts:Date.now()});
const QT={};let gm='map',gf='weak',sel=null;
let S=JSON.parse(localStorage.getItem('sgc6')||'null')||fresh(),tab='over',vs=0,last=null;
const sum=o=>Object.values(o).reduce((a,v)=>a+v,0),maxPl=()=>2+S.r.kol,nPl=()=>Object.keys(S.pl).length,pn=k=>(S.pl[k]&&S.pl[k].name)||GAL[k].name,fields=g=>g.fl+2*S.r.ter;
const fn=f=>RACES[f]?RACES[f].n:GOA.n,fc=f=>RACES[f]?RACES[f].c[0]:GOA.c[0],gr=f=>RACES[f]?RACES[f].gr:GOA.gr,ex=f=>RACES[f]?RACES[f].ex:GOA.ex;
const eff=k=>{let m=RACES[S.race].eff[k]||1;S.co.forEach(a=>m*=RACES[a].ally[k]||1);return m*hm(k)};
// ---- hrdinové: bonusy a automatický růst ----
const heroes=()=>Object.keys(S.hero||{}),need=l=>Math.round(150*Math.pow(l,1.7)),maxHeroes=()=>Math.min(5,1+S.g.kas);
const hv=t=>heroes().reduce((a,id)=>a+(HEROES[id].t==t?HT[t].v*S.hero[id].lv:0),0);
const hm=k=>({atk:1+hv('atk'),def:1+hv('def'),prod:1+hv('eco'),res:Math.max(.5,1-hv('res')),spd:Math.max(.5,1-hv('spd')),loot:1+hv('loot')})[k]||1;
function addXp(id,n){const h=S.hero[id];if(!h||h.lv>=10)return;h.xp+=n;while(h.lv<10&&h.xp>=need(h.lv)){h.xp-=need(h.lv);h.lv++;log(`Hrdina ${HEROES[id].n} dosáhl úrovně ${h.lv} (${HT[HEROES[id].t].n}).`,'w')}}
const xp=(t,n)=>heroes().forEach(id=>{if(HEROES[id].t==t)addXp(id,n)}),hc=id=>HEROES[id].c.map(v=>Math.round(v*(1+heroes().length*.6)));

const cost=(d,l,m)=>d.c.map(v=>Math.ceil(v*Math.pow(d.f,l)*(m||1))),ok=c=>S.n>=c[0]&&S.t>=c[1],pay=c=>{S.n-=c[0];S.t-=c[1]};
const reqOK=q=>!q||(Object.entries(q.g||{}).every(([k,v])=>S.g[k]>=v)&&Object.entries(q.r||{}).every(([k,v])=>S.r[k]>=v));
const reqTx=q=>[...Object.entries(q.g||{}).map(([k,v])=>G[k].n+' '+v),...Object.entries(q.r||{}).map(([k,v])=>R[k].n+' '+v)].join(', ');
const uName=r=>RACES[S.race].u[ROLES.indexOf(r)],uCost=r=>UN[r].c.map(v=>Math.ceil(v*(r=='inf'||r=='elite'?eff('ucost'):1)));
const pw=u=>ROLES.reduce((a,r)=>a+(u[r]||0)*UN[r].atk*(r=='inf'||r=='elite'?eff('inf'):1),0)*(1+.1*S.r.zbr)*eff('atk');
const myArmy=()=>{const u={};ATK.forEach(r=>u[r]=S.u[r]);return pw(u)},shield=()=>Math.max(.2,1-.08*S.r.stit);
const dfn=k=>{const p=S.pl[k];return(30+p.gar*12+p.b.def*25)*(1+.15*p.b.shd)*(1+.1*S.r.zbr)*(1+.1*S.r.stit)*(1+.1*S.r.obr)*eff('def')};
const cnt=f=>Object.values(S.own).filter(o=>o.f==f).length;
const dfO=k=>{const o=S.own[k],n=Math.max(1,cnt(o.f)),a=S.ai[o.f];return Math.round(Math.max(o.cap?600:30,GAL[k].p)*(o.cap?3:1)*o.b*(1+Math.min(25,a.bld/n)/10)*(a.p=='def'?1.25:1))};
function pr(k){const b=S.pl[k].b,m=TY[GAL[k].ty].m,prod=3*b.reak*Math.pow(1.1,b.reak)*(1+.1*S.r.ener),use=2*(b.naq+b.tri),e=use?Math.min(1,prod/use):1,f=eff('prod')*(1+.08*S.r.tez);return{e,n:1.4*b.naq*Math.pow(1.12,b.naq)*e*m[0]*f,t:.9*b.tri*Math.pow(1.12,b.tri)*e*m[1]*f}}
function rates(){let n=0,t=0;for(const k in S.pl){const p=pr(k);n+=p.n;t+=p.t}return{n,t}}
function log(m,c){const d=document.createElement('div');d.className=c||'';d.textContent=new Date().toLocaleTimeString('cs-CZ')+'  '+m;$('#log').prepend(d)}
const travel=k=>(8+6*Math.abs(GAL[k].s-GAL[S.cur].s))*Math.pow(.85,S.r.poh)*hm('spd');
const fmtT=s=>{s=Math.ceil(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} h ${m} min`:m?`${m} min ${s%60} s`:`${s} s`};
function eta(c){const nn=Math.max(0,c[0]-S.n),nt=Math.max(0,c[1]-S.t);if(!nn&&!nt)return'✓ Dost surovin';const r=rates();if((nn&&r.n<=0)||(nt&&r.t<=0))return'Těžba je nulová';const s=Math.max(nn/r.n,nt/r.t);return'Dost surovin za '+fmtT(s)+(s<86400?' (v '+new Date(Date.now()+s*1000).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})+')':'')}
// ---- AI říše: osobnosti, ekonomika, armáda, kolonizace a války ----
const HP={inf:18,elite:56,ftr:70,crs:450,flg:1800,col:60},PERS={war:'agresivní',eco:'ekonomická',def:'obranná'};
const news=m=>{S.news.unshift({t:Date.now(),m});S.news.length=Math.min(S.news.length,12)},hist=m=>{S.hist.unshift(m);S.hist.length=Math.min(S.hist.length,8)};
function fight(A,Ah,D,sh){let ap=Ah,dp=D*2,rs=[];for(let i=0;i<6&&ap>0&&dp>0;i++){const da=A*.5*(.8+Math.random()*.4)*Math.max(.12,ap/Ah),dd=D*.5*(.8+Math.random()*.4)*sh*Math.max(.12,dp/(D*2));dp-=da;ap-=dd;rs.push({a:Math.max(0,ap)/Ah,d:Math.max(0,dp)/(D*2),da:Math.round(da),dd:Math.round(dd)})}return{win:dp<=0&&ap>0,rs,af:Math.max(0,ap)/Ah}}
function initAI(){const r=rng(5),ids=Object.keys(RACES).filter(x=>x!=S.race),P=['war','eco','def'],gk=HK('goauld'),homes=new Set([...Object.keys(RACES).map(x=>HK(x)),gk]);S.own={};S.ai={};S.news=[];S.hist=[];
 GAL.forEach(g=>{if(g.npc&&!homes.has(g.key))S.own[g.key]={f:'goauld',b:1}});
 S.own[gk]={f:'goauld',b:1,cap:1};S.ai.goauld={army:300,bld:10,cs:GAL[gk].s,res:300,p:'war'};
 ids.forEach(id=>{const k=HK(id);S.own[k]={f:id,b:1,cap:1};const nb=GAL.find(x=>x.s==GAL[k].s&&x.key!=k&&!S.own[x.key]&&!homes.has(x.key));if(nb)S.own[nb.key]={f:id,b:1};S.ai[id]={army:200+r()*150,bld:10,cs:GAL[k].s,res:300,p:P[Math.floor(r()*3)]}});S.at=Date.now()}
function aiAttack(f){const a=S.ai[f];if(a.army<80)return;const A=a.army*.3;let best=null,bs=0;
 for(const k in S.own){const o=S.own[k];if(o.f==f||o.cap||(o.t&&Date.now()-o.t<1200000))continue;const D=dfO(k);if(A<D*.9)continue;const sc=(GAL[k].p+1)/(D+1)/(1+Math.abs(GAL[k].s-a.cs)*.15);if(sc>bs){bs=sc;best=k}}
 if(best==null)return;const o=S.own[best],d=S.ai[o.f],D=dfO(best),r=fight(A,A*3.5,D,1);
 if(r.win){S.own[best]={f,b:1,t:Date.now()};a.army*=.88+.1*r.af;d.army*=.93;news(`${fn(f)} dobyli planetu ${GAL[best].name} od říše ${fn(o.f)}.`)}else{a.army*=.85;d.army*=.97;news(`${fn(o.f)} odrazili útok říše ${fn(f)} na ${GAL[best].name}.`)}}
function aiStep(){const now=Date.now(),st=Math.min(240,Math.floor((now-S.at)/30000));if(st<1)return;S.at+=st*30000;
 for(let i=0;i<st;i++)for(const f in S.ai){const a=S.ai[f],n=cnt(f);if(!n)continue;
  const ne=(Math.min(n,5)+Math.max(0,n-5)*.25)*(1+Math.max(0,4-n)*.2),inc=ne*7.5,w={war:[.6,.25,.15],eco:[.25,.45,.3],def:[.4,.4,.2]}[a.p];
  a.pa=(a.pa||0)+inc*w[0];a.pb=(a.pb||0)+inc*w[1];a.pc=(a.pc||0)+inc*w[2];
  a.army+=a.pa*.07;a.pa=0;
  const bc=120*(1+a.bld/n);if(a.bld/n<25){while(a.pb>=bc&&a.bld/n<25){a.pb-=bc;a.bld++}}else{a.army+=a.pb*.07;a.pb=0}
  const fl=GAL.filter(g=>!S.own[g.key]&&!S.pl[g.key]);
  if(n<10&&fl.length>8){if(a.pc>=700){const t=fl.sort((p,q)=>Math.abs(p.s-a.cs)-Math.abs(q.s-a.cs)+(Math.random()-.5)*2)[0];S.own[t.key]={f,b:1};a.pc-=700}}else{a.army+=a.pc*.07;a.pc=0}
  if(Math.random()<(a.p=='war'?.04:a.p=='def'?.01:.02))aiAttack(f)}}
const fsc=f=>Math.round(cnt(f)*150+S.ai[f].bld*12+S.ai[f].army/4);
const myScore=()=>Math.round(nPl()*150+Object.values(S.pl).reduce((a,p)=>a+sum(p.b),0)*12+sum(S.g)*20+sum(S.r)*25+myArmy()/4);
const board=()=>[{n:S.cmd+' ('+RACES[S.race].n+')',s:myScore(),me:1,pl:nPl(),ar:myArmy()},...Object.keys(S.ai).map(f=>({n:fn(f)+(RACES[f]?' (AI)':' (vládce '+GOA.ruler+')'),f,s:fsc(f),pl:cnt(f),ar:S.ai[f].army,ally:S.co.includes(f),c:fc(f),p:PERS[S.ai[f].p]}))].sort((a,b)=>b.s-a.s);
// ---- tick, flotily, bitvy ----
function tick(){if(!S.race)return;const now=Date.now(),dt=Math.min((now-S.ts)/1000,86400);S.ts=now;const r=rates();S.n+=r.n*dt;S.t+=r.t*dt;heroes().forEach(id=>addXp(id,dt*.25));xp('eco',(r.n+r.t)*dt*.03);aiStep();
 S.fl=S.fl.filter(f=>{if(f.ph==0&&now>=f.arr){arrive(f);f.ph=1}if(f.ph==1&&now>=f.back){for(const k in f.u)S.u[k]+=f.u[k];log('Flotila se vrátila domů.');return false}return true});
 if(now>=S.ca)counter();draw();dyn()}
function launch(t,k){const g=GAL[k],o=S.own[k];let u={};
 if(t=='col'){if(S.u.col<1||o||S.pl[k]||nPl()+S.fl.filter(f=>f.t=='col').length>=maxPl())return;u={col:1}}
 else{if(!o||S.co.includes(o.f))return;ATK.forEach(r=>u[r]=S.u[r]);const a=pw(u);if(a<=0||(t=='occ'&&(a<dfO(k)*1.3||S.u.inf<10||nPl()>=maxPl())))return}
 for(const x in u)S.u[x]-=u[x];
 const T=travel(k)*1000,now=Date.now();S.fl.push({t,k,u,ph:0,go:now,arr:now+T,back:now+2*T});xp('spd',25);
 log(({col:'Kolonizační loď',atk:'Útočná flotila',occ:'Invazní flotila'})[t]+' míří na '+g.name+' (cesta '+Math.round(T/1000)+' s).');save();draw()}
function arrive(f){const g=GAL[f.k];
 if(f.t=='col'){if(S.pl[f.k]||S.own[f.k]||nPl()>=maxPl()){log('Kolonizace '+g.name+' selhala, planetu mezitím někdo obsadil. Loď se vrací.','l');return}S.pl[f.k]=home();f.u.col=0;log('Nová kolonie: '+g.name+'. Osadníci postavili základní doly.','w');return}
 const o=S.own[f.k];if(S.pl[f.k]||!o)return;if(S.co.includes(o.f)){log(g.name+' mezitím patří spojenci, útok zrušen.');return}
 const A=pw(f.u),Ah=ATK.reduce((s,r)=>s+(f.u[r]||0)*HP[r],0)||1,D=dfO(f.k),r=fight(A,Ah,D,shield()),ai=S.ai[o.f],lost={};
 ATK.forEach(x=>{const n=f.u[x]||0,l=Math.min(n,Math.round(n*(1-r.af)));if(l){lost[x]=l;f.u[x]-=l}});
 const lt=Object.entries(lost).map(([x,l])=>l+'× '+uName(x)).join(', ')||'žádné';let msg;
 if(r.win){const lm=hm('loot'),L=[Math.round(g.loot[0]*lm),Math.round(g.loot[1]*lm)];S.n+=L[0];S.t+=L[1];xp('loot',L[0]*.02);ai.army*=.9;msg=`Vítězství nad říší ${fn(o.f)} na ${g.name}. Kořist ${fmt(L[0])} naquadah, ${fmt(L[1])} trinium.`;
  if(f.t=='occ'&&f.u.inf>0&&nPl()<maxPl()){const gar=Math.min(10,f.u.inf);f.u.inf-=gar;S.pl[f.k]={...home(),gar};delete S.own[f.k];msg+=` Planeta je obsazena, posádka ${gar}.`}else o.b*=1.1}
 else{ai.army*=.97;msg=`Ústup z ${g.name}: tvá síla ${fmt(A)} nestačila na obranu ${fmt(D)}.`}
 msg+=` Ztráty: ${lt}.`;log(msg,r.win?'w':'l');hist(msg);xp('atk',r.win?60:25);report('Bitva o '+g.name,r.rs,msg,r.win)}
function report(title,rs,msg,win){const o=$('#battle');if(!o.hidden)return;o.hidden=false;$('#b-title').textContent=title;$('#b-res').textContent='';$('#b-log').innerHTML='';$('#b-close').disabled=true;$('#b-a').style.width='100%';$('#b-d').style.width='100%';
 rs.forEach((q,i)=>setTimeout(()=>{$('#b-a').style.width=q.a*100+'%';$('#b-d').style.width=q.d*100+'%';const d=document.createElement('div');d.textContent=`Kolo ${i+1}: tvé jednotky způsobily ${fmt(q.da)} škody, obránci ${fmt(q.dd)}.`;$('#b-log').append(d)},i*900+100));
 setTimeout(()=>{$('#b-res').textContent=msg;$('#b-res').className=win?'w':'l';$('#b-close').disabled=false;$('#b-close').focus()},rs.length*900+300)}
function counter(){S.ca=Date.now()+(60+Math.random()*80)*1000;const ks=Object.keys(S.pl).filter(k=>k!=S.home),at=Object.keys(S.ai).filter(f=>!S.co.includes(f)&&cnt(f)>0);if(!ks.length||!at.length)return;
 const wt=f=>S.ai[f].army*({war:1.6,eco:.6,def:.5}[S.ai[f].p]);let x=Math.random()*at.reduce((s,f)=>s+wt(f),0);const f=at.find(q=>(x-=wt(q))<=0)||at[0],a=S.ai[f],A=a.army*.3;
 ks.sort((p,q)=>dfn(p)-dfn(q));const k=ks[0],D=dfn(k);if(A<D*.7&&Math.random()<.7)return;const r=fight(A,A*3.5,D,1);let m;
 if(!r.win){S.pl[k].gar=Math.round(S.pl[k].gar*.85);a.army*=.7+.3*r.af;xp('def',50);m=`${fn(f)} zaútočili na ${pn(k)} silou ${fmt(A)}. Obrana (${fmt(D)}) vydržela.`;log(m,'w')}
 else{m=`${fn(f)} dobyli planetu ${pn(k)} (útok ${fmt(A)} proti obraně ${fmt(D)}). Získáš ji zpět útokem z Galaxie.`;log(m,'l');delete S.pl[k];S.own[k]={f,b:1,t:Date.now()};if(S.cur==k)S.cur=S.home}
 hist(m);save()}
// ---- grafika ----
function mkDefs(){$('#defs').innerHTML=Object.keys(RACES).map(id=>`<linearGradient id="ug-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${RACES[id].c[0]}"/><stop offset="1" stop-color="${RACES[id].c[1]}"/></linearGradient>`).join('')+`<radialGradient id="ubg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#1c2a3c"/><stop offset="1" stop-color="#07090d"/></radialGradient>`+TK.map(t=>`<radialGradient id="g-${t}" cx=".35" cy=".3"><stop offset="0" stop-color="${TY[t].c[0]}"/><stop offset="1" stop-color="${TY[t].c[1]}"/></radialGradient>`).join('')+`<radialGradient id="shade" cx=".3" cy=".3" r=".85"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></radialGradient><radialGradient id="sun"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffb43c"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="nzA" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".03 .06" numOctaves="4" seed="4"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.8 -.6"/></filter><filter id="nzB" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.8 -.6"/></filter><filter id="neb" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008 .014" numOctaves="4" seed="12"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .45 0 0 0 0 .9 0 0 0 1.4 -.45"/></filter>`}
function art(g,ctx,x,y,Rd){const r=rng(g.key*7+3),id='cp'+ctx+g.key,rocky=g.ty=='des'||g.ty=='vol',c0=TY[g.ty].c[0];
 let o=`<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${Rd}"/></clipPath><circle cx="${x}" cy="${y}" r="${Rd+4}" fill="${c0}" opacity=".3" filter="url(#glow)"/><g clip-path="url(#${id})"><circle cx="${x}" cy="${y}" r="${Rd}" fill="url(#g-${g.ty})"/><rect x="${x-Rd}" y="${y-Rd}" width="${2*Rd}" height="${2*Rd}" filter="url(#${rocky?'nzB':'nzA'})" opacity=".5" style="mix-blend-mode:overlay"/>`;
 if(rocky)for(let i=0;i<5;i++)o+=`<circle cx="${x+(r()-.5)*Rd*1.6}" cy="${y+(r()-.5)*Rd*1.6}" r="${Rd*(.06+r()*.12)}" fill="#000" opacity=".2"/>`;
 else if(g.ty=='gas'){for(let i=0;i<7;i++)o+=`<rect x="${x-Rd}" y="${y-Rd+i*2*Rd/7}" width="${2*Rd}" height="${2*Rd/7+.5}" fill="${i%2?'#fff':'#5a3418'}" opacity="${.12+(i%3)*.06}"/>`;if(g.name=='Jupiter')o+=`<ellipse cx="${x+Rd*.3}" cy="${y+Rd*.28}" rx="${Rd*.22}" ry="${Rd*.12}" fill="#c8583a" opacity=".85"/>`}else{o+='<g class="cl">';for(let i=0;i<4;i++)o+=`<ellipse cx="${x+(r()-.5)*Rd*1.4}" cy="${y+(r()-.5)*Rd*1.6}" rx="${Rd*(.3+r()*.4)}" ry="${Rd*.08}" fill="#fff" opacity=".4"/>`;o+='</g>'}
 if(g.name=='Země')o+=`<ellipse cx="${x-Rd*.25}" cy="${y-Rd*.1}" rx="${Rd*.35}" ry="${Rd*.22}" fill="#3f8a4a" opacity=".85"/><ellipse cx="${x+Rd*.35}" cy="${y+Rd*.3}" rx="${Rd*.25}" ry="${Rd*.15}" fill="#4f9a55" opacity=".85"/>`;
 if(g.ty=='vol')o+=`<path d="M${x-Rd} ${y+4}l${Rd*.7} -8l${Rd*.5} 10l${Rd*.8} -6" stroke="#ffb040" stroke-width="${Rd*.07}" fill="none" opacity=".85"/>`;
 return o+`<circle cx="${x}" cy="${y}" r="${Rd}" fill="url(#shade)"/></g><circle cx="${x}" cy="${y}" r="${Rd}" fill="none" stroke="#fff" stroke-opacity=".18"/>`}
const ic=k=>`<svg class="ic"><use href="#i-${k}"/></svg>`;
const UIMG={inf:'<circle cx="60" cy="18" r="8" fill="url(#ug)"/><path d="M50 62V40q0-8 10-8t10 8v22z" fill="url(#ug)"/><rect x="66" y="36" width="28" height="5" rx="2" fill="#cbd5df" transform="rotate(-10 66 38)"/><path d="M52 14q8-9 16 0" stroke="#fff" stroke-opacity=".5" fill="none"/>',
ftr:'<path d="M60 6l7 24 36 26-6 6-30-9-7 15-7-15-30 9-6-6 36-26z" fill="url(#ug)" stroke="#fff" stroke-opacity=".35"/><circle cx="54" cy="64" r="3" fill="#7fe3ff"/><circle cx="66" cy="64" r="3" fill="#7fe3ff"/>',
crs:'<path d="M8 38l16-11h58l22 11-22 11H24z" fill="url(#ug)" stroke="#fff" stroke-opacity=".35"/><path d="M46 27l6-12h18l6 12z" fill="url(#ug)"/><rect x="2" y="33" width="9" height="10" rx="3" fill="#7fe3ff"/><circle cx="60" cy="38" r="2" fill="#ffe9a0"/><circle cx="72" cy="38" r="2" fill="#ffe9a0"/><circle cx="84" cy="38" r="2" fill="#ffe9a0"/>',
flg:'<path d="M4 44l16-12h22l8-14h26l8 14h22l16 12-16 12H20z" fill="url(#ug)" stroke="#fff" stroke-opacity=".35"/><rect x="52" y="8" width="16" height="10" fill="url(#ug)"/><rect x="2" y="36" width="9" height="16" rx="3" fill="#7fe3ff"/><circle cx="48" cy="44" r="2.5" fill="#ffe9a0"/><circle cx="60" cy="44" r="2.5" fill="#ffe9a0"/><circle cx="72" cy="44" r="2.5" fill="#ffe9a0"/>',
col:'<ellipse cx="60" cy="36" rx="36" ry="17" fill="url(#ug)" stroke="#fff" stroke-opacity=".35"/><circle cx="36" cy="36" r="8" fill="#0b0e12" opacity=".5"/><circle cx="84" cy="36" r="8" fill="#0b0e12" opacity=".5"/><rect x="26" y="54" width="10" height="6" rx="2" fill="#7fe3ff"/><rect x="84" y="54" width="10" height="6" rx="2" fill="#7fe3ff"/>'};
UIMG.elite='<circle cx="60" cy="36" r="30" fill="url(#ug)" opacity=".2"/>'+UIMG.inf+'<ellipse cx="49" cy="38" rx="6" ry="4" fill="#fff" opacity=".6"/><ellipse cx="71" cy="38" rx="6" ry="4" fill="#fff" opacity=".6"/>';
const uimg=r=>`<svg class="uimg" viewBox="0 0 120 72" role="img" aria-label="${uName(r)}"><rect width="120" height="72" rx="8" fill="url(#ubg)"/><circle cx="12" cy="10" r="1" fill="#fff"/><circle cx="105" cy="20" r="1" fill="#fff"/><circle cx="20" cy="60" r="1" fill="#fff"/>${UIMG[r].replace(/#ug/g,'#ug-'+S.race)}</svg>`;
const col=k=>S.pl[k]?'#e8cf8a':S.own[k]?fc(S.own[k].f):'#6b7885';
const POS=s=>({x:62+(s%6)*100+(s<6?0:48),y:(s<6?58+(s*37)%34:172+(s*53)%34)});
function starmap(){let o=`<svg viewBox="0 0 640 250" class="smap" role="group" aria-label="Galaktická mapa"><rect width="640" height="250" filter="url(#neb)" opacity=".55"/>`;
 for(let s=0;s<11;s++){const a=POS(s),b=POS(s+1);o+=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#4fb6ff" stroke-opacity=".25" stroke-dasharray="2 5"/>`}
 for(let s=0;s<12;s++){const p=POS(s),own=SK[s].map(k=>col(k)),mine=own.filter(c=>c=='#e8cf8a').length;
  o+=`<g data-v="${s}" tabindex="0" role="button" aria-label="Systém ${SYS[s]}" class="sy"><circle cx="${p.x}" cy="${p.y}" r="36" fill="transparent"/><circle cx="${p.x}" cy="${p.y}" r="24" fill="url(#sun)" opacity=".65"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff"/>${vs==s?`<circle cx="${p.x}" cy="${p.y}" r="31" fill="none" stroke="#fff" stroke-dasharray="4 4" class="sel"/>`:''}`+own.map((c,i)=>{const a=-Math.PI/2+i*Math.PI*2/own.length;return `<circle cx="${p.x+19*Math.cos(a)}" cy="${p.y+19*Math.sin(a)}" r="4.5" fill="${c}" stroke="#0b0e12" stroke-width="1.5"/>`}).join('')+`<text x="${p.x}" y="${p.y+46}">${s+1}. ${SYS[s]}</text></g>`}
 return o+'</svg>'}
const SSZ=[6,10,11,8,26,22,15,14],SC=['#ffe9a0','#ffb43c','#ff7a5a','#9ad0ff','#e0e8ff'];
function sysview(){const ks=SK[vs],n=ks.length,sc=vs==0?'#ffe08a':SC[vs%5],XS=n==8?[88,130,176,224,306,392,474,546]:[110,215,320,425,530];
 let o=`<svg viewBox="0 0 640 220" class="smap" role="group" aria-label="Systém ${SYS[vs]}"><defs><radialGradient id="sg"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="${sc}"/><stop offset="1" stop-color="${sc}" stop-opacity="0"/></radialGradient></defs><circle cx="-14" cy="110" r="100" fill="url(#sg)"/>`;
 XS.forEach(x=>o+=`<circle cx="-14" cy="110" r="${x+14}" fill="none" stroke="#3b4652" stroke-opacity=".55" stroke-dasharray="2 5"/>`);
 if(vs==0)for(let i=0;i<26;i++){const a=-.32+.64*((i*7)%26)/26,R=265+((i*13)%9)-4;o+=`<circle cx="${-14+R*Math.cos(a)}" cy="${110+R*Math.sin(a)}" r="1.4" fill="#9aa4ae"/>`}
 ks.forEach((k,i)=>{const g=GAL[k],R=n==8?SSZ[i]:15+((vs*7+i*5)%9),off=i%2?28:-28,rr=XS[i]+14,cx=-14+Math.sqrt(rr*rr-off*off),cy=110+off,mine=S.pl[k],ow=S.own[k],st=mine?'#e8cf8a':ow?fc(ow.f):'none';
  o+=`<g class="pl" data-pl="${k}" tabindex="0" role="button" aria-label="${pn(k)}"><circle cx="${cx}" cy="${cy}" r="${R+16}" fill="transparent"/>${art(g,'v',cx,cy,R)}${g.name=='Saturn'?`<ellipse cx="${cx}" cy="${cy}" rx="${R*1.9}" ry="${R*.45}" transform="rotate(-18 ${cx} ${cy})" fill="none" stroke="#d9c49a" stroke-opacity=".85" stroke-width="3"/>`:''}<circle cx="${cx}" cy="${cy}" r="${R+4}" fill="none" stroke="${st}" stroke-width="2" class="${ow&&!mine?'npc':''}"/>${sel==k?`<circle cx="${cx}" cy="${cy}" r="${R+9}" fill="none" stroke="#fff" stroke-dasharray="4 4"/>`:''}<text x="${cx}" y="${cy+R+18}">${pn(k)}</text><text x="${cx}" y="${cy+R+32}" style="fill:${mine?'#e8cf8a':ow?'#ff9a85':'#8b98a5'}">${mine?'tvoje':ow?fn(ow.f):'volná'}</text></g>`});
 return o+'</svg>'}
function card(k){const g=GAL[k],m=S.pl[k],o=S.own[k],T=Math.round(travel(k)),cl=col(k),al=o&&S.co.includes(o.f),a=myArmy();let tg,bt,df='';
 if(m){tg=`Posádka ${m.gar} · obrana ${fmt(dfn(k))} · zastavěno ${sum(m.b)}/${fields(g)}`;bt=`<button class="go" data-k="s:${k}">Spravovat</button><button class="go" data-k="n:${k}">Přejmenovat</button>`+(k!=S.home?`<button class="go" data-k="g:${k}" ${S.u.inf>=5?'':'disabled'}>Posílit +5</button>`:'')}
 else if(o){const d=dfO(k),q=a>=d*1.6?['Snadný cíl','ez']:a>=d*.95?['Vyrovnaný boj','mid']:['Příliš silný','hard'];df=al?'':`<span class="df ${q[1]}">${q[0]}</span>`;tg=`Obrana ${fmt(d)} · kořist ${fmt(g.loot[0])} / ${fmt(g.loot[1])}${o.cap?' · hlavní město':''}`;bt=al?'<p>Spojenec, nelze napadnout.</p>':`<button class="go" data-k="m:${k}" ${a>0?'':'disabled'}>Zaútočit</button><button class="go" data-k="c:${k}" ${a>=d*1.3&&S.u.inf>=10&&nPl()<maxPl()?'':'disabled'}>Obsadit</button>`}
 else{tg='Volná planeta. Kolonizace spotřebuje 1 kolonizační loď (máš '+S.u.col+').';bt=`<button class="go" data-k="k:${k}" ${S.u.col>0&&nPl()+S.fl.filter(f=>f.t=='col').length<maxPl()?'':'disabled'}>Kolonizovat</button>`}
 const bd=m?'<span class="tag">tvoje</span>':o?`<span class="own" style="background:${cl}">${fn(o.f)}</span>`:'<span class="tag gr">volná</span>';
 return `<div class="pc${sel==k?' sel':''}" style="--c:${cl}"><svg class="pa" viewBox="0 0 64 64">${art(g,'c'+gm,32,32,26)}</svg><div class="pi"><h3>${pn(k)} ${bd} ${df}</h3><p>${TY[g.ty].n} · ${fields(g)} polí · cesta ${T} s</p>${g.desc?`<p>${g.desc}</p>`:''}<p class="tg">${tg}</p><div class="pb">${bt}</div></div></div>`}
// ---- záložky ----
function row(key,d,l,c,t,off,extra,req){const rq=reqOK(req),can=ok(c)&&!off&&rq,k=key.split(':')[1];return `<div class="row"><div class="rh">${ic(k)}<div><h3>${d.n}${l!==null?` <span class="lv">úr. ${l}</span>`:''}</h3><p>${d.d}</p><span class="cost"><i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}${extra||''}</span>${rq?(off?`<p class="bad">${off}</p>`:`<p class="eta" data-c="${c[0]},${c[1]}"></p>`):`<p class="bad">Vyžaduje: ${reqTx(req)}</p>`}</div></div><button class="go" data-k="${key}" ${can?'':'disabled'}>${t}</button></div>`}
const newsHTML=()=>`<h2>Zprávy z galaxie</h2>`+(S.news.length?S.news.map(n=>`<p><small>${new Date(n.t).toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}</small> ${n.m}</p>`).join(''):'<p>Zatím klid. Říše se rozvíjejí a brzy začnou válčit.</p>');
function tHangar(){return Object.keys(UN).map(k=>{const rq=reqOK(UN[k].req),c=uCost(k);return `<div class="row urow" data-u="${k}"><div class="rh">${uimg(k)}<div><h3>${uName(k)} <span class="lv">máš ${S.u[k]}</span></h3><p>${UN[k].d}</p><span class="cost">Síla ${UN[k].atk} · HP ${HP[k]} · za kus <i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}</span>${rq?`<p class="mx"></p><p class="tc cost"></p><p class="eta" data-c="0,0"></p>`:`<p class="bad">Vyžaduje: ${reqTx(UN[k].req)}</p>`}</div></div>${rq?`<div class="qty"><input type="number" inputmode="numeric" min="1" value="${QT[k]||1}" aria-label="Počet kusů"><button class="chip" data-k="x:${k}">Max</button><button class="go" data-k="u:${k}">Vyrobit</button></div>`:''}</div>`}).join('')}
function tOver(){const r=rates(),bd=board(),rank=bd.findIndex(x=>x.me)+1;
 return `<div class="stats"><div><small>Planety</small><b>${nPl()} / ${maxPl()}</b></div><div><small>Těžba</small><b>${r.n.toFixed(1)} / ${r.t.toFixed(1)} /s</b></div><div><small>Síla flotily</small><b>${fmt(myArmy())}</b></div><div><small>Pořadí</small><b>${rank}. z ${bd.length}</b></div></div><h2>Tvoje planety</h2>`+
 Object.keys(S.pl).map(k=>{const p=S.pl[k],q=pr(k),g=GAL[k],us=sum(p.b),fl=fields(g);return `<div class="card"><div class="ph"><svg class="pa s" viewBox="0 0 64 64">${art(g,'o',32,32,26)}</svg><div><h3>${pn(k)} ${k==S.home?'<span class="tag">hlavní</span>':''}</h3><p>${TY[g.ty].n} · ${SYS[g.s]}</p></div></div><p class="cost"><i class="gem n"></i>+${q.n.toFixed(1)}/s <i class="gem t"></i>+${q.t.toFixed(1)}/s · Obrana ${fmt(dfn(k))} · Posádka ${p.gar}</p><p>Doly ${p.b.naq}/${p.b.tri} · Reaktor ${p.b.reak} · Platforma ${p.b.def} · Štít ${p.b.shd}</p><div class="fbar"><i style="width:${Math.min(100,us/fl*100)}%"></i></div><p>Zastavěno ${us} / ${fl} polí</p>${q.e<1?`<p class="bad">Energie ${Math.round(q.e*100)} %</p>`:''}<button class="go" data-k="s:${k}">Spravovat</button><button class="go" data-k="n:${k}">Přejmenovat</button>${k!=S.home?`<button class="go" data-k="g:${k}" ${S.u.inf>=5?'':'disabled'}>Posílit +5</button>`:''}</div>`}).join('')+newsHTML()}
function tBase(){const p=S.pl[S.cur],g=GAL[S.cur],pp=pr(S.cur),us=sum(p.b),fl=fields(g),full=us>=fl;
 return `<div class="strip">`+Object.keys(S.pl).map(k=>`<button class="chip ${k==S.cur?'act':''}" data-k="p:${k}">${pn(k)}</button>`).join('')+`</div><div class="card"><p>${TY[g.ty].n} planeta · těžba +${pp.n.toFixed(1)} naquadah/s, +${pp.t.toFixed(1)} trinium/s</p><p>Zastavěno <b>${us} / ${fl}</b> polí. Každá úroveň budovy zabere jedno pole, další pole přidá výzkum Terraformace.</p><div class="fbar"><i style="width:${Math.min(100,us/fl*100)}%"></i></div></div>`
 +Object.keys(B).map(k=>row('b:'+k,B[k],p.b[k],cost(B[k],p.b[k]),p.b[k]?'Vylepšit':'Postavit',full?'Planeta nemá volná pole':'','',B[k].req)).join('')+(pp.e<1?`<p class="bad">Nedostatek energie, těžba běží na ${Math.round(pp.e*100)} %. Vylepši reaktor.</p>`:'')
 +`<h2>Velitelství</h2>`+Object.keys(G).map(k=>row('q:'+k,G[k],S.g[k],cost(G[k],S.g[k]),S.g[k]?'Vylepšit':'Postavit')).join('')}
function tMap(){
 const seg=`<div class="seg">`+[['map','Mapa'],['list','Cíle'],['fleet','Flotily'+(S.fl.length?' ('+S.fl.length+')':'')]].map(([k,t])=>`<button class="${gm==k?'act':''}" data-gm="${k}">${t}</button>`).join('')+`</div>`;
 if(gm=='map'){const sk=SK[vs],mine=sk.filter(k=>S.pl[k]).length,free=sk.filter(k=>!S.pl[k]&&!S.own[k]).length;
  return seg+`<div class="legend"><span><i style="background:#e8cf8a"></i>tvoje</span><span><i style="background:#6b7885"></i>volná</span><span><i style="background:#e0705a"></i>cizí (barva = říše)</span></div><div class="mapbox">${starmap()}</div><p class="hint">Klepni na systém v mapě, pod ní uvidíš jeho planety.</p><h2>Systém ${vs+1}: ${SYS[vs]}</h2><div class="mapbox">${sysview()}</div><p>${mine} tvoje · ${free} volné · ${sk.length-mine-free} cizí. Tvoje síla útoku: <b>${fmt(myArmy())}</b></p>`+sk.map(card).join('')}
 if(gm=='list'){const F={weak:['Slabé cíle',k=>S.own[k]&&!S.co.includes(S.own[k].f)&&myArmy()>=dfO(k)*.95],enemy:['Všichni nepřátelé',k=>S.own[k]&&!S.co.includes(S.own[k].f)],free:['Volné planety',k=>!S.own[k]&&!S.pl[k]],mine:['Moje planety',k=>S.pl[k]]};
  const ks=GAL.map(g=>g.key).filter(F[gf][1]).sort((x,y)=>travel(x)-travel(y)).slice(0,12);
  return seg+`<div class="strip">`+Object.keys(F).map(k=>`<button class="chip ${gf==k?'act':''}" data-gf="${k}">${F[k][0]}</button>`).join('')+`</div><p class="hint">Seřazeno podle vzdálenosti od aktuální planety. Tvoje síla útoku: <b>${fmt(myArmy())}</b></p>`+(ks.length?ks.map(card).join(''):'<p>Žádné planety v této skupině.</p>')}
 return seg+(S.fl.length?S.fl.map(f=>{const s=f.ph?f.arr:f.go,e=f.ph?f.back:f.arr,un=Object.entries(f.u).filter(([,n])=>n>0).map(([r,n])=>n+'× '+uName(r)).join(', ');return `<div class="fl"><b>${({col:'Kolonizace',atk:'Útok',occ:'Invaze'})[f.t]}</b> · ${GAL[f.k].name} · ${f.ph?'návrat':'let'} <span class="cd" data-t="${e}"></span><p>${un}</p><div class="pg"><i data-s="${s}" data-e="${e}"></i></div></div>`}).join(''):'<p>Žádné flotily na cestě.</p>')+`<h2>Poslední bitvy</h2>`+(S.hist.length?S.hist.map(h=>`<p>${h}</p>`).join(''):'<p>Zatím žádné.</p>')}
function tDip(){const n=S.co.length,c=[600*(n+1),400*(n+1)],bd=board(),me=bd.find(x=>x.me).s,tot=me+bd.filter(x=>x.ally).reduce((a,x)=>a+x.s,0);
 return `<h2>Koalice (${n} / ${Math.min(3,S.g.dip)})</h2><p>Spojence nelze napadnout a dávají bonus. S ostatními rasami můžeš válčit: stačí je napadnout v Galaxii (spojence nejdřív vyhoď z koalice). Skóre koalice: <b>${fmt(tot)}</b>.</p>`+Object.keys(RACES).filter(x=>x!=S.race).map(id=>{const r=RACES[id],in_=S.co.includes(id);return `<div class="row"><div><h3><span class="dot" style="background:linear-gradient(135deg,${r.c[0]},${r.c[1]})"></span> ${r.n} ${in_?'<span class="tag">spojenec</span>':'<span class="tag gr">neutrální</span>'}</h3><p>${r.d}</p><span class="cost">Bonus pro koalici: ${r.allyT}</span>${in_?'':`<p class="cost"><i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}</p><p class="eta" data-c="${c[0]},${c[1]}"></p>`}</div><button class="go" data-k="${in_?'l':'j'}:${id}" ${in_||(n<Math.min(3,S.g.dip)&&ok(c))?'':'disabled'}>${in_?'Opustit':'Přizvat'}</button></div>`}).join('')
 +`<h2>Žebříček říší</h2><ol class="board">`+bd.map(x=>`<li class="${x.me?'me':x.ally?'ally':''}"><span><i class="dot s" style="background:${x.c||'#e8cf8a'}"></i>${x.n}${x.ally?' · spojenec':''}<small>${x.pl} planet · armáda ${fmt(x.ar)}${x.p?' · '+x.p:''}${x.pl?'':' · poražena'}</small></span><b>${fmt(x.s)}</b></li>`).join('')+`</ol><p>Říše se rozvíjejí podle své povahy (agresivní, ekonomická, obranná): staví, kolonizují, trénují armádu a válčí mezi sebou i s tebou. Goa'uldi ovládá jediný vládce.</p>${newsHTML()}`}
const HI={atk:'zbr',def:'shd',eco:'naq',res:'lab',spd:'poh',loot:'tri'};
function hpic(id,lv){const h=HEROES[id],ini=h.n.split(/[\s'’./]+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
 return `<svg class="hpic" viewBox="0 0 80 80" role="img" aria-label="${h.n}"><defs><clipPath id="hc${id}"><circle cx="40" cy="40" r="36"/></clipPath></defs><circle cx="40" cy="40" r="38" fill="url(#ug-${h.r})" stroke="#e8cf8a" stroke-width="2"/><g clip-path="url(#hc${id})"><circle cx="40" cy="30" r="12" fill="#0b0e12" opacity=".55"/><path d="M12 80c0-20 12-30 28-30s28 10 28 30z" fill="#0b0e12" opacity=".55"/></g><text x="40" y="70" text-anchor="middle" font-family="Cinzel,serif" font-size="15" font-weight="700" fill="#fff" style="text-anchor:middle">${ini}</text><circle cx="64" cy="16" r="11" fill="#10151b" stroke="#e8cf8a"/><svg x="56" y="8" width="16" height="16" style="color:#f0d99a"><use href="#i-${HI[h.t]}"/></svg>${lv?`<circle cx="16" cy="64" r="10" fill="#c9a24b"/><text x="16" y="68" text-anchor="middle" font-size="11" font-weight="700" fill="#1a1405" style="text-anchor:middle">${lv}</text>`:''}</svg>`}
function tHeroes(){const own=heroes(),mx=maxHeroes(),n=own.length;
 let h=`<h2>Moji hrdinové (${n} / ${mx})</h2><p>Hrdinové dávají bonusy a sami se zlepšují tím, jak pracují: zkušenosti jim přibývají časem a rychleji při činnostech jejich oboru (bitvy, těžba, výzkum, cesty). Další místo odemkneš vylepšením Kasáren (nyní úr. ${S.g.kas}).</p>`;
 h+=n?own.map(id=>{const d=HEROES[id],t=HT[d.t],l=S.hero[id],p=l.lv>=10?100:l.xp/need(l.lv)*100;return `<div class="card hero"><div class="ph">${hpic(id,l.lv)}<div><h3>${d.n} <span class="lv">úr. ${l.lv}${l.lv>=10?' (max)':''}</span></h3><p>${d.d}</p><p class="cost">${t.n}: +${Math.round(t.v*l.lv*100)} % ${t.u}${l.lv<10?` · další úroveň +${Math.round(t.v*100)} %`:''}</p></div></div><div class="pg"><i style="width:${p}%"></i></div><p><small>Zkušenosti ${fmt(l.xp)} / ${l.lv>=10?'max':fmt(need(l.lv))}</small></p></div>`}).join(''):'<p>Zatím nemáš žádného hrdinu.</p>';
 const av=Object.keys(HEROES).filter(id=>HEROES[id].r==S.race&&!S.hero[id]);
 h+=`<h2>K náboru</h2>`+(av.length?av.map(id=>{const d=HEROES[id],t=HT[d.t],c=hc(id),full=n>=mx;return `<div class="row"><div class="rh">${hpic(id,0)}<div><h3>${d.n}</h3><p>${d.d}</p><span class="cost">${t.n}: +${Math.round(t.v*100)} % ${t.u} za úroveň (max. úr. 10) · <i class="gem n"></i>${fmt(c[0])} <i class="gem t"></i>${fmt(c[1])}</span>${full?'<p class="bad">Není volné místo, vylepši Kasárna.</p>':`<p class="eta" data-c="${c[0]},${c[1]}"></p>`}</div></div><button class="go" data-k="h:${id}" ${full||!ok(c)?'disabled':''}>Najmout</button></div>`}).join(''):'<p>Všechny hrdiny své rasy už máš.</p>');
 return h}
function build(){return ({over:tOver,base:tBase,lab:()=>Object.keys(R).map(k=>row('r:'+k,R[k],S.r[k],cost(R[k],S.r[k],eff('res')),'Zkoumat',0,'',R[k].req)).join(''),hangar:tHangar,map:tMap,hero:tHeroes,dip:tDip})[tab]()}
function render(){const h=build();if(h===last)return;last=h;$('#tab').innerHTML=h}
function dyn(){const now=Date.now();
 document.querySelectorAll('.urow').forEach(r=>{const k=r.dataset.u,inp=r.querySelector('input');if(!inp)return;QT[k]=inp.value;const c=uCost(k),mx=Math.floor(Math.min(S.n/c[0],S.t/c[1])),q=Math.max(1,Math.floor(+inp.value)||1),tc=[c[0]*q,c[1]*q];r.querySelector('.mx').textContent='Můžeš vyrobit: '+fmt(mx)+' ks';r.querySelector('.tc').innerHTML=`Celkem za ${q} ks: <i class="gem n"></i>${fmt(tc[0])} <i class="gem t"></i>${fmt(tc[1])}`;r.querySelector('.eta').dataset.c=tc.join(',');r.querySelector('[data-k^="u:"]').disabled=!ok(tc)});document.querySelectorAll('.eta').forEach(e=>{const [a,b]=e.dataset.c.split(',').map(Number),t=eta([a,b]);e.textContent=t;e.className='eta'+(t[0]=='✓'?' yes':'')});document.querySelectorAll('.cd').forEach(e=>e.textContent=fmtT(Math.max(0,(+e.dataset.t-now)/1000)));document.querySelectorAll('.pg i').forEach(e=>e.style.width=Math.min(100,Math.max(0,(now-e.dataset.s)/(e.dataset.e-e.dataset.s)*100))+'%')}
function draw(){const r=rates(),rk=board().findIndex(x=>x.me)+1;$('#r-n').textContent=fmt(S.n);$('#r-t').textContent=fmt(S.t);$('#p-n').textContent='+'+r.n.toFixed(1)+'/s';$('#p-t').textContent='+'+r.t.toFixed(1)+'/s';
 $('#r-p').textContent=nPl()+' / '+maxPl();$('#p-p').textContent='pořadí '+rk+'.';$('#gate').classList.toggle('open',S.fl.length>0);render()}
function setTab(t){tab=t;last=null;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('act',b.dataset.tab==t));render();dyn();scrollTo(0,0)}
function hud(){const r=RACES[S.race];$('#emb').style.background=`linear-gradient(135deg,${r.c[0]},${r.c[1]})`;$('#who').textContent=S.cmd+' · '+r.n}
function pick(id){S.race=id;S.cmd=S.cmd||'Velitel';S.home=HK(id);S.pl={[S.home]:home()};S.cur=S.home;S.ts=S.start=Date.now();initAI();hud();$('#pick').hidden=true;save();log('Vítej, '+S.cmd+'. Tvůj domovský svět: '+RACES[id].home+'.');setTab('over');tick()}
// ---- ovládání ----
document.addEventListener('click',e=>{
 const rc=e.target.closest('[data-race]');if(rc)return pick(rc.dataset.race);
 const n=e.target.closest('nav button');if(n)return setTab(n.dataset.tab);
 if(e.target.closest('#next')){S.cmd=($('#cmd').value||'Velitel').trim().slice(0,20)||'Velitel';$('#step1').hidden=true;$('#step2').hidden=false;return}
 const gb=e.target.closest('[data-gm]');if(gb){gm=gb.dataset.gm;last=null;render();return dyn()}
 const fb=e.target.closest('[data-gf]');if(fb){gf=fb.dataset.gf;last=null;render();return dyn()}
 const pl=e.target.closest('[data-pl]');if(pl){sel=+pl.dataset.pl;last=null;render();const c=document.querySelector('.pc.sel');if(c&&c.scrollIntoView)c.scrollIntoView({block:'center',behavior:'smooth'});return dyn()}
 const v=e.target.closest('[data-v]');if(v){vs=+v.dataset.v;last=null;render();return dyn()}
 const b=e.target.closest('[data-k]');if(!b)return;const [t,k]=b.dataset.k.split(':');
 if(t=='h'){const c=hc(k);if(S.hero[k]||heroes().length>=maxHeroes()||!ok(c))return;pay(c);S.hero[k]={lv:1,xp:0};log('Hrdina '+HEROES[k].n+' se přidal k tvé říši.','w');save();draw();return dyn()}
 if(t=='m')return launch('atk',+k);if(t=='c')return launch('occ',+k);if(t=='k')return launch('col',+k);
 if(t=='p'){S.cur=+k;return render()}if(t=='s'){S.cur=+k;return setTab('base')}
 if(t=='n'){const nn=prompt('Nový název planety:',pn(k));if(nn&&nn.trim()){S.pl[k].name=nn.trim().slice(0,24);save();render()}return}
 if(t=='g'){if(S.u.inf>=5&&S.pl[k]){S.u.inf-=5;S.pl[k].gar+=5;log('Posádka '+pn(k)+' posílena o 5.');save();render()}return}
 if(t=='j'){const c=[600*(S.co.length+1),400*(S.co.length+1)];if(S.co.length<Math.min(3,S.g.dip)&&ok(c)&&!S.co.includes(k)){pay(c);S.co.push(k);log(RACES[k].n+' se přidali ke koalici.','w');save();draw()}return}
 if(t=='l'){S.co=S.co.filter(x=>x!=k);log(RACES[k].n+' opustili koalici. Teď je můžeš napadnout.');save();draw();return}
 if(t=='x'){const r=b.closest('.row'),c=uCost(k);r.querySelector('input').value=Math.max(1,Math.floor(Math.min(S.n/c[0],S.t/c[1])));return dyn()}
 if(t=='u'){const r=b.closest('.row'),q=Math.max(1,Math.floor(+r.querySelector('input').value)||1),c=uCost(k).map(v=>v*q);if(!ok(c)||!reqOK(UN[k].req))return;pay(c);S.u[k]+=q;log('Vyrobeno: '+q+'× '+uName(k))}
 else{const d=({b:B,q:G,r:R})[t][k],o=t=='b'?S.pl[S.cur].b:t=='q'?S.g:S.r,c=cost(d,o[k],t=='r'?eff('res'):1);if(!ok(c)||!reqOK(d.req)||(t=='b'&&sum(o)>=fields(GAL[S.cur])))return;pay(c);o[k]++;if(t=='r')xp('res',60);log(d.n+' na úrovni '+o[k]+'.')}
 save();draw();dyn()});
document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('.urow'))dyn()});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='cmd'){$('#next').click();return}if((e.key=='Enter'||e.key==' ')&&e.target.dataset&&e.target.dataset.v!==undefined){e.preventDefault();vs=+e.target.dataset.v;last=null;render();dyn()}});
$('#rename').onclick=()=>{const n=prompt('Jméno velitele:',S.cmd);if(n&&n.trim()){S.cmd=n.trim().slice(0,20);hud();save()}};
$('#b-close').onclick=()=>{$('#battle').hidden=true};
$('#reset').onclick=()=>{if(confirm('Opravdu smazat veškerý postup?')){localStorage.removeItem('sgc6');location.reload()}};
function save(){try{localStorage.setItem('sgc6',JSON.stringify(S))}catch(e){}}
(()=>{let g='';for(let i=0;i<39;i++){const a=i/39*2*Math.PI,s=Math.sin(a),c=Math.cos(a);g+=`<path d="M${200+147*s} ${200-147*c}L${200+176*s} ${200-176*c}"/><circle cx="${200+162*s}" cy="${200-162*c}" r="3" fill="#c9a24b" stroke="none"/>`}$('#glyphs').innerHTML=g;
 let c='';for(let i=0;i<9;i++){const a=(i*40+200)*Math.PI/180;c+=`<g transform="translate(${200+183*Math.sin(a)} ${200-183*Math.cos(a)}) rotate(${i*40+200})"><path class="chev" d="M-17 -15L17 -15L10 15L-10 15Z"/></g>`}$('#chevs').innerHTML=c;
 [['l1',90,1],['l2',60,1.4],['l3',35,2]].forEach(([id,n,sz],j)=>{const cv=document.createElement('canvas');cv.width=cv.height=512;const x=cv.getContext('2d'),r=rng(7+j);for(let i=0;i<n;i++){x.fillStyle=`rgba(${j==2?'255,230,190':'255,255,255'},${.35+r()*.65})`;x.fillRect(Math.floor(r()*512),Math.floor(r()*512),sz,sz)}$('#'+id).style.backgroundImage=`url(${cv.toDataURL()})`})})();
async function boot(){
 try{const r=await fetch('data.json');if(!r.ok)throw new Error(r.status);({TY,SYS,GOA,B,G,R,UN,RACES,HEROES,HT}=await r.json())}
 catch(e){$('#tab').textContent='Nepodařilo se načíst data.json. Hru spusť přes server (npm start), ne otevřením souboru.';return}
 TK=Object.keys(TY);buildGalaxy();mkDefs();
 if(!S.race||!RACES[S.race]){S=fresh();$('#cards').innerHTML=Object.keys(RACES).map(id=>{const r=RACES[id];return `<button class="rc" data-race="${id}" style="--a:${r.c[0]};--b:${r.c[1]}"><span class="emb"></span><h3>${r.n}</h3><p>${r.d}</p><small>${r.bonus}</small></button>`}).join('');$('#pick').hidden=false;setTimeout(()=>$('#cmd').focus(),150);setInterval(tick,1000);setInterval(save,5000);return}
 hud();tick();setInterval(tick,1000);setInterval(save,5000)}
boot();
