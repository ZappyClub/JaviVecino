import { mode, saveFile } from './_store.js';
import { guard, json } from './_lib.js';

/* Solo para pruebas locales (sin Vercel Blob): sube audio a la carpeta .data */
export async function POST(request) {
  if (mode() !== 'local') return json({ error: 'No disponible' }, 404);
  if (!guard(request)) return json({ error: 'No autorizado' }, 401);
  const ext = (new URL(request.url).searchParams.get('ext') || 'mp3').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'mp3';
  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length || buf.length > 150 * 1024 * 1024) return json({ error: 'Archivo no válido' }, 413);
  return json({ url: await saveFile(buf, ext, 'audio/mpeg') });
}
