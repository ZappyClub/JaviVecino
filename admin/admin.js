/* Panel de administración de DJ Javi Vecino — solo visible escribiendo /panel y con código de acceso */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const E = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = $('#root');
const S = { content: null, base: '', tab: 'mashups', storage: 'local', missing: false };
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const today = () => new Date().toISOString().slice(0, 10);
const rid = () => 'x' + Math.random().toString(36).slice(2, 9);
const fmtDate = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); return m ? `${+m[3]} ${MES[+m[2] - 1]} ${m[1]}` : ''; };

/* ---------- red ---------- */
async function api(path, opt = {}) {
  const r = await fetch(path, { credentials: 'same-origin', ...opt, headers: { ...(opt.json ? { 'Content-Type': 'application/json' } : {}), ...(opt.headers || {}) }, body: opt.json ? JSON.stringify(opt.json) : opt.body });
  let data = {};
  try { data = await r.json(); } catch { /* sin cuerpo */ }
  if (!r.ok) { const e = new Error(data.error || 'Error ' + r.status); e.status = r.status; throw e; }
  return data;
}
let tt;
function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(tt); tt = setTimeout(() => (t.className = ''), bad ? 4500 : 2200); }

/* ---------- guardado ---------- */
async function commit(mutator, okMsg = 'Guardado') {
  const next = structuredClone(S.content);
  mutator(next);
  try {
    const r = await api('/api/save', { method: 'POST', json: { content: next, base: S.base } });
    S.content = r.content; S.base = r.content.updatedAt;
    toast(okMsg); render();
    return true;
  } catch (e) {
    if (e.status === 401) { toast('La sesión ha caducado. Entra de nuevo.', true); return boot(); }
    toast(e.message, true);
    return false;
  }
}

/* ---------- archivos ---------- */
function xhrPost(url, body, type, onProg) {
  return new Promise((res, rej) => {
    const x = new XMLHttpRequest();
    x.open('POST', url);
    if (type) x.setRequestHeader('Content-Type', type);
    x.upload.onprogress = (e) => e.lengthComputable && onProg && onProg(e.loaded / e.total);
    x.onload = () => { let d = {}; try { d = JSON.parse(x.responseText); } catch { /* */ } x.status < 300 ? res(d) : rej(new Error(d.error || 'Error ' + x.status)); };
    x.onerror = () => rej(new Error('Error de red'));
    x.send(body);
  });
}
async function resizeImage(file, max, q = 0.85) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q));
  if (!blob) throw new Error('No se pudo procesar la imagen');
  if (blob.size > 3.9 * 1024 * 1024) return resizeImage(file, max * 0.75, q - 0.1);
  return blob;
}
async function uploadImage(file, max, onProg) {
  const blob = await resizeImage(file, max);
  const d = await xhrPost('/api/upload-image', blob, 'image/jpeg', onProg);
  return d.url;
}
async function uploadAudio(file, onProg) {
  if (file.size > 150 * 1024 * 1024) throw new Error('El audio pesa más de 150 MB');
  if (S.storage === 'blob') {
    const { upload } = await import('https://esm.sh/@vercel/blob@2.8.0/client');
    const safe = file.name.replace(/[^\w.-]+/g, '-').slice(-60);
    const r = await upload('audio/' + safe, file, { access: 'public', handleUploadUrl: '/api/upload', multipart: true, onUploadProgress: (p) => onProg && onProg(p.percentage / 100) });
    return r.url;
  }
  const ext = (file.name.split('.').pop() || 'mp3').toLowerCase();
  return (await xhrPost('/api/upload-local?ext=' + encodeURIComponent(ext), file, file.type || 'audio/mpeg', onProg)).url;
}
function pick(accept, multiple) {
  return new Promise((res) => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiple;
    i.onchange = () => res([...i.files]); i.click();
  });
}

/* ---------- vistas ---------- */
function loginView(msg = '', notConfigured = false) {
  root.innerHTML = `<div class="login"><form id="lf" autocomplete="off">
    <img src="/assets/logo-javivecino.png" alt="DJ Javi Vecino" width="573" height="270">
    ${notConfigured ? `<p class="err">El panel todavía no está configurado: falta la variable ADMIN_CODE en Vercel.</p>` : `
    <p class="sm">Acceso privado</p>
    <input id="code" type="password" placeholder="Código de acceso" autocomplete="current-password" required autofocus aria-label="Código de acceso">
    <button class="b p" type="submit">Entrar</button>
    <p class="err" id="le" role="alert">${E(msg)}</p>`}
  </form></div>`;
  const f = $('#lf');
  if (!notConfigured) f.onsubmit = async (e) => {
    e.preventDefault();
    const b = f.querySelector('button'); b.disabled = true;
    try { await api('/api/auth?a=login', { method: 'POST', json: { code: $('#code').value } }); await boot(); }
    catch (er) { $('#le').textContent = er.message; $('#code').select(); b.disabled = false; }
  };
}

