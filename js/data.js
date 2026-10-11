/* Fotos reales: nombre base en assets/img + anchos disponibles (srcset) */
const SPOT='https://open.spotify.com/playlist/0TYhUZ8pQ8tR4TBIHhOgyn?si=f2bcc556f8094f40&nd=1&dlsi=42c86d6097084445';
const photo=(n,ws)=>({src:`assets/img/${n}-${ws[ws.length-1]}.jpg`,set:ws.map(w=>`assets/img/${n}-${w}.jpg ${w}w`).join(', ')});
const PH={hero:photo('directo',[800,1280,1920]),heroM:photo('pantalla-2',[600,1000,1400]),p1:photo('pantalla-1',[600,1000,1400]),p2:photo('pantalla-2',[600,1000,1400]),cab:photo('cabina',[600,1000,1400]),bn:photo('bn',[600,1000,1400]),cover:photo('portada-playlist',[600])};

/* ============ DATOS MOCK (TODO: sustituir por base de datos / CMS) ============
   Todo lo de aquí es PLACEHOLDER. Sin datos reales del artista. */
const DATA={
 artist:{name:'DJ JAVI VECINO',tagline:'',email:'',
  social:[['Instagram','https://www.instagram.com/javivecinodj/'],['TikTok','https://www.tiktok.com/@javivecinodj'],['YouTube','https://www.youtube.com/@JAVIVECINODJ'],['SoundCloud','https://soundcloud.com/carmen-vecino-castro'],['Spotify',SPOT]]},
 mashups:[],
 events:[],
 packs:[],
 gallery:[
  {id:'g1',cls:'g1',type:'dj',label:'Foto 01',ph:'hero',pos:'50% 38%',alt:'DJ Javi Vecino en cabina frente a la pantalla de visuales',sizes:'(max-width:700px) 100vw,66vw'},
  {id:'g2',cls:'g2',type:'dj',label:'Foto 02',ph:'p1',pos:'50% 40%',alt:'DJ Javi Vecino concentrado en los platos ante el público',sizes:'(max-width:700px) 50vw,33vw'},
  {id:'g3',cls:'g3',type:'dj',label:'Foto 03',ph:'bn',pos:'55% 38%',alt:'Retrato en blanco y negro de DJ Javi Vecino',sizes:'(max-width:700px) 50vw,33vw'},
  {id:'g4',cls:'g4',type:'dj',label:'Foto 04',ph:'cab',pos:'50% 35%',alt:'DJ Javi Vecino visto desde detrás en la cabina',sizes:'(max-width:700px) 50vw,33vw'},
  {id:'g5',cls:'g5',type:'dj',label:'Foto 05',ph:'p2',pos:'45% 28%',alt:'DJ Javi Vecino saludando al público',sizes:'(max-width:700px) 50vw,33vw'},,
  {id:'publico-1',cls:'',type:'publico',label:'Público',src:'assets/img/publico-1.jpg',alt:'Público de la sala en plena fiesta'},
  {id:'publico-2',cls:'',type:'publico',label:'Público',src:'assets/img/publico-2.jpg',alt:'Grupo de amigos disfrazados en la pista'},
  {id:'publico-3',cls:'',type:'publico',label:'Público',src:'assets/img/publico-3.jpg',alt:'Grupo de amigos posando en la pista'},
  {id:'dj-1',cls:'',type:'dj',label:'DJ',src:'assets/img/dj-1.jpg',alt:'DJ Javi Vecino en la cabina con el neón de la sala'},
  {id:'dj-2',cls:'',type:'dj',label:'DJ',src:'assets/img/dj-2.jpg',alt:'DJ Javi Vecino mezclando en cabina'},
  {id:'dj-3',cls:'',type:'dj',label:'DJ',src:'assets/img/dj-3.jpg',alt:'DJ Javi Vecino con las luces azules de la sala'},
  {id:'dj-4',cls:'',type:'dj',label:'DJ',src:'assets/img/dj-4.jpg',alt:'DJ Javi Vecino disfrutando de la sesión'}
 ]
};

