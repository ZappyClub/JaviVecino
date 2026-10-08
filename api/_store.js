import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import DEFAULT from './_default.js';

/* Con BLOB_READ_WRITE_TOKEN (Vercel Blob) guarda en la nube; sin él, en la carpeta .data (solo para pruebas locales) */
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
export const mode = () => (useBlob() ? 'blob' : 'local');
const DIR = () => process.env.DATA_DIR || path.join(process.cwd(), '.data');
/* El archivo con TODO el contenido (incluidos borradores) lleva un nombre secreto derivado del token privado de Blob,
   así su dirección no se puede adivinar. Lo público se sirve filtrado desde /api/content. */
const KEY = () => 'content/' + crypto.createHash('sha256').update('jv-content:' + (process.env.BLOB_READ_WRITE_TOKEN || 'local')).digest('hex').slice(0, 24) + '.json';
/* En Vercel el disco es de solo lectura: sin Blob no se puede guardar nada */
export const storageMissing = () => !!process.env.VERCEL && !useBlob();

export async function readContent() {
  if (useBlob()) {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'content/', limit: 10 });
    const b = blobs.find((x) => x.pathname === KEY());
    if (!b) return structuredClone(DEFAULT);
    const r = await fetch(b.url + '?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('No se pudo leer el contenido guardado');
    return await r.json();
  }
  try { return JSON.parse(await fs.readFile(path.join(DIR(), 'content.json'), 'utf8')); }
  catch { return structuredClone(DEFAULT); }
}

export async function writeContent(obj) {
  const text = JSON.stringify(obj);
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    await put(KEY(), text, { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
    return;
  }
  await fs.mkdir(DIR(), { recursive: true });
  await fs.writeFile(path.join(DIR(), 'content.json'), text);
}

export async function saveFile(buf, ext, contentType) {
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const r = await put('uploads/' + name, buf, { access: 'public', contentType, addRandomSuffix: false });
    return r.url;
  }
  await fs.mkdir(path.join(DIR(), 'uploads'), { recursive: true });
  await fs.writeFile(path.join(DIR(), 'uploads', name), buf);
  return '/uploads/' + name;
}

export async function deleteUrls(urls) {
  const list = [...urls];
  if (!list.length) return;
  try {
    if (useBlob()) {
      const { del } = await import('@vercel/blob');
      await del(list.filter((u) => /\.blob\.vercel-storage\.com\//.test(u)));
    } else {
      for (const u of list) if (/^\/uploads\/[\w.-]+$/.test(u)) await fs.unlink(path.join(DIR(), u)).catch(() => {});
    }
  } catch { /* limpieza best-effort */ }
}
