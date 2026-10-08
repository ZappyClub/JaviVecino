/* ============ COMPONENTES ============ */
const Spot=()=>`<section class="s sp"><div class="wrap spg"><div><p class="lbl">Spotify</p><h2>Dale play<br>a la playlist</h2><p class="spt">Escucha la playlist de DJ Javi Vecino en Spotify.</p><a class="btn s" href="${spotUrl()}" target="_blank" rel="noopener">Abrir en Spotify</a></div><a class="spc" href="${spotUrl()}" target="_blank" rel="noopener" aria-label="Abrir la playlist en Spotify"><span class="spi"><img src="assets/img/playlist-cover.jpg" alt="Portada de la playlist de Javi Vecino en Spotify" width="720" height="960" loading="lazy" decoding="async"></span><span class="spm"><b>JAVIVECINO Playlist</b><i>Todos mis hits aquí · Spotify</i><span class="spb"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg></span></span><span class="eqs" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></a></div></section>`;
const Ses=()=>{const s=DATA.session;if(!s||!s.url)return '';
 return Sec('YouTube','Última sesión','Ver en YouTube',s.url,`<a class="sesc" href="${s.url}" target="_blank" rel="noopener" aria-label="Ver la última sesión en YouTube" data-cur="Play"><span class="sesi">${s.cover?`<img src="${s.cover}" alt="Portada de la última sesión de DJ Javi Vecino en YouTube" width="1280" height="720" loading="lazy" decoding="async">`:''}</span><span class="pl2" aria-hidden="true"></span>${s.title?`<span class="sest">${s.title}</span>`:''}</a>`)};