/* Datos reales del artista (aportados por él). Editar aquí. */
DATA.about={
 intro:'Me llamo Javi Vecino y soy DJ y productor de A Coruña. Llevo 4 años de experiencia en esta profesión, con muchas ganas de seguir cumpliendo un sueño.',
 estilo:'Busco crear experiencias sonoras que conecten con el público y mantengan la pista en movimiento de principio a fin.',
 trayectoria:'He participado en eventos locales y showcases privados, consolidando mi presencia dentro de la escena de A Coruña.',
 residencia:'Residencia actual en Discoteca Iris (Betanzos). Residencias anteriores en Melide, Carballo y Laracha.',
 verbenas:['Larin','Laracha','Arteixo','Chamin','Melide','Carballo','Golmar','Coruña'],
 salas:[['Discoteca Iris','Betanzos'],['Goat','Carballo'],['A2','Laracha'],['Discoteca Pazos','Laracha'],['Iceberg','Melide'],['Nexus','Melide'],['LaCalle','Laracha'],['Oceanico','Coruña'],['LaCalle','Coruña'],['Gymare','Noia']]
};

DATA.session={title:'Bad Bunny Mix · Sesión',url:'https://www.youtube.com/watch?v=1N5DyPYPGI0',cover:'assets/img/sesion-yt-1280.jpg'};

/* ============ CONTENIDO GESTIONADO DESDE EL PANEL (/panel) ============
   Si existe /api/content se usa ese contenido (solo lo publicado). Si no (archivo suelto, vista previa)
   se mantienen los datos de ejemplo de arriba. Todo texto se escapa antes de pintarse. */
const MESES=['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const X=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>typeof v==='string'?X(v):Array.isArray(v)?v.map(clean):(v&&typeof v==='object')?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clean(x)])):v;
const slugify=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50)||'item';
function uniqueSlugs(list){const seen={};list.forEach(x=>{const s=slugify(x.title);seen[s]=(seen[s]||0)+1;x.slug=seen[s]>1?s+'-'+seen[s]:s})}
function applyContent(raw){
 ['mashups','events','packs','gallery'].forEach(k=>{raw[k]=raw[k]||[]});
 uniqueSlugs(raw.mashups);uniqueSlugs(raw.events);uniqueSlugs(raw.packs);
 const c=clean(raw),pad=n=>String(n).padStart(2,'0'),now=new Date(),today=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
 const a=c.artist||{},ab=c.about||{};
 DATA.live=true;
 DATA.legal=c.legal||{};
 if(c.session)DATA.session={title:c.session.title||'',url:c.session.url||'',cover:c.session.cover||''};
 DATA.artist={...DATA.artist,tagline:a.tagline||'',email:a.email||'',social:a.social||[]};
 DATA.about={intro:ab.intro||'',estilo:ab.estilo||'',trayectoria:ab.trayectoria||'',residencia:ab.residencia||'',verbenas:ab.verbenas||[],salas:ab.salas||[]};
 DATA.mashups=c.mashups.map(m=>({...m,date:m.date?m.date.split('-').reverse().join('/'):''}));
 DATA.events=c.events.map(e=>{const [y,mo,dd]=(e.date||'').split('-');return {...e,d:dd||'--',m:MESES[(+mo||1)-1]||'',y:y||'',past:!!e.date&&e.date<today}});
 DATA.packs=c.packs.map(p=>({...p,list:p.tracks,tracks:p.tracks.length}));
 DATA.gallery=c.gallery.map((g,i)=>({...g,cls:'g'+((i%6)+1)}));
}
async function loadContent(){
 if(!/^https?:$/.test(location.protocol))return false;
 const pub=c=>{const o={...c};['mashups','events','packs','gallery'].forEach(k=>{o[k]=(c[k]||[]).filter(x=>x.published!==false)});return o};
 try{
  let draft=null;try{if(localStorage.getItem('jv_unlock')==='1'&&localStorage.getItem('jv_dirty')==='1')draft=JSON.parse(localStorage.getItem('jv_draft'))}catch(e){}
  if(draft&&draft.artist){window.__jvLive=draft;applyContent(pub(draft));return true}
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),3500);
  const r=await fetch('content.json?v='+Date.now(),{signal:ctl.signal,cache:'no-cache'});clearTimeout(t);
  if(!r.ok)return false;const j=await r.json();if(!j||!j.artist)return false;window.__jvLive=j;applyContent(pub(j));return true}catch(e){return false}}
