import { saveFile, storageMissing } from './_store.js';
import { guard, json } from './_lib.js';

/* POST /api/upload-image  (cuerpo = imagen binaria, ya reducida por el panel)  -> { url } */
const MAX = 4 * 1024 * 1024;
const sniff = (b) => {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ['jpg', 'image/jpeg'];
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return ['png', 'image/png'];
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') return ['webp', 'image/webp'];
  return null;
};
export async function POST(request) {
  if (!guard(request)) return json({ error: 'No autorizado' }, 401);
  if (storageMissing()) return json({ error: 'Falta conectar el almacenamiento (Vercel Blob) en el proyecto de Vercel. Mira la guía.' }, 503);
  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length || buf.length > MAX) return json({ error: 'Imagen demasiado grande (máx. 4 MB)' }, 413);
  const t = sniff(buf);
  if (!t) return json({ error: 'Formato no válido (usa JPG, PNG o WebP)' }, 415);
  try { return json({ url: await saveFile(buf, t[0], t[1]) }); }
  catch { return json({ error: 'No se pudo subir la imagen' }, 500); }
}