const TABS = [['mashups', 'Mashups'], ['events', 'Agenda'], ['packs', 'Packs'], ['gallery', 'Contenido'], ['about', 'Sobre mí'], ['settings', 'Ajustes']];
function render() {
  if (!S.content) return;
  root.innerHTML = `<header class="top"><img src="/assets/logo-javivecino.png" alt="DJ Javi Vecino" width="573" height="270"><span class="t">Panel</span><span class="sp"></span>
    <a class="b s" href="/" target="_blank" rel="noopener">Ver web ↗</a><button class="b s" id="out">Salir</button></header>
    <nav class="tabs" role="tablist">${TABS.map(([k, l]) => `<button role="tab" aria-selected="${S.tab === k}" data-t="${k}">${l}</button>`).join('')}</nav>
    ${S.missing ? `<div class="warnb"><b>Falta un paso en Vercel:</b> conecta el almacenamiento (Storage → Blob → Public) y vuelve a desplegar. Hasta entonces el panel no podrá guardar. Mira «GUIA-PANEL.md».</div>` : ''}
    <main id="mn"></main>`;
  $('#out').onclick = async () => { await api('/api/auth?a=logout', { method: 'POST' }).catch(() => {}); S.content = null; boot(); };
  root.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; render(); scrollTo(0, 0); }));
  const m = $('#mn');
  ({ mashups: () => listView(m, 'mashups'), events: () => listView(m, 'events'), packs: () => listView(m, 'packs'), gallery: () => galleryView(m), about: () => aboutView(m), settings: () => settingsView(m) })[S.tab]();
}

/* ---------- definición de cada colección ---------- */
const KIND = {
  mashups: {
    title: 'Mashups', one: 'mashup', add: 'Nuevo mashup', movable: true, thumb: (x) => x.cover,
    sub: (x) => [x.artists, x.bpm && x.bpm + ' BPM', fmtDate(x.date), x.audio ? 'con audio' : 'sin audio'].filter(Boolean).join(' · '),
    blank: () => ({ id: rid(), title: '', artists: '', bpm: '', date: today(), desc: '', cover: '', audio: '', download: '', published: true }),
    fields: [
      ['title', 'text', 'Nombre del mashup *', { required: true, max: 120 }],
      ['artists', 'text', 'Artistas / canciones', { max: 160, ph: 'Artista A × Artista B' }],
      ['bpm', 'text', 'BPM', { max: 8, half: true }], ['date', 'date', 'Fecha', { half: true }],
      ['cover', 'image', 'Portada', { px: 1200, hint: 'Cuadrada si es posible' }],
      ['audio', 'audio', 'Audio del mashup'],
      ['download', 'url', 'Enlace de descarga (opcional)', { hint: 'Si lo dejas vacío, el botón Descargar usará el propio audio.' }],
      ['desc', 'textarea', 'Descripción', { max: 1500 }],
      ['published', 'check', 'Publicado (visible en la web)']
    ]
  },
  events: {
    title: 'Agenda', one: 'evento', add: 'Nuevo evento', movable: false, poster: true, thumb: (x) => x.poster,
    sub: (x) => [fmtDate(x.date), x.time && x.time + 'h', x.venue, x.city].filter(Boolean).join(' · '),
    blank: () => ({ id: rid(), title: '', date: today(), time: '', venue: '', city: '', poster: '', tickets: '', desc: '', published: true }),
    fields: [
      ['title', 'text', 'Evento *', { required: true, max: 120 }],
      ['date', 'date', 'Fecha *', { required: true, half: true }], ['time', 'time', 'Hora', { half: true }],
      ['venue', 'text', 'Sala / lugar', { max: 120, half: true }], ['city', 'text', 'Ciudad', { max: 80, half: true }],
      ['poster', 'image', 'Cartel', { px: 1600, po: true, hint: 'Vertical (3:4) se ve mejor' }],
      ['tickets', 'url', 'Enlace de entradas', { hint: 'https://…  Si lo dejas vacío, no se muestra el botón.' }],
      ['desc', 'textarea', 'Información', { max: 1500 }],
      ['published', 'check', 'Publicado (visible en la web)']
    ]
  },
  packs: {
    title: 'Packs', one: 'pack', add: 'Nuevo pack', movable: true, thumb: (x) => x.cover,
    sub: (x) => [`${(x.tracks || []).length} tracks`, x.download ? 'con descarga' : '', x.drive ? 'con Drive' : ''].filter(Boolean).join(' · '),
    blank: () => ({ id: rid(), title: '', desc: '', cover: '', tracks: [], download: '', drive: '', published: true }),
    fields: [
      ['title', 'text', 'Nombre del pack *', { required: true, max: 120 }],
      ['cover', 'image', 'Portada', { px: 1200 }],
      ['desc', 'textarea', 'Descripción', { max: 1500 }],
      ['tracks', 'tracks', 'Lista de tracks'],
      ['download', 'url', 'Enlace de descarga directa'], ['drive', 'url', 'Enlace de Google Drive'],
      ['published', 'check', 'Publicado (visible en la web)']
    ]
  }
};