const SP=(t,o)=>[...t].map((c,i)=>c===' '?' ':`<span class="lt" aria-hidden="true" style="animation-delay:${(.3+(i+o)*.045).toFixed(2)}s">${c}</span>`).join('');
const Photo=(k,alt,sizes,pos)=>{const p=PH[k];return `<img src="${p.src}" srcset="${p.set}" sizes="${sizes}" alt="${alt}" loading="lazy" decoding="async" style="object-position:${pos||'50% 30%'}">`};
const $=s=>document.querySelector(s),esc=s=>String(s);
const U=s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value};
const spotUrl=()=>(DATA.artist.social.find(s=>s[0]==='Spotify')||[0,SPOT])[1];
const dl=m=>{const u=m.download||m.audio;return u?`<a class="btn s" href="${u}" target="_blank" rel="noopener" download aria-label="Descargar ${m.title}">Descargar</a>`:(DATA.live?'':`<a class="btn s" href="#" aria-label="Descargar ${m.title}">Descargar</a>`)};
const Img=(src,label,alt,cls='')=>src?`<img src="${src}" alt="${alt||label}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`:`<div class="ph ${cls}" role="img" aria-label="Placeholder: ${label}"><span>${label}</span></div>`;
const Btn=(t,h,s)=>`<a class="btn ${s?'s':''}" href="${h}"${/^https?:/.test(h)?' target="_blank" rel="noopener"':''}>${t}</a>`;
const Sec=(lbl,title,cta,href,body)=>`<section class="s"><div class="wrap"><div class="sh"><div><p class="lbl">${lbl}</p><h2>${title}</h2></div>${cta?Btn(cta,href):''}</div>${body}</div></section>`;
const I={play:'<svg viewBox="0 0 16 16"><path d="M3 1.5v13l11-6.5z"/></svg>',pause:'<svg viewBox="0 0 16 16"><path d="M3 1h4v14H3zM9 1h4v14H9z"/></svg>'};
let cur=null;
const Player=m=>(m.audio||!DATA.live)?PlayerRaw(m):'<p class="tag">Audio próximamente</p>';
const PlayerRaw=m=>`<div class="pl" data-p="${m.slug}"><button class="pb" aria-label="Reproducir ${m.title}" aria-pressed="false">${I.play}</button><div class="bar" role="slider" aria-label="Progreso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><i><b></b></i></div><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="tm">0:00</span></div>`;
function wire(){document.querySelectorAll('[data-p]').forEach(el=>{const m=DATA.mashups.find(x=>x.slug===el.dataset.p),b=el.querySelector('.pb'),bar=el.querySelector('.bar'),fill=el.querySelector('b'),tm=el.querySelector('.tm');
 let pos=0,dur=30,t=null,au=null;if(m.audio){au=new Audio(U(m.audio));au.preload='none';au.onloadedmetadata=()=>dur=au.duration}
 const draw=()=>{const p=au?au.currentTime/(au.duration||1):pos/dur;fill.style.width=p*100+'%';bar.setAttribute('aria-valuenow',Math.round(p*100));const s=Math.floor(au?au.currentTime:pos);tm.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 const stop=()=>{b.innerHTML=I.play;el.classList.remove('on');b.setAttribute('aria-pressed','false');clearInterval(t);au&&au.pause()};
 const go=()=>{if(cur&&cur!==stop)cur();cur=stop;el.classList.add('on');b.innerHTML=I.pause;b.setAttribute('aria-pressed','true');if(au)au.play();else t=setInterval(()=>{pos+=.25;if(pos>=dur){pos=0;stop()}draw()},250)};
 if(au)au.ontimeupdate=draw;
 b.onclick=()=>b.getAttribute('aria-pressed')==='true'?stop():go();
 bar.onclick=e=>{const r=bar.getBoundingClientRect(),p=(e.clientX-r.left)/r.width;au?au.currentTime=p*(au.duration||0):pos=p*dur;draw()}})}
const Mashup=m=>`<article class="mi"><a href="#/mashups/${m.slug}" class="fr sq" aria-label="${m.title}">${Img(m.cover,'Portada',m.title)}</a><div><h3><a href="#/mashups/${m.slug}">${m.title}</a></h3><p class="sub">${m.artists}</p><p class="tag">${[m.bpm&&m.bpm+' BPM',m.date].filter(Boolean).join(' · ')}</p></div>${Player(m)}<div class="acts"><a class="btn" href="#/mashups/${m.slug}">Ver</a>${dl(m)}</div></article>`;
const MN=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const CAL={y:null,m:0,sel:''};
const EvRow=e=>`<a class="er ${e.past?'past':''}" href="#/agenda/${e.slug}"><b>${e.d}<small>${e.m} ${e.y}</small></b><span><strong>${e.title}</strong><em>${[e.venue,e.city,e.time&&e.time+'h'].filter(Boolean).join(' · ')}</em></span><i aria-hidden="true">→</i></a>`;
function CalInner(){
 if(CAL.y===null){const u=DATA.events.filter(e=>!e.past&&e.date).sort((x,y)=>x.date<y.date?-1:1)[0],d=u?new Date(u.date+'T00:00'):new Date();CAL.y=d.getFullYear();CAL.m=d.getMonth()}
 const y=CAL.y,m=CAL.m,pad=n=>String(n).padStart(2,'0'),t=new Date(),td=t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate());
 const key=d=>y+'-'+pad(m+1)+'-'+pad(d),n=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7;
 const by={};DATA.events.forEach(e=>{if(e.date)(by[e.date]=by[e.date]||[]).push(e)});
 let c='';for(let i=0;i<off;i++)c+='<span class="cd0"></span>';
 for(let d=1;d<=n;d++){const k=key(d),has=by[k],cl='cd'+(has?' has':'')+(k===td?' td':'')+(k===CAL.sel?' cds':'');
  c+=has?`<button type="button" class="${cl}" data-cd="${k}" aria-label="${d} de ${MN[m]}: ${has.length} actuación(es)">${d}<i></i></button>`:`<span class="${cl}">${d}</span>`}
 const mon=DATA.events.filter(e=>e.date&&e.date.startsWith(y+'-'+pad(m+1))).sort((x,z)=>x.date<z.date?-1:1);
 const list=CAL.sel&&by[CAL.sel]?by[CAL.sel]:mon;
 const title=CAL.sel&&by[CAL.sel]?'Actuaciones del '+CAL.sel.split('-').reverse().join('/'):'Actuaciones en '+MN[m].toLowerCase();
 return `<div class="ch"><button type="button" data-cm="-1" aria-label="Mes anterior">‹</button><h2>${MN[m]} <span>${y}</span></h2><button type="button" data-cm="1" aria-label="Mes siguiente">›</button></div><div class="cg" role="grid">${['L','M','X','J','V','S','D'].map(w=>'<b>'+w+'</b>').join('')}${c}</div><p class="cl"><i></i> Día con actuación</p><h3 class="ct">${title}</h3>${list.length?'<div class="er-l">'+list.map(EvRow).join('')+'</div>':'<p class="emp">No hay actuaciones este mes.</p>'}`}
