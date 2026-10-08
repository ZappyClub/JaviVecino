import crypto from 'node:crypto';

/* Valida y limpia todo el contenido que llega desde el panel. Solo se guardan los campos conocidos. */
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : '');
const S = (v, max = 300) => clean(v, max).replace(/\s+/g, ' ').trim();
const L = (v, max = 3000) => clean(v, max).trim();
const URLF = (v) => {
  const s = S(v, 1200);
  return /^(https?:\/\/|\/(?!\/)|assets\/)/i.test(s) ? s : '';
};
const DATE = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : '');
const TIME = (v) => (/^\d{2}:\d{2}$/.test(String(v)) ? String(v) : '');
const newId = () => crypto.randomBytes(5).toString('hex');
const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);

function withIds(list) {
  const seen = new Set();
  return list.map((x) => {
    let id = /^[a-z0-9_-]{3,40}$/i.test(x.id || '') ? x.id : newId();
    while (seen.has(id)) id = newId();
    seen.add(id);
    return { ...x, id };
  });
}

export function sanitizeContent(input) {
  const c = input && typeof input === 'object' ? input : {};
  const a = c.artist || {}, ab = c.about || {};
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    artist: {
      tagline: S(a.tagline, 140),
      email: S(a.email, 120),
      social: arr(a.social, 12).map((s) => [S(s && s[0], 40), URLF(s && s[1])]).filter((s) => s[0] && s[1])
    },
    about: {
      intro: L(ab.intro, 1500),
      estilo: L(ab.estilo, 1500),
      trayectoria: L(ab.trayectoria, 1500),
      residencia: L(ab.residencia, 600),
      verbenas: arr(ab.verbenas, 80).map((v) => S(v, 60)).filter(Boolean),
      salas: arr(ab.salas, 80).map((s) => [S(s && s[0], 60), S(s && s[1], 60)]).filter((s) => s[0])
    },
    session: { title: S(c.session && c.session.title, 120), url: URLF(c.session && c.session.url), cover: URLF(c.session && c.session.cover) },
    mashups: withIds(arr(c.mashups, 300).map((m) => ({
      id: m && m.id, title: S(m && m.title, 120), artists: S(m && m.artists, 160), bpm: S(m && m.bpm, 8),
      date: DATE(m && m.date), desc: L(m && m.desc, 1500), cover: URLF(m && m.cover), audio: URLF(m && m.audio),
      download: URLF(m && m.download), published: !!(m && m.published)
    })).filter((m) => m.title)),
    events: withIds(arr(c.events, 300).map((e) => ({
      id: e && e.id, title: S(e && e.title, 120), date: DATE(e && e.date), time: TIME(e && e.time),
      venue: S(e && e.venue, 120), city: S(e && e.city, 80), poster: URLF(e && e.poster), tickets: URLF(e && e.tickets),
      desc: L(e && e.desc, 1500), published: !!(e && e.published)
    })).filter((e) => e.title)),
    packs: withIds(arr(c.packs, 300).map((p) => ({
      id: p && p.id, title: S(p && p.title, 120), desc: L(p && p.desc, 1500), cover: URLF(p && p.cover),
      tracks: arr(p && p.tracks, 300).map((t) => [S(t && t[0], 140), S(t && t[1], 10)]).filter((t) => t[0]),
      download: URLF(p && p.download), drive: URLF(p && p.drive), published: !!(p && p.published)
    })).filter((p) => p.title)),
    gallery: withIds(arr(c.gallery, 500).map((g) => ({
      id: g && g.id, type: ['foto', 'cartel', 'video'].includes(g && g.type) ? g.type : 'foto', title: S(g && g.title, 120),
      src: URLF(g && g.src), url: URLF(g && g.url), published: !!(g && g.published)
    })).filter((g) => g.src || g.url))
  };
}

/* Lo que ve el público: solo lo publicado */
export function publicView(c) {
  const pub = (l) => (l || []).filter((x) => x.published);
  return { ...c, mashups: pub(c.mashups), events: pub(c.events), packs: pub(c.packs), gallery: pub(c.gallery) };
}

/* Todas las URL de archivos subidos que aparecen en el contenido */
export function uploadedUrls(c) {
  const out = new Set();
  const walk = (v) => {
    if (typeof v === 'string') { if (/\.blob\.vercel-storage\.com\//.test(v) || /^\/uploads\//.test(v)) out.add(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(c);
  return out;
}