function listView(m, k) {
  const K = KIND[k];
  const list = S.content[k];
  const items = k === 'events' ? [...list].sort((a, b) => (b.date || '').localeCompare(a.date || '')) : list;
  m.innerHTML = `<div class="bar"><div><h2>${K.title}</h2><p>${list.length} en total · ${list.filter((x) => x.published).length} publicados</p></div><button class="b p" id="add">+ ${K.add}</button></div>
    ${k === 'mashups' ? `<p class="note">Los mashups se muestran en el <b>orden de esta lista</b>. Usa ↑ ↓ para ordenarlos. Lo que está en <b>Borrador</b> no se ve en la web.</p>` : ''}
    ${items.length ? items.map((x) => `<article class="row ${x.published ? '' : 'off'}" data-id="${E(x.id)}"><div class="th ${K.poster ? 'po' : ''}">${K.thumb(x) ? `<img src="${E(K.thumb(x))}" alt="" loading="lazy">` : 'sin imagen'}</div>
      <div><h3>${E(x.title)}</h3><p class="sub">${E(K.sub(x))}</p><span class="badge ${x.published ? 'on' : ''}">${x.published ? 'Publicado' : 'Borrador'}</span></div>
      <div class="acts"><button class="b s" data-a="edit">Editar</button><button class="b s" data-a="pub">${x.published ? 'Ocultar' : 'Publicar'}</button>
      ${K.movable ? `<button class="b s" data-a="up" aria-label="Subir">↑</button><button class="b s" data-a="down" aria-label="Bajar">↓</button>` : ''}<button class="b s d" data-a="del">Eliminar</button></div></article>`).join('')
      : `<div class="empty">Todavía no hay nada. Pulsa «${K.add}» para empezar.</div>`}`;
  $('#add').onclick = () => formModal(k, K.blank(), true);
  m.querySelectorAll('.row').forEach((row) => row.querySelectorAll('[data-a]').forEach((b) => (b.onclick = async () => {
    const id = row.dataset.id, a = b.dataset.a, item = list.find((x) => x.id === id);
    if (a === 'edit') return formModal(k, structuredClone(item), false);
    if (a === 'pub') return commit((c) => { const t = c[k].find((x) => x.id === id); t.published = !t.published; }, item.published ? 'Oculto' : 'Publicado');
    if (a === 'del') { if (confirm(`¿Eliminar «${item.title}»? Esta acción no se puede deshacer.`)) commit((c) => { c[k] = c[k].filter((x) => x.id !== id); }, 'Eliminado'); return; }
    commit((c) => { const i = c[k].findIndex((x) => x.id === id), j = a === 'up' ? i - 1 : i + 1; if (j >= 0 && j < c[k].length) [c[k][i], c[k][j]] = [c[k][j], c[k][i]]; }, 'Orden actualizado');
  })));
}