document.addEventListener('click',e=>{const el=document.getElementById('cal');if(!el)return;const b=e.target.closest('[data-cm],[data-cd]');if(!b||!el.contains(b))return;
 if(b.dataset.cm){CAL.m+=+b.dataset.cm;if(CAL.m<0){CAL.m=11;CAL.y--}if(CAL.m>11){CAL.m=0;CAL.y++}CAL.sel=''}else CAL.sel=CAL.sel===b.dataset.cd?'':b.dataset.cd;
 el.innerHTML=CalInner()});
const Event=e=>`<article class="ev ${e.past?'past':''}"><div class="d">${e.d}<small>${e.m} ${e.y}</small></div><a class="fr po" href="#/agenda/${e.slug}" style="aspect-ratio:3/4;width:88px" aria-label="Cartel ${e.title}">${Img(e.poster,'Cartel',e.title)}</a><div><h3><a href="#/agenda/${e.slug}">${e.title}</a></h3><p class="sub">${[e.venue,e.city,e.time&&e.time+'h'].filter(Boolean).join(' · ')}</p></div><div class="acts">${e.past||!e.tickets?'':Btn('Entradas',e.tickets,1)}${Btn('Info','#/agenda/'+e.slug)}</div></article>`;
const Pack=p=>`<a class="card" href="#/packs/${p.slug}"><div class="fr sq">${Img(p.cover,'Portada pack',p.title)}</div><h3>${p.title}</h3><p>${[p.tracks+' tracks',p.desc].filter(Boolean).join(' · ')}</p></a>`;
const Gal=g=>{const cap=g.label||g.title||'';
 const img=g.ph?Photo(g.ph,g.alt,g.sizes,g.pos):g.src?`<img src="${g.src}" alt="${g.title||'DJ Javi Vecino'}" loading="lazy" decoding="async">`:Img('',cap||'Vídeo',cap);
 const body=`${img}<figcaption>${cap}</figcaption>`;
 if(g.type==='video'&&g.url)return `<figure data-t="${g.type||''}" class="gi ${g.cls||''} vid" data-cur="Ver"><a href="${g.url}" target="_blank" rel="noopener" aria-label="Ver vídeo ${cap}">${body}<span class="pl2" aria-hidden="true"></span></a></figure>`;
 return `<figure data-t="${g.type||''}" class="gi ${g.cls||''}" data-cur="Ver">${body}</figure>`};
