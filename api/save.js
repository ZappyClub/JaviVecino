import { readContent, writeContent, deleteUrls, storageMissing } from './_store.js';
import { sanitizeContent, uploadedUrls } from './_schema.js';
import { guard, json } from './_lib.js';

/* POST /api/save  { content, base }  -> guarda todo el contenido (validado) */
export async function POST(request) {
  if (!guard(request)) return json({ error: 'No autorizado' }, 401);
  if (storageMissing()) return json({ error: 'Falta conectar el almacenamiento (Vercel Blob) en el proyecto de Vercel. Mira la guía.' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Datos no válidos' }, 400); }
  try {
    const prev = await readContent();
    if (body.base && prev.updatedAt && body.base !== prev.updatedAt)
      return json({ error: 'El contenido ha cambiado desde otro dispositivo. Recarga el panel antes de guardar.' }, 409);
    const next = sanitizeContent(body.content);
    await writeContent(next);
    const old = uploadedUrls(prev), now = uploadedUrls(next);
    await deleteUrls([...old].filter((u) => !now.has(u)));   // borra archivos que ya no se usan
    return json({ content: next });
  } catch (e) {
    return json({ error: 'No se pudo guardar' }, 500);
  }
}