/* ---------- formulario modal ---------- */
function formModal(k, draft, isNew) {
  const K = KIND[k];
  const ov = document.createElement('div'); ov.className = 'ov';
  const close = () => ov.remove();
  const fieldHTML = ([key, type, label, o = {}]) => {
    const v = draft[key];
    if (type === 'check') return `<label class="chk"><input type="checkbox" data-k="${key}" ${v ? 'checked' : ''}><span>${label}</span></label>`;
    if (type === 'image') return `<div class="up" data-img="${key}"><div class="pv ${o.po ? 'po' : ''}"></div><div><span class="lb f-lb">${label}</span><div class="acts" style="justify-content:flex-start"><button type="button" class="b s" data-up>Subir imagen</button><button type="button" class="b s d" data-rm>Quitar</button></div><p class="hint" style="margin-top:6px">${o.hint || ''} JPG, PNG o WebP; se reduce automáticamente.</p><div class="pr"><i></i></div></div></div>`;
    if (type === 'audio') return `<div class="aud" data-aud="${key}"><span class="lb f-lb" style="font:700 11px Syne,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--mute)">${label}</span><audio controls preload="none" class="hidden"></audio><div class="acts" style="justify-content:flex-start;margin:8px 0"><button type="button" class="b s" data-up>Subir audio (MP3, WAV, M4A)</button><button type="button" class="b s d" data-rm>Quitar</button></div><div class="pr"><i></i></div><label class="f" style="margin:10px 0 0"><span>…o pega un enlace directo al audio</span><input type="url" data-k="${key}" value="${E(v)}" placeholder="https://…"></label></div>`;
    if (type === 'tracks') return `<label class="f"><span>${label}</span><textarea data-k="${key}" data-tracks rows="7" placeholder="Nombre del track | 3:45">${E((v || []).map((t) => t[0] + (t[1] ? ' | ' + t[1] : '')).join('\n'))}</textarea><span class="hint">Un track por línea. La duración es opcional.</span></label>`;
    if (type === 'textarea') return `<label class="f"><span>${label}</span><textarea data-k="${key}" maxlength="${o.max || 1500}">${E(v)}</textarea></label>`;
    return `<label class="f" ${o.half ? 'data-half' : ''}><span>${label}</span><input type="${type}" data-k="${key}" value="${E(v)}" ${o.required ? 'required' : ''} ${o.max ? `maxlength="${o.max}"` : ''} placeholder="${E(o.ph || (type === 'url' ? 'https://…' : ''))}">${o.hint ? `<span class="hint">${o.hint}</span>` : ''}</label>`;
  };
  // agrupa los campos "half" de dos en dos
  let html = '', buf = [];
  K.fields.forEach((f) => { if (f[3] && f[3].half) { buf.push(fieldHTML(f)); if (buf.length === 2) { html += `<div class="g2">${buf.join('')}</div>`; buf = []; } } else { if (buf.length) { html += `<div class="g2">${buf.join('')}</div>`; buf = []; } html += fieldHTML(f); } });
  if (buf.length) html += `<div class="g2">${buf.join('')}</div>`;
  ov.innerHTML = `<form class="md" novalidate><h2>${isNew ? K.add : 'Editar ' + K.one}</h2>${html}<div class="ft"><button type="button" class="b" data-c>Cancelar</button><button class="b p" type="submit">Guardar</button></div></form>`;
  document.body.appendChild(ov);
  const form = $('form', ov);
  ov.addEventListener('mousedown', (e) => { if (e.target === ov && !form.dataset.busy) close(); });
  $('[data-c]', ov).onclick = close;

  const showImg = (w, url) => { const pv = $('.pv', w); pv.innerHTML = url ? `<img src="${E(url)}" alt="">` : 'sin imagen'; };
  const showAud = (w, url) => { const a = $('audio', w); if (url) { a.src = url; a.classList.remove('hidden'); } else { a.removeAttribute('src'); a.classList.add('hidden'); } };
  const progress = (w) => { const p = $('.pr', w), i = $('i', p); p.classList.add('on'); return (f) => (i.style.width = Math.round(f * 100) + '%'); };
  const done = (w) => { const p = $('.pr', w); p.classList.remove('on'); $('i', p).style.width = '0'; };

  form.querySelectorAll('[data-img]').forEach((w) => {
    const key = w.dataset.img, f = K.fields.find((x) => x[0] === key), px = (f[3] && f[3].px) || 1400;
    showImg(w, draft[key]);
    $('[data-up]', w).onclick = async () => {
      const [file] = await pick('image/jpeg,image/png,image/webp,image/*'); if (!file) return;
      const pr = progress(w); form.dataset.busy = 1;
      try { draft[key] = await uploadImage(file, px, pr); showImg(w, draft[key]); toast('Imagen subida'); } catch (e) { toast(e.message, true); }
      done(w); delete form.dataset.busy;
    };
    $('[data-rm]', w).onclick = () => { draft[key] = ''; showImg(w, ''); };
  });
  form.querySelectorAll('[data-aud]').forEach((w) => {
    const key = w.dataset.aud, inp = $('input', w);
    showAud(w, draft[key]);
    inp.oninput = () => { draft[key] = inp.value.trim(); showAud(w, draft[key]); };
    $('[data-up]', w).onclick = async () => {
      const [file] = await pick('audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac'); if (!file) return;
      const pr = progress(w); form.dataset.busy = 1;
      try { draft[key] = await uploadAudio(file, pr); inp.value = draft[key]; showAud(w, draft[key]); toast('Audio subido'); } catch (e) { toast(e.message, true); }
      done(w); delete form.dataset.busy;
    };
    $('[data-rm]', w).onclick = () => { draft[key] = ''; inp.value = ''; showAud(w, ''); };
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (form.dataset.busy) return toast('Espera a que termine la subida', true);
    const out = { ...draft };
    form.querySelectorAll('[data-k]').forEach((el) => {
      const key = el.dataset.k;
      if (el.type === 'checkbox') out[key] = el.checked;
      else if (el.hasAttribute('data-tracks')) out[key] = el.value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.lastIndexOf('|'); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, '']; });
      else out[key] = el.value.trim();
    });
    const missing = K.fields.find(([key, , , o]) => o && o.required && !out[key]);
    if (missing) { toast('Falta: ' + missing[2].replace(' *', ''), true); return; }
    const b = $('button[type=submit]', form); b.disabled = true;
    const ok = await commit((c) => { const i = c[k].findIndex((x) => x.id === out.id); if (i >= 0) c[k][i] = out; else c[k].unshift(out); }, isNew ? 'Creado' : 'Guardado');
    if (ok) close(); else b.disabled = false;
  };
  const first = $('input[type=text]', form); if (first) first.focus();
}