const Social=()=>`<div class="soc">${DATA.artist.social.map(s=>`<a href="${s[1]}" rel="noopener" target="_blank">${s[0]}</a>`).join('')}</div>`;
/* ============ PÁGINAS ============ */
let up=[],past=[];
function derive(){up=DATA.events.filter(e=>!e.past).sort((x,y)=>(x.date||'').localeCompare(y.date||''));past=DATA.events.filter(e=>e.past).sort((x,y)=>(y.date||'').localeCompare(x.date||''))}
derive();
const P={
home:()=>{const e=up[0],L=DATA.live;
return `<section class="hero"><picture class="bg"><source media="(min-width:821px)" srcset="${PH.hero.set}" sizes="100vw"><img src="${PH.heroM.src}" srcset="${PH.heroM.set}" sizes="100vw" alt="DJ Javi Vecino pinchando en directo" fetchpriority="high" decoding="async"></picture><div class="wrap"><p class="lbl hp">DJ · Mashups · Sesiones</p><h1 class="hn" aria-label="DJ Javi Vecino"><span class="h1a">${SP('DJ JAVI',0)}</span><br><span class="h1b">${SP('VECINO',7)}</span></h1><div class="hb">${DATA.artist.tagline?`<p>${DATA.artist.tagline}</p>`:''}<div class="row">${Btn('Mashups','#/mashups',1)}${Btn('Agenda','#/agenda')}</div></div></div><span class="vt" aria-hidden="true">Web oficial</span><svg class="badge" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="cc" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#cc">DJ Javi Vecino · Mashups · Directo · </textPath></text><circle cx="60" cy="60" r="5" fill="#35c8ff"/></svg></section>
<div class="mq" aria-hidden="true"><div>${'<span>Mashups</span><i>/</i><span>Agenda</span><i>/</i><span>Packs</span><i>/</i><span>Contenido</span><i>/</i>'.repeat(8)}</div></div>`
+(e?`<section class="s inv"><div class="wrap next"><div class="fr po">${Img(e.poster,'Cartel próxima actuación',e.title)}</div><div><p class="lbl">Próxima actuación${L?'':' · datos temporales'}</p><p class="d dt">${e.d} ${e.m}</p><h3 style="font-size:24px;margin-top:10px">${e.title}</h3><dl class="meta">${e.time?`<dt>Hora</dt><dd>${e.time}h</dd>`:''}${e.venue?`<dt>Sala</dt><dd>${e.venue}</dd>`:''}${e.city?`<dt>Ciudad</dt><dd>${e.city}</dd>`:''}</dl>${e.tickets?Btn('Entradas',e.tickets,1):''}</div></div></section>`:'')
+(DATA.mashups.length?Sec('Música','Mashups','Ver todos los mashups','#/mashups','<div class="ml">'+DATA.mashups.slice(0,3).map(Mashup).join('')+'</div>'):'')
+Ses()
+Spot()
+(up.length?Sec('Directos','Agenda','Ver agenda completa','#/agenda','<div class="er-l">'+up.slice(0,4).map(EvRow).join('')+'</div>'):'')
+(DATA.packs.length?Sec('Descargas','Packs','Ver packs','#/packs','<div class="g3">'+DATA.packs.slice(0,3).map(Pack).join('')+'</div>'):'')
+(DATA.gallery.filter(g=>g.src||g.ph).length?Sec('Imagen','Contenido','Ver contenido','#/contenido','<div class="strip">'+DATA.gallery.filter(g=>g.src||g.ph).slice(0,3).map(g=>Gal({...g,cls:''})).join('')+'</div>'):'')
+`<section class="s"><div class="wrap two"><div class="fr po">${Photo('bn','Retrato en blanco y negro de DJ Javi Vecino','(max-width:820px) 100vw,50vw','50% 30%')}</div><div><p class="lbl">Sobre mí</p><h2>DJ Javi<br>Vecino</h2><p class="pre" style="margin:24px 0 28px;color:var(--mute);max-width:440px">${DATA.about.intro}</p>${Btn('Sobre mí','#/sobre-mi')}<p class="lbl" style="margin:40px 0 14px">Redes</p>${Social()}</div></div></section>`},
mashups:()=>`<div class="pg"><div class="wrap"><p class="lbl">Música</p><h1>Mashups</h1>${DATA.mashups.length?`<div class="ml">${DATA.mashups.filter(m=>m.published).map(Mashup).join('')}</div>`:'<p class="emp">Los primeros mashups llegan pronto.</p>'}</div></div>${Spot()}`,
mashup:s=>{const m=DATA.mashups.find(x=>x.slug===s);if(!m)return P.nf();const rel=DATA.mashups.filter(x=>x.slug!==s).slice(0,2);return `<div class="pg"><div class="wrap"><a class="back" href="#/mashups">← Mashups</a><div class="dt2"><div class="fr sq">${Img(m.cover,'Portada grande',m.title)}</div><div><p class="lbl">${[m.bpm&&m.bpm+' BPM',m.date].filter(Boolean).join(' · ')}</p><h1>${m.title}</h1><p class="lbl">${m.artists}</p>${m.desc?`<p class="pre" style="margin:22px 0;color:var(--mute)">${m.desc}</p>`:''}${Player(m)}<div class="row" style="margin-top:26px">${dl(m)}</div></div></div>${rel.length?`<h2 style="font-size:44px;margin:70px 0 24px">Relacionados</h2><div class="ml">${rel.map(Mashup).join('')}</div>`:''}</div></div>`},
agenda:()=>`<div class="pg"><div class="wrap"><p class="lbl">Directos</p><h1>Agenda</h1><div id="cal" class="cal">${CalInner()}</div>${up.length?`<h2 class="ct2">Próximas fechas</h2><div class="er-l">${up.map(EvRow).join('')}</div>`:''}${past.length?`<h2 class="ct2">Pasadas</h2><div class="er-l">${past.map(EvRow).join('')}</div>`:''}</div></div>`,
evento:s=>{const e=DATA.events.find(x=>x.slug===s);if(!e)return P.nf();return `<div class="pg"><div class="wrap"><a class="back" href="#/agenda">← Agenda</a><div class="dt2"><div class="fr po">${Img(e.poster,'Cartel',e.title)}</div><div><p class="lbl">${e.d} ${e.m} ${e.y}</p><h1>${e.title}</h1><dl class="meta">${e.time?`<dt>Hora</dt><dd>${e.time}h</dd>`:''}${e.venue?`<dt>Sala</dt><dd>${e.venue}</dd>`:''}${e.city?`<dt>Ciudad</dt><dd>${e.city}</dd>`:''}</dl>${e.desc?`<p class="pre" style="color:var(--mute);margin-bottom:26px">${e.desc}</p>`:''}${e.past?'<p class="lbl">Evento finalizado</p>':(e.tickets?Btn('Entradas',e.tickets,1):'')}</div></div></div></div>`},
packs:()=>`<div class="pg"><div class="wrap"><p class="lbl">Descargas</p><h1>Packs</h1>${DATA.packs.length?`<div class="g3">${DATA.packs.map(Pack).join('')}</div>`:'<p class="emp">Los primeros packs llegan pronto.</p>'}</div></div>`,
pack:s=>{const p=DATA.packs.find(x=>x.slug===s);if(!p)return P.nf();return `<div class="pg"><div class="wrap"><a class="back" href="#/packs">← Packs</a><div class="dt2"><div class="fr sq">${Img(p.cover,'Portada pack',p.title)}</div><div><p class="lbl">${p.tracks} tracks</p><h1>${p.title}</h1>${p.desc?`<p class="pre" style="color:var(--mute)">${p.desc}</p>`:''}${p.list.length?`<ol class="tl">${p.list.map((t,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span>${t[0]}<span>${t[1]}</span></li>`).join('')}</ol>`:''}${DATA.live?'':'<p class="note">Preview: el reproductor se conectará a los audios reales.</p>'}<div class="row">${p.download?`<a class="btn s" href="${p.download}"${/^https?:/.test(p.download)?' target="_blank" rel="noopener"':''}>Descarga directa</a>`:''}${p.drive?`<a class="btn" href="${p.drive}" target="_blank" rel="noopener">Google Drive</a>`:''}</div></div></div></div></div>`},
contenido:()=>`<div class="pg"><div class="wrap"><p class="lbl">Imagen</p><h1>Contenido</h1>${DATA.gallery.length?`<div class="chips" role="group" aria-label="Filtrar">${['todo','dj','publico','foto','cartel','video'].filter(f=>f==='todo'||DATA.gallery.some(g=>g.type===f)).map(f=>`<button data-f="${f}" aria-pressed="${f==='todo'}">${f==='todo'?'Todo':f==='dj'?'DJ':f==='publico'?'Público':f==='foto'?'Fotos':f==='cartel'?'Carteles':'Vídeos'}</button>`).join('')}</div><div class="gal" id="gl">${DATA.gallery.map(Gal).join('')}</div>`:'<p class="emp">Pronto habrá contenido nuevo.</p>'}</div></div>`,
sobre:()=>{const A=DATA.about;return `<div class="pg"><div class="wrap"><p class="lbl">Sobre mí</p><h1>Sobre mí</h1><div class="dt2"><div class="fr po">${Photo('bn','Retrato en blanco y negro de DJ Javi Vecino','(max-width:820px) 100vw,45vw','50% 62%')}</div><div>${A.intro?`<p class="lead pre">${A.intro}</p>`:''}${A.estilo?`<h3 class="sm">Estilo</h3><p class="sp2 pre">${A.estilo}</p>`:''}${A.trayectoria?`<h3 class="sm">Trayectoria</h3><p class="sp2 pre">${A.trayectoria}</p>`:''}${A.residencia?`<p class="sp2 pre"><strong>${A.residencia}</strong></p>`:''}</div></div>
${A.verbenas.length||A.salas.length?`<div class="tray">${A.verbenas.length?`<div><p class="lbl">Verbenas destacadas</p><ul class="tl2">${A.verbenas.map((v,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span>Verbena ${v}</li>`).join('')}</ul></div>`:''}${A.salas.length?`<div><p class="lbl">Salas y discotecas</p><ul class="tl2">${A.salas.map((s,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span>${s[0]}<em>${s[1]||''}</em></li>`).join('')}</ul></div>`:''}</div>`:''}
<p class="lbl" style="margin:56px 0 14px">Redes</p>${Social()}</div></div>`},
contacto:()=>`<div class="pg"><div class="wrap"><p class="lbl">Redes</p><h1>Contacto</h1><p style="color:var(--mute);margin:0 0 28px;max-width:46ch">Escríbeme por mis redes.</p>${Social()}</div></div>`,
nf:()=>`<div class="pg"><div class="wrap"><h1>404</h1>${Btn('Volver al inicio','#/')}</div></div>`};
/* ============ ROUTER ============ */
const NAV=[['Mashups','mashups'],['Agenda','agenda'],['Packs','packs'],['Contenido','contenido'],['Sobre mí','sobre-mi'],['Contacto','contacto']];
$('#mn').innerHTML=NAV.map(n=>`<li><a href="#/${n[1]}">${n[0]}</a></li>`).join('');
function buildFooter(){$('#ft').innerHTML=`<div><a class="logo" href="#/" aria-label="DJ Javi Vecino — inicio"><img src="assets/logo-javivecino.png" alt="DJ Javi Vecino" width="573" height="270"></a></div><ul>${NAV.map(n=>`<li><a href="#/${n[1]}">${n[0]}</a></li>`).join('')}</ul><ul>${DATA.artist.social.map(s=>`<li><a href="${s[1]}">${s[0]}</a></li>`).join('')}</ul><div class="cp"><span id="cpy">© ${new Date().getFullYear()} ${DATA.artist.name}</span><a href="#/contacto">Aviso legal</a><a href="#/contacto">Política de privacidad</a><button type="button" class="mnt" id="mnt">Mantenimiento (Código Privado)</button></div>`;}
let RT=(()=>{try{return location.hash.replace('#/','')}catch(e){return ''}})();
function route(){const [a,b]=(RT||'').split('/');cur&&cur();cur=null;
 const h=!a?P.home():a==='mashups'?(b?P.mashup(b):P.mashups()):a==='agenda'?(b?P.evento(b):P.agenda()):a==='packs'?(b?P.pack(b):P.packs()):a==='contenido'?P.contenido():a==='sobre-mi'?P.sobre():a==='contacto'?P.contacto():P.nf();
 const m=$('#app');m.style.animation='none';m.offsetHeight;m.style.animation='';m.innerHTML=h;scrollTo(0,0);
 document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#/'+a));
 $('#mn').classList.remove('open');$('#bg').setAttribute('aria-expanded','false');
 document.title=(a?a.charAt(0).toUpperCase()+a.slice(1)+' — ':'')+DATA.artist.name;
 wire();reveal();
 const f=document.querySelectorAll('.chips button');f.forEach(c=>c.onclick=()=>{f.forEach(x=>x.setAttribute('aria-pressed',x===c));const t=c.dataset.f;document.querySelectorAll('#gl>*').forEach((el,i)=>el.style.display=t==='todo'||el.dataset.t===t?'':'none')});
 const cf=$('#cf');if(cf)cf.onsubmit=e=>{e.preventDefault();$('#ok').textContent='Formulario de demostración: conectar a un servicio de envío.'}}
$('#bg').onclick=()=>{const o=$('#mn').classList.toggle('open');$('#bg').setAttribute('aria-expanded',o)};
let first=true;
function go(){if(first||matchMedia('(prefers-reduced-motion:reduce)').matches){first=false;route();return}
 const p=$('#pt');p.className='in';setTimeout(()=>{route();p.className='out';setTimeout(()=>{p.className=''},470)},400)}
/* Navegación interna: funciona también en vistas previas/iframes donde la URL no cambia */
function nav(to){to=(to||'').replace(/^#?\/?/,'');if(to===RT&&!first)return;RT=to;try{history.replaceState(null,'','#/'+to)}catch(e){try{location.hash='#/'+to}catch(e2){}}go()}
document.addEventListener('click',e=>{if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;const l=e.target.closest&&e.target.closest('a[href^="#/"]');if(!l)return;e.preventDefault();nav(l.getAttribute('href'))});
addEventListener('hashchange',()=>{let h='';try{h=location.hash.replace('#/','')}catch(e){}if(h!==RT){RT=h;go()}});
window.__ready=loadContent().then(()=>{derive();buildFooter();go()});

/* Aparición suave al entrar en viewport */
function reveal(){const els=document.querySelectorAll('main .sh,.sesc,main .next,main .two,main .dt2,main .pg .wrap>h1,.mi,.ev,.card,.strip .gi,.gal .gi');
 if(!('IntersectionObserver' in window)){return}
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('vis');scrT(x.target);io.unobserve(x.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'});
 els.forEach(e=>{e.classList.add('rv');io.observe(e)})}

/* Cursor de punto, barra de progreso y parallax suave del hero */
(function(){
 const sb=document.createElement('div');sb.id='sb';document.body.appendChild(sb);
 addEventListener('scroll',()=>{sb.style.transform='scaleX('+(scrollY/((document.documentElement.scrollHeight-innerHeight)||1))+')'},{passive:true});
 if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 const d=document.createElement('div');d.id='dot';document.body.appendChild(d);document.documentElement.classList.add('cur');
 let x=-50,y=-50,tx=-50,ty=-50;
 addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;d.style.opacity=(e.target.closest&&e.target.closest('.spf'))?0:1;const t=e.target.closest&&e.target.closest('a,button,[role=slider],label,select,.fr,.gi');d.classList.toggle('hov',!!t);const lab=e.target.closest&&e.target.closest('[data-cur]'),lt2=lab?lab.dataset.cur:'';d.classList.toggle('lab',!!lab);if(d.textContent!==lt2)d.textContent=lt2;
  const hr=e.target.closest&&e.target.closest('.hero');if(hr){hr.style.setProperty('--px',(e.clientX/innerWidth-.5).toFixed(3));hr.style.setProperty('--py',(e.clientY/innerHeight-.5).toFixed(3))}});
 document.addEventListener('mouseleave',()=>{d.style.opacity=0});
 addEventListener('mousedown',()=>d.classList.add('dn'));addEventListener('mouseup',()=>d.classList.remove('dn'));
 (function f(){x+=(tx-x)*.35;y+=(ty-y)*.35;d.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%)';requestAnimationFrame(f)})();
})();

/* Pantalla de carga: 3 fases de color (negro azulado → azul profundo → azul eléctrico) */
(function(){const l=document.getElementById('ld');if(!l)return;
 const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 l.querySelector('.ld-bg').style.backgroundImage='url("'+PH.hero.src+'")';
 const eq=l.querySelector('.ld-eq'),N=Math.min(90,Math.ceil(innerWidth/16));
 for(let i=0;i<N;i++){const b=document.createElement('i');const mid=1-Math.abs(i/N-.5)*1.1;b.style.setProperty('--h',(.18+Math.random()*.82*mid).toFixed(2));b.style.setProperty('--d',(.5+Math.random()*.9).toFixed(2)+'s');b.style.setProperty('--l','-'+(Math.random()*1.2).toFixed(2)+'s');eq.appendChild(b)}
 const n=l.querySelector('.ld-n span'),bar=l.querySelector('.ld-line i'),st=l.querySelector('.ld-st');
 const TXT=['Calentando platos','Cargando mashups','Subiendo el volumen'],T=rm?1200:2900,t0=performance.now();let last=0;
 (function f(t){const p=Math.min((t-t0)/T,1),e=1-Math.pow(1-p,2.2),s=p<.34?1:p<.67?2:3;
  n.textContent=String(Math.round(e*100)).padStart(3,'0');bar.style.width=e*100+'%';
  if(s!==last){last=s;l.dataset.s=s;st.textContent=TXT[s-1]}
  if(p<1)requestAnimationFrame(f);else st.textContent='Listo'})(t0);
 const loaded=new Promise(r=>document.readyState==='complete'?r():addEventListener('load',r));
 Promise.all([new Promise(r=>setTimeout(r,T+250)),loaded,window.__ready||0]).then(()=>{l.classList.add('out');setTimeout(()=>document.body.classList.remove('ld'),450);setTimeout(()=>l.remove(),1100)});
})();
/* Lightbox de fotos */
(function(){const lb=document.createElement('div');lb.id='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-label','Foto ampliada');lb.innerHTML='<img alt=""><button aria-label="Cerrar">×</button>';document.body.appendChild(lb);
 const im=lb.querySelector('img');let list=[],i=0;
 const show=k=>{i=(k+list.length)%list.length;im.src=list[i].src;im.alt=list[i].alt;lb.classList.add('on')};
 const close=()=>lb.classList.remove('on');
 document.addEventListener('click',e=>{const g=e.target.closest('.gi');if(g&&!g.classList.contains('vid')&&g.querySelector('img')){list=[...g.parentElement.querySelectorAll('.gi:not(.vid) img')];show(list.indexOf(g.querySelector('img')));return}
  if(lb.classList.contains('on')&&e.target.closest('#lb')){const r=im.getBoundingClientRect();(e.target.tagName==='IMG'&&list.length>1)?show(i+(e.clientX>r.left+r.width/2?1:-1)):close()}});
 addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});
})();
/* Botones magnéticos y tilt en cards (solo ratón) */
(function(){if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 let lb=null,lt=null;
 addEventListener('mousemove',e=>{const b=e.target.closest&&e.target.closest('.btn'),c=e.target.closest&&e.target.closest('.card .fr');
  if(lb&&lb!==b)lb.style.transform='';if(lt&&lt!==c)lt.style.transform='';lb=b;lt=c;
  if(b){const r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'}
  if(c){const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(700px) rotateX('+(-py*7)+'deg) rotateY('+(px*7)+'deg) scale(1.02)'}});
})();

/* Efecto de texto al aparecer los títulos */
function scrT(el){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const h=el.matches('h1')?el:el.matches('.sh')?el.querySelector('h2'):null;if(!h||h.children.length)return;
 const t=h.textContent,C='ABCDEFGHJKLMNPRSTUVWXYZ#/+';let n=0;
 const id=setInterval(()=>{h.textContent=[...t].map((c,i)=>c===' '||i<n?c:C[Math.random()*C.length|0]).join('');n+=.7;if(n>=t.length){h.textContent=t;clearInterval(id)}},35)}

/* Enlaces aún sin destino real (href="#"): no navegan, avisan con un mensaje */
(function(){const t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t);let id;
 const say=m=>{t.textContent=m;t.classList.add('on');clearTimeout(id);id=setTimeout(()=>t.classList.remove('on'),2200)};
 document.addEventListener('click',e=>{const l=e.target.closest&&e.target.closest('a[href="#"]');if(!l)return;e.preventDefault();
  const x=l.textContent.trim().toLowerCase();say(x.includes('entradas')?'Entradas: enlace próximamente':x.includes('descarg')||x.includes('drive')?'Descarga disponible próximamente':'Enlace próximamente')});
 document.addEventListener('mousemove',()=>{},{passive:true});
 new MutationObserver(()=>{document.querySelectorAll('a[href="#"]').forEach(l=>l.classList.add('soon'))}).observe(document.getElementById('app'),{childList:true});
})();

/* Mantenimiento (Código Privado): banner flotante para entrar al panel de textos */
(function(){
 const CODE='javivecinodj'; /* ← cambia aquí el código si quieres */
 const box=document.createElement('form');box.id='ac';box.setAttribute('role','dialog');box.setAttribute('aria-label','Acceso privado');box.setAttribute('autocomplete','off');
 box.innerHTML='<div class="ac-t"><span>Mantenimiento · Código privado</span><button type="button" class="ac-x" aria-label="Cerrar">×</button></div><div class="ac-r"><input type="password" name="code" placeholder="Escribe el código" autocomplete="off" aria-label="Código privado" required><button class="btn s" type="submit">Entrar</button></div><p class="ac-e" role="alert"></p>';
 document.body.appendChild(box);
 const inp=box.querySelector('input'),err=box.querySelector('.ac-e');
 const open=()=>{err.textContent='';box.classList.add('on');setTimeout(()=>inp.focus(),60)};
 const close=()=>{box.classList.remove('on');inp.value='';err.textContent=''};
 document.addEventListener('click',e=>{
  if(e.target.closest('#mnt')){if(box.classList.contains('on'))close();else open();return}
  if(e.target.closest('.ac-x')||(box.classList.contains('on')&&!e.target.closest('#ac')))close()});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('on'))close()});
 box.onsubmit=e=>{e.preventDefault();
  const n=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');if(![CODE,'ADMIN_JAVIVECINO'].map(n).includes(n(inp.value))){err.textContent='Código incorrecto (versión sin servidor)';inp.select();return}
  try{localStorage.setItem('jv_unlock','1')}catch(x){}
  close();if(window.openPanel)window.openPanel()};
})();
