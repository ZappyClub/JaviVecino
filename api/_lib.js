import crypto from 'node:crypto';

export const COOKIE = 'jv_admin';
const TTL = 60 * 60 * 12; // la sesión dura 12 h

const secret = () => process.env.SESSION_SECRET || 'jv-session:' + (process.env.ADMIN_CODE || '');
const mac = (s) => crypto.createHmac('sha256', secret()).update(s).digest('base64url');

export function makeToken() {
  const body = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL, n: crypto.randomBytes(6).toString('hex') })).toString('base64url');
  return body + '.' + mac(body);
}

export function checkToken(t) {
  if (!t || !process.env.ADMIN_CODE) return false;
  const [body, sig] = String(t).split('.');
  if (!body || !sig) return false;
  const a = Buffer.from(sig), b = Buffer.from(mac(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now() / 1000; } catch { return false; }
}

export function getCookie(request, name) {
  const c = request.headers.get('cookie') || '';
  for (const part of c.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

export const isAuthed = (request) => checkToken(getCookie(request, COOKIE));

export function codeOk(input) {
  const A = process.env.ADMIN_CODE;
  if (!A) return false;
  const h = (s) => crypto.createHash('sha256').update(String(s).trim()).digest();
  return crypto.timingSafeEqual(h(input), h(A));
}

/* Las peticiones que modifican algo deben venir de la propia web (cabecera Origin) */
export function sameOrigin(request) {
  const o = request.headers.get('origin');
  if (!o) return false;
  try { return new URL(o).host === new URL(request.url).host; } catch { return false; }
}

export const json = (obj, status = 200, headers = {}) =>
  Response.json(obj, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export const cookieHeader = (value, maxAge) =>
  `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}` + (process.env.DEV_LOCAL ? '' : '; Secure');

/* Límite de intentos de login (por instancia; en Vercel conviene añadir además el Firewall) */
const fails = new Map();
const WINDOW = 10 * 60 * 1000, MAX = 6;
export const ipOf = (request) => (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
export function blocked(ip) {
  const now = Date.now();
  const list = (fails.get(ip) || []).filter((t) => now - t < WINDOW);
  fails.set(ip, list);
  return list.length >= MAX;
}
export const registerFail = (ip) => fails.set(ip, [...(fails.get(ip) || []), Date.now()]);
export const clearFails = (ip) => fails.delete(ip);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Acceso al panel: sesión válida + petición del mismo origen */
export const guard = (request) => isAuthed(request) && sameOrigin(request);