/* ---------- contenido (galería) ---------- */
function galleryView(m) {
  const g = S.content.gallery;
  m.innerHTML = `<div class="bar"><div><h2>Contenido</h2><p>${g.length} elementos · fotos, carteles y vídeos de la galería</p></div>
    <div class="acts"><button class="b p" id="gu">+ Subir fotos</button><button class="b" id="gp">+ Subir carteles</button><button class="b" id="gv">+ Vídeo (enlace)</button></div></div>
    <p class="note">Las imágenes se reducen y optimizan solas. El orden de aquí es el orden en la web; el primero se muestra más grande.</p>
    ${g.length ? `<div class="gg">${g.map((x) => `<div class="gc ${x.published ? '' : 'off'}" data-id="${E(x.id)}"><div class="im">${x.src ? `<img src="${E(x.src)}" alt="" loading="lazy">` : ''}<span class="tag">${x.type}</span></div>
      <div class="bd"><input value="${E(x.title)}" maxlength="120" placeholder="Título (opcional)" aria-label="Título" data-title>
      <select data-type aria-label="Tipo">${['foto', 'cartel', 'video'].map((t) => `<option value="${t}" ${x.type === t ? 'selected' : ''}>${t === 'foto' ? 'Foto' : t === 'cartel' ? 'Cartel' : 'Vídeo'}</option>`).join('')}</select>
      <div class="acts"><button class="b s" data-a="pub">${x.published ? 'Ocultar' : 'Publicar'}</button><button class="b s" data-a="up" aria-label="Subir">↑</button><button class="b s" data-a="down" aria-label="Bajar">↓</button><button class="b s d" data-a="del">Eliminar</button></div></div></div>`).join('')}</div>`
      : '<div class="empty">Sin contenido todavía.</div>'}`;
  const upload = async (type) => {
    const files = await pick('image/jpeg,image/png,image/webp,image/*', true); if (!files.length) return;
    const urls = []; let n = 0;
    for (const f of files) { toast(`Subiendo ${++n} de ${files.length}…`); try { urls.push(await uploadImage(f, type === 'cartel' ? 1600 : 1800)); } catch (e) { toast(f.name + ': ' + e.message, true); } }
    if (urls.length) commit((c) => c.gallery.push(...urls.map((u) => ({ id: rid(), type, title: '', src: u, url: '', published: true }))), `${urls.length} subida(s)`);
  };
  $('#gu').onclick = () => upload('foto'); $('#gp').onclick = () => upload('cartel');
  $('#gv').onclick = () => {
    const link = prompt('Enlace del vídeo (YouTube, Instagram, TikTok…):'); if (!link) return;
    if (!/^https?:\/\//i.test(link.trim())) return toast('El enlace debe empezar por https://', true);
    const title = prompt('Título (opcional):') || '';
    commit((c) => c.gallery.unshift({ id: rid(), type: 'video', title, src: '', url: link.trim(), published: true }), 'Vídeo añadido');
  };
  m.querySelectorAll('.gc').forEach((card) => {
    const id = card.dataset.id;
    $('[data-title]', card).onchange = (e) => commit((c) => { c.gallery.find((x) => x.id === id).title = e.target.value.trim(); }, 'Título guardado');
    $('[data-type]', card).onchange = (e) => commit((c) => { c.gallery.find((x) => x.id === id).type = e.target.value; }, 'Tipo cambiado');
    card.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'pub') return commit((c) => { const t = c.gallery.find((x) => x.id === id); t.published = !t.published; }, 'Actualizado');
      if (a === 'del') { if (confirm('¿Eliminar este elemento?')) commit((c) => { c.gallery = c.gallery.filter((x) => x.id !== id); }, 'Eliminado'); return; }
      commit((c) => { const i = c.gallery.findIndex((x) => x.id === id), j = a === 'up' ? i - 1 : i + 1; if (j >= 0 && j < c.gallery.length) [c.gallery[i], c.gallery[j]] = [c.gallery[j], c.gallery[i]]; }, 'Orden actualizado');
    }));
  });
}

