import { mode, storageMissing } from './_store.js';
import { isAuthed, codeOk, makeToken, cookieHeader, json, sameOrigin, ipOf, blocked, registerFail, clearFails, sleep } from './_lib.js';

/* GET  /api/auth?a=session            -> estado de la sesión
   POST /api/auth?a=login  {code}      -> entra con el código
   POST /api/auth?a=logout             -> sale */
export async function GET(request) {
  if (new URL(request.url).searchParams.get('a') !== 'session') return json({ error: 'No encontrado' }, 404);
  return json({ authed: isAuthed(request), storage: mode(), configured: !!process.env.ADMIN_CODE, storageMissing: storageMissing() });
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'Origen no permitido' }, 403);
  const a = new URL(request.url).searchParams.get('a');

  if (a === 'logout') return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader('', 0) });

  if (a === 'login') {
    if (!process.env.ADMIN_CODE) return json({ error: 'El panel no está configurado (falta ADMIN_CODE en Vercel).' }, 503);
    const ip = ipOf(request);
    if (blocked(ip)) return json({ error: 'Demasiados intentos. Espera unos minutos.' }, 429);
    const body = await request.json().catch(() => ({}));
    const ok = codeOk(typeof body.code === 'string' ? body.code.slice(0, 200) : '');
    if (!ok) { registerFail(ip); await sleep(800); return json({ error: 'Código incorrecto' }, 401); }
    clearFails(ip);
    return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader(makeToken(), 60 * 60 * 12) });
  }
  return json({ error: 'No encontrado' }, 404);
}