/* ---------- sobre mí ---------- */
function aboutView(m) {
  const a = S.content.about;
  m.innerHTML = `<div class="bar"><div><h2>Sobre mí</h2><p>Textos de la página «Sobre mí» y de la portada</p></div></div>
    <form id="af"><label class="f"><span>Presentación</span><textarea name="intro" maxlength="1500" rows="4">${E(a.intro)}</textarea></label>
    <label class="f"><span>Estilo</span><textarea name="estilo" maxlength="1500" rows="3">${E(a.estilo)}</textarea></label>
    <label class="f"><span>Trayectoria</span><textarea name="trayectoria" maxlength="1500" rows="3">${E(a.trayectoria)}</textarea></label>
    <label class="f"><span>Residencias</span><textarea name="residencia" maxlength="600" rows="2">${E(a.residencia)}</textarea></label>
    <label class="f"><span>Verbenas destacadas</span><textarea name="verbenas" rows="8">${E(a.verbenas.join('\n'))}</textarea><span class="hint">Una por línea (se muestran como «Verbena …»).</span></label>
    <label class="f"><span>Salas y discotecas</span><textarea name="salas" rows="10">${E(a.salas.map((s) => s[0] + (s[1] ? ' | ' + s[1] : '')).join('\n'))}</textarea><span class="hint">Una por línea: Nombre | Ciudad</span></label>
    <button class="b p" type="submit">Guardar cambios</button></form>`;
  $('#af').onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target), lines = (k) => String(f.get(k)).split('\n').map((l) => l.trim()).filter(Boolean);
    commit((c) => {
      Object.assign(c.about, { intro: f.get('intro'), estilo: f.get('estilo'), trayectoria: f.get('trayectoria'), residencia: f.get('residencia'), verbenas: lines('verbenas'),
        salas: lines('salas').map((l) => { const i = l.lastIndexOf('|'); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, '']; }) });
    });
  };
}

/* ---------- ajustes ---------- */
function settingsView(m) {
  const a = S.content.artist, ses = { title: '', url: '', cover: '', ...(S.content.session || {}) };
  const rows = () => a.social.map((s, i) => `<div class="soc"><input value="${E(s[0])}" maxlength="40" data-n="${i}" aria-label="Nombre de la red" placeholder="Instagram"><input value="${E(s[1])}" data-u="${i}" aria-label="Enlace" placeholder="https://…"><button type="button" class="b s d" data-r="${i}" aria-label="Quitar">✕</button></div>`).join('');
  m.innerHTML = `<div class="bar"><div><h2>Ajustes</h2><p>Frase de portada, contacto y redes</p></div></div>
    <form id="sf">
    <div class="f"><span class="lb">Última sesión de YouTube (sale en la portada)</span>
      <div class="up" id="ses" style="margin-top:8px"><div class="pv" style="width:128px;height:72px"></div><div><div class="acts" style="justify-content:flex-start"><button type="button" class="b s" id="su">Subir portada</button><button type="button" class="b s d" id="sr2">Quitar</button></div><p class="hint" style="margin-top:6px">Formato 16:9 (como las miniaturas de YouTube).</p><div class="pr"><i></i></div></div></div>
      <label class="f"><span>Título (opcional)</span><input name="stitle" maxlength="120" value="${E(ses.title)}"></label>
      <label class="f"><span>Enlace del vídeo de YouTube</span><input name="surl" type="url" value="${E(ses.url)}" placeholder="https://www.youtube.com/watch?v=…"><span class="hint">Si lo dejas vacío, la sección no se muestra.</span></label></div>
    <label class="f"><span>Frase corta de la portada</span><input name="tagline" maxlength="140" value="${E(a.tagline)}" placeholder="Si la dejas vacía, no se muestra"></label>
    <label class="f"><span>Email de contratación</span><input name="email" type="email" maxlength="120" value="${E(a.email)}" placeholder="booking@…"></label>
    <div class="f"><span class="lb">Redes sociales</span><div id="sr">${rows()}</div><button type="button" class="b s" id="sa" style="margin-top:6px">+ Añadir red</button></div>
    <p class="hint" style="margin:6px 0 16px">La red llamada «Spotify» es la que usa el botón de la playlist.</p>
    <button class="b p" type="submit">Guardar cambios</button></form>
    <p class="note" style="margin-top:32px">Almacenamiento: <b>${S.storage === 'blob' ? 'Vercel Blob (nube)' : 'local (solo pruebas)'}</b></p>`;
  const showSes = () => { $('#ses .pv').innerHTML = ses.cover ? `<img src="${E(ses.cover)}" alt="">` : 'sin imagen'; };
  showSes();
  $('#su').onclick = async () => {
    const [file] = await pick('image/jpeg,image/png,image/webp,image/*'); if (!file) return;
    const p = $('#ses .pr'), i = $('i', p); p.classList.add('on');
    try { ses.cover = await uploadImage(file, 1600, (f) => (i.style.width = Math.round(f * 100) + '%')); showSes(); toast('Portada subida'); } catch (e) { toast(e.message, true); }
    p.classList.remove('on'); i.style.width = '0';
  };
  $('#sr2').onclick = () => { ses.cover = ''; showSes(); };
  const social = () => [...document.querySelectorAll('#sr .soc')].map((r) => [r.children[0].value.trim(), r.children[1].value.trim()]);
  $('#sa').onclick = () => { a.social = social(); a.social.push(['', '']); settingsView(m); };
  m.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => { a.social = social(); a.social.splice(+b.dataset.r, 1); settingsView(m); }));
  $('#sf').onsubmit = (e) => {
    e.preventDefault(); const f = new FormData(e.target), soc = social().filter((s) => s[0] && s[1]);
    commit((c) => { c.session = { title: String(f.get('stitle')).trim(), url: String(f.get('surl')).trim(), cover: ses.cover }; c.artist.tagline = f.get('tagline'); c.artist.email = f.get('email'); c.artist.social = soc; });
  };
}

/* ---------- arranque ---------- */
async function boot() {
  try {
    const s = await api('/api/auth?a=session');
    S.storage = s.storage; S.missing = !!s.storageMissing;
    if (!s.configured) return loginView('', true);
    if (!s.authed) return loginView();
    const r = await api('/api/content?admin=1');
    S.content = r.content; S.base = r.content.updatedAt || '';
    render();
  } catch (e) {
    root.innerHTML = `<div class="login"><div style="text-align:center;max-width:420px"><img src="/assets/logo-javivecino.png" alt="" width="200" style="margin:0 auto 16px;display:block;height:auto"><p class="err">No se pudo conectar con el servidor del panel.</p><p class="sm" style="color:var(--mute);font-size:13px;margin-top:8px">${E(e.message)}</p><p class="sm" style="color:var(--mute);font-size:13px;margin-top:8px">El panel solo funciona en la web desplegada en Vercel (o con «npm run dev» en local), no abriendo el archivo HTML directamente.</p></div></div>`;
  }
}
boot();
})();
